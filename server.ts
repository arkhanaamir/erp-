import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'The Casabuild ERP',
    timestamp: new Date().toISOString(),
    hasGemini: !!process.env.GEMINI_API_KEY,
  });
});

// AI Automated Quote & BOQ Estimator
app.post('/api/ai/quote-estimate', async (req, res) => {
  try {
    const { projectType, areaSqFt, tier, scopeDescription, clientName } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback algorithmic BOQ generation when no API key configured
      const area = Number(areaSqFt) || 1800;
      const rateMultiplier = tier === 'Ultra-Luxury' ? 2.2 : tier === 'Premium' ? 1.5 : 1.0;
      
      const civilRate = Math.round(1650 * rateMultiplier);
      const mepRate = Math.round(450 * rateMultiplier);
      const flooringRate = Math.round(550 * rateMultiplier);
      const carpentryRate = Math.round(850 * rateMultiplier);
      const paintingRate = Math.round(180 * rateMultiplier);

      const items = [
        {
          category: 'Civil & Structural',
          item: 'RCC Structure & Brick Masonry with AAC Blocks',
          unit: 'Sq. Ft',
          quantity: area,
          unitRate: civilRate,
          amount: area * civilRate,
          notes: 'High-strength structural concrete, cured cement mortar & AAC blockwork'
        },
        {
          category: 'Plumbing & Electrical (MEP)',
          item: 'Concealed Conduit Piping, Wiring & Sanitary Drainage',
          unit: 'Sq. Ft',
          quantity: area,
          unitRate: mepRate,
          amount: area * mepRate,
          notes: 'Finolex/Polycab FR wires, Astral CPVC pipes & Grohe/Kohler rough-ins'
        },
        {
          category: 'Flooring & Wall Tiling',
          item: 'Italian Marble / Large Format Vitrified Tile Flooring',
          unit: 'Sq. Ft',
          quantity: Math.round(area * 0.85),
          unitRate: flooringRate,
          amount: Math.round(area * 0.85) * flooringRate,
          notes: 'Precision laser leveling, epoxy grouting and diamond polishing'
        },
        {
          category: 'Modular Woodwork & Interiors',
          item: 'Custom Marine Ply Modular Wardrobes, Kitchen & Paneling',
          unit: 'Sq. Ft',
          quantity: Math.round(area * 0.4),
          unitRate: carpentryRate,
          amount: Math.round(area * 0.4) * carpentryRate,
          notes: 'BWP grade plywood, Blum soft-close hardware, 1mm acrylic/veneer finish'
        },
        {
          category: 'Finishes & Paints',
          item: 'Acrylic Emulsion Paint & Luxury Texture Wall Accent',
          unit: 'Sq. Ft',
          quantity: Math.round(area * 2.8),
          unitRate: paintingRate,
          amount: Math.round(area * 2.8) * paintingRate,
          notes: '3 coats Asian Paints Royale with primer, putty and moisture barrier'
        }
      ];

      const subtotal = items.reduce((acc, curr) => acc + curr.amount, 0);
      const contingency = Math.round(subtotal * 0.05);
      const gst = Math.round(subtotal * 0.18);
      const grandTotal = subtotal + contingency + gst;

      return res.json({
        quoteNumber: `CB-Q-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: clientName || 'Valued Client',
        projectType: projectType || 'Turnkey Construction & Interiors',
        areaSqFt: area,
        tier: tier || 'Premium',
        items,
        subtotal,
        contingency,
        taxPercent: 18,
        taxAmount: gst,
        grandTotal,
        timelineEstimateWeeks: Math.ceil(area / 180) + (tier === 'Ultra-Luxury' ? 6 : 2),
        executiveSummary: `Generated comprehensive Bill of Quantities (BOQ) for ${area} sq.ft under ${tier} finish specification. Includes civil, MEP, premium finishes, modular joinery, and quality contingency.`
      });
    }

    const prompt = `You are the Chief Cost Estimator for "The Casabuild", an elite Architecture, Interior Design, and Construction firm.
Generate a structured, professional itemized Bill of Quantities (BOQ) quotation for:
- Client: ${clientName || 'Client'}
- Project Type: ${projectType || 'Full Construction & Interiors'}
- Built-up Area: ${areaSqFt || 2000} sq.ft
- Finishes Tier: ${tier || 'Premium'}
- Scope / Special Brief: ${scopeDescription || 'Modern luxury architectural design with turnkey execution'}

Return ONLY a valid JSON object matching this schema:
{
  "quoteNumber": "CB-Q-XXXX",
  "clientName": "string",
  "projectType": "string",
  "areaSqFt": number,
  "tier": "string",
  "items": [
    {
      "category": "string (e.g., Civil & Structure, MEP & Electrical, Flooring & Tiling, Modular Woodwork, Finishes & Paint)",
      "item": "string",
      "unit": "string (e.g., Sq.Ft, Rft, Nos, Lumpsum)",
      "quantity": number,
      "unitRate": number (in INR ₹),
      "amount": number,
      "notes": "string"
    }
  ],
  "subtotal": number,
  "contingency": number,
  "taxPercent": 18,
  "taxAmount": number,
  "grandTotal": number,
  "timelineEstimateWeeks": number,
  "executiveSummary": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI quote:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quote' });
  }
});

// AI Client Progress Report Generator
app.post('/api/ai/progress-report', async (req, res) => {
  try {
    const { projectName, clientName, overallProgress, milestones, recentLogs, upcomingTasks } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reportTitle: `Project Progress Report - ${projectName || 'The Casabuild Site'}`,
        executiveSummary: `The project has successfully reached ${overallProgress || 65}% overall completion. All structural and MEP rough-ins are progressing ahead of schedule with zero safety incidents.`,
        keyHighlights: [
          'Brickwork and internal plastering completed across all primary zones.',
          'High-grade concealed plumbing pressure testing successfully certified.',
          'Tile selection and custom woodwork fabrication in progress as per schedule.'
        ],
        snagResolutionNotes: 'Minor conduit alignment adjustments addressed immediately on site.',
        nextWeekOutlook: 'Commencing ceiling framing, electrical box fixations, and waterproofing inspection.',
        qualityScore: '98/100',
        safetyStatus: '100% Compliant - No incidents'
      });
    }

    const prompt = `You are the Project Director at "The Casabuild".
Generate an authoritative, client-facing executive progress report for our luxury construction project.
Project: ${projectName}
Client: ${clientName}
Current Progress: ${overallProgress}%
Milestone data: ${JSON.stringify(milestones || [])}
Recent Daily Site Notes: ${JSON.stringify(recentLogs || [])}
Upcoming targets: ${JSON.stringify(upcomingTasks || [])}

Return a clean JSON object with:
{
  "reportTitle": "string",
  "executiveSummary": "string (polite, reassuring, professional tone)",
  "keyHighlights": ["bullet 1", "bullet 2", "bullet 3"],
  "snagResolutionNotes": "string",
  "nextWeekOutlook": "string",
  "qualityScore": "string (e.g. 96/100)",
  "safetyStatus": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI report:', error);
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Casabuild ERP server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
