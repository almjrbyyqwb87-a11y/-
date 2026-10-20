import React from 'react';
import { Users, Star, Briefcase, Heart, Crown } from 'lucide-react';
import { Contact } from '../types/contact';

interface Props {
  contacts: Contact[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const StatsBar: React.FC<Props> = ({
  contacts,
  activeCategory,
  onSelectCategory,
}) => {
  const total = contacts.length;
  const favorites = contacts.filter((c) => c.isFavorite).length;
  const work = contacts.filter((c) => c.category === 'work').length;
  const family = contacts.filter((c) => c.category === 'family').length;
  const vip = contacts.filter((c) => c.category === 'vip').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
      {/* Total Card */}
      <button
        onClick={() => onSelectCategory('all')}
        className={`p-3 rounded-2xl border text-right transition active:scale-98 ${
          activeCategory === 'all'
            ? 'bg-indigo-600/15 border-indigo-500/40 shadow-sm'
            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">إجمالي الأرقام</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-extrabold text-white mt-1">{total}</p>
      </button>

      {/* Favorites Card */}
      <button
        onClick={() => onSelectCategory('favorites')}
        className={`p-3 rounded-2xl border text-right transition active:scale-98 ${
          activeCategory === 'favorites'
            ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">المفضلة</span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-400/20" />
          </div>
        </div>
        <p className="text-xl font-extrabold text-white mt-1">{favorites}</p>
      </button>

      {/* Work Card */}
      <button
        onClick={() => onSelectCategory('work')}
        className={`p-3 rounded-2xl border text-right transition active:scale-98 ${
          activeCategory === 'work'
            ? 'bg-blue-500/15 border-blue-500/40 shadow-sm'
            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">جهات العمل</span>
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-extrabold text-white mt-1">{work}</p>
      </button>

      {/* VIP / Family Card */}
      <button
        onClick={() => onSelectCategory('vip')}
        className={`p-3 rounded-2xl border text-right transition active:scale-98 ${
          activeCategory === 'vip'
            ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">VIP كبار الشخصيات</span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Crown className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-extrabold text-white mt-1">{vip}</p>
      </button>
    </div>
  );
};
