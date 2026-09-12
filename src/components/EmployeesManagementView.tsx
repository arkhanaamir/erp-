import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { UserProfile, UserRole } from '../types';
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  ShieldCheck,
  Compass,
  HardHat,
  Calculator,
  UserCheck,
  Eye,
  EyeOff,
  Search,
  FileSpreadsheet,
  Building,
  KeyRound,
  Mail,
  Phone,
  FolderKanban,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  RefreshCw,
  Lock,
  Copy,
  Check,
  Database
} from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';
import { CreateEmployeeModal } from './CreateEmployeeModal';
import { EmployeeEditModal } from './EmployeeEditModal';
import { RecentlyDeletedModal } from './RecentlyDeletedModal';
import { CloudDataPointModal } from './CloudDataPointModal';

export const EmployeesManagementView: React.FC = () => {
  const {
    users,
    currentUser,
    projects,
    toggleUserDisabled,
    deleteUser,
    isOwner,
    recentlyDeletedCount
  } = useCasabuild();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInitialTab, setEditInitialTab] = useState<'profile' | 'projects' | 'security' | 'danger'>('profile');
  const [showRecycleBinModal, setShowRecycleBinModal] = useState(false);
  const [showDataPointModal, setShowDataPointModal] = useState(false);

  // Password visibility map (for quick credential inspection)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const roleMeta: Record<UserRole, { label: string; icon: any; color: string; badgeColor: string }> = {
    owner: {
      label: 'Managing Director / Owner',
      icon: ShieldCheck,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    architect: {
      label: 'Senior Architect & Design Lead',
      icon: Compass,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
    },
    supervisor: {
      label: 'Site Project Engineer',
      icon: HardHat,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    accountant: {
      label: 'Chief Accountant & CFO',
      icon: Calculator,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    contractor: {
      label: 'Subcontractor / Trade Lead',
      icon: UserCheck,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    },
    client: {
      label: 'Property Owner / Client',
      icon: Eye,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    }
  };

  // Filter non-deleted users
  const activeEmployees = users.filter(u => !u.isDeleted);

  const filteredEmployees = activeEmployees.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.companyOrAffiliation && u.companyOrAffiliation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !u.disabled && u.status !== 'Disabled') ||
      (statusFilter === 'disabled' && (u.disabled || u.status === 'Disabled'));

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalCount = activeEmployees.length;
  const activeCount = activeEmployees.filter(u => !u.disabled && u.status !== 'Disabled').length;
  const disabledCount = totalCount - activeCount;

  const handleExportExcel = () => {
    const headers = [
      'Account ID',
      'Full Name',
      'Email Address',
      'System Role',
      'Designation / Job Title',
      'Contact Phone',
      'Organization / Firm',
      'License ID',
      'Assigned Projects',
      'Status',
      'Last Login'
    ];
    const rows = activeEmployees.map(u => [
      u.id,
      u.name,
      u.email,
      u.role.toUpperCase(),
      u.designation || '',
      u.phone || '',
      u.companyOrAffiliation || '',
      u.licenseNumber || '',
      (!u.assignedProjects || u.assignedProjects.includes('ALL'))
        ? 'Universal (All Projects)'
        : u.assignedProjects.join(', '),
      u.disabled || u.status === 'Disabled' ? 'Disabled' : 'Active',
      u.lastLogin || 'Never'
    ]);
    exportToExcel('casabuild_employee_accounts', headers, rows);
  };

  const handleOpenEdit = (emp: UserProfile, tab: 'profile' | 'projects' | 'security' | 'danger' = 'profile') => {
    setEditingEmployee(emp);
    setEditInitialTab(tab);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              Enterprise Governance
            </span>
            <span className="text-xs text-zinc-400">The Casabuild Group</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 font-['Outfit',sans-serif] tracking-tight mt-1">
            Company Employees & Accounts
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl mt-0.5">
            Create, edit, and manage staff accounts, role designations, site assignments, and system credentials.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            id="employee-mgmt-add-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <UserPlus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Add Employee & Account</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 transition"
            title="Download complete employee directory in Excel (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={() => setShowRecycleBinModal(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 transition"
            title="View soft-deleted employees in Recently Deleted Recycle Bin"
          >
            <Trash2 className="h-4 w-4 text-rose-400" />
            <span className="hidden sm:inline">Recycle Bin</span>
            {recentlyDeletedCount > 0 && (
              <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                {recentlyDeletedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Cloud Data Point Storage Diagnostic Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-amber-500/25 bg-amber-500/5 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Cloud Storage Data Point</span>
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Google Cloud Firestore</span>
              </span>
            </div>
            <p className="text-xs text-zinc-200 mt-0.5">
              Data Repository: <strong className="text-amber-300 font-mono">ar.khanaamir@gmail.com</strong>
              <span className="text-zinc-500 mx-2">•</span>
              <span className="text-zinc-400 font-mono text-[11px]">ai-studio-thecasabuild31-b35684a5...</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDataPointModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition shrink-0 self-start sm:self-auto"
        >
          <Database className="h-3.5 w-3.5 text-amber-400" />
          <span>Check Data Point</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Total Staff</span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-100">{totalCount}</p>
          <span className="text-[10px] text-zinc-400">Registered across all branches</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Active Logins</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{activeCount}</p>
          <span className="text-[10px] text-emerald-500/80">Authorized ERP access</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Suspended / Disabled</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-400">{disabledCount}</p>
          <span className="text-[10px] text-rose-400/80">Access temporarily revoked</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Active Sites</span>
            <FolderKanban className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-sky-400">{projects.length}</p>
          <span className="text-[10px] text-sky-400/80">Universal / Site assignments</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-[#161922] p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone, designation, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Role Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition shrink-0 ${
              roleFilter === 'all'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            All Roles
          </button>
          {(['owner', 'architect', 'supervisor', 'accountant', 'contractor', 'client'] as UserRole[]).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded-xl text-xs capitalize transition shrink-0 ${
                roleFilter === r
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>
      </div>

      {/* Employees Grid / Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((employee) => {
          const meta = roleMeta[employee.role] || roleMeta.supervisor;
          const RoleIcon = meta.icon;
          const isAamirOwner = employee.email.trim().toLowerCase() === 'ar.khanaamir@gmail.com';
          const isSelf = currentUser?.id === employee.id || currentUser?.email.trim().toLowerCase() === employee.email.trim().toLowerCase();
          const isDisabled = Boolean(employee.disabled || employee.status === 'Disabled');
          const isPassVisible = Boolean(visiblePasswords[employee.id]);

          return (
            <div
              key={employee.id}
              className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
                isDisabled
                  ? 'border-zinc-800/60 bg-zinc-950/40 opacity-75'
                  : 'border-zinc-800 bg-[#161922] hover:border-zinc-700/80 hover:shadow-xl'
              }`}
            >
              <div>
                {/* Top Row: Avatar, Name & Edit Button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={employee.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`}
                        alt={employee.name}
                        className="h-12 w-12 rounded-xl object-cover ring-2 ring-zinc-800"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#161922] ${
                          isDisabled ? 'bg-rose-500' : 'bg-emerald-400'
                        }`}
                        title={isDisabled ? 'Account is Suspended' : 'Account is Active'}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <h3 className={`text-sm font-bold truncate ${isDisabled ? 'line-through text-zinc-400' : 'text-zinc-100'}`}>
                          {employee.name}
                        </h3>
                        {isAamirOwner && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-500/50">
                            OWNER
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{employee.designation || meta.label}</p>
                    </div>
                  </div>

                  {/* Quick Inline Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(employee, 'profile')}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold transition active:scale-95 shrink-0"
                    title={`Edit specifications & credentials for ${employee.name}`}
                  >
                    <Pencil className="h-3 w-3 text-amber-400" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Role and Affiliation Badges */}
                <div className="mt-3.5 flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                    <RoleIcon className="h-3 w-3" />
                    <span className="uppercase">{employee.role}</span>
                  </span>

                  <span className="text-[10px] text-zinc-400 truncate max-w-[140px]" title={employee.companyOrAffiliation}>
                    {employee.companyOrAffiliation || 'The Casabuild Group'}
                  </span>
                </div>

                {/* Account Details & Credentials Section */}
                <div className="mt-3.5 space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-xs">
                  {/* Email / Login ID */}
                  <div className="flex items-center justify-between text-zinc-300">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Mail className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate font-mono text-[11px]">{employee.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(employee.email, `email-${employee.id}`)}
                      className="text-zinc-500 hover:text-zinc-300 p-0.5 transition"
                      title="Copy login email"
                    >
                      {copiedId === `email-${employee.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>

                  {/* Password Inspection & Copy */}
                  <div className="flex items-center justify-between text-zinc-300 border-t border-zinc-800/50 pt-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <KeyRound className="h-3.5 w-3.5 text-amber-500/80 shrink-0" />
                      <span className="font-mono text-[11px] text-zinc-300">
                        {isPassVisible ? (employee.password || 'Casabuild@2025') : '••••••••••••'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(employee.id)}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5 transition"
                        title={isPassVisible ? 'Hide password' : 'Show password'}
                      >
                        {isPassVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(employee.password || 'Casabuild@2025', `pass-${employee.id}`)}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5 transition"
                        title="Copy password"
                      >
                        {copiedId === `pass-${employee.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Phone & License */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/50 pt-2">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Phone className="h-3 w-3 text-zinc-500 shrink-0" />
                      <span className="truncate">{employee.phone || '+91 98000 12345'}</span>
                    </div>
                    {employee.licenseNumber && (
                      <span className="text-[10px] text-zinc-500 truncate" title={employee.licenseNumber}>
                        {employee.licenseNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Project Assignment Tag */}
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Site Assignment:</span>
                  <span className="font-medium text-amber-300/90 truncate max-w-[160px]">
                    {!employee.assignedProjects || employee.assignedProjects.includes('ALL')
                      ? 'Universal (All Sites)'
                      : `${employee.assignedProjects.length} Assigned Project(s)`}
                  </span>
                </div>
              </div>

              {/* Action Bar at Bottom of Card */}
              <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-zinc-500 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Login: {employee.lastLogin || 'Never'}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Toggle Active / Disabled Login */}
                  {!isAamirOwner && (
                    <button
                      type="button"
                      onClick={() => toggleUserDisabled(employee.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                        isDisabled
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                      }`}
                      title={isDisabled ? 'Re-activate account login' : 'Suspend account login'}
                    >
                      {isDisabled ? 'Activate' : 'Disable'}
                    </button>
                  )}

                  {/* Delete Employee Button */}
                  {!isAamirOwner && !isSelf && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(employee, 'danger')}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title={`Delete account for ${employee.name} (move to Recycle Bin)`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-zinc-200">No employees found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            No employee profiles match your current search query or role filter. You can add a new employee or clear your filters.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center space-x-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      )}

      {/* Modal: Create Employee Account */}
      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Modal: Edit Employee Account */}
      <EmployeeEditModal
        employee={editingEmployee}
        isOpen={showEditModal}
        initialTab={editInitialTab}
        onClose={() => {
          setShowEditModal(false);
          setEditingEmployee(null);
        }}
      />

      {/* Modal: Recently Deleted Recycle Bin */}
      <RecentlyDeletedModal
        isOpen={showRecycleBinModal}
        onClose={() => setShowRecycleBinModal(false)}
        initialFilter="users"
      />

      {/* Modal: Cloud Data Point Inspector */}
      <CloudDataPointModal
        isOpen={showDataPointModal}
        onClose={() => setShowDataPointModal(false)}
      />
    </div>
  );
};
