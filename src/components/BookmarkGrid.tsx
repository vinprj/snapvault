import { useState, useEffect } from 'react';
import { ExternalLink, Trash2, Globe, Edit2, Save, X, Clock, ArrowUpDown, MousePointer } from 'lucide-react';
import type { Bookmark, Collection } from '../types';

type SortOption = 'date' | 'title' | 'visits';

interface Props { 
  bookmarks: Bookmark[]; 
  onUpdate: (id: string, updates: Partial<Bookmark>) => void; 
  onDelete: (id: string) => void; 
  onVisit: (id: string) => void;
  collections: Collection[]; 
}

export default function BookmarkGrid({ bookmarks, onUpdate, onDelete, onVisit, collections }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bookmark>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Sort bookmarks
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'visits':
        return (b.visitCount || 0) - (a.visitCount || 0);
      case 'date':
      default:
        return b.createdAt - a.createdAt;
    }
  });

  if (!sortedBookmarks.length) {
    return (
      <div className="text-center py-20 text-gray-400 animate-pulse">
        <div className="relative">
          <Globe size={48} className="mx-auto mb-3 opacity-30" />
          <div className="absolute inset-0 animate-ping bg-blue-400/20 rounded-full" />
        </div>
        <p className="text-lg font-medium text-gray-500">No bookmarks yet</p>
        <p className="text-sm mt-1">Click "Add" to save your first link</p>
      </div>
    );
  }

  const startEdit = (b: Bookmark) => {
    setEditing(b.id);
    setEditForm({ title: b.title, description: b.description, url: b.url, collectionId: b.collectionId, tags: [...b.tags] });
  };

  const saveEdit = (id: string) => {
    onUpdate(id, editForm);
    setEditing(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({});
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !editForm.tags?.includes(tag.trim())) {
      setEditForm({ ...editForm, tags: [...(editForm.tags || []), tag.trim()] });
    }
  };

  const removeTag = (tag: string) => {
    setEditForm({ ...editForm, tags: editForm.tags?.filter(t => t !== tag) || [] });
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleCardClick = (id: string) => {
    // Open in new tab and track visit
    const b = bookmarks.find(bk => bk.id === id);
    if (b) window.open(b.url, '_blank', 'noopener,noreferrer');
    onVisit(id);
  };

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              List
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="date">📅 Newest</option>
              <option value="title">🔤 A-Z</option>
              <option value="visits">🔥 Most visited</option>
            </select>
            <ArrowUpDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bookmarks */}
      {viewMode === 'grid' ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-all duration-500 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
          {sortedBookmarks.map((b, i) => (
            <BookmarkCard
              key={b.id}
              bookmark={b}
              index={i}
              editing={editing === b.id}
              editForm={editForm}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onEdit={startEdit}
              onSave={saveEdit}
              onCancel={cancelEdit}
              onDelete={onDelete}
              onVisit={handleCardClick}
              setEditForm={setEditForm}
              addTag={addTag}
              removeTag={removeTag}
              getTimeAgo={getTimeAgo}
              collections={collections}
            />
          ))}
        </div>
      ) : (
        <div className={`space-y-2 transition-all duration-500 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
          {sortedBookmarks.map((b, i) => (
            <BookmarkRow
              key={b.id}
              bookmark={b}
              index={i}
              onDelete={onDelete}
              onVisit={handleCardClick}
              getTimeAgo={getTimeAgo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkCard({ 
  bookmark: b, 
  index, 
  editing, 
  editForm, 
  hoveredId, 
  onHover, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete, 
  onVisit,
  setEditForm,
  addTag,
  removeTag,
  getTimeAgo,
  collections
}: any) {
  if (editing) {
    return (
      <div className="relative p-4 rounded-xl bg-white dark:bg-gray-900 border-2 border-blue-500 shadow-lg col-span-1">
        <div className="space-y-2">
          <input value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="Title" />
          <input value={editForm.url || ''} onChange={e => setEditForm({ ...editForm, url: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="URL" />
          <textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" placeholder="Description" rows={2} />
          <select value={editForm.collectionId || ''} onChange={e => setEditForm({ ...editForm, collectionId: e.target.value || null })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
            <option value="">No Collection</option>
            {collections.map((c: Collection) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <div className="relative">
            <input 
              onKeyDown={e => { if (e.key === 'Enter') { addTag(e.currentTarget.value); e.currentTarget.value = ''; }}} 
              placeholder="Add tag..." 
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
            />
          </div>
          {editForm.tags && editForm.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {editForm.tags.map((t: string) => (
                <span 
                  key={t} 
                  onClick={() => removeTag(t)} 
                  className="px-2 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  {t} <X size={10} />
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={() => onSave(b.id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all hover:scale-[1.02] active:scale-95">
              <Save size={14} /> Save
            </button>
            <button onClick={onCancel} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-all">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer ${
        hoveredId === b.id ? 'ring-2 ring-blue-400/30' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => onHover(b.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onVisit(b.id)}
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 ${hoveredId === b.id ? 'opacity-100' : ''}`} />
      
      <div className="relative flex items-start gap-3">
        <div className="relative">
          <img 
            src={b.favicon || `https://www.google.com/s2/favicons?domain=${new URL(b.url).hostname}&sz=32`} 
            alt="" 
            className="w-10 h-10 rounded-lg mt-0.5 object-cover bg-white shadow-sm"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} 
          />
          {hoveredId === b.id && (
            <div className="absolute inset-0 rounded-lg bg-blue-500/20 animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{b.title || b.url}</h3>
          <p className="text-xs text-gray-500 truncate mt-0.5 hover:text-gray-700 dark:hover:text-gray-300">{b.url}</p>
          {b.description && <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{b.description}</p>}
        </div>
      </div>
      
      {b.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {b.tags.map((t: string) => (
            <span key={t} className="px-2 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
              {t}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock size={12} /> {getTimeAgo(b.createdAt)}
        </span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Globe size={12} /> {new URL(b.url).hostname.replace('www.', '')}
        </span>
        {b.visitCount > 0 && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <MousePointer size={12} /> {b.visitCount}
          </span>
        )}
      </div>
      
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-[-4px]">
        <a 
          href={b.url} 
          target="_blank" 
          rel="noopener" 
          className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-110 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={14} />
        </a>
      </div>
      
      <div className={`absolute bottom-16 right-3 flex gap-1 transition-all duration-200 ${hoveredId === b.id ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(b); }} 
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-500 transition-all hover:scale-110"
        >
          <Edit2 size={14} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(b.id); }} 
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-all hover:scale-110"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function BookmarkRow({ 
  bookmark: b, 
  index, 
  onDelete, 
  onVisit, 
  getTimeAgo 
}: { 
  bookmark: Bookmark; 
  index: number; 
  onDelete: (id: string) => void; 
  onVisit: (id: string) => void;
  getTimeAgo: (timestamp: number) => string;
}) {
  return (
    <div 
      className="group flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-md cursor-pointer"
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onVisit(b.id)}
    >
      <img 
        src={b.favicon || `https://www.google.com/s2/favicons?domain=${new URL(b.url).hostname}&sz=32`} 
        alt="" 
        className="w-6 h-6 rounded object-cover bg-white flex-shrink-0"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} 
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {b.title || b.url}
        </h3>
        <p className="text-xs text-gray-500 truncate">{new URL(b.url).hostname.replace('www.', '')}</p>
      </div>

      {b.tags.length > 0 && (
        <div className="flex gap-1 flex-shrink-0">
          {b.tags.slice(0, 2).map((t: string) => (
            <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              {t}
            </span>
          ))}
        </div>
      )}

      <span className="text-xs text-gray-400 flex-shrink-0">
        {getTimeAgo(b.createdAt)}
      </span>

      <span className="text-xs text-gray-400 flex-shrink-0">
        {b.visitCount > 0 && `${b.visitCount} visits`}
      </span>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <a 
          href={b.url} 
          target="_blank" 
          rel="noopener" 
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={14} className="text-gray-400" />
        </a>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(b.id); }} 
          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
}
