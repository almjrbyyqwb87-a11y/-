import { Contact } from '../types/contact';
import { sanitizePhoneNumber } from './vcard';

export interface DuplicateGroup {
  id: string;
  reason: 'phone' | 'name' | 'email';
  reasonLabel: string;
  contacts: Contact[];
}

export function findDuplicates(contacts: Contact[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processedIds = new Set<string>();

  // 1. Check matching phones
  const phoneMap = new Map<string, Contact[]>();
  for (const c of contacts) {
    const rawDigits = c.phone.replace(/\D/g, '');
    if (rawDigits.length >= 7) {
      // Use last 8-9 digits to match local vs international formats
      const key = rawDigits.slice(-8);
      const list = phoneMap.get(key) || [];
      list.push(c);
      phoneMap.set(key, list);
    }
  }

  for (const [key, list] of phoneMap.entries()) {
    if (list.length > 1) {
      const unvisited = list.filter((c) => !processedIds.has(c.id));
      if (unvisited.length > 1) {
        unvisited.forEach((c) => processedIds.add(c.id));
        groups.push({
          id: `phone-${key}`,
          reason: 'phone',
          reasonLabel: `نفس رقم الهاتف (...${key})`,
          contacts: unvisited,
        });
      }
    }
  }

  // 2. Check identical normalized names
  const nameMap = new Map<string, Contact[]>();
  for (const c of contacts) {
    if (processedIds.has(c.id)) continue;
    const norm = c.name
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ');
    if (norm.length >= 3) {
      const list = nameMap.get(norm) || [];
      list.push(c);
      nameMap.set(norm, list);
    }
  }

  for (const [key, list] of nameMap.entries()) {
    if (list.length > 1) {
      const unvisited = list.filter((c) => !processedIds.has(c.id));
      if (unvisited.length > 1) {
        unvisited.forEach((c) => processedIds.add(c.id));
        groups.push({
          id: `name-${key}`,
          reason: 'name',
          reasonLabel: `تطابق الاسم (${unvisited[0].name})`,
          contacts: unvisited,
        });
      }
    }
  }

  return groups;
}

/**
 * Merge an array of contacts into a single comprehensive contact
 */
export function mergeContactGroup(groupContacts: Contact[]): Contact {
  if (groupContacts.length === 1) return groupContacts[0];

  // Pick the contact with the most information as primary base
  const sorted = [...groupContacts].sort((a, b) => {
    const scoreA =
      (a.phone ? 2 : 0) +
      (a.secondaryPhone ? 1 : 0) +
      (a.email ? 2 : 0) +
      (a.company ? 1 : 0) +
      (a.notes ? 2 : 0) +
      (a.isFavorite ? 3 : 0);
    const scoreB =
      (b.phone ? 2 : 0) +
      (b.secondaryPhone ? 1 : 0) +
      (b.email ? 2 : 0) +
      (b.company ? 1 : 0) +
      (b.notes ? 2 : 0) +
      (b.isFavorite ? 3 : 0);
    return scoreB - scoreA;
  });

  const primary = sorted[0];
  const others = sorted.slice(1);

  // Merge phone numbers
  const allPhones = new Set<string>();
  if (primary.phone) allPhones.add(sanitizePhoneNumber(primary.phone));
  if (primary.secondaryPhone) allPhones.add(sanitizePhoneNumber(primary.secondaryPhone));

  let secondaryPhone = primary.secondaryPhone || '';
  for (const o of others) {
    if (o.phone && !allPhones.has(sanitizePhoneNumber(o.phone))) {
      if (!secondaryPhone) {
        secondaryPhone = o.phone;
        allPhones.add(sanitizePhoneNumber(o.phone));
      }
    }
    if (o.secondaryPhone && !allPhones.has(sanitizePhoneNumber(o.secondaryPhone))) {
      if (!secondaryPhone) {
        secondaryPhone = o.secondaryPhone;
        allPhones.add(sanitizePhoneNumber(o.secondaryPhone));
      }
    }
  }

  // Combine unique notes
  const notesSet = new Set<string>();
  if (primary.notes) notesSet.add(primary.notes.trim());
  for (const o of others) {
    if (o.notes && o.notes.trim() && !notesSet.has(o.notes.trim())) {
      notesSet.add(o.notes.trim());
    }
  }

  const mergedNotes = Array.from(notesSet).join('\n---\n');

  return {
    ...primary,
    secondaryPhone,
    email: primary.email || others.find((o) => o.email)?.email || '',
    company: primary.company || others.find((o) => o.company)?.company || '',
    jobTitle: primary.jobTitle || others.find((o) => o.jobTitle)?.jobTitle || '',
    address: primary.address || others.find((o) => o.address)?.address || '',
    birthday: primary.birthday || others.find((o) => o.birthday)?.birthday || '',
    isFavorite: primary.isFavorite || others.some((o) => o.isFavorite),
    notes: mergedNotes,
    updatedAt: Date.now(),
  };
}
