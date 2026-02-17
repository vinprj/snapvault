import { Search, Plus, Sun, Moon, Download } from 'lucide-react';

interface Props { 
  search: string; 
  onSearch: (q: string) => void; 
  onAdd: () => void; 
  onImportExport: () => void;
  dark: boolean; 
  onToggleDark: () => void; 
}

export default function Header({ search, onSearch, onAdd, onImportExport, dark, onToggleDark }: Props) {
  return (
    <header className="flex items-center gap-4 px-6 py-5 border-b-2 border-violet-200 dark:border-violet-900 pin-card">
      <div className="flex-1 relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" />
        <input 
          value={search} 
          onChange={e => onSearch(e.target.value)} 
          placeholder="Search your vault..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-2 border-violet-200 dark:border-violet-800 outline-none focus:border-violet-400 dark:focus:border-violet-600 smooth-vault handwritten text-lg"
        />
      </div>
      <button 
        onClick={onAdd} 
        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold smooth-vault sticker"
      >
        <Plus size={20} /> Pin
      </button>
      <button
        onClick={onImportExport}
        className="p-3 rounded-2xl text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 smooth-vault"
        title="Export & Import"
      >
        <Download size={22} />
      </button>
      <button 
        onClick={onToggleDark} 
        className="p-3 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 smooth-vault"
      >
        {dark ? <Sun size={22} className="text-yellow-500" /> : <Moon size={22} className="text-indigo-600" />}
      </button>
    </header>
  );
}
