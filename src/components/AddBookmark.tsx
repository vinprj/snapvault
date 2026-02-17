import { useState } from 'react';
import { X } from 'lucide-react';
import type { Bookmark, Collection } from '../types';

interface Props { collections: Collection[]; onAdd: (bm: Omit<Bookmark, 'id' | 'createdAt'>) => void; onClose: () => void; }

export default function AddBookmark({ collections, onAdd, onClose }: Props) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Add Bookmark</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-3">
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          <select value={collectionId || ''} onChange={e => setCollectionId(e.target.value || null)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none">
            <option value="">No Collection</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tags..." className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {tags.length > 0 && <div className="flex flex-wrap gap-1">{tags.map(t => <span key={t} className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 cursor-pointer" onClick={() => setTags(tags.filter(x => x !== t))}>{t} ×</span>)}</div>}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={() => url.trim() && onAdd({ url: url.trim(), title: title.trim() || url.trim(), description, favicon: '', collectionId, tags })}
            disabled={!url.trim()} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition-colors">
            Save Bookmark
          </button>
        </div>
      </div>
    </div>
  );
}
