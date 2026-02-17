import { useState } from 'react';
import { ExternalLink, Trash2, Globe, Edit2, Save, X, Eye } from 'lucide-react';
import type { Bookmark, Collection } from '../types';

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

  if (!bookmarks.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Globe size={48} className="mx-auto mb-3 opacity-50" />
        <p className="text-lg">No bookmarks yet</p>
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

  const handleVisit = (id: string, url: string) => {
    onVisit(id);
    window.open(url, '_blank');
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {bookmarks.map(b => (
        <div key={b.id} className="group p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg">
          {editing === b.id ? (
            <div className="space-y-2">
              <input 
                value={editForm.title || ''} 
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500" 
                placeholder="Title" 
              />
              <input 
                value={editForm.url || ''} 
                onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500" 
                placeholder="URL" 
              />
              <textarea 
                value={editForm.description || ''} 
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500 resize-none" 
                placeholder="Description" 
                rows={2} 
              />
              <select 
                value={editForm.collectionId || ''} 
                onChange={e => setEditForm({ ...editForm, collectionId: e.target.value || null })}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none"
              >
                <option value="">No Collection</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <div className="flex gap-1">
                <button onClick={() => saveEdit(b.id)} className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center justify-center gap-1">
                  <Save size={14} /> Save
                </button>
                <button onClick={cancelEdit} className="flex-1 py-1 px-2 bg-gray-200 dark:bg-gray-800 rounded text-sm flex items-center justify-center gap-1">
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center flex-shrink-0">
                  {b.favicon ? (
                    <img src={b.favicon} alt="" className="w-6 h-6 rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <Globe size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{b.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{new URL(b.url).hostname}</p>
                </div>
              </div>

              {b.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{b.description}</p>
              )}

              {b.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {b.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <Eye className="w-3 h-3" />
                <span>{b.visitCount || 0} visits</span>
                {b.lastVisited && (
                  <>
                    <span>•</span>
                    <span>Last: {formatDate(b.lastVisited)}</span>
                  </>
                )}
              </div>

              <div className="flex gap-1">
                <button 
                  onClick={() => handleVisit(b.id, b.url)} 
                  className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center justify-center gap-1"
                >
                  <ExternalLink size={14} /> Visit
                </button>
                <button 
                  onClick={() => startEdit(b)} 
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => onDelete(b.id)} 
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
