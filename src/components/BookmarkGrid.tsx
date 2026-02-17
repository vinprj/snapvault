import { useState } from 'react';
import { ExternalLink, Trash2, Globe, Edit2, Save, X } from 'lucide-react';
import type { Bookmark, Collection } from '../types';

interface Props { bookmarks: Bookmark[]; onUpdate: (id: string, updates: Partial<Bookmark>) => void; onDelete: (id: string) => void; collections: Collection[]; }

export default function BookmarkGrid({ bookmarks, onUpdate, onDelete, collections }: Props) {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {bookmarks.map(b => (
        <div key={b.id} className="group p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg">
          {editing === b.id ? (
            <div className="space-y-2">
              <input value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500" placeholder="Title" />
              <input value={editForm.url || ''} onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500" placeholder="URL" />
              <textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500 resize-none" placeholder="Description" rows={2} />
              <select value={editForm.collectionId || ''} onChange={e => setEditForm({ ...editForm, collectionId: e.target.value || null })}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none">
                <option value="">No Collection</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <input onKeyDown={e => { if (e.key === 'Enter') { addTag(e.currentTarget.value); e.currentTarget.value = ''; }}} placeholder="Add tag..." className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500" />
              {editForm.tags && editForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {editForm.tags.map(t => (
                    <span key={t} onClick={() => removeTag(t)} className="px-2 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20">{t} ×</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => saveEdit(b.id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white">
                  <Save size={14} /> Save
                </button>
                <button onClick={cancelEdit} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <img src={b.favicon || `https://www.google.com/s2/favicons?domain=${new URL(b.url).hostname}&sz=32`} alt="" className="w-8 h-8 rounded mt-0.5"
                  onError={e => { (e.target as HTMLImageElement).src = ''; }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{b.title || b.url}</h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{b.url}</p>
                  {b.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{b.description}</p>}
                </div>
              </div>
              {b.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {b.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600">{t}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <a href={b.url} target="_blank" rel="noopener" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <ExternalLink size={12} /> Open
                </a>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(b)} className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => onDelete(b.id)} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
