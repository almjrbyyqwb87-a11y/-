import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  MessageSquare,
  Mail,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Star,
  Edit3,
  Trash2,
  Share2,
  QrCode,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Contact, CATEGORIES } from '../types/contact';
import { formatWhatsAppNumber, sanitizePhoneNumber, generateVCardString } from '../utils/vcard';

interface Props {
  contact: Contact | null;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenQR: (contact: Contact) => void;
}

export const ContactDetailModal: React.FC<Props> = ({
  contact,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenQR,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!contact) return null;

  const category = CATEGORIES[contact.category] || CATEGORIES.other;
  const telNum = sanitizePhoneNumber(contact.phone);
  const waNum = formatWhatsAppNumber(contact.phone);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: contact.name,
      text: `${contact.name}\nهاتف: ${contact.phone}${contact.email ? `\nبريد: ${contact.email}` : ''}${contact.company ? `\nشركة: ${contact.company}` : ''}`,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share cancelled or failed', err);
      }
    } else {
      copyToClipboard(shareData.text, 'share');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl max-h-[92vh] flex flex-col text-right overflow-hidden animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(contact.id)}
              className={`rounded-xl p-2 transition ${
                contact.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="المفضلة"
            >
              <Star className={`w-5 h-5 ${contact.isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => onOpenQR(contact)}
              className="rounded-xl p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
              title="رمز QR"
            >
              <QrCode className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="rounded-xl p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
              title="مشاركة جهة الاتصال"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => onEdit(contact)}
              className="rounded-xl p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
              title="تعديل"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Profile Overview */}
          <div className="flex flex-col items-center text-center">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-xl mb-3"
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${contact.avatarColor || 'from-indigo-600 to-blue-700'} flex items-center justify-center text-white font-extrabold text-3xl shadow-xl shadow-indigo-950/40 ring-4 ring-white/10 mb-3`}
              >
                {contact.name.slice(0, 2)}
              </div>
            )}

            <h2 className="text-xl font-black text-white">{contact.name}</h2>

            {(contact.jobTitle || contact.company) && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 justify-center">
                {contact.company && <Building2 className="w-3.5 h-3.5 text-slate-500" />}
                <span>
                  {contact.jobTitle && contact.company
                    ? `${contact.jobTitle} - ${contact.company}`
                    : contact.jobTitle || contact.company}
                </span>
              </p>
            )}

            <div className="mt-2.5 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${category.bgColor} ${category.color} ${category.borderColor}`}
              >
                {category.label}
              </span>

              {contact.isFavorite && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Star className="w-3 h-3 fill-current" />
                  <span>المفضلة</span>
                </span>
              )}
            </div>
          </div>

          {/* Primary Action Buttons (Grid) */}
          <div className="grid grid-cols-4 gap-2.5">
            <a
              href={`tel:${telNum}`}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition"
            >
              <Phone className="w-5 h-5" />
              <span className="text-[11px] font-bold">اتصال</span>
            </a>

            <a
              href={`https://wa.me/${waNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 active:scale-95 transition"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[11px] font-bold">واتساب</span>
            </a>

            <a
              href={`sms:${telNum}`}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 active:scale-95 transition"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[11px] font-bold">رسالة</span>
            </a>

            <button
              onClick={() => onOpenQR(contact)}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 active:scale-95 transition"
            >
              <QrCode className="w-5 h-5" />
              <span className="text-[11px] font-bold">رمز QR</span>
            </button>
          </div>

          {/* Details Sections */}
          <div className="space-y-3">
            {/* Primary Phone Item */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 text-indigo-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">الهاتف الرئيسي</p>
                  <p className="text-sm font-bold text-white font-mono mt-0.5" dir="ltr">
                    {contact.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyToClipboard(contact.phone, 'phone')}
                  className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  title="نسخ الرقم"
                >
                  {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`tel:${telNum}`}
                  className="rounded-xl p-2 text-emerald-400 hover:bg-emerald-500/10 transition"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Secondary Phone Item */}
            {contact.secondaryPhone && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700/50 text-slate-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">هاتف إضافي</p>
                    <p className="text-sm font-bold text-white font-mono mt-0.5" dir="ltr">
                      {contact.secondaryPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyToClipboard(contact.secondaryPhone!, 'secondaryPhone')}
                    className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  >
                    {copiedField === 'secondaryPhone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={`tel:${sanitizePhoneNumber(contact.secondaryPhone)}`}
                    className="rounded-xl p-2 text-emerald-400 hover:bg-emerald-500/10 transition"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Email Item */}
            {contact.email && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-700/50 text-purple-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">البريد الإلكتروني</p>
                    <p className="text-sm font-semibold text-white truncate mt-0.5" dir="ltr">
                      {contact.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => copyToClipboard(contact.email!, 'email')}
                    className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  >
                    {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={`mailto:${contact.email}`}
                    className="rounded-xl p-2 text-purple-400 hover:bg-purple-500/10 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Address */}
            {contact.address && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700/50 text-rose-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">العنوان</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{contact.address}</p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl p-2 text-rose-400 hover:bg-rose-500/10 transition"
                  title="فتح في خرائط جوجل"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Birthday */}
            {contact.birthday && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 text-amber-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">تاريخ الميلاد</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{contact.birthday}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {contact.notes && (
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>الملاحظات</span>
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed selectable-text">
                  {contact.notes}
                </p>
              </div>
            )}
          </div>

          {/* Delete Action Section */}
          <div className="pt-2">
            {showDeleteConfirm ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
                <p className="text-xs font-bold text-rose-300">
                  هل أنت متأكد من رغبتك في حذف جهة الاتصال هذه نهائياً؟
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      onDelete(contact.id);
                      onClose();
                    }}
                    className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white transition active:scale-95"
                  >
                    نعم، حذف
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition"
                  >
                    تراجع
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-xs font-semibold transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف جهة الاتصال</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
