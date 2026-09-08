import React, { useState, useMemo } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { SoftDeletedItem, SoftDeletedType } from '../types';
import {
  Trash2,
  RotateCcw,
  Building,
  HardHat,
  UserCheck,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Calendar,
  User,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface RecentlyDeletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'all' | 'project' | 'employee_staff' | 'employee_worker' | 'projects' | 'workers' | 'users';
  initialFilter?: 'all' | 'project' | 'employee_staff' | 'employee_worker' | 'projects' | 'workers' | 'users';
}

function resolveTab(val?: string): 'all' | 'project' | 'employee_staff' | 'employee_worker' {
  if (val === 'projects' || val === 'project') return 'project';
  if (val === 'workers' || val === 'employee_worker') return 'employee_worker';
  if (val === 'users' || val === 'employee_staff') return 'employee_staff';
  return 'all';
}

export const RecentlyDeletedModal: React.FC<RecentlyDeletedModalProps> = ({
  isOpen,
  onClose,
  initialTab,
  initialFilter
}) => {
  const defaultTab = resolveTab(initialFilter || initialTab);
  const {
    recentlyDeletedItems,
    recentlyDeletedCount,
    restoreProject,
    permanentlyDeleteProject,
    restoreUser,
    permanentlyDeleteUser,
    restoreWorker,
    permanentlyDeleteWorker,
    restoreAllDeleted,
    emptyRecycleBin,
    isOwner
  } = useCasabuild();

  const [activeTab, setActiveTab] = useState<'all' | 'project' | 'employee_staff' | 'employee_worker'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Sync initialTab if opened from specific source
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(resolveTab(initialFilter || initialTab));
      setActionFeedback(null);
    }
  }, [isOpen, initialFilter, initialTab]);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleRestore = (item: SoftDeletedItem) => {
    if (item.itemType === 'project') {
      restoreProject(item.id);
      showNotification(`Restored project "${item.title}" to active status.`);
    } else if (item.itemType === 'employee_staff') {
      restoreUser(item.id);
      showNotification(`Restored staff profile "${item.title}" to active directory.`);
    } else if (item.itemType === 'employee_worker') {
      restoreWorker(item.id);
      showNotification(`Restored worker profile "${item.title}" to active labour roster.`);
    }
  };

  const handlePermanentDelete = (item: SoftDeletedItem) => {
    if (!isOwner) {
      alert('Permanent purging is restricted to Managing Owner.');
      return;
    }
    const confirmed = window.confirm(
      `Permanently purge "${item.title}"? This will permanently delete this record from the database. This action CANNOT be undone.`
    );
    if (!confirmed) return;

    if (item.itemType === 'project') {
      permanentlyDeleteProject(item.id);
      showNotification(`Permanently deleted project "${item.title}".`, 'info');
    } else if (item.itemType === 'employee_staff') {
      permanentlyDeleteUser(item.id);
      showNotification(`Permanently deleted staff record "${item.title}".`, 'info');
    } else if (item.itemType === 'employee_worker') {
      permanentlyDeleteWorker(item.id);
      showNotification(`Permanently deleted worker profile "${item.title}".`, 'info');
    }
  };

  const handleRestoreAll = () => {
    if (filteredItems.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to restore all ${filteredItems.length} deleted items back to active status?`
    );
    if (confirmed) {
      restoreAllDeleted();
      showNotification(`All items have been restored to active status.`);
    }
  };

  const handleEmptyBin = () => {
    if (!isOwner) {
      alert('Emptying the recycle bin is restricted to Managing Owner.');
      return;
    }
    if (recentlyDeletedCount === 0) return;
    const confirmed = window.confirm(
      `Permanently delete all ${recentlyDeletedCount} items in the Recently Deleted bin? This cannot be undone.`
    );
    if (confirmed) {
      emptyRecycleBin();
      showNotification(`Recycle bin emptied. All deleted items permanently wiped.`, 'info');
    }
  };

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return (recentlyDeletedItems || []).filter(item => {
      const matchesTab = activeTab === 'all' || item.itemType === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.codeOrRole && item.codeOrRole.toLowerCase().includes(q)) ||
        (item.deletedBy && item.deletedBy.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [recentlyDeletedItems, activeTab, searchQuery]);

  // Tab counts
  const counts = useMemo(() => {
    const list = recentlyDeletedItems || [];
    return {
      all: list.length,
      project: list.filter(i => i.itemType === 'project').length,
      employee_staff: list.filter(i => i.itemType === 'employee_staff').length,
      employee_worker: list.filter(i => i.itemType === 'employee_worker').length,
    };
  }, [recentlyDeletedItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-zinc-800 bg-[#12151d] text-zinc-100 shadow-2xl overflow-hidden font-['Outfit',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-[#161922]">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-inner">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-zinc-100">Recently Deleted Bin</h3>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  {recentlyDeletedCount} {recentlyDeletedCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                30-day safety retention window. Restore accidentally deleted projects and employees at any time.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 30-Day Window Alert Banner */}
        <div className="flex items-center justify-between gap-3 bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 text-xs text-amber-200/90">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>30-Day Recovery Window:</strong> Accidental deletions are safely preserved here for 30 days before permanent automatic purging.
            </span>
          </div>

          {recentlyDeletedCount > 0 && (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleRestoreAll}
                className="flex items-center space-x-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/30 transition"
                title="Restore all items in this bin"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore All</span>
              </button>

              {isOwner && (
                <button
                  onClick={handleEmptyBin}
                  className="flex items-center space-x-1 rounded-lg bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/30 transition"
                  title="Permanently wipe all deleted items"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Empty Bin</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notification Toast inside modal */}
        {actionFeedback && (
          <div className={`px-5 py-2 text-xs flex items-center space-x-2 border-b ${
            actionFeedback.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
          }`}>
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionFeedback.message}</span>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="p-4 border-b border-zinc-800 bg-[#141720] flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Tab Selector */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveTab('project')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'project'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Projects ({counts.project})
            </button>
            <button
              onClick={() => setActiveTab('employee_staff')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'employee_staff'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Staff & Team ({counts.employee_staff})
            </button>
            <button
              onClick={() => setActiveTab('employee_worker')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'employee_worker'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Site Labour ({counts.employee_worker})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search deleted records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Scrollable Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/60" />
              </div>
              <h4 className="text-sm font-bold text-zinc-200">
                {searchQuery ? 'No matching items in recycle bin' : 'Recycle Bin is Empty'}
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                {searchQuery
                  ? 'Try modifying your search keywords or switching filter tabs.'
                  : 'No projects or employees are currently soft-deleted. Deleted items will be held here safely for 30 days.'}
              </p>
            </div>
          ) : (
            filteredItems.map(item => {
              const formattedDate = new Date(item.deletedAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const isProject = item.itemType === 'project';
              const isStaff = item.itemType === 'employee_staff';
              const isWorker = item.itemType === 'employee_worker';

              // Days remaining badge styling
              let daysBadgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
              if (item.daysRemaining <= 3) {
                daysBadgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold';
              } else if (item.daysRemaining <= 10) {
                daysBadgeClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
              }

              return (
                <div
                  key={item.id}
                  className="group relative rounded-xl border border-zinc-800 bg-[#161922] p-4 shadow-lg hover:border-zinc-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Icon & Details */}
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border mt-0.5 ${
                      isProject
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : isStaff
                        ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {isProject && <Building className="h-5 w-5" />}
                      {isStaff && <UserCheck className="h-5 w-5" />}
                      {isWorker && <HardHat className="h-5 w-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-zinc-100 text-sm truncate">{item.title}</h4>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                          isProject
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : isStaff
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {item.badge}
                        </span>

                        {/* 30-Day Window Countdown */}
                        <span className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 text-[10px] border ${daysBadgeClass}`}>
                          <Clock className="h-3 w-3" />
                          <span>
                            {item.daysRemaining > 0
                              ? `${item.daysRemaining} days remaining`
                              : 'Grace period expired'}
                          </span>
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{item.subtitle}</p>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500 mt-2">
                        <span className="flex items-center">
                          <User className="mr-1 h-3 w-3 text-zinc-400" />
                          Deleted by: <strong className="text-zinc-300 ml-1">{item.deletedBy}</strong>
                        </span>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3 text-zinc-400" />
                          {formattedDate}
                        </span>
                        {item.meta.location && (
                          <span className="flex items-center text-zinc-400">
                            <MapPin className="mr-1 h-3 w-3 text-amber-500" />
                            {item.meta.location}
                          </span>
                        )}
                        {item.meta.contractValue && (
                          <span className="text-emerald-400 font-medium">
                            Value: {item.meta.contractValue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 border-zinc-800/80 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleRestore(item)}
                      className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-md shadow-emerald-500/20 active:scale-95 transition"
                      title="Restore back to active"
                    >
                      <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Restore</span>
                    </button>

                    {isOwner && (
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        className="flex items-center space-x-1 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-rose-500/10 hover:border-rose-500/40 px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-rose-300 transition"
                        title="Permanently purge from system"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Purge</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 px-5 py-3 bg-[#161922] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Casabuild SafeDelete™ Engine • Automatic 30-day purge buffer</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 text-xs font-semibold text-zinc-200 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
