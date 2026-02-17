import { useState, useEffect } from 'react';
import type { Bookmark, Collection } from './types';
import BookmarkGrid from './components/BookmarkGrid';
import AddBookmark from './components/AddBookmark';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

function load<T>(key: string, fallback: T): T {
  const s = localStorage.getItem(key);
  return s ? JSON.parse(s) : fallback;
}

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => load('sv-bookmarks', []));
  const [collections, setCollections] = useState<Collection[]>(() => load('sv-collections', [
    { id: '1', name: 'Reading', icon: '📚', color: 'blue', order: 0 },
    { id: '2', name: 'Dev Tools', icon: '🛠️', color: 'green', order: 1 },
    { id: '3', name: 'Design', icon: '🎨', color: 'pink', order: 2 },
  ]));
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [dark, setDark] = useState(() => load('sv-dark', true));

  useEffect(() => { localStorage.setItem('sv-bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('sv-collections', JSON.stringify(collections)); }, [collections]);
  useEffect(() => {
    localStorage.setItem('sv-dark', JSON.stringify(dark));
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const filtered = bookmarks.filter(b => {
    if (activeCollection && b.collectionId !== activeCollection) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q) || b.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const addBookmark = (bm: Omit<Bookmark, 'id' | 'createdAt'>) => {
    setBookmarks(prev => [{ ...bm, id: crypto.randomUUID(), createdAt: Date.now() }, ...prev]);
    setShowAdd(false);
  };

  const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBookmark = (id: string) => setBookmarks(prev => prev.filter(b => b.id !== id));

  const addCollection = (name: string, icon: string) => {
    setCollections(prev => [...prev, { id: crypto.randomUUID(), name, icon, color: 'gray', order: prev.length }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex">
      <Sidebar collections={collections} active={activeCollection} onSelect={setActiveCollection} onAdd={addCollection} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header search={search} onSearch={setSearch} onAdd={() => setShowAdd(true)} dark={dark} onToggleDark={() => setDark(!dark)} />
        <main className="flex-1 p-6">
          <BookmarkGrid bookmarks={filtered} onUpdate={updateBookmark} onDelete={deleteBookmark} collections={collections} />
        </main>
      </div>
      {showAdd && <AddBookmark collections={collections} onAdd={addBookmark} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
