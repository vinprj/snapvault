import { Search, Plus, Sun, Moon, Download, RefreshCw } from 'lucide-react';

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
    <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[var(--bg-card)]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex-1 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          value={search} 
          onChange={e => onSearch(e.target.value)} 
          placeholder="Search bookmarks..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all"
        />
      </div>
      <button 
        onClick={onImportExport}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-all"
        title="Import/Export"
      >
        <RefreshCw size={18} />
      </button>
      <button 
        onClick={onAdd} 
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient text-white font-semibold"
      >
        <Plus size={18} /> Add
      </button>
      <button 
        onClick={onToggleDark} 
        className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
