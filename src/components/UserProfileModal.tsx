import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { UserRole, UserProfile } from '../types';
import { exportToExcel } from '../utils/excelExport';
import { RecentlyDeletedModal } from './RecentlyDeletedModal';
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Award,
  ShieldCheck,
  Compass,
  HardHat,
  Calculator,
  UserCheck,
  Eye,
  CheckCircle2,
  XCircle,
  LogOut,
  Users,
  Plus,
  Trash2,
  Lock,
  Clock,
  Building,
  KeyRound,
  Download,
  Edit3,
  UserX,
  ShieldAlert,
  FileSpreadsheet,
  Check,
  Pencil
} from 'lucide-react';
import { EmployeeEditModal } from './EmployeeEditModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    users,
    logout,
    updateUserProfile,
    addUser,
    deleteUser,
    toggleUserDisabled,
    recentlyDeletedItems,
    projects
  } = useCasabuild();

  const deletedUsersCount = (recentlyDeletedItems || []).filter(i => i.itemType === 'employee_user').length;
  const [showRecycleBinModal, setShowRecycleBinModal] = useState(false);

  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'team'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editDesignation, setEditDesignation] = useState(currentUser?.designation || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editCompany, setEditCompany] = useState(currentUser?.companyOrAffiliation || '');

  // Add User state (for Owner)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [newUserRole, setNewUserRole] = useState<UserRole>('supervisor');
  const [newUserDesignation, setNewUserDesignation] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Edit Employee Profile state (Owner Exclusive)
  const [editingTargetUser, setEditingTargetUser] = useState<UserProfile | null>(null);
  const [targetName, setTargetName] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [targetDesignation, setTargetDesignation] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState<UserRole>('supervisor');
  const [targetLicense, setTargetLicense] = useState('');
  const [targetPassword, setTargetPassword] = useState('');

  // Comprehensive Employee Edit Modal state
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<UserProfile | null>(null);
  const [showEmployeeEditModal, setShowEmployeeEditModal] = useState(false);

  const isOwner = currentUser?.role === 'owner' || currentUser?.email.trim().toLowerCase() === 'ar.khanaamir@gmail.com';

  if (!isOpen || !currentUser) return null;

  const roleMeta: Record<UserRole, { label: string; icon: any; color: string; desc: string }> = {
    owner: {
      label: 'Managing Director / Owner',
      icon: ShieldCheck,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      desc: 'Master ERP administrator with full executive and financial privileges.'
    },
    architect: {
      label: 'Architect & Design Lead',
      icon: Compass,
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      desc: 'Architectural drawings, BOQ specifications, interior finishes, and client presentations.'
    },
    supervisor: {
      label: 'Site Supervisor & Field Engineer',
      icon: HardHat,
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      desc: 'Labour attendance, daily site reports (DSR), material gate inward & photo documentation.'
    },
    accountant: {
      label: 'Chief Financial Officer / Accounts',
      icon: Calculator,
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      desc: 'Vendor ledgers, disbursements, payroll settlements, and tax/expense audits.'
    },
    contractor: {
      label: 'Civil & Turnkey Contractor',
      icon: UserCheck,
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      desc: 'Assigned workforce attendance, daily masonry/structural logs & task status.'
    },
    client: {
      label: 'Client & Property Owner',
      icon: Eye,
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      desc: 'View project milestone progress, inspect site photos, and approve interior finishes.'
    }
  };

  const currentMeta = roleMeta[currentUser.role];
  const CurrentIcon = currentMeta.icon;

  const allSystemPermissions = [
    { key: 'drawings', title: 'Architectural Drawings & Revision Sets', roles: ['owner', 'architect'] },
    { key: 'boq', title: 'BOQ & Automatic Quote Generation', roles: ['owner', 'architect', 'accountant'] },
    { key: 'dsr', title: 'Daily Site Reports (DSR) & Issue Logs', roles: ['owner', 'architect', 'supervisor', 'contractor'] },
    { key: 'labour', title: 'Workforce Attendance & Wage Settlement', roles: ['owner', 'supervisor', 'accountant', 'contractor'] },
    { key: 'inventory', title: 'Material Inventory & Gate Inward Entries', roles: ['owner', 'supervisor', 'accountant'] },
    { key: 'finance', title: 'Vendor Ledgers & Direct Payments', roles: ['owner', 'accountant'] },
    { key: 'selections', title: 'Interior Selections & Client Approvals', roles: ['owner', 'architect', 'client'] },
    { key: 'photos', title: 'High-Resolution Site Photo Timeline', roles: ['owner', 'architect', 'supervisor', 'contractor', 'client'] },
    { key: 'reports', title: 'Executive PDF Reports & Audit Logs', roles: ['owner', 'architect', 'supervisor', 'accountant'] },
  ];

  const handleSaveProfile = () => {
    updateUserProfile(currentUser.id, {
      designation: editDesignation,
      phone: editPhone,
      companyOrAffiliation: editCompany
    });
    setIsEditing(false);
  };

  const handleStartEditTargetUser = (u: UserProfile) => {
    setEditingTargetUser(u);
    setTargetName(u.name);
    setTargetEmail(u.email);
    setTargetPhone(u.phone || '');
    setTargetDesignation(u.designation || '');
    setTargetCompany(u.companyOrAffiliation || '');
    setTargetRole(u.role);
    setTargetLicense(u.licenseNumber || '');
    setTargetPassword(u.password || '');
  };

  const handleSaveTargetUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTargetUser) return;

    // Safety: only ar.khanaamir@gmail.com can be owner
    let safeRole = targetRole;
    if (safeRole === 'owner' && targetEmail.trim().toLowerCase() !== 'ar.khanaamir@gmail.com') {
      safeRole = 'architect';
    }

    updateUserProfile(editingTargetUser.id, {
      name: targetName.trim(),
      email: targetEmail.trim(),
      phone: targetPhone.trim(),
      designation: targetDesignation.trim(),
      companyOrAffiliation: targetCompany.trim(),
      role: safeRole,
      licenseNumber: targetLicense.trim(),
      password: targetPassword ? targetPassword.trim() : editingTargetUser.password
    });

    setEditingTargetUser(null);
  };

  const handleExportUsers = () => {
    const headers = [
      'Staff / User ID',
      'Full Name',
      'Official Email',
      'Predefined System Role',
      'Designation & Title',
      'Contact Phone Number',
      'Affiliated Organization / Firm',
      'Registration / License ID',
      'Profile Account Status',
      'Last Login Timestamp'
    ];
    const rows = users.map(u => [
      u.id,
      u.name,
      u.email,
      u.role.toUpperCase(),
      u.designation || '',
      u.phone || '',
      u.companyOrAffiliation || '',
      u.licenseNumber || '',
      u.disabled ? 'Disabled' : (u.status || 'Active'),
      u.lastLogin || 'Never'
    ]);
    exportToExcel('casabuild_employee_profiles', headers, rows);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword,
      role: newUserRole,
      designation: newUserDesignation.trim() || roleMeta[newUserRole].label,
      phone: newUserPhone.trim() || '+91 98000 12345',
      companyOrAffiliation: 'The Casabuild Group',
      licenseNumber: `CB-${newUserRole.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      assignedProjects: ['ALL'],
      permissions: []
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserDesignation('');
    setNewUserPhone('');
    setShowAddUserModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-[#161922] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-[#12151d]">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-11 w-11 rounded-xl object-cover ring-1 ring-amber-500/40"
                />
              ) : (
                <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-base">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-zinc-900 border border-zinc-700">
                <CurrentIcon className="h-3.5 w-3.5 text-amber-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-base font-bold text-zinc-100">{currentUser.name}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEmployeeForEdit(currentUser);
                    setShowEmployeeEditModal(true);
                  }}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-zinc-800/90 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-500/40 text-[10px] font-medium transition cursor-pointer"
                  title="Edit user profile specifications & credentials"
                >
                  <Pencil className="h-2.5 w-2.5 text-amber-400" />
                  <span>Edit</span>
                </button>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${currentMeta.color}`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-900/40 px-6 pt-2 space-x-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Profile & Credentials
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'permissions'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Role Permissions Matrix
          </button>

          {currentUser.role === 'owner' && (
            <button
              onClick={() => setActiveTab('team')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
                activeTab === 'team'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Enterprise Users Directory ({users?.length || 0})
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Profile & Credentials */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Role Summary Banner */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start space-x-3">
                <CurrentIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300">
                    Predefined System Role: {currentMeta.label}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {currentMeta.desc}
                  </p>
                </div>
              </div>

              {!isOwner && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center space-x-3 text-xs text-amber-200">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-amber-300">Managed Enterprise Profile: </span>
                    Contact details, phone numbers, and profile settings are centrally protected and can only be modified or deleted by Managing Owner <span className="font-semibold text-white">Ar. Aamir Khan (ar.khanaamir@gmail.com)</span>.
                  </div>
                </div>
              )}

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-500 text-[11px]">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Login Email ID</span>
                  </div>
                  <p className="text-xs font-mono font-medium text-zinc-200">{currentUser.email}</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-500 text-[11px]">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Contact Phone</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                    />
                  ) : (
                    <p className="text-xs font-medium text-zinc-200">{currentUser.phone}</p>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-500 text-[11px]">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Designation & Title</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={e => setEditDesignation(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                    />
                  ) : (
                    <p className="text-xs font-medium text-zinc-200">{currentUser.designation}</p>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-500 text-[11px]">
                    <Building className="h-3.5 w-3.5" />
                    <span>Affiliated Firm / Org</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editCompany}
                      onChange={e => setEditCompany(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                    />
                  ) : (
                    <p className="text-xs font-medium text-zinc-200">{currentUser.companyOrAffiliation}</p>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-500 text-[11px]">
                    <Award className="h-3.5 w-3.5" />
                    <span>Registration / License ID</span>
                  </div>
                  <p className="text-xs font-mono font-medium text-amber-300">
                    {currentUser.licenseNumber || 'Verified Internal Member'}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-500 text-[11px]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Last Login Timestamp</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-300">
                    {currentUser.lastLogin || 'Active session now'}
                  </p>
                </div>
              </div>

              {/* Edit Controls */}
              <div className="flex items-center justify-between pt-2">
                {!isOwner ? (
                  <div className="flex items-center space-x-2 text-zinc-400 text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Profile editing restricted to Managing Owner</span>
                  </div>
                ) : isEditing ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 transition"
                    >
                      Save Updates
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs text-amber-300 hover:bg-amber-500/20 transition font-medium"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Contact Details</span>
                  </button>
                )}

                <button
                  id="user-logout-btn"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-medium hover:bg-rose-500/20 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Role Permissions Matrix */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 leading-relaxed">
                The Casabuild ERP automatically enforces cryptographic role boundaries. {isOwner ? (
                  <span className="text-amber-300 font-semibold">As Master Owner, Ar. Aamir Khan holds unrestricted administrative authorization across every role and subsystem:</span>
                ) : (
                  <>Below is the operational permission status for <span className="text-amber-400 font-semibold">{currentUser.name}</span> ({currentMeta.label}):</>
                )}
              </div>

              <div className="space-y-2">
                {allSystemPermissions.map(item => {
                  const isAllowed = isOwner || item.roles.includes(currentUser.role);
                  return (
                    <div
                      key={item.key}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                        isAllowed
                          ? 'border-zinc-800 bg-zinc-900/60 text-zinc-200'
                          : 'border-zinc-800/40 bg-zinc-950/40 text-zinc-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {isAllowed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-zinc-600 shrink-0" />
                        )}
                        <span className={isAllowed ? 'font-medium text-zinc-100' : 'line-through'}>
                          {item.title}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          isAllowed
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isAllowed ? 'AUTHORIZED' : 'RESTRICTED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Team Directory (Owner Exclusive) */}
          {activeTab === 'team' && currentUser.role === 'owner' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-zinc-100">Enterprise Personnel & Staff Directory</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
                      {users?.length || 0} Registered
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Master governance portal. Edit employee contact details, toggle account disabling, or manage role permissions.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    id="team-recently-deleted-btn"
                    onClick={() => setShowRecycleBinModal(true)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                      deletedUsersCount > 0
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                        : 'border-zinc-750 bg-zinc-800/90 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                    title="Recently Deleted Staff Bin (30-day restore window)"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                    <span>Deleted Staff</span>
                    {deletedUsersCount > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-500/25 px-1.5 py-0.2 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                        {deletedUsersCount}
                      </span>
                    )}
                  </button>

                  <button
                    id="export-users-excel-btn"
                    onClick={handleExportUsers}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition"
                    title="Export complete staff & partner directory to Microsoft Excel / CSV"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAddUserModal(true);
                      setEditingTargetUser(null);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Provision User</span>
                  </button>
                </div>
              </div>

              {/* Edit Existing User Modal Inline */}
              {editingTargetUser && (
                <form onSubmit={handleSaveTargetUser} className="p-4 rounded-xl border border-amber-500/40 bg-zinc-900/95 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Edit3 className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300">
                        Edit Profile & Contact Details: {editingTargetUser.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingTargetUser(null)}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={targetName}
                        onChange={e => setTargetName(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Official Email Address</label>
                      <input
                        type="email"
                        value={targetEmail}
                        onChange={e => setTargetEmail(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Contact Phone / Mobile <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={targetPhone}
                        onChange={e => setTargetPhone(e.target.value)}
                        placeholder="+91 98000 00000"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Designation & Title</label>
                      <input
                        type="text"
                        value={targetDesignation}
                        onChange={e => setTargetDesignation(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Predefined ERP Role</label>
                      <select
                        value={targetRole}
                        onChange={e => setTargetRole(e.target.value as UserRole)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                      >
                        <option value="architect">Architect & Design</option>
                        <option value="supervisor">Site Supervisor</option>
                        <option value="accountant">Accountant / Finance</option>
                        <option value="contractor">Civil Contractor</option>
                        <option value="client">Client</option>
                        {targetEmail.trim().toLowerCase() === 'ar.khanaamir@gmail.com' && (
                          <option value="owner">Managing Owner</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Firm / Affiliation</label>
                      <input
                        type="text"
                        value={targetCompany}
                        onChange={e => setTargetCompany(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">License / Reg ID</label>
                      <input
                        type="text"
                        value={targetLicense}
                        onChange={e => setTargetLicense(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Update Password</label>
                      <input
                        type="text"
                        value={targetPassword}
                        onChange={e => setTargetPassword(e.target.value)}
                        placeholder="Leave as is or enter new password"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                      />
                    </div>
                    <div className="flex items-end justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingTargetUser(null)}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 transition shadow"
                      >
                        Save Profile Updates
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Add User Modal Inline */}
              {showAddUserModal && (
                <form onSubmit={handleAddUser} className="p-4 rounded-xl border border-zinc-700 bg-zinc-900/90 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-amber-300">Create New Team Profile</span>
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={e => setNewUserName(e.target.value)}
                        placeholder="e.g. Ankit Verma"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Official Email</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={e => setNewUserEmail(e.target.value)}
                        placeholder="e.g. ankit@casabuild.com"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Predefined Security Role</label>
                      <select
                        value={newUserRole}
                        onChange={e => setNewUserRole(e.target.value as UserRole)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                      >
                        <option value="architect">Architect & Design</option>
                        <option value="supervisor">Site Supervisor</option>
                        <option value="accountant">Accountant / Finance</option>
                        <option value="contractor">Civil Contractor</option>
                        <option value="client">Client</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={newUserPhone}
                        onChange={e => setNewUserPhone(e.target.value)}
                        placeholder="+91 98000 00000"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Designation & Title</label>
                      <input
                        type="text"
                        value={newUserDesignation}
                        onChange={e => setNewUserDesignation(e.target.value)}
                        placeholder="e.g. Senior Project Architect"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Login Password</label>
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={e => setNewUserPassword(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400"
                    >
                      Add User Profile
                    </button>
                  </div>
                </form>
              )}

              {/* Users List */}
              <div className="space-y-2.5">
                {users.map(u => {
                  const meta = roleMeta[u.role];
                  const isAamirOwner = u.email.trim().toLowerCase() === 'ar.khanaamir@gmail.com';
                  const isUserDisabled = u.disabled || u.status === 'Disabled';

                  return (
                    <div
                      key={u.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition gap-3 ${
                        isUserDisabled
                          ? 'border-rose-900/40 bg-rose-950/10 opacity-75'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-lg object-cover ring-1 ring-zinc-700" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center font-bold text-xs border border-zinc-700">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-xs font-bold ${isUserDisabled ? 'text-zinc-400 line-through' : 'text-zinc-100'}`}>
                              {u.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEmployeeForEdit(u);
                                setShowEmployeeEditModal(true);
                              }}
                              className="inline-flex items-center space-x-1 ml-0.5 px-2 py-0.5 rounded-md bg-zinc-800/90 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-500/40 text-[10px] font-medium transition cursor-pointer"
                              title={`Edit employee specifications & options for ${u.name}`}
                            >
                              <Pencil className="h-2.5 w-2.5 text-amber-400" />
                              <span>Edit</span>
                            </button>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${meta.color}`}>
                              {u.role.toUpperCase()}
                            </span>
                            {isUserDisabled ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                DISABLED
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                ACTIVE
                              </span>
                            )}
                            {isAamirOwner && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                MANAGING OWNER
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-zinc-400">
                            <span className="font-mono text-zinc-300">{u.email}</span>
                            <span>•</span>
                            <span className="text-zinc-300">{u.phone || 'No phone'}</span>
                            {u.designation && (
                              <>
                                <span>•</span>
                                <span className="text-zinc-400 italic">{u.designation}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Management Actions */}
                      <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                        {/* Edit Employee Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmployeeForEdit(u);
                            setShowEmployeeEditModal(true);
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition shadow-sm active:scale-95"
                          title={`Edit employee specifications, role, projects & delete options for ${u.name}`}
                        >
                          <Pencil className="h-3 w-3 text-amber-400" />
                          <span>Edit</span>
                        </button>

                        {/* Disable / Enable Button */}
                        {!isAamirOwner && (
                          <button
                            type="button"
                            onClick={() => toggleUserDisabled(u.id)}
                            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs transition ${
                              isUserDisabled
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                            }`}
                            title={isUserDisabled ? 'Re-enable account login' : 'Disable and suspend account login'}
                          >
                            {isUserDisabled ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Enable</span>
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3" />
                                <span>Disable</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 px-6 py-3 bg-[#12151d] flex items-center justify-between text-[11px] text-zinc-400">
          <span>The Casabuild ERP • Role Cryptographic Token Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* 30-Day Recently Deleted Bin Modal for Staff */}
      <RecentlyDeletedModal
        isOpen={showRecycleBinModal}
        onClose={() => setShowRecycleBinModal(false)}
        initialFilter="users"
      />

      {/* Comprehensive Employee Edit & Delete Modal */}
      <EmployeeEditModal
        employee={selectedEmployeeForEdit}
        isOpen={showEmployeeEditModal}
        onClose={() => {
          setShowEmployeeEditModal(false);
          setSelectedEmployeeForEdit(null);
        }}
      />
    </div>
  );
};
