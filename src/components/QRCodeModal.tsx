import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode as QrIcon, Smartphone } from 'lucide-react';
import { Contact } from '../types/contact';
import { generateContactQRData } from '../utils/vcard';

interface Props {
  contact: Contact | null;
  onClose: () => void;
}

export const QRCodeModal: React.FC<Props> = ({ contact, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!contact || !canvasRef.current) return;

    const qrPayload = generateContactQRData(contact);
    QRCode.toCanvas(
      canvasRef.current,
      qrPayload,
      {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) console.error('Error generating QR code', error);
      }
    );
  }, [contact]);

  if (!contact) return null;

  const handleDownloadQR = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${contact.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(contact.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-center relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3">
          <QrIcon className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{contact.name}</h3>
        <p className="text-xs text-slate-400 font-mono mb-4" dir="ltr">
          {contact.phone}
        </p>

        {/* QR Code Container */}
        <div className="relative mx-auto w-fit p-3 bg-white rounded-2xl shadow-xl shadow-black/40">
          <canvas ref={canvasRef} className="rounded-xl block" />
        </div>

        {/* Explanation */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-800/60 py-2 px-3 rounded-xl">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>امسح الرمز بكاميرا أي هاتف لحفظ جهة الاتصال مباشرة</span>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-3 text-xs font-semibold text-white transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>حفظ كصورة</span>
          </button>

          <button
            onClick={handleCopyPhone}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2.5 px-3 text-xs font-semibold text-slate-200 transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرقم'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
