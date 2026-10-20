import React from 'react';
import { X, CopyCheck, Merge, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Contact } from '../types/contact';
import { DuplicateGroup, findDuplicates, mergeContactGroup } from '../utils/duplicates';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onMergeGroup: (merged: Contact, originalIds: string[]) => void;
  onMergeAll: (groups: DuplicateGroup[]) => void;
}

export const DuplicatesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contacts,
  onMergeGroup,
  onMergeAll,
}) => {
  if (!isOpen) return null;

  const duplicateGroups = findDuplicates(contacts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl max-h-[85vh] flex flex-col text-right overflow-hidden animate-in fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">فحص وتنظيف التكرار</h2>
            <CopyCheck className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {duplicateGroups.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">دفترك نظيف ومنظم!</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                لم يتم العثور على أي أرقام هواتف أو أسماء مكررة في سجل جهات الاتصال الخاصة بك.
              </p>
            </div>
          ) : (
            <>
              {/* Summary alert banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-semibold">
                    تم اكتشاف {duplicateGroups.length} مجموعة جهات اتصال مكررة
                  </span>
                </div>

                <button
                  onClick={() => onMergeAll(duplicateGroups)}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 text-xs transition active:scale-95 shrink-0"
                >
                  دمج الكل تلقائياً
                </button>
              </div>

              {/* Duplicate cards */}
              <div className="space-y-3.5 mt-2">
                {duplicateGroups.map((group) => {
                  const originalIds = group.contacts.map((c) => c.id);
                  const previewMerged = mergeContactGroup(group.contacts);

                  return (
                    <div
                      key={group.id}
                      className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                        <span className="text-xs font-bold text-indigo-400">
                          سبب التكرار: {group.reasonLabel}
                        </span>

                        <button
                          onClick={() => onMergeGroup(previewMerged, originalIds)}
                          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white transition active:scale-95 shadow"
                        >
                          <Merge className="w-3.5 h-3.5" />
                          <span>دمج في جهة واحدة</span>
                        </button>
                      </div>

                      {/* Contacts in this group */}
                      <div className="space-y-2">
                        {group.contacts.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                              >
                                {c.name.slice(0, 2)}
                              </div>
                              <span className="font-bold text-slate-200 truncate">{c.name}</span>
                            </div>

                            <span className="font-mono text-slate-400 text-[11px]" dir="ltr">
                              {c.phone}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
