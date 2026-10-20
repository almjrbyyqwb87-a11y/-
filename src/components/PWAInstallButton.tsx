import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  className?: string;
  variant?: 'button' | 'badge' | 'full';
}

export const PWAInstallButton: React.FC<Props> = ({ className = '', variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all ${className}`}
        title="تثبيت التطبيق على جهازك للعمل دون إنترنت"
      >
        <Download className="w-4 h-4" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 active:scale-95 transition-all ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت على آيفون</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-right">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>تثبيت التطبيق على آيفون / آيباد</span>
                  <Download className="w-4 h-4 text-indigo-400" />
                </h3>
              </div>

              <div className="mt-4 space-y-3.5 text-sm text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ١
                  </div>
                  <div>
                    <p className="font-semibold text-white">اضغط على زر المشاركة</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      انقر على أيقونة المشاركة <Share2 className="w-3.5 h-3.5 inline text-blue-400" /> في شريط متصفح Safari السفلي.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ٢
                  </div>
                  <div>
                    <p className="font-semibold text-white">إضافة إلى الصفحة الرئيسية</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      مرر للأسفل واختر <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" /> <strong>"إضافة إلى الشاشة الرئيسية"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ٣
                  </div>
                  <div>
                    <p className="font-semibold text-white">تأكيد التثبيت</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      اضغط على "إضافة" بالأعلى ليظهر التطبيق في شاشتك الرئيسية ويعمل بدون إنترنت!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                فهمت، شكراً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
