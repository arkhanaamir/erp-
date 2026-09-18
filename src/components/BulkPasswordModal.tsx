import React, { useState, useEffect } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { UserProfile } from '../types';
import {
  X,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  User,
  Save
} from 'lucide-react';

interface BulkPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmployeeId?: string | null;
}

export const BulkPasswordModal: React.FC<BulkPasswordModalProps> = ({
  isOpen,
  onClose,
  targetEmployeeId = null
}) => {
  const { users, bulkUpdateEmployeePasswords, changeUserPassword } = useCasabuild();

  // Active non-deleted staff
  const activeStaff = users.filter(u => !u.isDeleted);

  // Selected mode: 'individual' if targetEmployeeId is given, or allow switching
  const [selectedUserId, setSelectedUserId] = useState<string>(
    targetEmployeeId || (activeStaff[0]?.id || '')
  );

  // Individual password state
  const [individualPassword, setIndividualPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showIndividualPass, setShowIndividualPass] = useState(false);

  // Bulk password map: Record<userId, newPassword>
  const [bulkMap, setBulkMap] = useState<Record<string, string>>({});
  const [visibleBulkFields, setVisibleBulkFields] = useState<Record<string, boolean>>({});

  // Status & notifications
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'individual' | 'all'>(
    targetEmployeeId ? 'individual' : 'all'
  );

  useEffect(() => {
    if (isOpen) {
      setStatusMsg(null);
      setIndividualPassword('');
      setConfirmPassword('');
      if (targetEmployeeId) {
        setSelectedUserId(targetEmployeeId);
        setActiveTab('individual');
      }

      // Initialize bulk map with empty or generated values
      const initialMap: Record<RecordKey, string> = {};
      activeStaff.forEach(u => {
        initialMap[u.id] = '';
      });
      setBulkMap(initialMap);
    }
  }, [isOpen, targetEmployeeId]);

  if (!isOpen) return null;

  type RecordKey = string;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = 'Casa@';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    res += Math.floor(10 + Math.random() * 90);
    return res;
  };

  const handleGenerateAll = () => {
    const newMap: Record<string, string> = {};
    activeStaff.forEach(u => {
      newMap[u.id] = generateRandomPassword();
    });
    setBulkMap(newMap);
    setStatusMsg({
      type: 'success',
      text: 'Generated unique, high-strength passwords for all employees. Click "Save & Sync Passwords" below to apply.'
    });
  };

  const handleIndividualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!individualPassword || individualPassword.trim().length < 4) {
      setStatusMsg({ type: 'error', text: 'Password must contain at least 4 characters.' });
      return;
    }

    if (individualPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passwords do not match. Please re-enter.' });
      return;
    }

    setIsSaving(true);
    const res = await changeUserPassword(selectedUserId, individualPassword.trim());
    setIsSaving(false);

    if (res.success) {
      const updatedUser = activeStaff.find(u => u.id === selectedUserId);
      setStatusMsg({
        type: 'success',
        text: `Password for ${updatedUser?.name || 'employee'} successfully updated and synced to cloud!`
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to update password.' });
    }
  };

  const handleBulkSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const updates: { id: string; password: string }[] = [];
    for (const [id, pass] of Object.entries(bulkMap) as [string, string][]) {
      if (pass && pass.trim().length >= 4) {
        updates.push({ id, password: pass.trim() });
      }
    }

    if (updates.length === 0) {
      setStatusMsg({
        type: 'error',
        text: 'Please enter a new password (min 4 characters) for at least one employee or click "Generate Passwords for All".'
      });
      return;
    }

    setIsSaving(true);
    const res = await bulkUpdateEmployeePasswords(updates);
    setIsSaving(false);

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: `Successfully updated and cloud-synced passwords for ${res.updatedCount} employee(s)! Each employee can now log in separately.`
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: 'Failed to update employee passwords.' });
    }
  };

  const selectedUser = activeStaff.find(u => u.id === selectedUserId) || activeStaff[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#161922] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-[#12151d]">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Employee Password Management
              </h3>
              <p className="text-xs text-zinc-400">
                Configure private passwords for all employees to enforce isolated logins
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

        {/* Tab Buttons */}
        <div className="flex items-center border-b border-zinc-800 bg-[#12151d] px-6 space-x-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setStatusMsg(null);
            }}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'all'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Change All Employee Passwords ({activeStaff.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('individual');
              setStatusMsg(null);
            }}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'individual'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Change Single Employee Password</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* TAB 1: ALL EMPLOYEES PASSWORDS */}
        {activeTab === 'all' && (
          <form onSubmit={handleBulkSave} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div>
                <p className="text-xs font-bold text-zinc-200">
                  Batch Password Provisioning
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Set custom passwords or generate random secure passwords for all employees at once.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateAll}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition active:scale-95 shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Generate Unique Passwords for All</span>
              </button>
            </div>

            {/* List of Employees with Password Inputs */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {activeStaff.map(emp => {
                const isFieldVisible = Boolean(visibleBulkFields[emp.id]);
                const isAamirOwner = emp.email.trim().toLowerCase() === 'ar.khanaamir@gmail.com';

                return (
                  <div
                    key={emp.id}
                    className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 sm:max-w-[220px]">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-zinc-100 truncate">
                          {emp.name}
                        </span>
                        {isAamirOwner && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        {emp.email}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 flex-1 sm:justify-end">
                      <div className="relative flex-1 sm:max-w-[240px]">
                        <input
                          type={isFieldVisible ? 'text' : 'password'}
                          placeholder="New password (e.g. Casa#832)"
                          value={bulkMap[emp.id] || ''}
                          onChange={e =>
                            setBulkMap(prev => ({ ...prev, [emp.id]: e.target.value }))
                          }
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 pr-9 py-1.5 text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleBulkFields(prev => ({
                              ...prev,
                              [emp.id]: !prev[emp.id]
                            }))
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                          title={isFieldVisible ? 'Hide' : 'Reveal'}
                        >
                          {isFieldVisible ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const singlePass = generateRandomPassword();
                          setBulkMap(prev => ({ ...prev, [emp.id]: singlePass }));
                          setVisibleBulkFields(prev => ({ ...prev, [emp.id]: true }));
                        }}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-300 border border-zinc-700 transition"
                        title="Generate random password for this employee"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Passwords sync directly to Google Cloud Firestore immediately.</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSaving ? 'Saving to Cloud...' : 'Save & Sync Passwords'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: INDIVIDUAL EMPLOYEE PASSWORD */}
        {activeTab === 'individual' && (
          <form onSubmit={handleIndividualSave} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Employee Account
              </label>
              <select
                value={selectedUserId}
                onChange={e => {
                  setSelectedUserId(e.target.value);
                  setStatusMsg(null);
                }}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
              >
                {activeStaff.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()}) — {u.email}
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && (
              <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-100">{selectedUser.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">{selectedUser.email}</p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  New Private Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const pass = generateRandomPassword();
                    setIndividualPassword(pass);
                    setConfirmPassword(pass);
                    setShowIndividualPass(true);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Generate Secure Password</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type={showIndividualPass ? 'text' : 'password'}
                  required
                  value={individualPassword}
                  onChange={e => setIndividualPassword(e.target.value)}
                  placeholder="Enter new password (min 4 characters)"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-10 pr-10 py-2.5 text-xs text-zinc-100 font-mono focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowIndividualPass(!showIndividualPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showIndividualPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type={showIndividualPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to confirm"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-10 pr-4 py-2.5 text-xs text-zinc-100 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-[11px] text-zinc-400 space-y-1">
              <div className="flex items-center space-x-1.5 text-zinc-300 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Isolated Authentication Policy:</span>
              </div>
              <p>
                • This password will not be stored in any local storage or autofilled.
              </p>
              <p>
                • The employee must enter this password manually when logging in.
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? 'Updating...' : 'Update Password & Sync'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
