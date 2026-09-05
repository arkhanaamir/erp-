import React, { useState } from 'react';
import { ShieldAlert, Copy, Check, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { useCasabuild } from '../context/CasabuildContext';

interface DomainAuthNoticeProps {
  onRetryGoogle?: () => void;
  className?: string;
}

export const DomainAuthNotice: React.FC<DomainAuthNoticeProps> = ({ onRetryGoogle, className = '' }) => {
  const { signInDirectCloud } = useCasabuild();
  const [copied, setCopied] = useState(false);
  const [connectingDirect, setConnectingDirect] = useState(false);
  const [directSuccess, setDirectSuccess] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseConsoleUrl = 'https://console.firebase.google.com/project/basic-craft-ncbh2/authentication/settings';

  const handleCopyDomain = () => {
    if (currentDomain) {
      navigator.clipboard.writeText(currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDirectConnect = async () => {
    setConnectingDirect(true);
    setDirectError(null);
    try {
      await signInDirectCloud();
      setDirectSuccess(true);
    } catch (err: any) {
      setDirectError(err.message || 'Direct cloud session unavailable. Please add the domain to Firebase Console.');
    } finally {
      setConnectingDirect(false);
    }
  };

  return (
    <div className={`rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-zinc-900/90 to-zinc-950 p-4 text-xs text-zinc-300 shadow-xl space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-amber-300 text-sm">Firebase: auth/unauthorized-domain</h4>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono uppercase">Action Required</span>
          </div>
          <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
            Google OAuth requires your web app’s domain to be added to the Authorized Domains list in Firebase Authentication settings.
          </p>
        </div>
      </div>

      {/* Domain to Copy */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-zinc-400">
          Your Current Domain to Authorize:
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-zinc-950/80 border border-zinc-700/80 rounded-lg px-3 py-2 font-mono text-xs text-amber-200 select-all truncate">
            {currentDomain || 'ais-dev-...run.app'}
          </div>
          <button
            type="button"
            onClick={handleCopyDomain}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium transition shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                <span>Copy Domain</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Setup Instructions */}
      <div className="rounded-lg bg-zinc-900/80 border border-zinc-800/80 p-3 space-y-2 text-[11px]">
        <span className="font-semibold text-zinc-200 block">How to Authorize (Takes ~20 seconds):</span>
        <ol className="list-decimal list-inside space-y-1 text-zinc-400 leading-normal">
          <li>
            Open{' '}
            <a
              href={firebaseConsoleUrl}
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 underline hover:text-amber-300 inline-flex items-center gap-0.5 font-medium"
            >
              <span>Firebase Authentication Settings</span>
              <ExternalLink className="h-3 w-3" />
            </a>{' '}
            (Project: <strong className="text-zinc-200 font-mono">basic-craft-ncbh2</strong>).
          </li>
          <li>Under the <strong className="text-zinc-300">Settings</strong> tab, scroll down to the <strong className="text-zinc-300">Authorized domains</strong> section.</li>
          <li>Click <strong className="text-zinc-300">Add domain</strong>, paste the domain above, and click <strong className="text-zinc-300">Done</strong>.</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {onRetryGoogle && (
          <button
            type="button"
            onClick={onRetryGoogle}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold transition text-xs shadow"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Google Sign-In Again</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleDirectConnect}
          disabled={connectingDirect || directSuccess}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium transition text-xs"
        >
          {connectingDirect ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
          ) : (
            <Zap className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span>{directSuccess ? 'Connected to Cloud!' : 'Instant Cloud Connect'}</span>
        </button>
      </div>

      {directSuccess && (
        <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center space-x-1.5">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>Direct Cloud session connected successfully! You can now synchronize ERP records.</span>
        </div>
      )}

      {directError && (
        <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
          {directError}
        </div>
      )}
    </div>
  );
};
