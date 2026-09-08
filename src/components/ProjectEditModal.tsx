import React, { useState, useEffect } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { Project, ProjectMilestone, BOQItem } from '../types';
import {
  X,
  Building,
  MapPin,
  Calendar,
  IndianRupee,
  Layers,
  FileSpreadsheet,
  Trash2,
  Plus,
  AlertTriangle,
  Save,
  Check,
  ShieldAlert,
  User,
  Clock,
  Pencil,
  FileText
} from 'lucide-react';

interface ProjectEditModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'basic' | 'financials' | 'milestones' | 'boq' | 'danger';
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  isOpen,
  onClose,
  initialTab = 'basic'
}) => {
  const { updateProject, deleteProject, projects, currentRole } = useCasabuild();

  const [activeTab, setActiveTab] = useState<'basic' | 'financials' | 'milestones' | 'boq' | 'danger'>('basic');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State initialized from project
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<Project['type']>('Turnkey');
  const [status, setStatus] = useState<Project['status']>('Active');
  const [areaSqFt, setAreaSqFt] = useState<number>(3000);
  const [coverImage, setCoverImage] = useState('');

  // Financials & Dates
  const [contractValue, setContractValue] = useState<number>(0);
  const [budget, setBudget] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');

  // Overall Completion
  const [overallProgress, setOverallProgress] = useState<number>(0);

  // Milestones / Stages
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestonePhase, setNewMilestonePhase] = useState('Finishes');
  const [newMilestoneStart, setNewMilestoneStart] = useState('');
  const [newMilestoneEnd, setNewMilestoneEnd] = useState('');
  const [newMilestoneAssigned, setNewMilestoneAssigned] = useState('Casabuild Execution Team');

  // BOQ Items
  const [boq, setBoq] = useState<BOQItem[]>([]);
  const [newBOQItem, setNewBOQItem] = useState('');
  const [newBOQCategory, setNewBOQCategory] = useState('Civil');
  const [newBOQUnit, setNewBOQUnit] = useState('Sq.Ft');
  const [newBOQQty, setNewBOQQty] = useState<number>(100);
  const [newBOQRate, setNewBOQRate] = useState<number>(550);

  // Delete Confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setName(project.name || '');
      setCode(project.code || '');
      setClientName(project.clientName || '');
      setClientPhone(project.clientPhone || '');
      setClientEmail(project.clientEmail || '');
      setLocation(project.location || '');
      setType(project.type || 'Turnkey');
      setStatus(project.status || 'Active');
      setAreaSqFt(project.areaSqFt || 0);
      setCoverImage(project.coverImage || '');

      setContractValue(project.contractValue || 0);
      setBudget(project.budget || 0);
      setTotalSpent(project.totalSpent || 0);
      setStartDate(project.startDate || '');
      setExpectedCompletion(project.expectedCompletion || '');

      setOverallProgress(project.overallProgress || 0);
      setMilestones(project.milestones ? JSON.parse(JSON.stringify(project.milestones)) : []);
      setBoq(project.boq ? JSON.parse(JSON.stringify(project.boq)) : []);
      setActiveTab(initialTab);
      setShowDeleteConfirm(false);
      setSaveSuccess(false);
    }
  }, [project, isOpen, initialTab]);

  if (!isOpen || !project) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    updateProject(project.id, {
      name: name.trim() || project.name,
      code: code.trim() || project.code,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      location: location.trim(),
      type,
      status,
      areaSqFt: Number(areaSqFt) || 0,
      coverImage: coverImage.trim() || project.coverImage,
      contractValue: Number(contractValue) || 0,
      budget: Number(budget) || 0,
      totalSpent: Number(totalSpent) || 0,
      startDate,
      expectedCompletion,
      overallProgress: Math.min(100, Math.max(0, Number(overallProgress) || 0)),
      milestones,
      boq
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleRecalculateProgressFromMilestones = () => {
    if (milestones.length === 0) return;
    const avg = Math.round(
      milestones.reduce((acc, curr) => acc + (Number(curr.progress) || 0), 0) / milestones.length
    );
    setOverallProgress(avg);
  };

  const handleUpdateMilestone = (id: string, updates: Partial<ProjectMilestone>) => {
    setMilestones(prev =>
      prev.map(m => {
        if (m.id === id) {
          const updated = { ...m, ...updates };
          if (updates.progress !== undefined) {
            const prog = Number(updates.progress);
            updated.progress = prog;
            updated.status = prog === 100 ? 'Completed' : prog > 0 ? 'In Progress' : 'Upcoming';
          }
          return updated;
        }
        return m;
      })
    );
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    const newM: ProjectMilestone = {
      id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: newMilestoneTitle.trim(),
      phase: newMilestonePhase,
      startDate: newMilestoneStart || new Date().toISOString().split('T')[0],
      endDate: newMilestoneEnd || '',
      progress: 0,
      status: 'Upcoming',
      assignedTo: newMilestoneAssigned.trim() || 'Casabuild Execution Team'
    };
    setMilestones(prev => [...prev, newM]);
    setNewMilestoneTitle('');
    setNewMilestoneStart('');
    setNewMilestoneEnd('');
  };

  const handleUpdateBOQ = (id: string, updates: Partial<BOQItem>) => {
    setBoq(prev =>
      prev.map(b => {
        if (b.id === id) {
          const updated = { ...b, ...updates };
          if (updates.quantity !== undefined || updates.unitRate !== undefined) {
            const q = updates.quantity !== undefined ? Number(updates.quantity) : b.quantity;
            const r = updates.unitRate !== undefined ? Number(updates.unitRate) : b.unitRate;
            updated.amount = Math.round(q * r);
          }
          if (updates.completedPercent !== undefined) {
            const cp = Number(updates.completedPercent);
            updated.completedPercent = cp;
            updated.billedAmount = Math.round((updated.amount * cp) / 100);
          }
          return updated;
        }
        return b;
      })
    );
  };

  const handleRemoveBOQ = (id: string) => {
    setBoq(prev => prev.filter(b => b.id !== id));
  };

  const handleAddBOQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBOQItem.trim()) return;
    const qty = Number(newBOQQty) || 1;
    const rate = Number(newBOQRate) || 0;
    const amount = Math.round(qty * rate);
    const newB: BOQItem = {
      id: `boq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      item: newBOQItem.trim(),
      category: newBOQCategory,
      unit: newBOQUnit,
      quantity: qty,
      unitRate: rate,
      amount,
      completedPercent: 0,
      billedAmount: 0
    };
    setBoq(prev => [...prev, newB]);
    setNewBOQItem('');
  };

  const handleDeleteProject = () => {
    if (projects.length <= 1) {
      alert('Cannot delete the only remaining active project in the ERP system.');
      return;
    }
    deleteProject(project.id);
    onClose();
  };

  const isOwner = currentRole === 'owner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-zinc-800 bg-[#161922] shadow-2xl text-zinc-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-900/60">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 font-['Outfit',sans-serif]">
                  Edit Project Specifications
                </h3>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-amber-400 border border-zinc-700">
                  {project.code}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Modify project name, area, location, milestones, contracts, live BOQ, stages, and completion.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-5 overflow-x-auto scrollbar-none">
          {[
            { id: 'basic', label: 'General & Specs', icon: Building },
            { id: 'financials', label: 'Financials & Dates', icon: IndianRupee },
            { id: 'milestones', label: `Stages & Milestones (${milestones.length})`, icon: Layers },
            { id: 'boq', label: `Live BOQ (${boq.length})`, icon: FileSpreadsheet },
            { id: 'danger', label: 'Delete & Archive', icon: Trash2, danger: true }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`project-edit-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 border-b-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? tab.danger
                      ? 'border-rose-500 text-rose-400'
                      : 'border-amber-500 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? (tab.danger ? 'text-rose-400' : 'text-amber-400') : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* TAB 1: BASIC & SPECS */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., The Skyline Penthouse"
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Project Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g., CB-2025-01"
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Project Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Turnkey">Turnkey Execution</option>
                    <option value="Architecture">Architecture & Civil</option>
                    <option value="Interiors">Luxury Interiors</option>
                    <option value="Construction">Construction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Site Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Active">Active Site</option>
                    <option value="On Hold">On Hold / Paused</option>
                    <option value="Completed">Completed & Handed Over</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Built-Up Area (Sq.Ft) *</label>
                  <input
                    type="number"
                    value={areaSqFt}
                    onChange={e => setAreaSqFt(Number(e.target.value))}
                    placeholder="e.g., 4200"
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Site Location / Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g., DLF Phase 5, Golf Course Road, Gurugram, Haryana"
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 pl-9 pr-3 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Client & Primary Stakeholder
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="e.g., Rajesh Aggarwal"
                      className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Client Phone</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="+91 98100 XXXXX"
                      className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Client Email</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      placeholder="client@casabuild.com"
                      className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Project Cover Image URL</label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
                {coverImage && (
                  <div className="mt-2 h-24 w-full rounded-xl overflow-hidden border border-zinc-800">
                    <img src={coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIALS & CONTRACT DATES */}
          {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Contract Value (₹)</label>
                  <input
                    type="number"
                    value={contractValue}
                    onChange={e => setContractValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    ≈ ₹{(contractValue / 100000).toFixed(2)} Lakhs
                  </span>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Allocated Budget (₹)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    ≈ ₹{(budget / 100000).toFixed(2)} Lakhs
                  </span>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Total Spent to Date (₹)</label>
                  <input
                    type="number"
                    value={totalSpent}
                    onChange={e => setTotalSpent(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-amber-400 mt-1 block">
                    Variance: ₹{((budget - totalSpent) / 100000).toFixed(2)} Lakhs headroom
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Project Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-zinc-750 bg-zinc-900 pl-9 pr-3 py-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Expected Completion / Handover</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={expectedCompletion}
                      onChange={e => setExpectedCompletion(e.target.value)}
                      placeholder="e.g., Nov 2025"
                      className="w-full rounded-xl border border-zinc-750 bg-zinc-900 pl-9 pr-3 py-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="flex items-center space-x-2 text-zinc-200 font-semibold mb-2">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <span>Contracts & Payment Terms</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Project billing is managed in milestone phases (Mobilization Advance 15%, Plinth & Structure 35%, MEP & Masonry 25%, Finishing & Handover 25%). All work orders and agreements are linked to this project code ({project.code}).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: STAGES, MILESTONES & COMPLETION */}
          {activeTab === 'milestones' && (
            <div className="space-y-5">
              {/* Overall Completion Controller */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Overall Project Completion
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      Drag slider to update executive progress or auto-calculate from active stage milestones
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleRecalculateProgressFromMilestones}
                      className="rounded-lg border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition"
                    >
                      Recalculate Average
                    </button>
                    <span className="text-lg font-extrabold text-amber-400 font-mono">
                      {overallProgress}%
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overallProgress}
                  onChange={e => setOverallProgress(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-amber-500 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Milestones List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-200">
                    Execution Milestones & Stages ({milestones.length})
                  </h4>
                  <span className="text-[11px] text-zinc-500">
                    Adjust stage progress, target dates & status
                  </span>
                </div>

                {milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5 space-y-2.5 hover:border-zinc-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="h-5 w-5 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={m.title}
                          onChange={e => handleUpdateMilestone(m.id, { title: e.target.value })}
                          className="flex-1 font-semibold text-zinc-100 bg-transparent border-b border-zinc-750 focus:border-amber-500 focus:outline-none px-1 py-0.5"
                        />
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <select
                          value={m.phase}
                          onChange={e => handleUpdateMilestone(m.id, { phase: e.target.value })}
                          className="rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] p-1 focus:outline-none"
                        >
                          <option value="Planning">Planning</option>
                          <option value="Substructure">Substructure</option>
                          <option value="Structure">Structure</option>
                          <option value="MEP Services">MEP Services</option>
                          <option value="Finishes">Finishes</option>
                          <option value="Interiors">Interiors</option>
                          <option value="Handover">Handover</option>
                        </select>
                        <select
                          value={m.status}
                          onChange={e => handleUpdateMilestone(m.id, { status: e.target.value as any })}
                          className={`rounded-lg border text-[11px] font-semibold p-1 focus:outline-none ${
                            m.status === 'Completed'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : m.status === 'In Progress'
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Delayed">Delayed</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(m.id)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition"
                          title="Delete Milestone"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="flex items-center space-x-1.5 text-zinc-400">
                        <span>Start:</span>
                        <input
                          type="text"
                          value={m.startDate || ''}
                          onChange={e => handleUpdateMilestone(m.id, { startDate: e.target.value })}
                          placeholder="YYYY-MM-DD"
                          className="w-24 bg-zinc-800 rounded px-1.5 py-0.5 text-zinc-200 border border-zinc-700"
                        />
                      </div>
                      <div className="flex items-center space-x-1.5 text-zinc-400">
                        <span>Target End:</span>
                        <input
                          type="text"
                          value={m.endDate || ''}
                          onChange={e => handleUpdateMilestone(m.id, { endDate: e.target.value })}
                          placeholder="YYYY-MM-DD"
                          className="w-24 bg-zinc-800 rounded px-1.5 py-0.5 text-zinc-200 border border-zinc-700"
                        />
                      </div>
                      <div className="flex items-center space-x-1.5 text-zinc-400">
                        <span>Lead:</span>
                        <input
                          type="text"
                          value={m.assignedTo || ''}
                          onChange={e => handleUpdateMilestone(m.id, { assignedTo: e.target.value })}
                          placeholder="Assigned In-charge"
                          className="flex-1 bg-zinc-800 rounded px-1.5 py-0.5 text-zinc-200 border border-zinc-700"
                        />
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <div className="flex items-center space-x-3 pt-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={m.progress}
                        onChange={e => handleUpdateMilestone(m.id, { progress: Number(e.target.value) })}
                        className="h-1.5 w-full cursor-pointer accent-amber-500 bg-zinc-800 rounded-lg"
                      />
                      <span className="w-12 text-right font-bold text-zinc-200 font-mono">
                        {m.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Milestone Section */}
              <form onSubmit={handleAddMilestone} className="rounded-xl border border-dashed border-zinc-750 bg-zinc-900/30 p-4 space-y-3">
                <div className="flex items-center space-x-2 text-zinc-300 font-semibold">
                  <Plus className="h-4 w-4 text-amber-500" />
                  <span>Add New Stage / Milestone</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Milestone Title (e.g. Plastering & Waterproofing)"
                    value={newMilestoneTitle}
                    onChange={e => setNewMilestoneTitle(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                  <select
                    value={newMilestonePhase}
                    onChange={e => setNewMilestonePhase(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Planning">Phase: Planning</option>
                    <option value="Substructure">Phase: Substructure</option>
                    <option value="Structure">Phase: Structure</option>
                    <option value="MEP Services">Phase: MEP Services</option>
                    <option value="Finishes">Phase: Finishes</option>
                    <option value="Interiors">Phase: Interiors</option>
                    <option value="Handover">Phase: Handover</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="date"
                    value={newMilestoneStart}
                    onChange={e => setNewMilestoneStart(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="date"
                    value={newMilestoneEnd}
                    onChange={e => setNewMilestoneEnd(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Assigned Lead / Team"
                    value={newMilestoneAssigned}
                    onChange={e => setNewMilestoneAssigned(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 font-semibold text-zinc-200 border border-zinc-700 transition flex items-center space-x-1.5"
                >
                  <Plus className="h-3.5 w-3.5 text-amber-400" />
                  <span>Append Milestone</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: LIVE BOQ & QUANTITIES */}
          {activeTab === 'boq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-200">
                    Live Bill of Quantities (BOQ) ({boq.length} line items)
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Manage line items, unit rates, quantities, and certified completion percentage
                  </p>
                </div>
                <span className="font-mono font-bold text-amber-400">
                  Total BOQ: ₹{(boq.reduce((a, b) => a + (b.amount || 0), 0) / 100000).toFixed(2)} Lakhs
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Item Specification</th>
                      <th className="py-2.5 px-2">Category</th>
                      <th className="py-2.5 px-2 text-right">Qty & Unit</th>
                      <th className="py-2.5 px-2 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-2 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-2 text-center">Done (%)</th>
                      <th className="py-2.5 px-2 text-right">Billed (₹)</th>
                      <th className="py-2.5 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {boq.map(b => (
                      <tr key={b.id} className="hover:bg-zinc-800/40">
                        <td className="py-2.5 px-3 font-medium text-zinc-200 min-w-[140px]">
                          <input
                            type="text"
                            value={b.item}
                            onChange={e => handleUpdateBOQ(b.id, { item: e.target.value })}
                            className="w-full bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-amber-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-zinc-400">
                          <select
                            value={b.category}
                            onChange={e => handleUpdateBOQ(b.id, { category: e.target.value })}
                            className="bg-zinc-800 text-zinc-300 rounded px-1.5 py-0.5 border border-zinc-700"
                          >
                            <option value="Civil">Civil</option>
                            <option value="Structural">Structural</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Finishes">Finishes</option>
                            <option value="HVAC">HVAC</option>
                            <option value="Interiors">Interiors</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-2 text-right text-zinc-300">
                          <div className="flex items-center justify-end space-x-1">
                            <input
                              type="number"
                              value={b.quantity}
                              onChange={e => handleUpdateBOQ(b.id, { quantity: Number(e.target.value) })}
                              className="w-14 text-right bg-zinc-800 rounded px-1 border border-zinc-700"
                            />
                            <span className="text-zinc-500">{b.unit}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right text-zinc-300 font-mono">
                          <input
                            type="number"
                            value={b.unitRate}
                            onChange={e => handleUpdateBOQ(b.id, { unitRate: Number(e.target.value) })}
                            className="w-16 text-right bg-zinc-800 rounded px-1 border border-zinc-700"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-zinc-100 font-mono">
                          ₹{b.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={b.completedPercent}
                            onChange={e => handleUpdateBOQ(b.id, { completedPercent: Number(e.target.value) })}
                            className="w-12 text-center bg-zinc-800 rounded px-1 font-bold text-amber-400 border border-zinc-700"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-right font-semibold text-emerald-400 font-mono">
                          ₹{b.billedAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveBOQ(b.id)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition"
                            title="Delete BOQ Line"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add BOQ Form */}
              <form onSubmit={handleAddBOQ} className="rounded-xl border border-dashed border-zinc-750 bg-zinc-900/30 p-4 space-y-3">
                <div className="flex items-center space-x-2 text-zinc-300 font-semibold">
                  <Plus className="h-4 w-4 text-amber-500" />
                  <span>Add BOQ Line Item</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Item Description (e.g. Vitrified 800x800 Floor Tiles)"
                      value={newBOQItem}
                      onChange={e => setNewBOQItem(e.target.value)}
                      className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <select
                      value={newBOQCategory}
                      onChange={e => setNewBOQCategory(e.target.value)}
                      className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Civil">Civil</option>
                      <option value="Structural">Structural</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Finishes">Finishes</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Interiors">Interiors</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={newBOQUnit}
                      onChange={e => setNewBOQUnit(e.target.value)}
                      className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Sq.Ft">Sq.Ft</option>
                      <option value="Rft">Rft</option>
                      <option value="Cum">Cum</option>
                      <option value="Nos">Nos</option>
                      <option value="Bags">Bags</option>
                      <option value="Ton">Ton</option>
                      <option value="L.S">Lump Sum</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">Quantity</label>
                    <input
                      type="number"
                      value={newBOQQty}
                      onChange={e => setNewBOQQty(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">Unit Rate (₹)</label>
                    <input
                      type="number"
                      value={newBOQRate}
                      onChange={e => setNewBOQRate(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2.5 font-semibold text-zinc-200 border border-zinc-700 transition flex items-center justify-center space-x-1"
                    >
                      <Plus className="h-3.5 w-3.5 text-amber-400" />
                      <span>Append BOQ</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: DANGER ZONE & DELETE PROJECT */}
          {activeTab === 'danger' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">
                      Delete Project & Move to Recycle Bin
                    </h4>
                    <p className="text-xs text-rose-200/80">
                      Safe 30-Day Archival Window for "{project.name}" ({project.code})
                    </p>
                  </div>
                </div>

                <div className="text-zinc-300 text-xs space-y-2 bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                  <p className="font-semibold text-zinc-200">
                    What happens when you delete this project?
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    <li>The project is removed from active ERP dashboards, client portal, and site reports.</li>
                    <li>All {milestones.length} milestones, {boq.length} BOQ items, drawings, and logs are preserved.</li>
                    <li>It remains stored in the <strong className="text-amber-400">Recently Deleted Bin</strong> for 30 days.</li>
                    <li>Administrators or the Managing Owner can restore it at any time with a single click.</li>
                  </ul>
                </div>

                {!showDeleteConfirm ? (
                  <div className="pt-2">
                    <button
                      type="button"
                      id="project-delete-trigger-btn"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center space-x-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/25 transition active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Move Project to Recently Deleted</span>
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-rose-500/60 bg-rose-950/60 p-4 space-y-3 animate-in fade-in">
                    <div className="flex items-center space-x-2 text-rose-300 font-bold">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <span>Are you absolutely sure you want to delete "{project.name}"?</span>
                    </div>
                    <p className="text-xs text-rose-200/80">
                      This will archive project {project.code} into the 30-day recovery bin.
                    </p>
                    <div className="flex items-center space-x-3 pt-1">
                      <button
                        type="button"
                        id="confirm-delete-project-btn"
                        onClick={handleDeleteProject}
                        className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white transition active:scale-95"
                      >
                        Yes, Move to Recycle Bin
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800 px-5 py-4 bg-zinc-900/80">
          <div className="flex items-center space-x-2">
            {isOwner && activeTab !== 'danger' && (
              <button
                type="button"
                id="footer-delete-project-shortcut-btn"
                onClick={() => setActiveTab('danger')}
                className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-300 transition"
                title="Delete this project"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Project...</span>
              </button>
            )}
            {saveSuccess && (
              <span className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
                <Check className="h-4 w-4" />
                <span>Project updated successfully!</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              id="save-project-changes-btn"
              onClick={handleSave}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-5 py-2 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <Save className="h-4 w-4 stroke-[2.5]" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
