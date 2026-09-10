import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { UserRole, Project } from '../types';
import { UserProfileModal } from './UserProfileModal';
import { CloudSyncModal } from './CloudSyncModal';
import {
  Building2,
  ChevronDown,
  ShieldCheck,
  HardHat,
  Compass,
  Calculator,
  UserCheck,
  Eye,
  Plus,
  Bell,
  RotateCcw,
  Sparkles,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  User,
  Users,
  LogOut,
  SlidersHorizontal,
  Cloud,
  CloudOff,
  RefreshCw,
  Trash2,
  Pencil,
} from 'lucide-react';
import { RecentlyDeletedModal } from './RecentlyDeletedModal';
import { ProjectEditModal } from './ProjectEditModal';

interface NavbarProps {
  onOpenQuickAction: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAction, onNavigateToTab }) => {
  const {
    currentUser,
    logout,
    currentRole,
    setRole,
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    materials,
    resetToDefaults,
    cloudSyncStatus,
    firebaseUser,
    isOwner,
    recentlyDeletedCount,
    users,
  } = useCasabuild();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showRecentlyDeletedModal, setShowRecentlyDeletedModal] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const lowStockCount = (materials || []).filter(m => m?.status === 'Low Stock' || m?.status === 'Critical').length;
  const activeEmployeesCount = (users || []).filter(u => !u?.isDeleted).length;

  const roleConfigs: Record<UserRole, { label: string; icon: any; color: string; desc: string }> = {
    owner: {
      label: 'Owner (Executive)',
      icon: ShieldCheck,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      desc: 'Complete control: Finance, BOQ, Contracts & Approvals'
    },
    architect: {
      label: 'Architect & Design',
      icon: Compass,
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      desc: 'Drawings, BOQ specifications, Interior Selections'
    },
    supervisor: {
      label: 'Site Supervisor',
      icon: HardHat,
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      desc: 'Labour attendance, Daily Site Reports, Site photos'
    },
    accountant: {
      label: 'Accountant',
      icon: Calculator,
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      desc: 'Vendor payments, invoices, worker wage settlements'
    },
    contractor: {
      label: 'Contractor',
      icon: UserCheck,
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      desc: 'Assigned workforce, progress logs & task status'
    },
    client: {
      label: 'Client (Restricted View)',
      icon: Eye,
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      desc: 'View progress %, site photos, approvals & payment receipts'
    }
  };

  const currentRoleInfo = roleConfigs[currentRole];
  const CurrentRoleIcon = currentRoleInfo.icon;

  return (
    <header className="flex h-16 w-full items-center justify-between px-4 sm:px-6 bg-[#12151d]/90 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-xl shrink-0">
      <div className="flex items-center justify-between w-full">
        {/* Left: Brand & Architectural Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigateToTab('dashboard')}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-bold text-lg shadow-lg shadow-amber-500/20">
              <span className="font-['Cinzel',serif]">CB</span>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-['Cinzel',serif] text-base font-bold tracking-wider text-zinc-100 sm:text-lg">
                  THE CASABUILD
                </h1>
                <span className="hidden md:inline text-zinc-500 font-light text-xs">|</span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-amber-300 border border-zinc-700">
                  ERP v3.0
                </span>
              </div>
              <p className="hidden text-[10px] font-medium tracking-wider text-zinc-400 sm:block">
                ARCHITECTURE <span className="text-amber-500/80">•</span> INTERIORS <span className="text-amber-500/80">•</span> CONSTRUCTION
              </p>
            </div>
          </div>

          {/* Project Selector (hidden in client mode or mobile if tight) */}
          {currentRole !== 'client' && (
            <div className="relative hidden md:block">
              <button
                id="navbar-project-selector-btn"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="flex items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 transition"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span className="max-w-[160px] truncate font-medium">{activeProject.name}</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-amber-300 border border-zinc-700">{activeProject.code}</span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>

              {showProjectDropdown && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-zinc-800 bg-[#161922] p-2 shadow-2xl z-50">
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Switch Active Project
                  </div>
                  <div className="space-y-1">
                    {projects.map(p => (
                      <div
                        key={p.id}
                        className={`group flex items-center justify-between rounded-xl p-1.5 transition ${
                          p.id === activeProjectId
                            ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                            : 'hover:bg-zinc-800/60 text-zinc-300'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setActiveProjectId(p.id);
                            setShowProjectDropdown(false);
                          }}
                          className="flex-1 flex items-start justify-between text-left p-1"
                        >
                          <div>
                            <p className="font-medium text-zinc-100 group-hover:text-amber-300 transition text-xs">{p.name}</p>
                            <p className="text-[10px] text-zinc-400">{p.location}</p>
                          </div>
                          <div className="text-right mr-2">
                            <span className="text-[10px] font-bold text-amber-400">{p.overallProgress}%</span>
                            <span className="block text-[9px] text-zinc-500">{p.type}</span>
                          </div>
                        </button>

                        <button
                          id={`navbar-edit-project-${p.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(p);
                            setShowEditProjectModal(true);
                            setShowProjectDropdown(false);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-700/60 transition shrink-0"
                          title={`Edit ${p.name} (area, location, milestones, BOQ, contracts & delete)`}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Action, Role Switcher, Notifications, Reset */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Action Button */}
          {currentRole !== 'client' && (
            <button
              id="navbar-quick-action-btn"
              onClick={onOpenQuickAction}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Quick Action</span>
              <span className="sm:hidden">New</span>
            </button>
          )}

          {/* Employees & Accounts Shortcut */}
          {currentRole !== 'client' && (
            <button
              id="navbar-employees-btn"
              onClick={() => onNavigateToTab('employees')}
              className="flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-amber-500/40 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-amber-300 transition"
              title="Manage Company Employees, Accounts, Passwords & Permissions"
            >
              <Users className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline text-[11px]">Employees</span>
              <span className="inline-flex items-center justify-center rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] font-bold text-amber-400/90 border border-zinc-700">
                {activeEmployeesCount}
              </span>
            </button>
          )}

          {/* Recently Deleted Recycle Bin Button */}
          <button
            id="navbar-recently-deleted-btn"
            onClick={() => setShowRecentlyDeletedModal(true)}
            className={`relative flex items-center space-x-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
              recentlyDeletedCount > 0
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
            title="Recently Deleted Bin (30-Day Recovery Window for Projects, Personnel & Workers)"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden lg:inline text-[11px]">Recycle Bin</span>
            {recentlyDeletedCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-500/25 px-1.5 py-0.2 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                {recentlyDeletedCount}
              </span>
            )}
          </button>

          {/* Cloud Sync Status Indicator Pill */}
          <button
            id="navbar-cloud-sync-btn"
            onClick={() => setShowSyncModal(true)}
            className={`flex items-center space-x-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
              cloudSyncStatus === 'synced'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : cloudSyncStatus === 'syncing'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 animate-pulse'
                : cloudSyncStatus === 'error'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
            title="Firebase Cloud Database Synchronization"
          >
            {cloudSyncStatus === 'syncing' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
            ) : cloudSyncStatus === 'synced' ? (
              <div className="flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <Cloud className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            ) : cloudSyncStatus === 'error' ? (
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <CloudOff className="h-3.5 w-3.5 text-zinc-400" />
            )}
            <span className="hidden xl:inline text-[11px]">
              {cloudSyncStatus === 'synced'
                ? 'Cloud Synced'
                : cloudSyncStatus === 'syncing'
                ? 'Syncing...'
                : cloudSyncStatus === 'error'
                ? 'Sync Error'
                : 'Cloud Sync'}
            </span>
          </button>

          {/* Authenticated User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              id="navbar-user-profile-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/90 pl-1.5 pr-2.5 py-1 text-xs text-zinc-200 transition ring-1 ring-zinc-700/50 hover:border-zinc-700"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-7 w-7 rounded-lg object-cover ring-1 ring-amber-500/40"
                />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              )}
              
              <div className="hidden md:block text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-zinc-100 max-w-[120px] truncate leading-none">
                    {currentUser?.name || 'User'}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${currentRoleInfo.color}`}>
                    {isOwner && currentRole !== 'owner' ? `OWNER (${currentRole.toUpperCase()})` : currentRole.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[130px] leading-tight mt-0.5">
                  {currentUser?.email || 'Logged in'}
                </p>
              </div>

              <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-800 bg-[#161922] p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Profile Header */}
                <div className="flex items-center space-x-3 pb-3 border-b border-zinc-800">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="h-10 w-10 rounded-xl object-cover ring-1 ring-amber-500/40"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-100 truncate">{currentUser?.name}</p>
                    <p className="text-[11px] font-mono text-zinc-400 truncate">{currentUser?.email}</p>
                    <div className="flex items-center space-x-1.5 mt-1">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${currentRoleInfo.color}`}>
                        {isOwner && currentRole !== 'owner' ? `OWNER (${currentRole.toUpperCase()})` : currentRole.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">{currentUser?.designation}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="py-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-zinc-800/80 hover:text-amber-300 transition"
                  >
                    <User className="h-4 w-4 text-amber-400" />
                    <span>View Profile & Role Permissions Matrix</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigateToTab('employees');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-zinc-800/80 hover:text-amber-300 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Users className="h-4 w-4 text-amber-400" />
                      <span>Company Employees & Accounts</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeEmployeesCount}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowRecentlyDeletedModal(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-zinc-800/80 hover:text-amber-300 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Trash2 className="h-4 w-4 text-rose-400" />
                      <span>Recently Deleted Bin (30-Day Window)</span>
                    </div>
                    {recentlyDeletedCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {recentlyDeletedCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Role Switching: Allowed for Owner with Master Access across all roles */}
                {isOwner ? (
                  <div className="pt-2 border-t border-zinc-800">
                    <div className="flex items-center justify-between px-2 py-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Master Role Switcher
                      </span>
                      <span className="text-[9px] bg-amber-500/15 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                        Owner in Every Role
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 px-2 mb-2">
                      Operate with Master Owner authority across any role workspace:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(roleConfigs) as UserRole[]).map(roleKey => {
                        const cfg = roleConfigs[roleKey];
                        const Icon = cfg.icon;
                        const isSelected = currentRole === roleKey;
                        return (
                          <button
                            key={roleKey}
                            onClick={() => {
                              setRole(roleKey);
                              if (roleKey === 'client') {
                                onNavigateToTab('client-portal');
                              }
                            }}
                            className={`flex items-center space-x-1.5 p-1.5 rounded-lg text-[11px] font-medium transition ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            <span className="truncate">{cfg.label.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-zinc-800 px-2 py-1 text-[11px] text-zinc-400">
                    <span className="font-semibold text-zinc-300">Role Boundary Enforced:</span>
                    <p className="text-[10px] mt-0.5 text-zinc-400">
                      Your permissions are strictly defined as <span className="text-amber-400 font-medium">{currentRoleInfo.label}</span>.
                    </p>
                  </div>
                )}

                {/* Sign Out Button */}
                <div className="pt-2.5 mt-2 border-t border-zinc-800">
                  <button
                    id="navbar-sign-out-btn"
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out / Switch User</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="navbar-notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 p-2 text-zinc-400 hover:text-zinc-100 transition"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-500/40">
                  {lowStockCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-800 bg-[#161922] p-3 shadow-2xl z-50">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                  <span className="text-xs font-semibold text-zinc-200">Site Alerts & Reminders</span>
                  <span className="text-[10px] text-amber-400">Live</span>
                </div>
                <div className="space-y-2">
                  {lowStockCount > 0 ? (
                    <div className="flex items-start space-x-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-200">{lowStockCount} Material(s) Low in Stock</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          AAC Blocks & Paint below reorder threshold. Tap to restock.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400">No urgent inventory warnings.</p>
                  )}
                  <div className="flex items-start space-x-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-200">Daily Site Attendance Marked</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        24 workers logged on site today across {activeProject.name}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            id="navbar-reset-demo-btn"
            onClick={() => {
              if (window.confirm('Reset all Casabuild ERP data to factory blueprint state?')) {
                resetToDefaults();
              }
            }}
            className="hidden sm:flex rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 p-2 text-zinc-400 hover:text-zinc-200 transition"
            title="Reset to Blueprint Defaults"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* User Profile & Permissions Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Firebase Cloud Sync Management Modal */}
      <CloudSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />

      {/* 30-Day Recently Deleted Recycle Bin Modal */}
      <RecentlyDeletedModal
        isOpen={showRecentlyDeletedModal}
        onClose={() => setShowRecentlyDeletedModal(false)}
      />

      {/* Comprehensive Project Edit Modal */}
      <ProjectEditModal
        project={editingProject}
        isOpen={showEditProjectModal}
        onClose={() => {
          setShowEditProjectModal(false);
          setEditingProject(null);
        }}
      />
    </header>
  );
};
