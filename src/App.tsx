import { useState, useEffect } from 'react';
import type { Bookmark, Collection, ExportData } from './types';
import BookmarkGrid from './components/BookmarkGrid';
import AddBookmark from './components/AddBookmark';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ImportExport from './components/ImportExport';
import { hashPassword, verifyPassword } from './utils/crypto';

function load<T>(key: string, fallback: T): T {
  const s = localStorage.getItem(key);
  return s ? JSON.parse(s) : fallback;
}

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => load('sv-bookmarks', []));
  const [collections, setCollections] = useState<Collection[]>(() => load('sv-collections', [
    { id: '1', name: 'Reading', icon: '📚', color: 'blue', order: 0, isPasswordProtected: false },
    { id: '2', name: 'Dev Tools', icon: '🛠️', color: 'green', order: 1, isPasswordProtected: false },
    { id: '3', name: 'Design', icon: '🎨', color: 'pink', order: 2, isPasswordProtected: false },
  ]));
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [dark, setDark] = useState(() => load('sv-dark', true));
  const [unlockedCollections, setUnlockedCollections] = useState<Set<string>>(new Set());

  useEffect(() => { localStorage.setItem('sv-bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('sv-collections', JSON.stringify(collections)); }, [collections]);
  useEffect(() => {
    localStorage.setItem('sv-dark', JSON.stringify(dark));
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const activeCollectionData = collections.find(c => c.id === activeCollection);
  const isLocked = activeCollectionData?.password && !unlockedCollections.has(activeCollection!);

  const filtered = bookmarks.filter(b => {
    if (activeCollection) {
      if (b.collectionId !== activeCollection) return false;
      if (isLocked) return false; // Hide bookmarks from locked collections
    }
    if (search) {
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q) || b.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const addBookmark = (bm: Omit<Bookmark, 'id' | 'createdAt'>) => {
    // Fetch favicon
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(bm.url).hostname}&sz=64`;
    
    setBookmarks(prev => [
      { 
        ...bm, 
        id: crypto.randomUUID(), 
        createdAt: Date.now(),
        favicon: faviconUrl,
        visitCount: 0
      }, 
      ...prev
    ]);
    setShowAdd(false);
  };

  const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleVisit = (id: string) => {
    setBookmarks(prev => prev.map(b => 
      b.id === id 
        ? { ...b, visitCount: (b.visitCount || 0) + 1, lastVisited: Date.now() }
        : b
    ));
  };

  const deleteBookmark = (id: string) => setBookmarks(prev => prev.filter(b => b.id !== id));

  const addCollection = async (name: string, icon: string, password?: string) => {
    let hashedPassword: string | undefined;
    
    if (password) {
      hashedPassword = await hashPassword(password);
    }
    
    setCollections(prev => [...prev, { 
      id: crypto.randomUUID(), 
      name, 
      icon, 
      color: 'gray', 
      order: prev.length,
      isPasswordProtected: !!hashedPassword,
      password: hashedPassword
    }]);
  };

  const unlockCollection = async (collectionId: string, password: string): Promise<boolean> => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection?.password) return true;

    const isValid = await verifyPassword(password, collection.password);
    if (isValid) {
      setUnlockedCollections(prev => new Set([...prev, collectionId]));
    }
    return isValid;
  };

  const lockCollection = (collectionId: string) => {
    setUnlockedCollections(prev => {
      const next = new Set(prev);
      next.delete(collectionId);
      return next;
    });
  };

  const handleImport = (data: ExportData) => {
    // Merge collections (avoiding duplicates by ID)
    setCollections(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newCollections = data.collections.filter(c => !existingIds.has(c.id));
      return [...prev, ...newCollections];
    });

    // Merge bookmarks (avoiding duplicates by ID)
    setBookmarks(prev => {
      const existingIds = new Set(prev.map(b => b.id));
      const newBookmarks = data.bookmarks.filter(b => !existingIds.has(b.id));
      return [...prev, ...newBookmarks];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex">
      <Sidebar 
        collections={collections} 
        active={activeCollection} 
        onSelect={setActiveCollection} 
        onAdd={addCollection}
        onUnlock={unlockCollection}
        onLock={lockCollection}
        unlockedCollections={unlockedCollections}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          search={search} 
          onSearch={setSearch} 
          onAdd={() => setShowAdd(true)} 
          onImportExport={() => setShowImportExport(true)}
          dark={dark} 
          onToggleDark={() => setDark(!dark)} 
        />
        <main className="flex-1 p-6">
          {isLocked ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔒</div>
              <p className="text-lg font-semibold">Collection Locked</p>
              <p className="text-sm text-gray-500 mt-1">Click the lock icon in the sidebar to unlock</p>
            </div>
          ) : (
            <BookmarkGrid 
              bookmarks={filtered} 
              onUpdate={updateBookmark} 
              onDelete={deleteBookmark}
              onVisit={handleVisit}
              collections={collections} 
            />
          )}
        </main>
      </div>
      {showAdd && (
        <AddBookmark 
          collections={collections.filter(c => !c.password || unlockedCollections.has(c.id))} 
          onAdd={addBookmark} 
          onClose={() => setShowAdd(false)} 
        />
      )}
      {showImportExport && (
        <ImportExport
          bookmarks={bookmarks}
          collections={collections}
          onImport={handleImport}
          onClose={() => setShowImportExport(false)}
        />
      )}
    </div>
  );
}
