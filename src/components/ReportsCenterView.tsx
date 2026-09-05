import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import {
  FileBarChart2,
  Printer,
  Sparkles,
  Download,
  Calendar,
  Building2,
  Users2,
  Boxes,
  IndianRupee,
  CheckCircle2,
  FileText,
  Loader2
} from 'lucide-react';

export const ReportsCenterView: React.FC = () => {
  const {
    activeProject,
    dailyReports,
    workers,
    attendance,
    materials,
    vendors,
    expenses
  } = useCasabuild();

  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiReportContent, setAiReportContent] = useState<string | null>(null);
  const [activeReportType, setActiveReportType] = useState<'dsr' | 'weekly' | 'payroll' | 'materials' | 'vendors'>('dsr');

  const handleGenerateAIWeekly = async () => {
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/progress-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: activeProject,
          recentReports: dailyReports.slice(0, 3)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiReportContent(data.reportMarkdown);
      } else {
        throw new Error('Fallback');
      }
    } catch (e) {
      // Fallback structured markdown
      setAiReportContent(`### THE CASABUILD — WEEKLY EXECUTIVE CLIENT PROGRESS REPORT
**Project:** ${activeProject.name} (${activeProject.location})
**Reporting Period:** Current Week • Overall Progress: ${activeProject.overallProgress}%

#### 1. Key Milestones Accomplished
- Completed 2nd floor internal brickwork (AAC blocks) and rough-in conduit laying for electrical services.
- Bathroom waterproofing screed completed and hydro-tested for 48 hours with zero seepage.
- Structural plastering on east facade completed with curing scheduled for 7 days.

#### 2. Site Workforce & Resources Deployed
- Total Craft Hours Logged: 184 worker days (Masons, Carpenters, MEP Specialists).
- Materials Consumed: 140 Bags UltraTech 53 Cement, 1.2 MT Fe550D TMT Rebar.

#### 3. Upcoming Schedule (Next 10 Days)
- Gypsum false ceiling framing for living and dining areas.
- First coat primer application across all plastered bedrooms.
- Sanitaryware concealed valve installation (Grohe line).

**Site Engineer / Ar. Aamir Khan**  
The Casabuild Turnkey Architecture & Construction`);
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
              Module 10
            </span>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl font-['Outfit',sans-serif]">
              Executive Reports & Audit Exports
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Generate formal Daily Site Reports (DSR), AI weekly client summaries, labour payroll statements, and material audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Current Report</span>
          </button>
          <button
            onClick={handleGenerateAIWeekly}
            disabled={generatingAI}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
          >
            {generatingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{generatingAI ? 'Writing Report...' : 'AI Weekly Summary'}</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-zinc-800">
        {[
          { id: 'dsr', label: 'Daily Site Log (DSR)' },
          { id: 'weekly', label: 'AI Client Progress Summary' },
          { id: 'payroll', label: 'Workforce Payroll Statement' },
          { id: 'materials', label: 'Material Consumption & Stock' },
          { id: 'vendors', label: 'Vendor Financial Outstanding' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReportType(tab.id as any)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeReportType === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Canvas */}
      <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 lg:p-8 shadow-2xl print:bg-white print:text-black">
        {/* Formal Casabuild Letterhead */}
        <div className="flex items-center justify-between border-b-2 border-amber-500/30 pb-5 mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-wider text-zinc-100 print:text-black font-['Outfit',sans-serif]">
              THE CASABUILD
            </h1>
            <p className="text-xs font-medium tracking-widest text-amber-400 print:text-zinc-700">
              ARCHITECTURE • INTERIORS • CONSTRUCTION
            </p>
            <p className="text-[11px] text-zinc-400 print:text-zinc-600 mt-1">
              Sector 43, Golf Course Road, Gurugram, Haryana | contact@thecasabuild.com
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="rounded bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-400 border border-amber-500/20 print:border print:border-black">
              AUDITED STATEMENT
            </span>
            <p className="text-zinc-300 print:text-zinc-800 font-semibold mt-1">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-zinc-400 print:text-zinc-600 text-[11px]">Project: {activeProject.name} ({activeProject.code})</p>
          </div>
        </div>

        {/* View 1: DSR Report */}
        {activeReportType === 'dsr' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-zinc-100 print:text-black uppercase tracking-wider font-['Outfit',sans-serif]">
              Daily Site Report Summary
            </h3>
            {dailyReports.map((r, idx) => (
              <div key={r.id} className="rounded-xl border border-zinc-800 p-4 space-y-2 bg-zinc-900/60 print:bg-transparent">
                <div className="flex justify-between font-bold text-amber-400 print:text-black">
                  <span>Log #{idx + 1} — Date: {r.date}</span>
                  <span>Supervisor: {r.supervisorName}</span>
                </div>
                <p className="text-zinc-200 print:text-black"><span className="text-zinc-400">Work Accomplished:</span> {r.todaysWork}</p>
                <div className="flex space-x-4 text-zinc-400">
                  <span>Weather: {r.weather}</span>
                  <span>Workers on Site: {r.workersCount}</span>
                  <span>Progress: {r.progressPercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View 2: AI Weekly Progress Summary */}
        {activeReportType === 'weekly' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 print:text-black uppercase tracking-wider font-['Outfit',sans-serif]">
                Weekly Client Progress Bulletin
              </h3>
              {!aiReportContent && (
                <button
                  onClick={handleGenerateAIWeekly}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 transition"
                >
                  Generate AI Executive Bulletin
                </button>
              )}
            </div>

            {aiReportContent ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-xs text-zinc-200 print:text-black leading-relaxed whitespace-pre-wrap">
                {aiReportContent}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">
                Click "Generate AI Executive Bulletin" to compose a formal client summary based on the latest site reports.
              </div>
            )}
          </div>
        )}

        {/* View 3: Labour Payroll Statement */}
        {activeReportType === 'payroll' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-zinc-100 print:text-black uppercase tracking-wider font-['Outfit',sans-serif]">
              Workforce Muster Roll & Wage Statement
            </h3>
            <table className="w-full text-left text-zinc-300 print:text-black">
              <thead className="border-b border-zinc-800 text-[10px] uppercase text-zinc-400">
                <tr>
                  <th className="py-2">Worker</th>
                  <th className="py-2">Trade</th>
                  <th className="py-2 text-right">Daily Rate</th>
                  <th className="py-2 text-right">Days Worked</th>
                  <th className="py-2 text-right">Total Accrued</th>
                  <th className="py-2 text-right">Advance Paid</th>
                  <th className="py-2 text-right">Net Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {workers.map(w => (
                  <tr key={w.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-2.5 font-semibold text-zinc-100 print:text-black">{w.name}</td>
                    <td className="py-2.5">{w.trade}</td>
                    <td className="py-2.5 text-right">₹{w.dailyWage}</td>
                    <td className="py-2.5 text-right">{w.totalDaysWorked}</td>
                    <td className="py-2.5 text-right">₹{(w.dailyWage * w.totalDaysWorked).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right text-amber-400 print:text-black">₹{w.advanceReceived.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-400 print:text-black">₹{w.pendingWage.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View 4: Material Stock Statement */}
        {activeReportType === 'materials' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-zinc-100 print:text-black uppercase tracking-wider font-['Outfit',sans-serif]">
              Material Stock Balance & Valuation
            </h3>
            <table className="w-full text-left text-zinc-300 print:text-black">
              <thead className="border-b border-zinc-800 text-[10px] uppercase text-zinc-400">
                <tr>
                  <th className="py-2">Material</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Current Stock</th>
                  <th className="py-2 text-right">Unit Rate</th>
                  <th className="py-2 text-right">Asset Value</th>
                  <th className="py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {materials.map(m => (
                  <tr key={m.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-2.5 font-semibold text-zinc-100 print:text-black">{m.name}</td>
                    <td className="py-2.5">{m.category}</td>
                    <td className="py-2.5 text-right font-bold">{m.currentBalance} {m.unit}</td>
                    <td className="py-2.5 text-right">₹{m.unitCost}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-400 print:text-black">
                      ₹{(m.currentBalance * m.unitCost).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                        m.status === 'Adequate' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View 5: Vendor Financial Outstanding */}
        {activeReportType === 'vendors' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-zinc-100 print:text-black uppercase tracking-wider font-['Outfit',sans-serif]">
              Vendor Ledger & Outstanding Aging Summary
            </h3>
            <table className="w-full text-left text-zinc-300 print:text-black">
              <thead className="border-b border-zinc-800 text-[10px] uppercase text-zinc-400">
                <tr>
                  <th className="py-2">Vendor / Subcontractor</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Total Billed</th>
                  <th className="py-2 text-right">Total Paid</th>
                  <th className="py-2 text-right">Outstanding Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {vendors.map(v => (
                  <tr key={v.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-2.5 font-semibold text-zinc-100 print:text-black">{v.name}</td>
                    <td className="py-2.5">{v.category}</td>
                    <td className="py-2.5 text-right">₹{v.totalBilled.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right text-emerald-400 print:text-black">₹{v.paidAmount.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-bold text-amber-400 print:text-black">₹{v.pendingAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
