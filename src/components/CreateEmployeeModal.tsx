import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { UserRole } from '../types';
import {
  X,
  User,
  Mail,
  KeyRound,
  Phone,
  Briefcase,
  Building,
  Award,
  ShieldCheck,
  Compass,
  HardHat,
  Calculator,
  UserCheck,
  Eye,
  EyeOff,
  Sparkles,
  FolderKanban,
  Check,
  AlertCircle
} from 'lucide-react';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newEmployeeId?: string) => void;
}

export const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { addUser, projects, isOwner } = useCasabuild();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Casabuild@2025');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('supervisor');
  const [designation, setDesignation] = useState('Site Supervisor & Quality Lead');
  const [phone, setPhone] = useState('+91 98');
  const [companyOrAffiliation, setCompanyOrAffiliation] = useState('The Casabuild Group');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [assignAllProjects, setAssignAllProjects] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(projects.map(p => p.id));
  const [status, setStatus] = useState<'Active' | 'Disabled'>('Active');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const roleMeta: Record<UserRole, { label: string; icon: any; color: string; desc: string }> = {
    owner: {
      label: 'Managing Director / Owner',
      icon: ShieldCheck,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      desc: 'Master ERP administrator with full executive and financial privileges.'
    },
    architect: {
      label: 'Senior Architect & Design Lead',
      icon: Compass,
      color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      desc: 'Drawings, BOQs, client presentations, finishes, and design revisions.'
    },
    supervisor: {
      label: 'Site Supervisor / Engineer',
      icon: HardHat,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      desc: 'Daily Site Reports (DSR), workforce attendance, material in/out, and quality checks.'
    },
    accountant: {
      label: 'Chief Accountant / CFO',
      icon: Calculator,
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      desc: 'Vendor payments, GST invoices, worker wage disbursement, and expense audits.'
    },
    contractor: {
      label: 'Subcontractor / Trade Lead',
      icon: UserCheck,
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      desc: 'Labour deployment, civil concrete/brickwork progress, and material indents.'
    },
    client: {
      label: 'Client / Property Owner',
      icon: Eye,
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      desc: 'Live milestone dashboard, photo journals, finishes approvals, and financial receipts.'
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = 'Casa@';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    res += Math.floor(10 + Math.random() * 90);
    setPassword(res);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    switch (newRole) {
      case 'architect':
        setDesignation('Project Architect & Interior Specialist');
        break;
      case 'supervisor':
        setDesignation('Site Project Engineer & Quality Lead');
        break;
      case 'accountant':
        setDesignation('Accounts Executive & Billing Specialist');
        break;
      case 'contractor':
        setDesignation('Civil & Structural Contractor');
        break;
      case 'client':
        setDesignation('Property Owner / Project Sponsor');
        break;
      case 'owner':
        setDesignation('Managing Partner / Co-Owner');
        break;
    }
  };

  const handleToggleProject = (projId: string) => {
    if (selectedProjects.includes(projId)) {
      setSelectedProjects(prev => prev.filter(id => id !== projId));
    } else {
      setSelectedProjects(prev => [...prev, projId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg('Please enter the employee’s full legal name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please provide a valid official email address for account login.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Please specify a secure password (minimum 4 characters).');
      return;
    }

    setIsSubmitting(true);

    const result = addUser({
      name: cleanName,
      email: cleanEmail,
      password: password,
      role: role,
      designation: designation.trim() || roleMeta[role].label,
      phone: phone.trim() || '+91 98000 12345',
      companyOrAffiliation: companyOrAffiliation.trim() || 'The Casabuild Group',
      licenseNumber: licenseNumber.trim() || `CB-${role.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      assignedProjects: assignAllProjects ? ['ALL'] : (selectedProjects.length > 0 ? selectedProjects : ['ALL']),
      permissions: [],
      disabled: status === 'Disabled',
      status: status
    });

    setIsSubmitting(false);

    if (result && !result.success) {
      setErrorMsg(result.error || 'Failed to create employee profile.');
      return;
    }

    if (onCreated) {
      onCreated();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#161922] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-[#12151d] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">
                  Add Employee & Company Account
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  New Account
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Provision login credentials, designate system role, and assign site access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center space-x-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role Selection Matrix */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Select Company Role <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['architect', 'supervisor', 'accountant', 'contractor', 'client'] as UserRole[]).map((r) => {
                const meta = roleMeta[r];
                const Icon = meta.icon;
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/50 shadow-sm'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`} />
                      <span className="text-xs font-bold capitalize text-zinc-100">{r}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 line-clamp-1">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal & Account Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Full Legal Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Farhan Akhtar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Official Account Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="e.g. farhan@casabuild.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Account Password & Security */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                <span>Account Login Password</span>
                <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center space-x-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>Generate Secure Password</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-3 pr-10 py-2 text-xs font-mono text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              The employee can use this official email and password to log in into The Casabuild ERP console.
            </p>
          </div>

          {/* Designation & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Designation / Job Title
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. Lead Site Engineer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="+91 98123 45678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Affiliation & License */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Company / Organization
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="The Casabuild Group"
                  value={companyOrAffiliation}
                  onChange={(e) => setCompanyOrAffiliation(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Professional License / ID (Optional)
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. COA/CA/2021/10293"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Project Assignments */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                <FolderKanban className="h-3.5 w-3.5 text-amber-400" />
                <span>Site Project Access</span>
              </label>

              <button
                type="button"
                onClick={() => setAssignAllProjects(!assignAllProjects)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                  assignAllProjects
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {assignAllProjects ? 'Universal Access (All Projects)' : 'Restricted to Selected Sites'}
              </button>
            </div>

            {!assignAllProjects && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {projects.map((p) => {
                  const isChecked = selectedProjects.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                        isChecked
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                          : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleProject(p.id)}
                        className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-0"
                      />
                      <span className="truncate font-medium">{p.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account Status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Account Status Upon Creation</p>
              <p className="text-[11px] text-zinc-400">
                Active accounts can immediately sign in. Disabled accounts require administrative activation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStatus(status === 'Active' ? 'Disabled' : 'Active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                status === 'Active'
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-rose-500/40 bg-rose-500/15 text-rose-300'
              }`}
            >
              {status}
            </button>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-2 border-t border-zinc-800 px-6 py-4 bg-[#12151d] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Creating...' : 'Create Employee & Account'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
