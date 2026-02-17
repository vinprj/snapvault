import { useState } from 'react';
import { Bookmark, Plus, Lock, Unlock } from 'lucide-react';
import type { Collection } from '../types';

interface Props { 
  collections: Collection[]; 
  active: string | null; 
  onSelect: (id: string | null) => void; 
  onAdd: (name: string, icon: string, password?: string) => void;
  onUnlock: (collectionId: string, password: string) => Promise<boolean>;
  onLock: (collectionId: string) => void;
  unlockedCollections: Set<string>;
}

export default function Sidebar({ collections, active, onSelect, onAdd, onUnlock, onLock, unlockedCollections }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [unlockPassword, setUnlockPassword] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    
    onAdd(name.trim(), '📁', usePassword ? password : undefined);
    setName('');
    setPassword('');
    setUsePassword(false);
    setAdding(false);
  };

  const handleUnlock = async (collectionId: string) => {
    const success = await onUnlock(collectionId, unlockPassword);
    if (success) {
      setUnlocking(null);
      setUnlockPassword('');
      onSelect(collectionId);
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Bookmark size={20} className="text-blue-600" /> SnapVault
        </h1>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <button 
          onClick={() => onSelect(null)}
          className={`w-full text-left px-3 py-2 rounded-lg mb-1 font-medium transition-colors ${
            !active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          All Bookmarks
        </button>

        <p className="text-xs text-gray-400 uppercase tracking-wider px-3 mt-3 mb-1">Collections</p>

        {collections.map(c => {
          const isLocked = c.password && !unlockedCollections.has(c.id);
          const isUnlocking = unlocking === c.id;
          
          return (
            <div key={c.id}>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    if (isLocked) {
                      setUnlocking(c.id);
                    } else {
                      onSelect(c.id);
                    }
                  }}
                  className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    active === c.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{c.icon}</span> 
                  <span className="flex-1 truncate">{c.name}</span>
                  {isLocked && <Lock size={12} className="text-gray-400" />}
                </button>
                
                {c.password && !isLocked && (
                  <button
                    onClick={() => onLock(c.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Unlock size={14} />
                  </button>
                )}
              </div>

              {isUnlocking && (
                <div className="px-2 py-1 space-y-1">
                  <input
                    type="password"
                    value={unlockPassword}
                    onChange={e => setUnlockPassword(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleUnlock(c.id); }}
                    placeholder="Password"
                    autoFocus
                    className="w-full px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUnlock(c.id)}
                      className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Unlock
                    </button>
                    <button
                      onClick={() => { setUnlocking(null); setUnlockPassword(''); }}
                      className="flex-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-800 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {adding ? (
          <div className="px-2 mt-2 space-y-2">
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleAdd(); }}
              placeholder="Collection name" 
              autoFocus 
              className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500" 
            />
            
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={usePassword}
                onChange={e => setUsePassword(e.target.checked)}
                className="rounded"
              />
              Password protect
            </label>

            {usePassword && (
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500"
              />
            )}

            <div className="flex gap-1">
              <button
                onClick={handleAdd}
                className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => { setAdding(false); setName(''); setPassword(''); setUsePassword(false); }}
                className="flex-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-800 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setAdding(true)} 
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <Plus size={14} /> New Collection
          </button>
        )}
      </nav>
    </aside>
  );
}
