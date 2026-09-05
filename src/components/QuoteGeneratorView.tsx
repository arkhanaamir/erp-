import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { QuoteEstimateRequest, QuoteEstimateResponse } from '../types';
import {
  FileSpreadsheet,
  Sparkles,
  IndianRupee,
  Building2,
  CheckCircle2,
  Printer,
  Download,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Calendar,
  MapPin
} from 'lucide-react';

export const QuoteGeneratorView: React.FC = () => {
  const { activeProject, updateProject } = useCasabuild();

  // Generator form states
  const [clientName, setClientName] = useState(activeProject.clientName);
  const [projectTitle, setProjectTitle] = useState(activeProject.name);
  const [location, setLocation] = useState(activeProject.location);
  const [builtUpArea, setBuiltUpArea] = useState(activeProject.areaSqFt || 3500);
  const [qualityTier, setQualityTier] = useState<'Standard' | 'Premium' | 'Luxury Villa' | 'Commercial Spec'>('Premium');
  const [scopeDetails, setScopeDetails] = useState('Turnkey civil construction with RCC frame, Italian marble flooring in living/dining, premium false ceilings, Grohe sanitaryware, modular kitchen with acrylic finish, and ducted HVAC provision.');
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<QuoteEstimateResponse | null>(null);

  // Default initial estimate generator if offline or fast client calculation
  const generateFastEstimate = () => {
    setIsLoading(true);

    const rates = {
      Standard: 2100,
      Premium: 3200,
      'Luxury Villa': 4800,
      'Commercial Spec': 2600
    };

    const baseRate = rates[qualityTier];
    const subtotal = builtUpArea * baseRate;

    const items = [
      {
        category: 'Civil & Foundation',
        item: 'RCC Frame Structure, M25 Concrete, Fe550D TMT Reinforcement & Brickwork',
        quantity: builtUpArea,
        unit: 'Sq.Ft',
        rate: Math.round(baseRate * 0.38),
        amount: Math.round(subtotal * 0.38)
      },
      {
        category: 'Flooring & Wall Tiling',
        item: qualityTier === 'Luxury Villa' ? 'Imported Italian Botticino / Dyna Marble with 8-coat diamond polishing' : 'Kajaria 800x1600 Double Charged Vitrified Tiles with epoxy grouting',
        quantity: Math.round(builtUpArea * 0.85),
        unit: 'Sq.Ft',
        rate: Math.round(baseRate * 0.16),
        amount: Math.round(subtotal * 0.16)
      },
      {
        category: 'False Ceiling & Architectural Lighting',
        item: 'Saint-Gobain Gyproc Gypsum board false ceiling with cove lighting and recessed magnetic tracks',
        quantity: builtUpArea,
        unit: 'Sq.Ft',
        rate: Math.round(baseRate * 0.08),
        amount: Math.round(subtotal * 0.08)
      },
      {
        category: 'Electrical & Automation',
        item: 'Polycab FRLS concealed conduit copper wiring with Schneider AvatarOn modular switches and smart touch automation',
        quantity: builtUpArea,
        unit: 'Sq.Ft',
        rate: Math.round(baseRate * 0.09),
        amount: Math.round(subtotal * 0.09)
      },
      {
        category: 'Plumbing & Sanitaryware',
        item: 'Astral CPVC piping, Grohe concealed diverters, wall-hung WC with sensor flush valves',
        quantity: 4,
        unit: 'Toilets',
        rate: Math.round((subtotal * 0.09) / 4),
        amount: Math.round(subtotal * 0.09)
      },
      {
        category: 'Woodwork & Modular Kitchen',
        item: 'Century Pro Marine Ply Modular Kitchen with Hafele soft-close hardware & acrylic shutters',
        quantity: 1,
        unit: 'Job Lot',
        rate: Math.round(subtotal * 0.12),
        amount: Math.round(subtotal * 0.12)
      },
      {
        category: 'Interior Painting & Finishes',
        item: 'Asian Paints Royale Luxury Emulsion with 3 coats putty & primer application',
        quantity: builtUpArea * 3,
        unit: 'Sq.Ft',
        rate: Math.round(baseRate * 0.08),
        amount: Math.round(subtotal * 0.08)
      }
    ];

    const actualSubtotal = items.reduce((acc, curr) => acc + curr.amount, 0);
    const gst = Math.round(actualSubtotal * 0.18);
    const contingency = Math.round(actualSubtotal * 0.05);
    const total = actualSubtotal + gst + contingency;

    const result: QuoteEstimateResponse = {
      projectTitle,
      clientName,
      estimatedTimelineMonths: qualityTier === 'Luxury Villa' ? 14 : 10,
      totalEstimate: total,
      subtotal: actualSubtotal,
      gstAmount: gst,
      contingencyAmount: contingency,
      items,
      paymentMilestones: [
        { milestone: 'Mobilization & Architectural Sign-off', percentage: 20, amount: Math.round(total * 0.20) },
        { milestone: 'Plinth Level & Foundation Casting', percentage: 20, amount: Math.round(total * 0.20) },
        { milestone: 'RCC Roof Slab Completion', percentage: 25, amount: Math.round(total * 0.25) },
        { milestone: 'Brickwork, Plaster & MEP Concealed Rough-in', percentage: 20, amount: Math.round(total * 0.20) },
        { milestone: 'Finishes, Flooring & Final Handover', percentage: 15, amount: Math.round(total * 0.15) },
      ],
      disclaimer: 'Official quote valid for 30 days. Material rate escalations exceeding 5% in TMT steel or cement will be billed at actuals as per standard Casabuild turnkey agreements.'
    };

    setTimeout(() => {
      setGeneratedQuote(result);
      setIsLoading(false);
    }, 600);
  };

  const handleAIQuote = async () => {
    setIsLoading(true);
    try {
      const payload: QuoteEstimateRequest = {
        projectTitle,
        clientName,
        builtUpAreaSqFt: builtUpArea,
        qualityTier,
        scopeDescription: scopeDetails,
        location
      };

      const res = await fetch('/api/ai/quote-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedQuote(data);
      } else {
        // Fallback to internal estimator
        generateFastEstimate();
      }
    } catch (err) {
      console.warn('AI endpoint not reachable, generating local estimate', err);
      generateFastEstimate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToActiveProject = () => {
    if (!generatedQuote) return;
    const newBOQ = generatedQuote.items.map((item, idx) => ({
      id: `boq-gen-${Date.now()}-${idx}`,
      item: item.item,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitRate: item.rate,
      amount: item.amount,
      completedPercent: 0,
      billedAmount: 0
    }));

    updateProject(activeProject.id, {
      contractValue: generatedQuote.totalEstimate,
      budget: generatedQuote.subtotal,
      boq: newBOQ
    });

    alert('Official Quote successfully saved into the Active Project BOQ and Budget!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
              Module 6
            </span>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl font-['Outfit',sans-serif]">
              BOQ & Automated Quote Generator
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Instant itemized contractor and architectural estimates, GST calculations, milestone schedules, and bill generation.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="quote-generate-ai-btn"
            onClick={handleAIQuote}
            disabled={isLoading}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{isLoading ? 'Estimating with Gemini...' : 'Generate Automated Quote'}</span>
          </button>
        </div>
      </div>

      {/* Input Parameters Grid */}
      <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 font-['Outfit',sans-serif]">
          1. Project Specifications & Construction Scope
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Project Name</label>
            <input
              type="text"
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Built-Up Area (Sq.Ft)</label>
            <input
              type="number"
              value={builtUpArea}
              onChange={e => setBuiltUpArea(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Specification Tier</label>
            <select
              value={qualityTier}
              onChange={e => setQualityTier(e.target.value as any)}
              className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="Standard">Standard Turnkey (₹2,100 / sqft)</option>
              <option value="Premium">Premium Architecture (₹3,200 / sqft)</option>
              <option value="Luxury Villa">Ultra Luxury Villa (₹4,800 / sqft)</option>
              <option value="Commercial Spec">Commercial Office Spec (₹2,600 / sqft)</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-zinc-400 mb-1 font-medium">Detailed Architectural Scope & Material Preferences</label>
            <textarea
              rows={2}
              value={scopeDetails}
              onChange={e => setScopeDetails(e.target.value)}
              className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Generated Quote Display */}
      {generatedQuote && (
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl space-y-6">
          {/* Quote Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-wider text-zinc-100 font-['Outfit',sans-serif]">
                  THE CASABUILD
                </span>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                  OFFICIAL ESTIMATE
                </span>
              </div>
              <h3 className="mt-1 text-2xl font-bold text-zinc-100 font-['Outfit',sans-serif]">
                {generatedQuote.projectTitle}
              </h3>
              <p className="text-xs text-zinc-400">
                Prepared for: <span className="font-medium text-zinc-200">{generatedQuote.clientName}</span> • Estimated Execution: <span className="text-amber-400 font-semibold">{generatedQuote.estimatedTimelineMonths} Months</span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print PDF Bill</span>
              </button>
              <button
                onClick={handleApplyToActiveProject}
                className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Sync to Live BOQ</span>
              </button>
            </div>
          </div>

          {/* Itemized BOQ Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/60 uppercase tracking-wider text-zinc-400 text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Scope / Material Specification</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Unit Rate (₹)</th>
                  <th className="py-3 px-3 text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {generatedQuote.items.map((item, i) => (
                  <tr key={i} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-3">
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-zinc-100 max-w-[280px]">
                      {item.item}
                    </td>
                    <td className="py-3 px-3 text-right text-zinc-300 font-medium">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right text-zinc-400">
                      ₹{item.rate.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-zinc-100">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown Calculation (Subtotal, GST, Total) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 pt-4 border-t border-zinc-800">
            {/* Payment Milestones (Matches Blueprint: 30% advance, plinth, slab, brickwork, handover) */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 font-['Outfit',sans-serif]">
                Contractual Payment Milestones
              </h4>
              <div className="space-y-2 text-xs">
                {generatedQuote.paymentMilestones.map((pm, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-zinc-800/60 last:border-0">
                    <div className="flex items-center space-x-2">
                      <span className="rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-[10px] font-bold border border-amber-500/30">
                        {pm.percentage}%
                      </span>
                      <span className="text-zinc-300">{pm.milestone}</span>
                    </div>
                    <span className="font-bold text-zinc-100">
                      ₹{pm.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Civil & Interior Works Subtotal:</span>
                <span className="font-medium text-zinc-200">₹{generatedQuote.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>GST (18% Construction & Services):</span>
                <span className="font-medium text-zinc-200">₹{generatedQuote.gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Contingency Buffer (5%):</span>
                <span className="font-medium text-zinc-200">₹{generatedQuote.contingencyAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-zinc-100 font-['Outfit',sans-serif]">Grand Total Contract Value:</span>
                <span className="text-2xl font-extrabold text-amber-400">
                  ₹{generatedQuote.totalEstimate.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="pt-2 text-[10px] text-zinc-500 italic">
                {generatedQuote.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
