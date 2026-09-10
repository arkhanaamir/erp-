import React from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardCheck,
  Users2,
  Users,
  Boxes,
  Receipt,
  FileSpreadsheet,
  Camera,
  Palette,
  Eye,
  FileBarChart2,
  HardHat,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  setMobileOpen,
}) => {
  const { currentRole, materials, dailyReports, isOwner, users } = useCasabuild();

  const lowStockCount = (materials || []).filter(m => m?.status === 'Low Stock' || m?.status === 'Critical').length;
  const activeStaffCount = (users || []).filter(u => !u?.isDeleted).length;

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, badge: null, roles: ['owner', 'architect', 'supervisor', 'accountant', 'contractor'] },
    { id: 'employees', label: 'Employees & Accounts', icon: Users, badge: `${activeStaffCount} Staff`, roles: ['owner', 'architect', 'supervisor', 'accountant'] },
    { id: 'projects', label: 'Projects & Milestones', icon: FolderKanban, badge: '5 Active', roles: ['owner', 'architect', 'supervisor', 'accountant'] },
    { id: 'daily-reports', label: 'Daily Site Reports (DSR)', icon: ClipboardCheck, badge: 'Daily', roles: ['owner', 'architect', 'supervisor', 'contractor'] },
    { id: 'labour', label: 'Labour & Attendance', icon: Users2, badge: '24 Today', roles: ['owner', 'supervisor', 'accountant', 'contractor'] },
    { id: 'inventory', label: 'Material Inventory', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} Low` : null, alert: lowStockCount > 0, roles: ['owner', 'supervisor', 'accountant'] },
    { id: 'finance', label: 'Vendors & Expenses', icon: Receipt, badge: '₹38.4k', roles: ['owner', 'accountant'] },
    { id: 'boq-quotes', label: 'BOQ & Automated Quotes', icon: FileSpreadsheet, badge: 'AI Ready', sparkle: true, roles: ['owner', 'architect', 'accountant'] },
    { id: 'photos', label: 'Site Photo Journal', icon: Camera, badge: null, roles: ['owner', 'architect', 'supervisor', 'contractor', 'client'] },
    { id: 'selections', label: 'Interior Selections', icon: Palette, badge: 'Client', roles: ['owner', 'architect', 'client'] },
    { id: 'client-portal', label: 'Client Portal', icon: Eye, badge: 'Live', roles: ['owner', 'client', 'architect'] },
    { id: 'reports', label: 'Executive Reports (PDF)', icon: FileBarChart2, badge: null, roles: ['owner', 'architect', 'supervisor', 'accountant'] },
  ];

  // Master Owner in every role has access to all tools, while other profiles see their role-specific view
  const visibleItems = isOwner ? navItems : navItems.filter(item => item.roles.includes(currentRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-20 bottom-4 left-3 z-30 w-64 bg-[#12151d] border border-zinc-800/80 rounded-2xl shadow-2xl transition-transform duration-200 ease-in-out lg:static lg:top-0 lg:bottom-0 lg:left-0 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-1">
            <div className="px-2 py-1 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Main Console
            </div>

            <nav className="space-y-1">
              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileOpen(false);
                    }}
                    className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm font-semibold'
                        : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`h-4 w-4 transition ${
                          isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.sparkle && (
                        <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                      )}
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wider ${
                            item.alert
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                              : isActive
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Active Project Card at bottom of sidebar */}
          <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-zinc-900/80 p-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-400">
                <HardHat className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Live Site Mode
                </span>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="mt-1.5 text-xs font-semibold text-zinc-200">Enterprise Cloud Sync</p>
            <p className="text-[10px] text-zinc-400">Offline PWA • Instant Cloud Ledgers</p>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-amber-500 h-full w-[88%] rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
