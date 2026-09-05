import React from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import {
  Eye,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Camera,
  Layers,
  Palette,
  FileText,
  Phone,
  ShieldCheck,
  Building2,
  ChevronRight,
  Download,
  AlertCircle
} from 'lucide-react';

interface ClientPortalViewProps {
  onNavigateToSelections: () => void;
  onNavigateToPhotos: () => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  onNavigateToSelections,
  onNavigateToPhotos
}) => {
  const {
    currentUser,
    activeProject,
    dailyReports,
    sitePhotos,
    interiorSelections,
    updateInteriorSelection
  } = useCasabuild();

  const clientDisplayName = currentUser?.role === 'client' ? currentUser.name : (activeProject?.clientName || 'Valued Client');
  const pendingSelections = (interiorSelections || []).filter(i => i?.status === 'Pending');
  const recentReport = (dailyReports || [])[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Client Welcome Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                Module 9 • Client Portal
              </span>
              <span className="text-xs text-zinc-400">Verified Client Access</span>
            </div>
            <h2 className="mt-1.5 text-2xl font-bold text-white font-['Outfit',sans-serif]">
              Welcome back, {clientDisplayName}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Live updates for <span className="font-semibold text-zinc-200">{activeProject?.name || 'Casabuild Project'}</span> ({activeProject?.location || 'Gurugram'}). Turnkey execution managed by The Casabuild.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-right">
              <span className="text-[10px] uppercase text-zinc-500">Project Status</span>
              <p className="text-sm font-bold text-emerald-400">On Track ({activeProject.overallProgress}%)</p>
            </div>
            <a
              href={`tel:+919810012345`}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-3 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <Phone className="h-4 w-4" />
              <span>Contact Architect</span>
            </a>
          </div>
        </div>
      </div>

      {/* Progress & Financial Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Overall Completion</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{activeProject.overallProgress}%</span>
            <span className="text-xs text-amber-400 font-semibold">Phase: Finishes</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 rounded-full"
              style={{ width: `${activeProject.overallProgress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Contract Value</span>
          <p className="mt-2 text-2xl font-extrabold text-white">
            ₹{(activeProject.contractValue / 100000).toFixed(2)} Lakhs
          </p>
          <span className="text-[11px] text-zinc-500">Turnkey Fixed Scope</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Paid to Date</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">
              ₹{(activeProject.totalSpent / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-[10px] text-zinc-400">3 Verified Bills</span>
          </div>
          <span className="text-[11px] text-zinc-500">Receipts issued</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Next Milestone Due</span>
          <p className="mt-2 text-2xl font-extrabold text-amber-400">
            ₹{((activeProject.contractValue - activeProject.totalSpent) * 0.4 / 100000).toFixed(2)}L
          </p>
          <span className="text-[11px] text-zinc-500">Upon False Ceiling Completion</span>
        </div>
      </div>

      {/* Two Column Layout: Daily Site Activity & Milestone Schedule */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Recent Daily Progress & Photos */}
        <div className="space-y-6 lg:col-span-2">
          {/* Latest Verified Site Update */}
          {recentReport && (
            <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Latest Site Activity Log</h3>
                </div>
                <span className="text-xs text-zinc-400">{recentReport.date}</span>
              </div>
              <p className="mt-3 text-xs text-zinc-200 leading-relaxed">
                "{recentReport.todaysWork}"
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                <span>Weather: {recentReport.weather} ({recentReport.temperature})</span>
                <span>Workforce: {recentReport.workersCount} craftsmen on site</span>
              </div>
            </div>
          )}

          {/* Site Photos Gallery Preview */}
          <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Live Site Progress Photos</h3>
                <p className="text-xs text-zinc-400">Documented by site engineers</p>
              </div>
              <button
                onClick={onNavigateToPhotos}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center"
              >
                View All <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sitePhotos.slice(0, 3).map(photo => (
                <div key={photo.id} className="relative aspect-video rounded-xl overflow-hidden group border border-zinc-800">
                  <img src={photo.imageUrl} alt={photo.caption} className="h-full w-full object-cover group-hover:scale-105 transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <p className="absolute bottom-1.5 left-2 right-2 text-[10px] text-zinc-200 truncate">
                    {photo.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Approvals & Invoices */}
        <div className="space-y-6">
          {/* Pending Material Selections Requiring Approval */}
          <div className="rounded-2xl border border-amber-500/30 bg-[#161922] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Awaiting Your Approval ({pendingSelections?.length || 0})
                </h3>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {(pendingSelections || []).slice(0, 2).map(item => (
                <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <img src={item.imageUrl} alt={item.item} className="h-10 w-10 rounded-xl object-cover border border-zinc-700" />
                    <div>
                      <h4 className="font-semibold text-zinc-100">{item.item}</h4>
                      <p className="text-[10px] text-zinc-400">{item.brand}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex space-x-2">
                    <button
                      onClick={() => updateInteriorSelection(item.id, { status: 'Approved', clientFeedback: 'Approved by client' })}
                      className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-1 font-semibold text-white shadow-md shadow-emerald-500/25 transition text-[11px]"
                    >
                      Approve Spec
                    </button>
                    <button
                      onClick={onNavigateToSelections}
                      className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 px-2.5 py-1 text-zinc-300 text-[11px] transition"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
              {(pendingSelections?.length || 0) === 0 && (
                <p className="text-xs text-zinc-400">All design and material selections are up to date.</p>
              )}
            </div>
          </div>

          {/* Running Account Bills / Invoices */}
          <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Certified Payment Receipts
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { title: 'RA Bill #01 - Foundation & Excavation', amount: '₹18,00,000', date: '25 Mar 2025' },
                { title: 'RA Bill #02 - Ground Floor Slab Casting', amount: '₹22,50,000', date: '18 Apr 2025' },
                { title: 'RA Bill #03 - Brickwork & Plastering', amount: '₹14,20,000', date: '04 May 2025' },
              ].map((bill, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2.5">
                  <div>
                    <p className="font-medium text-zinc-200">{bill.title}</p>
                    <span className="text-[10px] text-zinc-500">{bill.date}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{bill.amount}</p>
                    <span className="text-[10px] text-zinc-400">Paid ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
