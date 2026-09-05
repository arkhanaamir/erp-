import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { Worker, AttendanceRecord } from '../types';
import {
  Users2,
  Plus,
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  HardHat,
  Search,
  Filter,
  DollarSign,
  UserCheck,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Ban,
  UserX,
  Edit3,
  Trash2,
  ShieldAlert,
  Lock,
  Check
} from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

export const LabourAttendanceView: React.FC = () => {
  const {
    workers,
    attendance,
    markAttendance,
    addWorker,
    updateWorker,
    deleteWorker,
    toggleWorkerBlacklist,
    toggleWorkerDisabled,
    currentUser,
    activeProjectId,
    activeProject
  } = useCasabuild();

  const isOwner = currentUser?.role === 'owner' || currentUser?.email.trim().toLowerCase() === 'ar.khanaamir@gmail.com';

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tradeFilter, setTradeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Blacklisted' | 'Disabled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [selectedWorkerProfile, setSelectedWorkerProfile] = useState<Worker | null>(null);

  // Edit worker profile state (Owner only)
  const [isEditingWorker, setIsEditingWorker] = useState(false);
  const [editWorkerName, setEditWorkerName] = useState('');
  const [editWorkerTrade, setEditWorkerTrade] = useState('');
  const [editWorkerPhone, setEditWorkerPhone] = useState('');
  const [editWorkerWage, setEditWorkerWage] = useState('');

  // New Worker Form
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerTrade, setNewWorkerTrade] = useState<any>('Mason');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerWage, setNewWorkerWage] = useState('950');

  // Advance Payment Modal
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);

  // Filtered workers
  const filteredWorkers = workers.filter(w => {
    const matchTrade = tradeFilter === 'All' || w.trade === tradeFilter;
    const matchSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.phone.includes(searchQuery);
    const matchStatus = 
      statusFilter === 'All' ? true :
      statusFilter === 'Blacklisted' ? !!w.isBlacklisted :
      statusFilter === 'Disabled' ? !!w.disabled :
      !w.isBlacklisted && !w.disabled;
    return matchTrade && matchSearch && matchStatus;
  });

  // Today's attendance stats
  const todayAttendanceRecords = attendance.filter(a => a.date === selectedDate);
  const presentCount = todayAttendanceRecords.filter(a => a.status === 'Present').length;
  const halfDayCount = todayAttendanceRecords.filter(a => a.status === 'Half Day').length;
  const absentCount = todayAttendanceRecords.filter(a => a.status === 'Absent').length;
  const totalDailyWages = todayAttendanceRecords.reduce((acc, curr) => acc + curr.payableAmount, 0);

  const handleOpenProfile = (w: Worker) => {
    setSelectedWorkerProfile(w);
    setEditWorkerName(w.name);
    setEditWorkerTrade(w.trade);
    setEditWorkerPhone(w.phone);
    setEditWorkerWage(String(w.dailyWage));
    setIsEditingWorker(false);
  };

  const handleSaveWorkerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerProfile || !isOwner) return;

    updateWorker(selectedWorkerProfile.id, {
      name: editWorkerName.trim(),
      trade: editWorkerTrade.trim() as any,
      phone: editWorkerPhone.trim(),
      dailyWage: Number(editWorkerWage) || selectedWorkerProfile.dailyWage
    });

    setSelectedWorkerProfile(prev => prev ? {
      ...prev,
      name: editWorkerName.trim(),
      trade: editWorkerTrade.trim() as any,
      phone: editWorkerPhone.trim(),
      dailyWage: Number(editWorkerWage) || selectedWorkerProfile.dailyWage
    } : null);

    setIsEditingWorker(false);
  };

  const handleToggleBlacklist = (w: Worker) => {
    if (!isOwner) {
      alert('Blacklisting contractors or workers can only be done by Managing Owner Ar. Aamir Khan.');
      return;
    }

    if (w.isBlacklisted) {
      if (window.confirm(`Remove ${w.name} from the blacklist and restore active status?`)) {
        toggleWorkerBlacklist(w.id);
        if (selectedWorkerProfile?.id === w.id) {
          setSelectedWorkerProfile(prev => prev ? { ...prev, isBlacklisted: false, blacklistReason: undefined } : null);
        }
      }
    } else {
      const reason = window.prompt(`Enter reason for blacklisting ${w.name}:`, 'Non-compliance with safety standards / absenteeism');
      if (reason !== null) {
        toggleWorkerBlacklist(w.id, reason || 'Blacklisted by Managing Owner');
        if (selectedWorkerProfile?.id === w.id) {
          setSelectedWorkerProfile(prev => prev ? { ...prev, isBlacklisted: true, blacklistReason: reason || 'Blacklisted by Managing Owner' } : null);
        }
      }
    }
  };

  const handleToggleDisabled = (w: Worker) => {
    if (!isOwner) {
      alert('Disabling profiles can only be performed by Managing Owner Ar. Aamir Khan.');
      return;
    }
    toggleWorkerDisabled(w.id);
    if (selectedWorkerProfile?.id === w.id) {
      setSelectedWorkerProfile(prev => prev ? { ...prev, disabled: !prev.disabled } : null);
    }
  };

  const handleDeleteWorkerProfile = (w: Worker) => {
    if (!isOwner) {
      alert('Deleting worker profiles is strictly restricted to Managing Owner Ar. Aamir Khan.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete profile for "${w.name}"?`)) {
      deleteWorker(w.id);
      setSelectedWorkerProfile(null);
    }
  };

  const handleExportMusterRoll = () => {
    const headers = [
      'Worker ID',
      'Worker Full Name',
      'Trade / Skill',
      'Contact Phone',
      'Attendance Date',
      'Attendance Status',
      'Work Assigned Today',
      'Daily Wage Rate (INR)',
      'Payable Wage Today (INR)',
      'Blacklisted Status',
      'Profile Account Status'
    ];
    const rows = workers.map(w => {
      const rec = attendance.find(a => a.workerId === w.id && a.date === selectedDate);
      const st = rec?.status || 'Present';
      const wageToday = st === 'Present' ? w.dailyWage : st === 'Half Day' ? Math.round(w.dailyWage / 2) : 0;
      return [
        w.id,
        w.name,
        w.trade,
        w.phone,
        selectedDate,
        st,
        rec?.workAssigned || 'General execution',
        w.dailyWage,
        wageToday,
        w.isBlacklisted ? `BLACKLISTED: ${w.blacklistReason || 'Restricted'}` : 'Cleared',
        w.disabled ? 'Disabled' : 'Active'
      ];
    });
    exportToExcel(`casabuild_muster_roll_${selectedDate}`, headers, rows);
  };

  const handleExportWorkersDirectory = () => {
    const headers = [
      'Worker ID',
      'Full Name',
      'Trade / Craft',
      'Mobile Phone Number',
      'Daily Wage Rate (INR)',
      'Total Days Worked',
      'Advance Received (INR)',
      'Pending Wage Due (INR)',
      'Blacklisted Flag',
      'Blacklist Reason',
      'Account Profile Status'
    ];
    const rows = workers.map(w => [
      w.id,
      w.name,
      w.trade,
      w.phone,
      w.dailyWage,
      w.totalDaysWorked,
      w.advanceReceived,
      w.pendingWage,
      w.isBlacklisted ? 'YES' : 'NO',
      w.blacklistReason || 'N/A',
      w.disabled ? 'Disabled' : 'Active'
    ]);
    exportToExcel('casabuild_workforce_contractors_directory', headers, rows);
  };

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName) return;
    addWorker({
      name: newWorkerName,
      trade: newWorkerTrade,
      phone: newWorkerPhone || '+91 98000 12345',
      dailyWage: Number(newWorkerWage) || 850
    });
    setShowAddWorkerModal(false);
    setNewWorkerName('');
    setNewWorkerPhone('');
  };

  const handleRecordAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerProfile || !advanceAmount) return;
    const adv = Number(advanceAmount);
    updateWorker(selectedWorkerProfile.id, {
      advanceReceived: selectedWorkerProfile.advanceReceived + adv,
      pendingWage: Math.max(0, selectedWorkerProfile.pendingWage - adv)
    });
    setShowAdvanceModal(false);
    setAdvanceAmount('');
    setSelectedWorkerProfile(prev => prev ? {
      ...prev,
      advanceReceived: prev.advanceReceived + adv,
      pendingWage: Math.max(0, prev.pendingWage - adv)
    } : null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
              Module 3
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-['Outfit',sans-serif]">
              Labour Attendance & Daily Tasks
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Digital muster roll with real-time wage calculation, daily task allocations, and automated workforce payroll.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="labour-export-muster-excel-btn"
            onClick={handleExportMusterRoll}
            className="flex items-center space-x-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
            title="Export daily muster roll and task assignments to Microsoft Excel / CSV"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Muster Roll</span>
          </button>

          <button
            id="labour-export-directory-excel-btn"
            onClick={handleExportWorkersDirectory}
            className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
            title="Export all registered labour & subcontractor contacts to Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Export Workforce</span>
          </button>

          <button
            id="labour-add-worker-btn"
            onClick={() => setShowAddWorkerModal(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Worker</span>
          </button>
        </div>
      </div>

      {/* Daily Roster Metric Cards (Matches Video Blueprint) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Date</span>
            <Calendar className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-base font-bold text-zinc-100">{selectedDate}</p>
          <span className="text-[10px] text-zinc-500">{activeProject.name}</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Present (Full)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">{presentCount || 18}</span>
            <span className="text-[11px] text-zinc-400">On-site</span>
          </div>
          <span className="text-[10px] text-zinc-500">Full daily rate</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Half Day</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-400">{halfDayCount || 2}</span>
            <span className="text-[11px] text-zinc-400">Shift</span>
          </div>
          <span className="text-[10px] text-zinc-500">50% wage calculated</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Daily Payout</span>
            <IndianRupee className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-zinc-100">
              ₹{(totalDailyWages || 19800).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-zinc-400">Accrued</span>
          </div>
          <span className="text-[10px] text-zinc-500">Auto wage settlement</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search worker by name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <select
            value={tradeFilter}
            onChange={e => setTradeFilter(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 focus:border-amber-500/60 outline-none"
          >
            <option value="All">All Trades</option>
            <option value="Mason">Mason</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Tile Specialist">Tile Specialist</option>
            <option value="Helper">Helper</option>
            <option value="Painter">Painter</option>
          </select>

          {/* Status Filter Chips */}
          <div className="inline-flex rounded-xl bg-zinc-900 p-0.5 border border-zinc-800 text-xs">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'All' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({workers.length})
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'Active' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('Blacklisted')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'Blacklisted' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Blacklisted ({workers.filter(w => w.isBlacklisted).length})
            </button>
          </div>
        </div>

        <div className="text-xs text-zinc-400">
          Showing <span className="font-semibold text-zinc-200">{filteredWorkers.length}</span> records
        </div>
      </div>

      {/* Attendance Matrix Table (Exactly matching video blueprint) */}
      <div className="rounded-2xl border border-zinc-800 bg-[#161922] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/60 uppercase tracking-wider text-zinc-400 text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Worker Profile</th>
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Work / Task Assigned Today</th>
                <th className="py-3 px-4 text-right">Daily Rate</th>
                <th className="py-3 px-4 text-right">Today's Wage</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredWorkers.map(worker => {
                const todayRecord = attendance.find(a => a.workerId === worker.id && a.date === selectedDate);
                const currentStatus = todayRecord?.status || 'Present';
                const currentTask = todayRecord?.workAssigned || 'General execution as assigned';

                return (
                  <tr
                    key={worker.id}
                    className={`transition ${
                      worker.isBlacklisted
                        ? 'bg-rose-950/20 border-l-2 border-l-rose-500 hover:bg-rose-950/30'
                        : worker.disabled
                        ? 'bg-zinc-900/40 opacity-70 hover:bg-zinc-900/60'
                        : 'hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Worker Info */}
                    <td className="py-3 px-4">
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => handleOpenProfile(worker)}
                      >
                        <img
                          src={worker.photo}
                          alt={worker.name}
                          className="h-9 w-9 rounded-full object-cover ring-1 ring-zinc-700"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <p className="font-bold text-zinc-100 hover:text-amber-300 transition">
                              {worker.name}
                            </p>
                            {worker.isBlacklisted && (
                              <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-400 border border-rose-500/30">
                                BLACKLISTED
                              </span>
                            )}
                            {worker.disabled && (
                              <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] font-semibold text-zinc-400 border border-zinc-700">
                                DISABLED
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400">{worker.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Trade */}
                    <td className="py-3 px-4">
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                        {worker.trade}
                      </span>
                    </td>

                    {/* Status Toggle Buttons: Present, Half Day, Absent */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-700/80">
                        <button
                          onClick={() => markAttendance(worker.id, 'Present', currentTask)}
                          disabled={worker.isBlacklisted || worker.disabled}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-zinc-400 hover:text-white'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => markAttendance(worker.id, 'Half Day', currentTask)}
                          disabled={worker.isBlacklisted || worker.disabled}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            currentStatus === 'Half Day'
                              ? 'bg-amber-500 text-zinc-950 shadow'
                              : 'text-zinc-400 hover:text-white'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          Half Day
                        </button>
                        <button
                          onClick={() => markAttendance(worker.id, 'Absent', 'Absent')}
                          disabled={worker.isBlacklisted || worker.disabled}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            currentStatus === 'Absent'
                              ? 'bg-rose-600 text-white shadow'
                              : 'text-zinc-400 hover:text-white'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>

                    {/* Work Assigned */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={currentTask}
                        disabled={worker.isBlacklisted || worker.disabled}
                        onChange={(e) => markAttendance(worker.id, currentStatus, e.target.value)}
                        placeholder="Task e.g. Brickwork Bedroom 2"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none disabled:opacity-50"
                      />
                    </td>

                    {/* Daily Rate */}
                    <td className="py-3 px-4 text-right font-medium text-zinc-300">
                      ₹{worker.dailyWage}
                    </td>

                    {/* Today's Payable Amount */}
                    <td className="py-3 px-4 text-right font-bold text-zinc-100">
                      ₹{currentStatus === 'Present' ? worker.dailyWage : currentStatus === 'Half Day' ? Math.round(worker.dailyWage / 2) : 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenProfile(worker)}
                          className="rounded-xl bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700 border border-zinc-700 transition"
                          title="View and edit profile details"
                        >
                          Profile
                        </button>

                        {isOwner && (
                          <button
                            onClick={() => handleToggleBlacklist(worker)}
                            className={`p-1 rounded-lg border text-[11px] transition ${
                              worker.isBlacklisted
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            }`}
                            title={worker.isBlacklisted ? 'Clear from Blacklist' : 'Add to Blacklist'}
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Profile Detail Modal (Matches Video Blueprint Shows: Photo, Mobile, Wage, Total days worked, Pending payment, Advance received + Owner Editing & Blacklist) */}
      {selectedWorkerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100 my-8">
            {/* Modal Top Bar */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedWorkerProfile.photo}
                  alt={selectedWorkerProfile.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-amber-500/40"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">
                      {selectedWorkerProfile.name}
                    </h3>
                    {selectedWorkerProfile.isBlacklisted && (
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                        BLACKLISTED
                      </span>
                    )}
                    {selectedWorkerProfile.disabled && (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 border border-zinc-700">
                        DISABLED
                      </span>
                    )}
                  </div>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20 inline-block mt-1">
                    {selectedWorkerProfile.trade}
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedWorkerProfile.phone}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedWorkerProfile(null);
                  setIsEditingWorker(false);
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {/* Blacklist Alert Banner if applicable */}
            {selectedWorkerProfile.isBlacklisted && (
              <div className="mt-3 flex items-start space-x-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-bold">Blacklisted Contractor / Worker:</span>
                  <p className="mt-0.5 text-[11px] text-rose-300/80">
                    {selectedWorkerProfile.blacklistReason || 'Restricted from site access and daily muster roll marking.'}
                  </p>
                </div>
              </div>
            )}

            {/* Non-owner notice */}
            {!isOwner && (
              <div className="mt-3 flex items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs text-zinc-400">
                <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Contact editing, blacklisting, and profile deletion are strictly reserved for Managing Owner Ar. Aamir Khan.</span>
              </div>
            )}

            {/* Edit Mode Form (Owner Only) */}
            {isOwner && isEditingWorker ? (
              <form onSubmit={handleSaveWorkerProfile} className="mt-4 space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                  <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Worker Profile & Contact</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingWorker(false)}
                    className="text-zinc-400 hover:text-zinc-200 text-[11px]"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editWorkerName}
                    onChange={e => setEditWorkerName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Trade / Craft</label>
                    <select
                      value={editWorkerTrade}
                      onChange={e => setEditWorkerTrade(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 outline-none"
                    >
                      <option value="Mason">Mason</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Tile Specialist">Tile Specialist</option>
                      <option value="Helper">Helper</option>
                      <option value="Painter">Painter</option>
                      <option value="Welder">Welder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Daily Wage (₹)</label>
                    <input
                      type="number"
                      required
                      value={editWorkerWage}
                      onChange={e => setEditWorkerWage(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Contact Phone Number (Mobile)</label>
                  <input
                    type="text"
                    required
                    value={editWorkerPhone}
                    onChange={e => setEditWorkerPhone(e.target.value)}
                    placeholder="+91 98000 12345"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingWorker(false)}
                    className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-1.5 font-bold text-zinc-950 hover:bg-amber-400 shadow"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Save Contact Changes</span>
                  </button>
                </div>
              </form>
            ) : null}

            {/* Payroll Stats Breakdown */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-[10px] uppercase text-zinc-400 font-semibold">Daily Wage</span>
                <p className="text-base font-bold text-zinc-100 mt-0.5">₹{selectedWorkerProfile.dailyWage} / day</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-[10px] uppercase text-zinc-400 font-semibold">Total Days Worked</span>
                <p className="text-base font-bold text-zinc-100 mt-0.5">{selectedWorkerProfile.totalDaysWorked} Days</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-[10px] uppercase text-zinc-400 font-semibold">Advance Received</span>
                <p className="text-base font-bold text-amber-400 mt-0.5">₹{selectedWorkerProfile.advanceReceived.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-[10px] uppercase text-zinc-400 font-semibold">Pending Payment</span>
                <p className="text-base font-bold text-emerald-400 mt-0.5">₹{selectedWorkerProfile.pendingWage.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="mt-4 flex space-x-2 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setShowAdvanceModal(true)}
                className="flex-1 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition"
              >
                Record Advance
              </button>
              <button
                onClick={() => {
                  updateWorker(selectedWorkerProfile.id, { pendingWage: 0 });
                  setSelectedWorkerProfile(prev => prev ? { ...prev, pendingWage: 0 } : null);
                }}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white shadow transition"
              >
                Settle Balance
              </button>
            </div>

            {/* Owner Administrative Actions */}
            {isOwner && (
              <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  Owner Administrative Governance
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {!isEditingWorker && (
                    <button
                      onClick={() => setIsEditingWorker(true)}
                      className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                      <span>Edit Contact</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleBlacklist(selectedWorkerProfile)}
                    className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      selectedWorkerProfile.isBlacklisted
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                        : 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                    }`}
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>{selectedWorkerProfile.isBlacklisted ? 'Remove Blacklist' : 'Blacklist Worker'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleDisabled(selectedWorkerProfile)}
                    className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition"
                  >
                    <UserX className="h-3.5 w-3.5 text-amber-400" />
                    <span>{selectedWorkerProfile.disabled ? 'Enable Profile' : 'Disable Profile'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteWorkerProfile(selectedWorkerProfile)}
                    className="flex items-center space-x-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition ml-auto"
                    title="Permanently remove worker profile"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Advance Sub-Modal */}
      {showAdvanceModal && selectedWorkerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#161922] p-5 shadow-2xl text-zinc-100">
            <h4 className="text-sm font-bold text-zinc-100 font-['Outfit',sans-serif]">Record Advance Payment</h4>
            <p className="text-xs text-zinc-400 mt-1">To: {selectedWorkerProfile.name}</p>
            <form onSubmit={handleRecordAdvance} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Advance Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g., 2000"
                  value={advanceAmount}
                  onChange={e => setAdvanceAmount(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAdvanceModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-1.5 font-semibold text-zinc-950 shadow">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Add New Workforce Member</h3>
            <form onSubmit={handleCreateWorker} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Worker Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rashid Ali"
                  value={newWorkerName}
                  onChange={e => setNewWorkerName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Specialized Trade</label>
                  <select
                    value={newWorkerTrade}
                    onChange={e => setNewWorkerTrade(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  >
                    <option value="Mason">Mason</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Tile Specialist">Tile Specialist</option>
                    <option value="Helper">Helper</option>
                    <option value="Painter">Painter</option>
                    <option value="Welder">Welder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Daily Wage Rate (₹)</label>
                  <input
                    type="number"
                    value={newWorkerWage}
                    onChange={e => setNewWorkerWage(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98XXX XXXXX"
                  value={newWorkerPhone}
                  onChange={e => setNewWorkerPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAddWorkerModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-1.5 font-semibold text-zinc-950 shadow">Add Worker</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
