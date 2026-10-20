import React, { useState, useRef } from 'react';
import { X, Camera, Trash2, Star, Check, User, Phone, Mail, Building2, MapPin, Calendar, FileText, Sparkles } from 'lucide-react';
import { Contact, ContactCategory, CATEGORIES, AVATAR_GRADIENTS } from '../types/contact';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Partial<Contact>) => void;
  initialContact?: Contact | null;
}

export const ContactModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialContact,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(initialContact?.name || '');
  const [phone, setPhone] = useState(initialContact?.phone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(initialContact?.secondaryPhone || '');
  const [email, setEmail] = useState(initialContact?.email || '');
  const [category, setCategory] = useState<ContactCategory>(initialContact?.category || 'personal');
  const [jobTitle, setJobTitle] = useState(initialContact?.jobTitle || '');
  const [company, setCompany] = useState(initialContact?.company || '');
  const [address, setAddress] = useState(initialContact?.address || '');
  const [notes, setNotes] = useState(initialContact?.notes || '');
  const [birthday, setBirthday] = useState(initialContact?.birthday || '');
  const [avatarColor, setAvatarColor] = useState(initialContact?.avatarColor || AVATAR_GRADIENTS[0]);
  const [avatarUrl, setAvatarUrl] = useState(initialContact?.avatarUrl || '');
  const [isFavorite, setIsFavorite] = useState(initialContact?.isFavorite || false);

  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميغابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatarUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'يرجى إدخال اسم جهة الاتصال';
    }
    if (!phone.trim()) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف الرئيسي';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: initialContact?.id,
      name: name.trim(),
      phone: phone.trim(),
      secondaryPhone: secondaryPhone.trim(),
      email: email.trim(),
      category,
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      address: address.trim(),
      notes: notes.trim(),
      birthday: birthday.trim(),
      avatarColor,
      avatarUrl,
      isFavorite,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl max-h-[92vh] flex flex-col text-right overflow-hidden animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{initialContact ? 'تعديل جهة الاتصال' : 'إضافة جهة اتصال جديدة'}</span>
          </h2>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`rounded-xl p-2 transition ${
              isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
            }`}
            title="تبديل المفضلة"
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Avatar & Photo Picker */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-indigo-500/30"
                />
              ) : (
                <div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-950/40 ring-4 ring-white/10`}
                >
                  {name.trim() ? name.trim().slice(0, 2) : <User className="w-8 h-8 opacity-60" />}
                </div>
              )}

              {/* Upload photo trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -left-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white p-2 shadow-lg ring-2 ring-slate-900 transition"
                title="تحميل صورة أو التقاط بالكاميرا"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="absolute -top-1 -right-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white p-1.5 shadow-lg ring-2 ring-slate-900 transition"
                  title="حذف الصورة"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Avatar color palettes (if no photo uploaded) */}
            {!avatarUrl && (
              <div className="flex items-center gap-1.5 mt-1">
                {AVATAR_GRADIENTS.map((grad) => (
                  <button
                    key={grad}
                    type="button"
                    onClick={() => setAvatarColor(grad)}
                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} transition-transform ${
                      avatarColor === grad ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              الاسم الكامل <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="مثال: د. فيصل القحطاني"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رقم الهاتف الرئيسي <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                placeholder="0501234567"
                dir="ltr"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left font-mono"
              />
              {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رقم إضافي (اختياري)
              </label>
              <input
                type="tel"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                placeholder="هاتف العمل أو المنزل"
                dir="ltr"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left font-mono"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              dir="ltr"
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              التصنيف
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORIES) as ContactCategory[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? `${cat.bgColor} ${cat.color} ${cat.borderColor} ring-1 ring-white/20`
                        : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                المسمى الوظيفي
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="مثال: مدير العمليات"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الشركة أو الجهة
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="مثال: سابك / أرامكو"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Address & Birthday */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                العنوان أو المدينة
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: الرياض، حي الياسمين"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                تاريخ الميلاد
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ملاحظات وتفاصيل إضافية
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات هامة، أوقات الاتصال المفضلة، أو تفاصيل العمل..."
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none selectable-text"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500 active:scale-95 transition"
            >
              <Check className="w-4 h-4" />
              <span>{initialContact ? 'حفظ التعديلات' : 'إضافة جهة الاتصال'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
