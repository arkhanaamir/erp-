import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { Project, ProjectMilestone, DrawingItem, BOQItem } from '../types';
import {
  FolderKanban,
  Plus,
  Calendar,
  IndianRupee,
  Activity,
  Layers,
  FileText,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  ChevronRight,
  Upload,
  Download,
  Percent,
  SlidersHorizontal,
  Compass,
  Building
} from 'lucide-react';

export const ProjectManagementView: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    addProject,
    updateProject,
    currentRole
  } = useCasabuild();

  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'drawings' | 'boq' | 'documents'>('overview');
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [showAddDrawingModal, setShowAddDrawingModal] = useState(false);

  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState<'Architecture' | 'Interiors' | 'Construction' | 'Turnkey'>('Turnkey');
  const [newContractValue, setNewContractValue] = useState('12000000');
  const [newAreaSqFt, setNewAreaSqFt] = useState('3500');

  // New Milestone Form State
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestonePhase, setMilestonePhase] = useState('Finishes');
  const [milestoneStart, setMilestoneStart] = useState('');
  const [milestoneEnd, setMilestoneEnd] = useState('');

  // New Drawing Form State
  const [drawingTitle, setDrawingTitle] = useState('');
  const [drawingType, setDrawingType] = useState<'Architectural' | 'Structural' | 'Interior' | 'MEP & Services'>('Architectural');
  const [drawingRevision, setDrawingRevision] = useState('R1');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    addProject({
      name: newProjectName,
      clientName: newClientName || 'Private Client',
      location: newLocation || 'Gurugram',
      type: newType,
      contractValue: Number(newContractValue) || 10000000,
      budget: Math.round(Number(newContractValue) * 0.88),
      areaSqFt: Number(newAreaSqFt) || 3000,
    });
    setShowAddProjectModal(false);
    setNewProjectName('');
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle) return;
    const newM: ProjectMilestone = {
      id: `m-${Date.now()}`,
      title: milestoneTitle,
      phase: milestonePhase,
      startDate: milestoneStart || new Date().toISOString().split('T')[0],
      endDate: milestoneEnd || '',
      progress: 0,
      status: 'Upcoming'
    };
    updateProject(activeProject.id, {
      milestones: [...activeProject.milestones, newM]
    });
    setShowAddMilestoneModal(false);
    setMilestoneTitle('');
  };

  const handleAddDrawing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawingTitle) return;
    const newD: DrawingItem = {
      id: `d-${Date.now()}`,
      title: drawingTitle,
      type: drawingType,
      revision: drawingRevision,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'In Review',
      approvedBy: 'Ar. Aamir Khan'
    };
    updateProject(activeProject.id, {
      drawings: [...activeProject.drawings, newD]
    });
    setShowAddDrawingModal(false);
    setDrawingTitle('');
  };

  const handleUpdateMilestoneProgress = (milestoneId: string, newProgress: number) => {
    const updated = activeProject.milestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          progress: newProgress,
          status: newProgress === 100 ? 'Completed' as const : newProgress > 0 ? 'In Progress' as const : 'Upcoming' as const
        };
      }
      return m;
    });
    
    // Auto recalculate overall project progress
    const avg = Math.round(
      updated.reduce((acc, curr) => acc + curr.progress, 0) / (updated.length || 1)
    );
    updateProject(activeProject.id, {
      milestones: updated,
      overallProgress: avg
    });
  };

  const handleUpdateBOQProgress = (boqId: string, newPercent: number) => {
    const updatedBOQ = activeProject.boq.map(b => {
      if (b.id === boqId) {
        const billed = Math.round((b.amount * newPercent) / 100);
        return { ...b, completedPercent: newPercent, billedAmount: billed };
      }
      return b;
    });
    updateProject(activeProject.id, { boq: updatedBOQ });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Project Selector Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
              Module 1
            </span>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl font-['Outfit',sans-serif]">
              Project Management & Timelines
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Control center for drawings, milestones, live BOQ, and contracts across all active sites.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {currentRole === 'owner' && (
            <button
              id="project-add-new-btn"
              onClick={() => setShowAddProjectModal(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-3.5 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Selector Horizontal Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {projects.map(p => (
          <button
            key={p.id}
            id={`project-pill-${p.id}`}
            onClick={() => setActiveProjectId(p.id)}
            className={`flex shrink-0 items-center space-x-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
              p.id === activeProjectId
                ? 'bg-zinc-800 text-amber-400 font-semibold shadow-md border border-amber-500/30'
                : 'bg-[#161922] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Building className="h-3.5 w-3.5 text-amber-500" />
            <span>{p.name}</span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              p.id === activeProjectId ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {p.overallProgress}%
            </span>
          </button>
        ))}
      </div>

      {/* Active Project Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#161922] shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-15">
          <img src={activeProject.coverImage} alt={activeProject.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161922] via-[#161922]/80 to-transparent" />
        </div>

        <div className="relative z-10 p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-medium text-amber-400">
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300 border border-zinc-700">
                  {activeProject.code}
                </span>
                <span>{activeProject.type} Project</span>
                <span>•</span>
                <span className="flex items-center text-zinc-300">
                  <MapPin className="mr-1 h-3.5 w-3.5 text-amber-500" />
                  {activeProject.location}
                </span>
              </div>
              <h3 className="mt-1.5 text-2xl font-bold text-zinc-100 font-['Outfit',sans-serif]">
                {activeProject.name}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Client: <span className="font-medium text-zinc-200">{activeProject.clientName}</span> ({activeProject.clientPhone}) • Built-up Area: <span className="text-zinc-200 font-medium">{activeProject.areaSqFt} Sq.Ft</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Contract Value</span>
                <p className="text-base font-bold text-emerald-400">
                  ₹{(activeProject.contractValue / 100000).toFixed(2)} Lakhs
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Spent to Date</span>
                <p className="text-base font-bold text-amber-400">
                  ₹{(activeProject.totalSpent / 100000).toFixed(2)} Lakhs
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 min-w-[120px]">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Completion</span>
                <p className="text-base font-bold text-zinc-100">
                  {activeProject.overallProgress}%
                </p>
              </div>
            </div>
          </div>

          {/* Module 1 Sub-Navigation Tabs */}
          <div className="mt-6 flex space-x-1 border-b border-zinc-800">
            {[
              { id: 'overview', label: 'Overview & Schedule' },
              { id: 'milestones', label: 'Milestones (Gantt)' },
              { id: 'drawings', label: `Drawings Vault (${activeProject.drawings.length})` },
              { id: 'boq', label: `Live BOQ (${activeProject.boq.length})` },
              { id: 'documents', label: 'Contracts & NOCs' }
            ].map(tab => (
              <button
                key={tab.id}
                id={`project-subtab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Phase Milestones Summary */}
            <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100 font-['Outfit',sans-serif]">Construction & Interior Lifecycle</h4>
                  <p className="text-xs text-zinc-400">Chronological execution progress</p>
                </div>
                <span className="text-xs font-semibold text-amber-400">
                  Target Handover: {activeProject.expectedCompletion || 'Feb 2026'}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {activeProject.milestones.map((m) => (
                  <div key={m.id} className="relative pl-6 pb-2 border-l-2 border-zinc-800 last:border-0">
                    <div className={`absolute -left-1.5 top-0 h-3 w-3 rounded-full ${
                      m.status === 'Completed' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : m.status === 'In Progress' ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-zinc-700'
                    }`} />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-zinc-200">{m.title}</span>
                      <span className={`text-[11px] font-medium ${
                        m.status === 'Completed' ? 'text-emerald-400' : m.status === 'In Progress' ? 'text-amber-400' : 'text-zinc-500'
                      }`}>
                        {m.progress}% • {m.status}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center space-x-3 text-[11px] text-zinc-400">
                      <span>Phase: {m.phase}</span>
                      <span>•</span>
                      <span>Assigned: {m.assignedTo || 'Casabuild Team'}</span>
                    </div>
                    <div className="mt-2 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          m.status === 'Completed' ? 'bg-emerald-400' : 'bg-amber-500'
                        }`}
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Details Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800">
                Site & Client Specifications
              </h4>
              <dl className="mt-3.5 space-y-3 text-xs">
                <div>
                  <dt className="text-zinc-500">Project Type</dt>
                  <dd className="font-medium text-zinc-200">{activeProject.type} Turnkey Execution</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Client Email</dt>
                  <dd className="font-medium text-zinc-200">{activeProject.clientEmail}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Project Budget</dt>
                  <dd className="font-medium text-zinc-200">₹{(activeProject.budget / 100000).toFixed(2)} Lakhs</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Estimated Variance</dt>
                  <dd className="font-medium text-emerald-400">+ ₹{((activeProject.budget - activeProject.totalSpent) / 100000).toFixed(2)} Lakhs headroom</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Start Date</dt>
                  <dd className="font-medium text-zinc-200">{activeProject.startDate}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Milestones Gantt & Progress Sliders */}
      {activeTab === 'milestones' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h4 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Interactive Milestone Timeline</h4>
              <p className="text-xs text-zinc-400">Update stage progress sliders to recalibrate project completion %</p>
            </div>
            <button
              onClick={() => setShowAddMilestoneModal(true)}
              className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
            >
              <Plus className="h-3.5 w-3.5 text-amber-500" />
              <span>Add Phase</span>
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            {activeProject.milestones.map(m => (
              <div key={m.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 mr-2 border border-amber-500/20">
                      {m.phase}
                    </span>
                    <span className="text-sm font-bold text-zinc-100 font-['Outfit',sans-serif]">{m.title}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-zinc-400">
                      {m.startDate || 'Start'} to {m.endDate || 'End'}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {m.progress}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={m.progress}
                    onChange={(e) => handleUpdateMilestoneProgress(m.id, Number(e.target.value))}
                    className="h-2 w-full cursor-pointer accent-amber-500 bg-zinc-800 rounded-lg"
                  />
                  <span className="w-12 text-right text-xs font-bold text-zinc-200">{m.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Drawings Vault */}
      {activeTab === 'drawings' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h4 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Architectural & Structural Drawings Vault</h4>
              <p className="text-xs text-zinc-400">Official PDFs, floorplans, and revisions for {activeProject.name}</p>
            </div>
            <button
              onClick={() => setShowAddDrawingModal(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-3.5 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Drawing</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeProject.drawings.map(d => (
              <div key={d.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-zinc-700 hover:bg-zinc-900">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                    {d.type}
                  </span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-300 border border-zinc-700">
                    {d.revision}
                  </span>
                </div>
                <h5 className="mt-2 text-sm font-bold text-zinc-100 font-['Outfit',sans-serif]">{d.title}</h5>
                <p className="mt-1 text-[11px] text-zinc-400">Approved By: {d.approvedBy || 'Pending'}</p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                  <span className={`font-semibold ${
                    d.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {d.status}
                  </span>
                  <button
                    onClick={() => alert(`Opening schematic view for ${d.title} (${d.revision})`)}
                    className="flex items-center space-x-1 text-amber-400 hover:text-amber-300"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View Plan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: BOQ (Bill of Quantities) Tracking */}
      {activeTab === 'boq' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
            <div>
              <h4 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Live Bill of Quantities (BOQ) & RA Billing</h4>
              <p className="text-xs text-zinc-400">Execution status vs quoted amounts</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400">Total BOQ Value: </span>
              <span className="text-sm font-bold text-emerald-400">
                ₹{activeProject.boq.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/60 uppercase tracking-wider text-zinc-400 text-[10px] rounded-xl border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Qty & Unit</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                  <th className="py-2.5 px-3 text-center">Completion %</th>
                  <th className="py-2.5 px-3 text-right">Certified RA Bill (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {activeProject.boq.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-3 font-medium text-zinc-100 max-w-[220px]">
                      {item.item}
                      {item.notes && <span className="block text-[10px] text-zinc-400 mt-0.5">{item.notes}</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 border border-zinc-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">{item.quantity} {item.unit}</td>
                    <td className="py-3 px-3 text-right">₹{item.unitRate.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right font-semibold text-zinc-100">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.completedPercent}
                          onChange={(e) => handleUpdateBOQProgress(item.id, Number(e.target.value))}
                          className="w-16 h-1.5 cursor-pointer accent-amber-500 bg-zinc-800"
                        />
                        <span className="w-8 font-bold text-amber-400">{item.completedPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      ₹{item.billedAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Documents & Contracts */}
      {activeTab === 'documents' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
          <h4 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif] mb-1">Legal Contracts, Approvals & Work Orders</h4>
          <p className="text-xs text-zinc-400 mb-4">Official documents logged for this project.</p>
          <div className="space-y-3">
            {[
              { name: 'Turnkey Architectural & Civil Agreement.pdf', date: '15 Mar 2025', size: '2.4 MB', signed: true },
              { name: 'Gurugram Municipal Corporation Sanction Plan.pdf', date: '02 Apr 2025', size: '5.1 MB', signed: true },
              { name: 'Structural Safety & Soil Test Certificate.pdf', date: '28 Feb 2025', size: '1.8 MB', signed: true },
              { name: 'Fire NOC & Underground Water Sump Clearance.pdf', date: '12 May 2025', size: '1.2 MB', signed: true }
            ].map((doc, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 text-xs hover:border-zinc-700 transition">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="font-semibold text-zinc-200">{doc.name}</p>
                    <p className="text-[11px] text-zinc-400">Uploaded {doc.date} • {doc.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Viewing document: ${doc.name}`)}
                  className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-200 border border-zinc-700 transition"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-lg font-bold text-zinc-100 font-['Outfit',sans-serif]">Add New Casabuild Project</h3>
            <form onSubmit={handleCreateProject} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., The Skyline Penthouse"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Rajiv Mehra"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Golf Course Road, Gurugram"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Turnkey">Turnkey</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Interiors">Interiors</option>
                    <option value="Construction">Construction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Area (Sq.Ft)</label>
                  <input
                    type="number"
                    value={newAreaSqFt}
                    onChange={e => setNewAreaSqFt(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Contract (₹)</label>
                  <input
                    type="number"
                    value={newContractValue}
                    onChange={e => setNewContractValue(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-5 py-2 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Add Project Phase Milestone</h3>
            <form onSubmit={handleAddMilestone} className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Milestone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., False Ceiling Framing & Wiring"
                  value={milestoneTitle}
                  onChange={e => setMilestoneTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Phase</label>
                <input
                  type="text"
                  value={milestonePhase}
                  onChange={e => setMilestonePhase(e.target.value)}
                  className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAddMilestoneModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-1.5 font-semibold text-zinc-950 shadow-md shadow-amber-500/20">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Drawing Modal */}
      {showAddDrawingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">Upload Architectural / Engineering Drawing</h3>
            <form onSubmit={handleAddDrawing} className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Drawing Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2nd Floor Master Bath Plumbing Schematic"
                  value={drawingTitle}
                  onChange={e => setDrawingTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Drawing Discipline</label>
                  <select
                    value={drawingType}
                    onChange={e => setDrawingType(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Architectural">Architectural</option>
                    <option value="Structural">Structural</option>
                    <option value="Interior">Interior</option>
                    <option value="MEP & Services">MEP & Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Revision Number</label>
                  <input
                    type="text"
                    value={drawingRevision}
                    onChange={e => setDrawingRevision(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-zinc-900 p-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAddDrawingModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-1.5 font-semibold text-zinc-950 shadow-md shadow-amber-500/20">Upload Drawing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
