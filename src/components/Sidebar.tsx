import { useState } from 'react';
import { Bookmark, Plus } from 'lucide-react';
import type { Collection } from '../types';

interface Props { collections: Collection[]; active: string | null; onSelect: (id: string | null) => void; onAdd: (name: string, icon: string) => void; }

export default function Sidebar({ collections, active, onSelect, onAdd }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  return (
    <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Bookmark size={20} className="text-blue-600" /> SnapVault
        </h1>
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        <button onClick={() => onSelect(null)}
          className={`w-full text-left px-3 py-2 rounded-lg mb-1 font-medium transition-colors ${!active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          All Bookmarks
        </button>
        <p className="text-xs text-gray-400 uppercase tracking-wider px-3 mt-3 mb-1">Collections</p>
        {collections.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className={`w-full text-left px-3 py-2 rounded-lg mb-0.5 transition-colors flex items-center gap-2 ${active === c.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <span>{c.icon}</span> {c.name}
          </button>
        ))}
        {adding ? (
          <div className="px-2 mt-2">
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && name.trim()) { onAdd(name.trim(), '📁'); setName(''); setAdding(false); }}}
              placeholder="Collection name" autoFocus className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500" />
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <Plus size={14} /> New Collection
          </button>
        )}
      </nav>
    </aside>
  );
}
