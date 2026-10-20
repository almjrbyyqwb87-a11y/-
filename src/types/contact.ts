export type ContactCategory = 'family' | 'work' | 'friends' | 'vip' | 'personal' | 'other';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  category: ContactCategory;
  jobTitle?: string;
  company?: string;
  address?: string;
  notes?: string;
  birthday?: string;
  avatarColor: string;
  avatarUrl?: string; // base64 or image url
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CategoryInfo {
  id: ContactCategory;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
}

export const CATEGORIES: Record<ContactCategory, CategoryInfo> = {
  family: {
    id: 'family',
    label: 'عائلة',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    iconName: 'Heart',
  },
  work: {
    id: 'work',
    label: 'عمل',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    iconName: 'Briefcase',
  },
  friends: {
    id: 'friends',
    label: 'أصدقاء',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    iconName: 'Users',
  },
  vip: {
    id: 'vip',
    label: 'VIP كبار الشخصيات',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    iconName: 'Crown',
  },
  personal: {
    id: 'personal',
    label: 'شخصي',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    iconName: 'User',
  },
  other: {
    id: 'other',
    label: 'أخرى',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    iconName: 'Tag',
  },
};

export const AVATAR_GRADIENTS = [
  'from-blue-600 to-indigo-600',
  'from-emerald-500 to-teal-700',
  'from-violet-600 to-purple-800',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-700',
  'from-fuchsia-600 to-pink-700',
  'from-teal-600 to-emerald-800',
];
