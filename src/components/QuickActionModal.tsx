import React from 'react';
import {
  ClipboardCheck,
  Users2,
  Users,
  Boxes,
  Receipt,
  Sparkles,
  Camera,
  FolderKanban,
  X
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'daily-reports',
      title: 'Log Daily Site Report (DSR)',
      desc: 'Record today’s work progress, weather, delays & tomorrow target',
      icon: ClipboardCheck,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'labour',
      title: 'Mark Labour Attendance',
      desc: 'Muster roll for 24 workers, status toggles & daily task assign',
      icon: Users2,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    },
    {
      id: 'inventory',
      title: 'Receive Material (Inward)',
      desc: 'Inward Cement, Steel, AAC Blocks with challan invoice numbers',
      icon: Boxes,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      id: 'finance',
      title: 'Record Site Expense / Voucher',
      desc: 'Disburse petty cash, UPI vendor settlements & attach bills',
      icon: Receipt,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    },
    {
      id: 'boq-quotes',
      title: 'AI Quote & BOQ Estimator',
      desc: 'Instant turnkey civil & interior cost projection with Gemini AI',
      icon: Sparkles,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      id: 'photos',
      title: 'Upload Site Photo',
      desc: 'Tag room, trade activity, and visual progress proof',
      icon: Camera,
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    },
    {
      id: 'projects',
      title: 'Add New Project / Milestone',
      desc: 'Set up turnkey villa or commercial fitout schedule',
      icon: FolderKanban,
      color: 'bg-zinc-800 text-zinc-300 border-zinc-700'
    },
    {
      id: 'employees',
      title: 'Add & Manage Employees / Accounts',
      desc: 'Create employee login credentials, assign system roles & projects',
      icon: Users,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              The Casabuild ERP
            </span>
            <h3 className="text-lg font-bold text-zinc-100 font-['Outfit',sans-serif]">
              Quick Action Launcher
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {actions.map(act => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onNavigate(act.id);
                  onClose();
                }}
                className="w-full flex items-center space-x-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-left transition hover:border-amber-500/40 hover:bg-zinc-800/60"
              >
                <div className={`rounded-xl p-2 border ${act.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-zinc-100">{act.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{act.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
