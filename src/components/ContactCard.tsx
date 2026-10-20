import React from 'react';
import { Phone, MessageCircle, MessageSquare, Star, QrCode, MoreVertical, Briefcase, Mail, Building2 } from 'lucide-react';
import { Contact, CATEGORIES } from '../types/contact';
import { formatWhatsAppNumber, sanitizePhoneNumber } from '../utils/vcard';

interface Props {
  contact: Contact;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenDetails: (contact: Contact) => void;
  onOpenQR: (contact: Contact, e: React.MouseEvent) => void;
  onEdit: (contact: Contact, e: React.MouseEvent) => void;
}

export const ContactCard: React.FC<Props> = ({
  contact,
  onToggleFavorite,
  onOpenDetails,
  onOpenQR,
  onEdit,
}) => {
  const category = CATEGORIES[contact.category] || CATEGORIES.other;
  const whatsappNum = formatWhatsAppNumber(contact.phone);
  const telNum = sanitizePhoneNumber(contact.phone);

  // Extract initials (first letters of words)
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2);
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  return (
    <div
      onClick={() => onOpenDetails(contact)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/60 hover:shadow-xl hover:shadow-indigo-950/20 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Right side in RTL: Avatar + Name + Metadata */}
        <div className="flex items-start gap-3 min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${contact.avatarColor || 'from-indigo-600 to-blue-700'} flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-950/30 ring-1 ring-white/10`}
              >
                {getInitials(contact.name)}
              </div>
            )}

            {/* Favorite Indicator Badge */}
            {contact.isFavorite && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-950 ring-2 ring-slate-900 shadow">
                <Star className="w-2.5 h-2.5 fill-current" />
              </span>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                {contact.name}
              </h3>
            </div>

            {/* Job / Company if present */}
            {(contact.jobTitle || contact.company) && (
              <p className="truncate text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                {contact.company && <Building2 className="w-3 h-3 text-slate-500 shrink-0" />}
                <span className="truncate">
                  {contact.jobTitle && contact.company
                    ? `${contact.jobTitle} - ${contact.company}`
                    : contact.jobTitle || contact.company}
                </span>
              </p>
            )}

            {/* Phone Display */}
            <p className="text-xs font-mono text-slate-300 mt-1" dir="ltr">
              {contact.phone}
            </p>

            {/* Category tag */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${category.bgColor} ${category.color} ${category.borderColor}`}
              >
                {category.label}
              </span>

              {contact.secondaryPhone && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  +رقم إضافي
                </span>
              )}

              {contact.notes && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 truncate max-w-[120px]">
                  ملاحظات
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Left side in RTL: Favorite Toggle & QR trigger */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => onOpenQR(contact, e)}
            className="rounded-xl p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition"
            title="عرض رمز QR للمسح السريع"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => onToggleFavorite(contact.id, e)}
            className={`rounded-xl p-2 transition ${
              contact.isFavorite
                ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/80'
            }`}
            title={contact.isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          >
            <Star className={`w-4 h-4 ${contact.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Action Ribbon (Call, WhatsApp, SMS, Email) */}
      <div
        className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-around gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Direct Call */}
        <a
          href={`tel:${telNum}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition text-xs font-semibold"
          title="اتصال هاتفي مباشر"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>اتصال</span>
        </a>

        {/* WhatsApp Direct */}
        <a
          href={`https://wa.me/${whatsappNum}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 active:scale-95 transition text-xs font-semibold"
          title="محادثة واتساب مباشرة"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>واتساب</span>
        </a>

        {/* SMS Message */}
        <a
          href={`sms:${telNum}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 active:scale-95 transition text-xs font-semibold"
          title="رسالة نصية SMS"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>رسالة</span>
        </a>

        {/* Email if available, or secondary phone call */}
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 active:scale-95 transition text-xs font-semibold"
            title="إرسال بريد إلكتروني"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>إيميل</span>
          </a>
        ) : (
          <button
            onClick={(e) => onEdit(contact, e)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition text-xs font-semibold"
          >
            <span>تعديل</span>
          </button>
        )}
      </div>
    </div>
  );
};
