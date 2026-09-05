import React from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import {
  FolderKanban,
  Users,
  IndianRupee,
  Activity,
  Plus,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MapPin,
  Boxes,
  Camera,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tabId: string) => void;
  onOpenQuickAction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickAction }) => {
  const {
    projects,
    activeProject,
    workers,
    attendance,
    expenses,
    materials,
    dailyReports,
    currentRole
  } = useCasabuild();

  // Metrics computation
  const activeProjectsCount = (projects || []).filter(p => p?.status === 'Active').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = (attendance || []).filter(a => a?.date === todayStr);
  const workersTodayCount = todayAttendance.filter(a => a?.status === 'Present' || a?.status === 'Half Day').length || 24;

  const todayExpenses = (expenses || []).filter(e => e?.date === todayStr);
  const todayExpenseAmount = todayExpenses.reduce((acc, curr) => acc + (curr?.amount || 0), 0) || 38450;

  const avgCompletion = Math.round(
    (projects || []).reduce((acc, curr) => acc + (curr?.overallProgress || 0), 0) / ((projects?.length) || 1)
  );

  const lowStockItems = (materials || []).filter(m => m?.status === 'Low Stock' || m?.status === 'Critical');

  // Chart data for spend vs budget
  const spendChartData = [
    { month: 'Jun', spend: 28, budget: 35 },
    { month: 'Jul', spend: 45, budget: 50 },
    { month: 'Aug', spend: 62, budget: 70 },
    { month: 'Sep', spend: 78, budget: 85 },
    { month: 'Oct', spend: 91.4, budget: 110 },
    { month: 'Nov (Proj)', spend: 108, budget: 125 },
  ];

  const tradeAttendanceData = [
    { trade: 'Masons', count: 6 },
    { trade: 'Carpenters', count: 5 },
    { trade: 'Electricians', count: 3 },
    { trade: 'Plumbers', count: 2 },
    { trade: 'Tile Specs', count: 3 },
    { trade: 'Helpers', count: 5 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-[#171a23] via-[#141720] to-[#12151c] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                The Casabuild Office Control Center
              </span>
            </div>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white lg:text-3xl font-['Outfit',sans-serif]">
              Construction & Design Operations
            </h2>
            <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
              Active tracking for <span className="font-semibold text-zinc-200">{activeProject.name}</span> ({activeProject.location}). Turnkey progress, live site reports, labour payroll, and procurement ledgers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dashboard-new-dsr-btn"
              onClick={() => onNavigate('daily-reports')}
              className="flex items-center space-x-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
            >
              <Activity className="h-4 w-4 text-amber-400" />
              <span>Log Site DSR</span>
            </button>
            <button
              id="dashboard-quote-estimator-btn"
              onClick={() => onNavigate('boq-quotes')}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Quote Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Dashboard Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Active Projects */}
        <div
          id="dashboard-card-active-projects"
          onClick={() => onNavigate('projects')}
          className="group cursor-pointer rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl hover:border-amber-500/30 transition-all"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Active Projects
            </span>
            <div className="rounded-lg bg-zinc-800 p-2 text-amber-400 group-hover:scale-110 transition border border-zinc-700">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl sm:text-4xl font-bold text-white font-['Outfit',sans-serif]">
              0{activeProjectsCount}
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-400">
              <TrendingUp className="mr-0.5 h-3.5 w-3.5" /> All on schedule
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400 truncate">
            Primary: {activeProject.name}
          </p>
        </div>

        {/* Card 2: Workers Today */}
        <div
          id="dashboard-card-workers-today"
          onClick={() => onNavigate('labour')}
          className="group cursor-pointer rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl hover:border-amber-500/30 transition-all"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Workers Today
            </span>
            <div className="rounded-lg bg-zinc-800 p-2 text-amber-400 group-hover:scale-110 transition border border-zinc-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl sm:text-4xl font-bold text-white font-['Outfit',sans-serif]">
              {workersTodayCount}
            </span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              Active on Site
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400 truncate">
            Masons, Carpenters, MEP & Helpers
          </p>
        </div>

        {/* Card 3: Today's Expense */}
        <div
          id="dashboard-card-today-expense"
          onClick={() => onNavigate('finance')}
          className="group cursor-pointer rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl hover:border-amber-500/30 transition-all"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Today's Expense
            </span>
            <div className="rounded-lg bg-zinc-800 p-2 text-amber-400 group-hover:scale-110 transition border border-zinc-700">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-white font-['Outfit',sans-serif]">
              ₹{todayExpenseAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-zinc-400">settled via UPI</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400 truncate">
            Labour wages & procurement batch
          </p>
        </div>

        {/* Card 4: Project Completion */}
        <div
          id="dashboard-card-project-completion"
          onClick={() => onNavigate('projects')}
          className="group cursor-pointer rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl hover:border-amber-500/30 transition-all"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Project Completion
            </span>
            <div className="rounded-lg bg-zinc-800 p-2 text-amber-400 group-hover:scale-110 transition border border-zinc-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl sm:text-4xl font-bold text-white font-['Outfit',sans-serif]">
              {activeProject?.overallProgress ?? 0}%
            </span>
            <span className="text-xs font-semibold text-amber-300">
              Phase: Finishes
            </span>
          </div>
          <div className="mt-2 w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${activeProject?.overallProgress ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Financial & Operational Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Spend vs Budget Analytics & Milestones */}
        <div className="space-y-6 lg:col-span-2">
          {/* Spend vs Budget Chart */}
          <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-zinc-100 font-['Outfit',sans-serif]">
                  Cumulative Financials: Spent vs Allocated Budget (₹ Lakhs)
                </h3>
                <p className="text-xs text-zinc-400">
                  {activeProject?.name || 'Casabuild Project'} — Total Contract: ₹{(((activeProject?.contractValue || 0)) / 100000).toFixed(1)}L
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-md bg-amber-500" />
                  <span className="text-zinc-200">Actual Spent</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-md bg-zinc-600" />
                  <span className="text-zinc-400">Planned Budget</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181b24', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: any) => [`₹${value} Lakhs`, '']}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#spendGrad)" name="Spent" />
                  <Area type="monotone" dataKey="budget" stroke="#71717a" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Budget" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Milestones Progress Bar */}
          <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-zinc-100 font-['Outfit',sans-serif]">Current Milestone Timeline</h3>
                <p className="text-xs text-zinc-400">{(activeProject?.milestones || []).length} defined project phases</p>
              </div>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center"
              >
                View Gantt <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {(activeProject?.milestones || []).slice(0, 4).map(m => (
                <div key={m.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-200">{m.title}</span>
                    <span className={`font-semibold ${
                      m.status === 'Completed' ? 'text-emerald-400' : m.status === 'In Progress' ? 'text-amber-400' : 'text-zinc-500'
                    }`}>
                      {m.progress}% ({m.status})
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        m.status === 'Completed' ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                      }`}
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions, Alerts, Recent DSR */}
        <div className="space-y-6">
          {/* Quick Execution Shortcuts */}
          <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3.5">
              Field & Office Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="quick-action-attendance"
                onClick={() => onNavigate('labour')}
                className="flex flex-col items-start rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 hover:border-amber-500/30 hover:bg-zinc-800/60 transition text-left"
              >
                <Users className="h-4 w-4 text-amber-400 mb-2" />
                <span className="text-xs font-semibold text-zinc-200">Labour Attendance</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Mark 24 workers</span>
              </button>

              <button
                id="quick-action-material-inward"
                onClick={() => onNavigate('inventory')}
                className="flex flex-col items-start rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 hover:border-amber-500/30 hover:bg-zinc-800/60 transition text-left"
              >
                <Boxes className="h-4 w-4 text-amber-400 mb-2" />
                <span className="text-xs font-semibold text-zinc-200">Receive Material</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Cement, Steel, AAC</span>
              </button>

              <button
                id="quick-action-record-expense"
                onClick={() => onNavigate('finance')}
                className="flex flex-col items-start rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 hover:border-amber-500/30 hover:bg-zinc-800/60 transition text-left"
              >
                <IndianRupee className="h-4 w-4 text-amber-400 mb-2" />
                <span className="text-xs font-semibold text-zinc-200">Record Expense</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Attach bill / receipt</span>
              </button>

              <button
                id="quick-action-site-photos"
                onClick={() => onNavigate('photos')}
                className="flex flex-col items-start rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 hover:border-amber-500/30 hover:bg-zinc-800/60 transition text-left"
              >
                <Camera className="h-4 w-4 text-amber-400 mb-2" />
                <span className="text-xs font-semibold text-zinc-200">Site Photos</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Tag room & date</span>
              </button>
            </div>
          </div>

          {/* Low Stock Material Inventory Alert Card */}
          {lowStockItems.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Inventory Restock Needed
                  </h4>
                </div>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="text-[11px] font-semibold text-amber-400 underline hover:text-amber-300"
                >
                  Restock
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {lowStockItems.slice(0, 3).map(m => (
                  <div key={m.id} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/60 last:border-0">
                    <span className="text-zinc-200 truncate max-w-[150px]">{m.name}</span>
                    <span className="font-semibold text-amber-300">{m.currentBalance} {m.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Daily Site Report (DSR) Card */}
          <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Latest Site Log
              </h3>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Verified
              </span>
            </div>

            {dailyReports.length > 0 && (
              <div className="mt-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Logged by: {dailyReports[0].supervisorName}</span>
                  <span>{dailyReports[0].date}</span>
                </div>
                <p className="text-xs text-zinc-200 line-clamp-3 leading-relaxed">
                  "{dailyReports[0].todaysWork}"
                </p>
                {dailyReports[0].issues && dailyReports[0].issues !== 'None reported.' && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-[11px] text-rose-300">
                    <span className="font-semibold">Snag/Alert:</span> {dailyReports[0].issues}
                  </div>
                )}
                <button
                  onClick={() => onNavigate('daily-reports')}
                  className="w-full mt-2 rounded-xl border border-zinc-700 bg-zinc-800/80 py-2 text-center text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
                >
                  View Full Daily Reports Log
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
