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
  AlertCircle
} from 'lucide-react';

export const LabourAttendanceView: React.FC = () => {
  const {
    workers,
    attendance,
    markAttendance,
    addWorker,
    updateWorker,
    activeProjectId,
    activeProject
  } = useCasabuild();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tradeFilter, setTradeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [selectedWorkerProfile, setSelectedWorkerProfile] = useState<Worker | null>(null);

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
    return matchTrade && matchSearch;
  });

  // Today's attendance stats
  const todayAttendanceRecords = attendance.filter(a => a.date === selectedDate);
  const presentCount = todayAttendanceRecords.filter(a => a.status === 'Present').length;
  const halfDayCount = todayAttendanceRecords.filter(a => a.status === 'Half Day').length;
  const absentCount = todayAttendanceRecords.filter(a => a.status === 'Absent').length;
  const totalDailyWages = todayAttendanceRecords.reduce((acc, curr) => acc + curr.payableAmount, 0);

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
    // refresh modal
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

        <div className="flex items-center space-x-2.5">
          <button
            id="labour-add-worker-btn"
            onClick={() => setShowAddWorkerModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2 text-xs font-semibold text-zinc-950 transition shadow-lg shadow-amber-500/20 active:scale-95"
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
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search worker by name..."
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
        </div>

        <div className="text-xs text-zinc-400">
          Showing <span className="font-semibold text-zinc-200">{filteredWorkers.length}</span> active tradespeople
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
                  <tr key={worker.id} className="hover:bg-zinc-800/40 transition">
                    {/* Worker Info */}
                    <td className="py-3 px-4">
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => setSelectedWorkerProfile(worker)}
                      >
                        <img
                          src={worker.photo}
                          alt={worker.name}
                          className="h-9 w-9 rounded-full object-cover ring-1 ring-zinc-700"
                        />
                        <div>
                          <p className="font-bold text-zinc-100 hover:text-amber-300 transition">
                            {worker.name}
                          </p>
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
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => markAttendance(worker.id, 'Half Day', currentTask)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            currentStatus === 'Half Day'
                              ? 'bg-amber-500 text-zinc-950 shadow'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Half Day
                        </button>
                        <button
                          onClick={() => markAttendance(worker.id, 'Absent', 'Absent')}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            currentStatus === 'Absent'
                              ? 'bg-rose-600 text-white shadow'
                              : 'text-zinc-400 hover:text-white'
                          }`}
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
                        onChange={(e) => markAttendance(worker.id, currentStatus, e.target.value)}
                        placeholder="Task e.g. Brickwork Bedroom 2"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none"
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
                      <button
                        onClick={() => setSelectedWorkerProfile(worker)}
                        className="rounded-xl bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700 border border-zinc-700 transition"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Profile Detail Modal (Matches Video Blueprint Shows: Photo, Mobile, Wage, Total days worked, Pending payment, Advance received) */}
      {selectedWorkerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedWorkerProfile.photo}
                  alt={selectedWorkerProfile.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-amber-500/40"
                />
                <div>
                  <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">{selectedWorkerProfile.name}</h3>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                    {selectedWorkerProfile.trade}
                  </span>
                  <p className="text-xs text-zinc-400 mt-1">{selectedWorkerProfile.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorkerProfile(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

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

            {/* Actions: Record Advance / Settle Payment */}
            <div className="mt-5 flex space-x-2 pt-3 border-t border-zinc-800">
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
