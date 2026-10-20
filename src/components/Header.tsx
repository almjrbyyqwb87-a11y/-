import React from 'react';
import {
  Users,
  Plus,
  CopyCheck,
  FileSpreadsheet,
  Download,
  Share2,
  Sparkles,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { Contact } from '../types/contact';
import { findDuplicates } from '../utils/duplicates';

interface Props {
  contacts: Contact[];
  onOpenAddModal: () => void;
  onOpenDuplicates: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<Props> = ({
  contacts,
  onOpenAddModal,
  onOpenDuplicates,
  onOpenBackup,
}) => {
  const duplicates = findDuplicates(contacts);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        {/* App Title & Brand Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
            <Users className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                جهات اتصالي
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              {contacts.length} جهة اتصال • حفظ سحابي ومحلي
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button (renders if installable on Chrome/Android/Desktop or iOS guide) */}
          <PWAInstallButton />

          {/* Backup / Export / Import Trigger */}
          <button
            onClick={onOpenBackup}
            className="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition"
            title="النسخ الاحتياطي واستيراد وتصدير بطاقات vCard"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          {/* Duplicate Finder Trigger */}
          <button
            onClick={onOpenDuplicates}
            className="relative flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition"
            title="فحص وتنظيف جهات الاتصال المكررة"
          >
            <CopyCheck className="w-4 h-4" />
            {duplicates.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-slate-950">
                {duplicates.length}
              </span>
            )}
          </button>

          {/* Add Contact Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة جهة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
