import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileCode,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Contact } from '../types/contact';
import { downloadVCard, parseVCF, downloadJSONBackup } from '../utils/vcard';
import { AVATAR_GRADIENTS } from '../types/contact';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onImportContacts: (newContacts: Contact[]) => void;
  onResetToDemo: () => void;
}

export const BackupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contacts,
  onImportContacts,
  onResetToDemo,
}) => {
  const vcfInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExportVCard = () => {
    downloadVCard(contacts, `contacts-${new Date().toISOString().split('T')[0]}.vcf`);
  };

  const handleExportJSON = () => {
    downloadJSONBackup(contacts);
  };

  const handleVCFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const parsed = parseVCF(content);
        if (parsed.length === 0) {
          alert('لم يتم العثور على جهات اتصال صالحة في ملف vCard هذا.');
          return;
        }

        const formatted: Contact[] = parsed.map((p, idx) => ({
          id: `imp-${Date.now()}-${idx}`,
          name: p.name || 'جهة اتصال مستوردة',
          phone: p.phone || '',
          secondaryPhone: p.secondaryPhone || '',
          email: p.email || '',
          category: 'other',
          jobTitle: p.jobTitle || '',
          company: p.company || '',
          address: p.address || '',
          notes: p.notes || '',
          birthday: p.birthday || '',
          avatarColor: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
          isFavorite: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));

        onImportContacts(formatted);
        setImportStatus(`تم بنجاح استيراد ${formatted.length} جهة اتصال من ملف vCard!`);
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const data = JSON.parse(content);
          const list = Array.isArray(data) ? data : data.contacts;
          if (!Array.isArray(list) || list.length === 0) {
            alert('صيغة ملف النسخة الاحتياطية غير صالحة.');
            return;
          }

          const formatted: Contact[] = list.map((c: Partial<Contact>, idx: number) => ({
            id: c.id || `imp-${Date.now()}-${idx}`,
            name: c.name || 'بدون اسم',
            phone: c.phone || '',
            secondaryPhone: c.secondaryPhone || '',
            email: c.email || '',
            category: c.category || 'other',
            jobTitle: c.jobTitle || '',
            company: c.company || '',
            address: c.address || '',
            notes: c.notes || '',
            birthday: c.birthday || '',
            avatarColor: c.avatarColor || AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
            avatarUrl: c.avatarUrl,
            isFavorite: Boolean(c.isFavorite),
            createdAt: c.createdAt || Date.now(),
            updatedAt: Date.now(),
          }));

          onImportContacts(formatted);
          setImportStatus(`تم استعادة النسخة الاحتياطية بنجاح (${formatted.length} جهة اتصال)!`);
          setTimeout(() => setImportStatus(null), 4000);
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
  };

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

          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>النسخ الاحتياطي والاستيراد والتصدير</span>
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {importStatus && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Section 1: Standard vCard (.vcf) */}
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>بطاقات جهات الاتصال (vCard .VCF)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  الصيغة القياسية المعتمدة عالمياً المتوافقة مباشرة مع هواتف آيفون (iOS Contacts)، وأندرويد (Google Contacts)، وبرنامج Outlook.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={handleExportVCard}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-3 text-xs font-bold text-white transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تصدير ملف .VCF</span>
              </button>

              <button
                onClick={() => vcfInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 px-3 text-xs font-bold text-slate-100 transition active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>استيراد ملف .VCF</span>
              </button>

              <input
                ref={vcfInputRef}
                type="file"
                accept=".vcf,text/vcard"
                className="hidden"
                onChange={handleVCFUpload}
              />
            </div>
          </div>

          {/* Section 2: Complete JSON Backup */}
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>نسخة احتياطية رقمية شاملة (JSON)</span>
                <FileCode className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                تحفظ كافة البيانات التفصيلية بما فيها التصنيفات، المفضلات، الألوان والصور الشخصية.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 px-3 text-xs font-bold text-white transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل نسخة JSON</span>
              </button>

              <button
                onClick={() => jsonInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 px-3 text-xs font-bold text-slate-100 transition active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>استعادة ملف JSON</span>
              </button>

              <input
                ref={jsonInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleJSONUpload}
              />
            </div>
          </div>

          {/* Section 3: Reset to sample demo data */}
          <div className="pt-2">
            {showResetConfirm ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>هل تريد استعادة جهات الاتصال التجريبية الافتراضية؟</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      onResetToDemo();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold transition active:scale-95"
                  >
                    نعم، استعادة النموذج
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>استعادة بيانات العرض التجريبية</span>
              </button>
            )}
          </div>
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
