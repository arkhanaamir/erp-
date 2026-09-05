import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { DomainAuthNotice } from './DomainAuthNotice';
import {
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Laptop,
  Smartphone,
  ArrowRight,
  Database,
  Zap,
  X
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    cloudSyncStatus,
    firebaseUser,
    signInWithGoogle,
    signInDirectCloud,
    signOutGoogle,
    syncAllToCloud,
    fetchLatestFromCloud,
    lastCloudSyncTime,
    cloudSyncError,
    unauthorizedDomain,
    projects,
    workers,
    dailyReports,
    expenses,
    vendors
  } = useCasabuild();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setLoadingAction('signin');
    setActionFeedback(null);
    try {
      await signInWithGoogle();
      setActionFeedback({
        type: 'success',
        message: 'Successfully authenticated with Google Cloud! Real-time synchronization is now active.'
      });
    } catch (err: any) {
      const isUnauth = err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain');
      setActionFeedback({
        type: 'error',
        message: isUnauth
          ? 'Domain authorization needed in Firebase Console. See details below.'
          : (err.message || 'Failed to authenticate with Google.')
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDirectConnect = async () => {
    setLoadingAction('direct');
    setActionFeedback(null);
    try {
      await signInDirectCloud();
      setActionFeedback({
        type: 'success',
        message: 'Direct Cloud session established! Firestore synchronization is now active.'
      });
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Direct cloud connection failed.'
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSyncToCloud = async () => {
    setLoadingAction('upload');
    setActionFeedback(null);
    try {
      const res = await syncAllToCloud();
      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: res.message
        });
      } else {
        setActionFeedback({
          type: 'error',
          message: res.message
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Upload to cloud failed.'
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFetchFromCloud = async () => {
    setLoadingAction('download');
    setActionFeedback(null);
    try {
      await fetchLatestFromCloud();
      setActionFeedback({
        type: 'success',
        message: 'Successfully refreshed latest records from Firebase Cloud!'
      });
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Failed to pull cloud records.'
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#141721] border border-zinc-800 shadow-2xl overflow-hidden font-['Outfit',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Firebase Cloud Synchronization</h3>
              <p className="text-xs text-zinc-400">Multi-device real-time database sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Status Box */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cloud Engine</span>
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firestore Provisioned</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 uppercase">Status</span>
                <p className="font-semibold text-zinc-200 capitalize mt-0.5 flex items-center space-x-1.5">
                  {cloudSyncStatus === 'synced' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  {cloudSyncStatus === 'syncing' && <RefreshCw className="h-3.5 w-3.5 text-amber-400 animate-spin" />}
                  {cloudSyncStatus === 'needs_login' && <AlertCircle className="h-3.5 w-3.5 text-amber-400" />}
                  {cloudSyncStatus === 'error' && <AlertCircle className="h-3.5 w-3.5 text-rose-400" />}
                  <span>{cloudSyncStatus.replace('_', ' ')}</span>
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 uppercase">Last Synchronized</span>
                <p className="font-mono text-zinc-200 mt-0.5">{lastCloudSyncTime || 'Pending sync'}</p>
              </div>
            </div>

            {/* Account row */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span className="text-zinc-300 font-medium">
                  {firebaseUser ? (
                    <span>Connected: <strong className="text-amber-300 font-mono">{firebaseUser.email}</strong></span>
                  ) : (
                    <span className="text-zinc-400">Google Account not yet linked</span>
                  )}
                </span>
              </div>

              {firebaseUser ? (
                <button
                  onClick={signOutGoogle}
                  className="text-[11px] text-zinc-400 hover:text-rose-400 transition underline underline-offset-2"
                >
                  Disconnect
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDirectConnect}
                    disabled={loadingAction === 'direct'}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium transition flex items-center space-x-1"
                    title="Connect directly to cloud without Google popup"
                  >
                    {loadingAction === 'direct' ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
                    ) : (
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span>Direct Connect</span>
                  </button>
                  <button
                    onClick={handleSignIn}
                    disabled={loadingAction === 'signin'}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition flex items-center space-x-1"
                  >
                    {loadingAction === 'signin' ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span>Sign In with Google</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Domain Authorization Guidance Banner */}
          {(unauthorizedDomain || actionFeedback?.message?.includes('unauthorized-domain') || cloudSyncError?.includes('unauthorized-domain')) && (
            <DomainAuthNotice onRetryGoogle={handleSignIn} />
          )}

          {/* Device Sync Info Card */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Laptop className="h-4 w-4" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-amber-200">How cross-machine sync works:</p>
              <p className="text-zinc-300 leading-relaxed">
                When you click <strong>"Upload to Cloud"</strong>, your projects, DSRs, BOQs, and attendance are published to your Firebase Firestore cloud database.
                When you open Casabuild on your other computer or mobile device and sign in, all records appear automatically!
              </p>
            </div>
          </div>

          {/* Feedback notification */}
          {actionFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{actionFeedback.message}</span>
            </div>
          )}

          {/* Summary of Local Dataset */}
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Current Dataset Ready to Sync</span>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300"><strong>{projects?.length || 0}</strong> Projects</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300"><strong>{workers?.length || 0}</strong> Labour Profiles</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300"><strong>{dailyReports?.length || 0}</strong> DSR Reports</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300"><strong>{expenses?.length || 0}</strong> Expense Vouchers</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300"><strong>{vendors?.length || 0}</strong> Vendors</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleSyncToCloud}
              disabled={loadingAction !== null}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
            >
              {loadingAction === 'upload' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              <span>Upload to Cloud</span>
            </button>

            <button
              onClick={handleFetchFromCloud}
              disabled={loadingAction !== null}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs active:scale-95 transition disabled:opacity-50"
            >
              {loadingAction === 'download' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <DownloadCloud className="h-4 w-4" />
              )}
              <span>Pull Latest from Cloud</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="font-mono truncate">Database: basic-craft-ncbh2</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
