import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex items-center justify-between gap-3 rounded-2xl bg-slate-900/95 border border-amber-500/40 p-3.5 shadow-2xl backdrop-blur-md max-w-md animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <WifiOff className="w-5 h-5 animate-pulse" />
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>وضع العمل دون اتصال (Offline)</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping" />
          </p>
          <p className="text-[11px] text-slate-300">
            تطبيق PWA نشط بالكامل. يمكنك البحث والاتصال وإدارة جهات اتصالك دون انترنت.
          </p>
        </div>
      </div>
      <div className="shrink-0 text-emerald-400">
        <CheckCircle2 className="w-5 h-5" />
      </div>
    </div>
  );
};
