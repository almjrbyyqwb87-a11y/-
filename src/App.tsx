/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Star,
  Users,
  CheckCircle2,
  PhoneOff,
  UserPlus,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Contact, ContactCategory, CATEGORIES } from './types/contact';
import { INITIAL_CONTACTS } from './data/initialContacts';
import { Header } from './components/Header';
import { ContactCard } from './components/ContactCard';
import { QuickDial } from './components/QuickDial';
import { StatsBar } from './components/StatsBar';
import { ContactModal } from './components/ContactModal';
import { ContactDetailModal } from './components/ContactDetailModal';
import { QRCodeModal } from './components/QRCodeModal';
import { DuplicatesModal } from './components/DuplicatesModal';
import { BackupModal } from './components/BackupModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DuplicateGroup } from './utils/duplicates';

const STORAGE_KEY = 'pwa_contacts_v1';

export default function App() {
  // Load contacts from LocalStorage or initialize with high quality Arabic sample data
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed reading contacts from storage', e);
    }
    return INITIAL_CONTACTS;
  });

  // Persistent sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed saving contacts to storage', e);
    }
  }, [contacts]);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'updated'>('name');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [qrContact, setQrContact] = useState<Contact | null>(null);
  const [isDuplicatesModalOpen, setIsDuplicatesModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter & Search & Sort pipeline
  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return contacts
      .filter((contact) => {
        // Category filtering
        if (selectedCategory === 'favorites') {
          if (!contact.isFavorite) return false;
        } else if (selectedCategory !== 'all') {
          if (contact.category !== selectedCategory) return false;
        }

        // Search query matching
        if (!q) return true;

        const nameMatch = contact.name.toLowerCase().includes(q);
        const phoneMatch = contact.phone.toLowerCase().includes(q);
        const secPhoneMatch = contact.secondaryPhone?.toLowerCase().includes(q);
        const emailMatch = contact.email?.toLowerCase().includes(q);
        const companyMatch = contact.company?.toLowerCase().includes(q);
        const jobMatch = contact.jobTitle?.toLowerCase().includes(q);
        const notesMatch = contact.notes?.toLowerCase().includes(q);

        return (
          nameMatch ||
          phoneMatch ||
          secPhoneMatch ||
          emailMatch ||
          companyMatch ||
          jobMatch ||
          notesMatch
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name, 'ar');
        } else if (sortBy === 'newest') {
          return b.createdAt - a.createdAt;
        } else {
          return b.updatedAt - a.updatedAt;
        }
      });
  }, [contacts, searchQuery, selectedCategory, sortBy]);

  // Group contacts alphabetically when sorting by name and not searching
  const groupedContacts = useMemo(() => {
    if (sortBy !== 'name' || searchQuery.trim().length > 0) {
      return null;
    }

    const groups: Record<string, Contact[]> = {};
    for (const c of filteredContacts) {
      const firstChar = c.name.trim()[0] || '#';
      // Normalize Arabic alefs
      const normalizedChar = /[أإآ]/.test(firstChar) ? 'ا' : firstChar;
      if (!groups[normalizedChar]) {
        groups[normalizedChar] = [];
      }
      groups[normalizedChar].push(c);
    }
    return groups;
  }, [filteredContacts, sortBy, searchQuery]);

  // Actions
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updatedState = !c.isFavorite;
          showToast(
            updatedState
              ? `تمت إضافة "${c.name}" إلى المفضلة`
              : `تمت إزالة "${c.name}" من المفضلة`
          );
          return { ...c, isFavorite: updatedState, updatedAt: Date.now() };
        }
        return c;
      })
    );

    // Keep detail view in sync
    if (detailContact && detailContact.id === id) {
      setDetailContact((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite, updatedAt: Date.now() } : null
      );
    }
  };

  const handleSaveContact = (contactData: Partial<Contact>) => {
    if (contactData.id) {
      // Edit existing
      setContacts((prev) =>
        prev.map((c) => (c.id === contactData.id ? ({ ...c, ...contactData, updatedAt: Date.now() } as Contact) : c))
      );
      showToast('تم تحديث جهة الاتصال بنجاح');
      if (detailContact && detailContact.id === contactData.id) {
        setDetailContact({ ...detailContact, ...contactData, updatedAt: Date.now() } as Contact);
      }
    } else {
      // Add new
      const newContact: Contact = {
        id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: contactData.name || 'بدون اسم',
        phone: contactData.phone || '',
        secondaryPhone: contactData.secondaryPhone || '',
        email: contactData.email || '',
        category: contactData.category || 'personal',
        jobTitle: contactData.jobTitle || '',
        company: contactData.company || '',
        address: contactData.address || '',
        notes: contactData.notes || '',
        birthday: contactData.birthday || '',
        avatarColor: contactData.avatarColor || 'from-indigo-600 to-blue-700',
        avatarUrl: contactData.avatarUrl || '',
        isFavorite: Boolean(contactData.isFavorite),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setContacts((prev) => [newContact, ...prev]);
      showToast('تمت إضافة جهة الاتصال الجديدة بنجاح');
    }
    setEditingContact(null);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    showToast('تم حذف جهة الاتصال');
    if (detailContact && detailContact.id === id) {
      setDetailContact(null);
    }
  };

  const handleMergeGroup = (merged: Contact, originalIds: string[]) => {
    const idSet = new Set(originalIds);
    setContacts((prev) => [merged, ...prev.filter((c) => !idSet.has(c.id))]);
    showToast('تم دمج جهتي الاتصال بنجاح وتحديث كافة السجلات');
  };

  const handleMergeAll = (groups: DuplicateGroup[]) => {
    let currentContacts = [...contacts];
    let count = 0;

    for (const group of groups) {
      const originalIds = group.contacts.map((c) => c.id);
      const idSet = new Set(originalIds);
      // Merge logic
      const primary = group.contacts[0];
      const mergedNotes = group.contacts
        .map((c) => c.notes?.trim())
        .filter(Boolean)
        .join(' | ');
      const merged: Contact = {
        ...primary,
        notes: mergedNotes,
        updatedAt: Date.now(),
      };

      currentContacts = [merged, ...currentContacts.filter((c) => !idSet.has(c.id))];
      count++;
    }

    setContacts(currentContacts);
    setIsDuplicatesModalOpen(false);
    showToast(`تم دمج ${count} مجموعة مكررة بنجاح وتنظيف الدفتر!`);
  };

  const handleImportContacts = (imported: Contact[]) => {
    setContacts((prev) => {
      // Merge and eliminate exact duplicate phones
      const existingPhones = new Set(prev.map((c) => c.phone.replace(/\D/g, '')));
      const toAdd = imported.filter((c) => !existingPhones.has(c.phone.replace(/\D/g, '')));
      return [...toAdd, ...prev];
    });
    showToast(`تم استيراد جهات الاتصال بنجاح وتحديث القائمة`);
  };

  const handleResetToDemo = () => {
    setContacts(INITIAL_CONTACTS);
    showToast('تمت استعادة جهات الاتصال التجريبية');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24">
      {/* Sticky App Header */}
      <Header
        contacts={contacts}
        onOpenAddModal={() => {
          setEditingContact(null);
          setIsAddModalOpen(true);
        }}
        onOpenDuplicates={() => setIsDuplicatesModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
        
        {/* Quick Stats Overview */}
        <StatsBar
          contacts={contacts}
          activeCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Speed Dial / Favorites Row */}
        <QuickDial
          contacts={contacts}
          onOpenDetails={(c) => setDetailContact(c)}
        />

        {/* Search & Filter Toolbar */}
        <div className="space-y-3 mb-5">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، رقم الهاتف، الوظيفة، الشركة أو الملاحظات..."
              className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3.5 pr-11 pl-10 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
            />
            <Search className="w-5 h-5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Chips & Sort Controls */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {/* Category Chips */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                الكل ({contacts.length})
              </button>

              <button
                onClick={() => setSelectedCategory('favorites')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                  selectedCategory === 'favorites'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>المفضلة</span>
              </button>

              {(Object.keys(CATEGORIES) as ContactCategory[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const count = contacts.filter((c) => c.category === catKey).length;
                if (count === 0 && selectedCategory !== catKey) return null;

                const isSelected = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 whitespace-nowrap ${
                      isSelected
                        ? `${cat.bgColor} ${cat.color} border ${cat.borderColor} ring-1 ring-white/20`
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Sort Toggle Dropdown */}
            <div className="flex items-center gap-1 shrink-0 mr-auto">
              <div className="relative inline-flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5">
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    sortBy === 'name' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="ترتيب أبجدي أ-ي"
                >
                  أ-ي
                </button>
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    sortBy === 'newest' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="المضاف حديثاً"
                >
                  الأحدث
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contacts List / Groups */}
        {filteredContacts.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/80 text-slate-500 flex items-center justify-center mb-3">
              {searchQuery ? <PhoneOff className="w-8 h-8" /> : <Users className="w-8 h-8" />}
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              {searchQuery ? 'لم يتم العثور على أي نتائج' : 'لا توجد جهات اتصال هنا'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
              {searchQuery
                ? `لم نتمكن من إيجاد أي تطابق للبحث "${searchQuery}". جرب كلمة بحث أخرى أو رقم هاتف مختلف.`
                : 'ابدأ بإضافة جهات الاتصال الخاصة بك الآن، أو قم باستيراد بطاقاتك من ملف vCard.'}
            </p>

            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 text-xs font-semibold transition"
              >
                مسح البحث
              </button>
            ) : (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-indigo-600/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة أول جهة اتصال</span>
              </button>
            )}
          </div>
        ) : groupedContacts ? (
          /* Alphabetically grouped sections */
          <div className="space-y-6">
            {Object.keys(groupedContacts)
              .sort((a, b) => a.localeCompare(b, 'ar'))
              .map((letter) => (
                <div key={letter} className="space-y-2.5">
                  <div className="sticky top-16 z-10 flex items-center gap-2 py-1 bg-slate-950/90 backdrop-blur-md">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-xs font-black text-indigo-400 border border-indigo-500/30">
                      {letter}
                    </span>
                    <div className="h-px flex-1 bg-slate-800/80" />
                    <span className="text-[11px] text-slate-500">
                      ({groupedContacts[letter].length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groupedContacts[letter].map((contact) => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        onToggleFavorite={handleToggleFavorite}
                        onOpenDetails={(c) => setDetailContact(c)}
                        onOpenQR={(c, e) => {
                          e.stopPropagation();
                          setQrContact(c);
                        }}
                        onEdit={(c, e) => {
                          e.stopPropagation();
                          setEditingContact(c);
                          setIsAddModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Plain list or sorted list */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetails={(c) => setDetailContact(c)}
                onOpenQR={(c, e) => {
                  e.stopPropagation();
                  setQrContact(c);
                }}
                onEdit={(c, e) => {
                  e.stopPropagation();
                  setEditingContact(c);
                  setIsAddModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) for quick add on mobile */}
      <button
        onClick={() => {
          setEditingContact(null);
          setIsAddModalOpen(true);
        }}
        className="fixed bottom-6 left-6 z-40 sm:hidden flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-2xl shadow-indigo-600/50 hover:from-indigo-500 hover:to-blue-500 active:scale-95 transition"
        title="إضافة جهة اتصال جديدة"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Offline Status Bar Component */}
      <OfflineIndicator />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl shadow-indigo-900/50 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ContactModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        initialContact={editingContact}
      />

      <ContactDetailModal
        contact={detailContact}
        onClose={() => setDetailContact(null)}
        onEdit={(c) => {
          setDetailContact(null);
          setEditingContact(c);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteContact}
        onToggleFavorite={(id) => handleToggleFavorite(id)}
        onOpenQR={(c) => setQrContact(c)}
      />

      <QRCodeModal
        contact={qrContact}
        onClose={() => setQrContact(null)}
      />

      <DuplicatesModal
        isOpen={isDuplicatesModalOpen}
        onClose={() => setIsDuplicatesModalOpen(false)}
        contacts={contacts}
        onMergeGroup={handleMergeGroup}
        onMergeAll={handleMergeAll}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        contacts={contacts}
        onImportContacts={handleImportContacts}
        onResetToDemo={handleResetToDemo}
      />
    </div>
  );
}
