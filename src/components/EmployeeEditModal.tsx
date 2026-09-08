import React, { useState, useEffect } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { UserProfile, UserRole } from '../types';
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Award,
  KeyRound,
  Trash2,
  AlertTriangle,
  Save,
  Check,
  ShieldCheck,
  Compass,
  HardHat,
  Calculator,
  UserCheck,
  Eye,
  Lock,
  Pencil,
  FolderKanban,
  ShieldAlert,
  UserX
} from 'lucide-react';

interface EmployeeEditModalProps {
  employee: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'projects' | 'security' | 'danger';
}

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  employee,
  isOpen,
  onClose,
  initialTab = 'profile'
}) => {
  const { updateUserProfile, deleteUser, currentUser, projects, isOwner } = useCasabuild();

  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'security' | 'danger'>(initialTab);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<UserRole>('supervisor');
  const [companyOrAffiliation, setCompanyOrAffiliation] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [assignAllProjects, setAssignAllProjects] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (employee && isOpen) {
      setName(employee.name || '');
      setEmail(employee.email || '');
      setPhone(employee.phone || '');
      setDesignation(employee.designation || '');
      setRole(employee.role || 'supervisor');
      setCompanyOrAffiliation(employee.companyOrAffiliation || 'The Casabuild Group');
      setLicenseNumber(employee.licenseNumber || '');
      setAvatar(employee.avatar || '');
      setPassword(employee.password || '');
      setDisabled(Boolean(employee.disabled || employee.status === 'Disabled'));

      const isAll = !employee.assignedProjects || employee.assignedProjects.includes('ALL');
      setAssignAllProjects(isAll);
      setSelectedProjects(isAll ? projects.map(p => p.id) : (employee.assignedProjects || []));

      setActiveTab(initialTab);
      setShowDeleteConfirm(false);
      setSaveSuccess(false);
    }
  }, [employee, isOpen, initialTab, projects]);

  if (!isOpen || !employee) return null;

  const isManagingOwner = employee.email.trim().toLowerCase() === 'ar.khanaamir@gmail.com';
  const isSelf = currentUser?.id === employee.id || currentUser?.email.trim().toLowerCase() === employee.email.trim().toLowerCase();

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

  const currentRoleMeta = roleMeta[role] || roleMeta.supervisor;
  const RoleIcon = currentRoleMeta.icon;

  const handleToggleProject = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert('Please fill out the employee name and official email address.');
      return;
    }

    // Safety: only ar.khanaamir@gmail.com can hold master owner role
    let safeRole = role;
    if (safeRole === 'owner' && email.trim().toLowerCase() !== 'ar.khanaamir@gmail.com') {
      safeRole = 'architect';
    }

    const assigned = assignAllProjects ? ['ALL'] : selectedProjects;

    updateUserProfile(employee.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98000 12345',
      designation: designation.trim() || currentRoleMeta.label,
      role: safeRole,
      companyOrAffiliation: companyOrAffiliation.trim() || 'The Casabuild Group',
      licenseNumber: licenseNumber.trim() || `CB-${safeRole.toUpperCase()}-001`,
      avatar: avatar.trim() || employee.avatar,
      password: password ? password.trim() : employee.password,
      disabled,
      status: disabled ? 'Disabled' : 'Active',
      assignedProjects: assigned
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleDelete = () => {
    if (isManagingOwner) {
      alert('The Master Managing Owner account (Ar. Aamir Khan) is permanently protected and cannot be deleted.');
      return;
    }

    if (isSelf) {
      alert('You cannot delete your currently active authenticated account. Sign in as another administrator first.');
      return;
    }

    deleteUser(employee.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#161922] shadow-2xl overflow-hidden flex flex-col my-6 max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-[#12151d] shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative shrink-0">
              {avatar || employee.avatar ? (
                <img
                  src={avatar || employee.avatar}
                  alt={name || employee.name}
                  className="h-11 w-11 rounded-xl object-cover ring-1 ring-amber-500/40"
                />
              ) : (
                <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-base">
                  {(name || employee.name).charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-zinc-900 border border-zinc-700">
                <RoleIcon className="h-3.5 w-3.5 text-amber-400" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-zinc-100 truncate">
                  {name || employee.name}
                </h2>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold border uppercase ${currentRoleMeta.color}`}>
                  {role}
                </span>
                {disabled && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    DISABLED
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {designation || employee.designation || currentRoleMeta.label} • {email || employee.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-[#12151d] px-5 space-x-1 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 border-b-2 px-3 py-3 text-xs font-medium transition shrink-0 ${
              activeTab === 'profile'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile & Role</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center space-x-2 border-b-2 px-3 py-3 text-xs font-medium transition shrink-0 ${
              activeTab === 'projects'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            <span>Assigned Projects</span>
            <span className="rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400">
              {assignAllProjects ? 'All' : selectedProjects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2 border-b-2 px-3 py-3 text-xs font-medium transition shrink-0 ${
              activeTab === 'security'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Security & Status</span>
          </button>

          <button
            onClick={() => setActiveTab('danger')}
            className={`flex items-center space-x-2 border-b-2 px-3 py-3 text-xs font-medium transition shrink-0 ${
              activeTab === 'danger'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-rose-400'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
            <span>Delete & Archive</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: Profile & Role Details */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Full Legal Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Official Email Address <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="employee@casabuild.com"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Contact Phone / Mobile <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98000 12345"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Designation & Official Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      placeholder="e.g. Senior Project Architect"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Predefined Role Selector */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Predefined System Role & Access Privilege
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(roleMeta) as UserRole[]).map(roleKey => {
                    const item = roleMeta[roleKey];
                    const ItemIcon = item.icon;
                    const isSelected = role === roleKey;
                    const isRestrictedOwner = roleKey === 'owner' && email.trim().toLowerCase() !== 'ar.khanaamir@gmail.com';

                    if (isRestrictedOwner) return null;

                    return (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => setRole(roleKey)}
                        className={`flex items-start space-x-2.5 rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-amber-500/60 bg-amber-500/10 shadow-md'
                            : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-zinc-700'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 shrink-0 mt-0.5">
                          <ItemIcon className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                            {item.label}
                          </p>
                          <p className="text-[10px] text-zinc-400 leading-snug mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Affiliated Organization / Firm
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={companyOrAffiliation}
                      onChange={e => setCompanyOrAffiliation(e.target.value)}
                      placeholder="The Casabuild Group"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Registration / License ID
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      placeholder="CB-ARCH-409 / CA/2020/12345"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Profile Photo URL (Avatar)
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Assigned Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Site & Project Access Scope</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Determine which sites this employee can supervise, log reports for, or view in their ERP console.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignAllProjects}
                      onChange={e => {
                        setAssignAllProjects(e.target.checked);
                        if (e.target.checked) {
                          setSelectedProjects(projects.map(p => p.id));
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    <span className="ml-2 text-xs font-semibold text-zinc-200">All Projects</span>
                  </label>
                </div>
              </div>

              {!assignAllProjects ? (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-zinc-400">
                    Select Individual Assigned Sites ({selectedProjects.length} selected):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                    {projects.map(p => {
                      const isChecked = selectedProjects.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleProject(p.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                            isChecked
                              ? 'border-amber-500/50 bg-amber-500/10'
                              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className={`text-xs font-bold truncate ${isChecked ? 'text-amber-300' : 'text-zinc-200'}`}>
                              {p.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate font-mono">
                              {p.code} • {p.location}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-zinc-700 text-amber-500 focus:ring-amber-400 h-4 w-4 bg-zinc-800"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs text-amber-300 flex items-center space-x-2">
                  <Check className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    Employee is assigned universal access across all {projects.length} ongoing and future projects.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Security & Status */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                <h4 className="text-xs font-bold text-zinc-200 flex items-center space-x-2">
                  <KeyRound className="h-4 w-4 text-amber-400" />
                  <span>Authentication Credentials</span>
                </h4>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Login Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password or leave unchanged"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Used for password authentication and instant sign-in on the login portal.
                  </p>
                </div>
              </div>

              {/* Account Status */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Account Access State</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Suspended or disabled accounts cannot log in or record attendance.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDisabled(!disabled)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      disabled
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                        : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    }`}
                  >
                    {disabled ? (
                      <>
                        <UserX className="h-3.5 w-3.5" />
                        <span>Account Disabled</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Account Active</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Delete & Archive (Danger Zone) */}
          {activeTab === 'danger' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-sm text-rose-200">
                  <ShieldAlert className="h-5 w-5 text-rose-400" />
                  <span>Archive & Remove Employee Profile</span>
                </div>
                <p className="leading-relaxed">
                  Moving this employee to the <strong>Recently Deleted bin</strong> will safely archive their credentials, contact records, and personal profile for <strong>30 days</strong>.
                </p>
                <p className="text-[11px] text-rose-300/80">
                  • Existing daily site reports, milestone completions, and logged entries associated with this user will remain preserved in historical logs.
                  <br />
                  • Master administrators can restore this employee at any time from the Recently Deleted Recycle Bin.
                </p>
              </div>

              {isManagingOwner ? (
                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-300 flex items-center space-x-2">
                  <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    The Managing Owner account (Ar. Aamir Khan) is permanently locked and cannot be deleted or archived.
                  </span>
                </div>
              ) : isSelf ? (
                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-300 flex items-center space-x-2">
                  <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    You cannot delete your own currently active account session. Switch to another administrator account to manage this profile.
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <p className="text-xs text-zinc-300">
                    Are you sure you want to move <strong>"{name || employee.name}"</strong> to the Recently Deleted bin?
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center space-x-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2.5 text-xs font-bold text-rose-300 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Initiate Employee Deletion</span>
                    </button>
                  ) : (
                    <div className="space-y-2 p-3 rounded-xl border border-rose-500 bg-rose-950/40">
                      <p className="text-xs font-bold text-rose-200">
                        Please confirm: Move "{name || employee.name}" to Recycle Bin?
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow transition"
                        >
                          Yes, Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800 shrink-0">
            <div>
              {activeTab !== 'danger' && !isManagingOwner && !isSelf && (
                <button
                  type="button"
                  onClick={() => setActiveTab('danger')}
                  className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-rose-500/30 transition"
                  title="Move employee to Recently Deleted bin"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Employee</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center space-x-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-zinc-950 shadow-md transition active:scale-95"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
