import React from 'react';
import { Star, Phone, MessageCircle } from 'lucide-react';
import { Contact } from '../types/contact';
import { formatWhatsAppNumber, sanitizePhoneNumber } from '../utils/vcard';

interface Props {
  contacts: Contact[];
  onOpenDetails: (contact: Contact) => void;
}

export const QuickDial: React.FC<Props> = ({ contacts, onOpenDetails }) => {
  const favorites = contacts.filter((c) => c.isFavorite);

  if (favorites.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>المفضلة والاتصال السريع ({favorites.length})</span>
        </h2>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar">
        {favorites.map((contact) => {
          const telNum = sanitizePhoneNumber(contact.phone);
          const waNum = formatWhatsAppNumber(contact.phone);
          const firstName = contact.name.trim().split(/\s+/)[0];

          return (
            <div
              key={contact.id}
              className="flex flex-col items-center shrink-0 group"
            >
              <div className="relative">
                <button
                  onClick={() => onOpenDetails(contact)}
                  className="relative block rounded-full ring-2 ring-amber-400/50 p-0.5 hover:ring-amber-400 transition"
                >
                  {contact.avatarUrl ? (
                    <img
                      src={contact.avatarUrl}
                      alt={contact.name}
                      className="w-13 h-13 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-13 h-13 rounded-full bg-gradient-to-br ${contact.avatarColor || 'from-indigo-600 to-blue-700'} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                    >
                      {firstName.slice(0, 2)}
                    </div>
                  )}
                </button>

                {/* Micro floating call button */}
                <a
                  href={`tel:${telNum}`}
                  className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg ring-2 ring-slate-900 transition active:scale-90"
                  title={`اتصال بـ ${firstName}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-3 h-3" />
                </a>

                {/* Micro floating WhatsApp button */}
                <a
                  href={`https://wa.me/${waNum}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-600 hover:bg-green-500 text-white flex items-center justify-center shadow-lg ring-2 ring-slate-900 transition active:scale-90"
                  title={`واتساب ${firstName}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="w-3 h-3" />
                </a>
              </div>

              <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-300 transition-colors mt-2 max-w-[70px] truncate text-center">
                {firstName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
