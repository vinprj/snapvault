import { Search, Plus, Sun, Moon } from 'lucide-react';

interface Props { search: string; onSearch: (q: string) => void; onAdd: () => void; dark: boolean; onToggleDark: () => void; }

export default function Header({ search, onSearch, onAdd, dark, onToggleDark }: Props) {
  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex-1 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search bookmarks..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
        <Plus size={18} /> Add
      </button>
      <button onClick={onToggleDark} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}
