import { Contact } from '../types/contact';

/**
 * Format phone number into clean international format for WhatsApp / Tel
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Clean phone number for WhatsApp link (digits only, no +)
 */
export function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  // If starts with 00, replace with nothing
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  // If starts with local 05... (Saudi/Gulf format) and 10 digits, convert to 9665...
  if (cleaned.startsWith('05') && cleaned.length === 10) {
    cleaned = '966' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Generate vCard 3.0 string for one or multiple contacts
 */
export function generateVCardString(contacts: Contact[]): string {
  return contacts
    .map((c) => {
      const lines: string[] = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN;CHARSET=UTF-8:${c.name}`,
        `N;CHARSET=UTF-8:${c.name};;;;`,
      ];

      if (c.phone) {
        lines.push(`TEL;TYPE=CELL,VOICE:${sanitizePhoneNumber(c.phone)}`);
      }
      if (c.secondaryPhone) {
        lines.push(`TEL;TYPE=WORK,VOICE:${sanitizePhoneNumber(c.secondaryPhone)}`);
      }
      if (c.email) {
        lines.push(`EMAIL;TYPE=INTERNET,HOME:${c.email}`);
      }
      if (c.company || c.jobTitle) {
        if (c.company) lines.push(`ORG;CHARSET=UTF-8:${c.company}`);
        if (c.jobTitle) lines.push(`TITLE;CHARSET=UTF-8:${c.jobTitle}`);
      }
      if (c.address) {
        lines.push(`ADR;TYPE=HOME;CHARSET=UTF-8:;;${c.address};;;;`);
      }
      if (c.birthday) {
        lines.push(`BDAY:${c.birthday}`);
      }
      if (c.notes) {
        // Escape newlines in notes
        const sanitizedNote = c.notes.replace(/\r?\n/g, '\\n');
        lines.push(`NOTE;CHARSET=UTF-8:${sanitizedNote}`);
      }
      lines.push('CATEGORIES:' + c.category);
      lines.push('END:VCARD');
      return lines.join('\r\n');
    })
    .join('\r\n\r\n');
}

/**
 * Trigger download of vCard file (.vcf)
 */
export function downloadVCard(contacts: Contact[], filename = 'contacts.vcf') {
  const vcfData = generateVCardString(contacts);
  const blob = new Blob([vcfData], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse .vcf text and return Contact objects
 */
export function parseVCF(vcfText: string): Partial<Contact>[] {
  const contacts: Partial<Contact>[] = [];
  const cards = vcfText.split(/BEGIN:VCARD/i).filter((card) => card.trim().length > 0);

  for (const card of cards) {
    const lines = card.split(/\r\n|\r|\n/);
    let name = '';
    const phones: string[] = [];
    let email = '';
    let org = '';
    let title = '';
    let note = '';
    let bday = '';
    let adr = '';

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (/^FN/i.test(line)) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        name = val;
      } else if (!name && /^N/i.test(line)) {
        const parts = line.substring(line.indexOf(':') + 1).split(';');
        name = parts.filter(Boolean).join(' ').trim();
      } else if (/^TEL/i.test(line)) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        if (val) phones.push(val);
      } else if (/^EMAIL/i.test(line)) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        if (val) email = val;
      } else if (/^ORG/i.test(line)) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        org = val;
      } else if (/^TITLE/i.test(line)) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        title = val;
      } else if (/^NOTE/i.test(line)) {
        const val = line.substring(line.indexOf(':') + 1).trim().replace(/\\n/g, '\n');
        note = val;
      } else if (/^BDAY/i.test(line)) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        bday = val;
      } else if (/^ADR/i.test(line)) {
        const parts = line.substring(line.indexOf(':') + 1).split(';');
        adr = parts.filter(Boolean).join(' - ').trim();
      }
    }

    if (name || phones.length > 0) {
      contacts.push({
        name: name || 'جهة اتصال مستوردة',
        phone: phones[0] || '',
        secondaryPhone: phones[1] || '',
        email,
        company: org,
        jobTitle: title,
        notes: note,
        birthday: bday,
        address: adr,
        category: 'other',
        isFavorite: false,
      });
    }
  }

  return contacts;
}

/**
 * Trigger download of JSON backup
 */
export function downloadJSONBackup(contacts: Contact[]) {
  const json = JSON.stringify(
    {
      appName: 'جهات اتصالي',
      exportDate: new Date().toISOString(),
      contactsCount: contacts.length,
      contacts,
    },
    null,
    2
  );
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contacts-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate standard QR code contact payload
 */
export function generateContactQRData(contact: Contact): string {
  return generateVCardString([contact]);
}
