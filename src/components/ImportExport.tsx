import { useState, useRef } from 'react';
import { Download, Upload, FileJson, Trash2, Check, AlertCircle } from 'lucide-react';
import type { Bookmark, Collection, ExportData } from '../types';

interface Props {
  bookmarks: Bookmark[];
  collections: Collection[];
  onImport: (data: ExportData) => void;
  onClose: () => void;
}

export default function ImportExport({ bookmarks, collections, onImport }: Props) {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data: ExportData = {
      bookmarks,
      collections,
      exportedAt: Date.now(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapvault-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ExportData;
        
        if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
          throw new Error('Invalid format: missing bookmarks array');
        }

        onImport(data);
        setImportStatus('success');
        setImportMessage(`Imported ${data.bookmarks.length} bookmarks successfully!`);
        
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 3000);
      } catch (err) {
        setImportStatus('error');
        setImportMessage(err instanceof Error ? err.message : 'Failed to import file');
        
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 3000);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all bookmarks? This cannot be undone.')) {
      localStorage.removeItem('sv-bookmarks');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Import Status */}
      {importStatus !== 'idle' && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          importStatus === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 
          'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {importStatus === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {importMessage}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="text-3xl font-bold text-blue-600">{bookmarks.length}</div>
          <p className="text-sm text-gray-500">Total Bookmarks</p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="text-3xl font-bold text-purple-600">{collections.length}</div>
          <p className="text-sm text-gray-500">Collections</p>
        </div>
      </div>

      {/* Export */}
      <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Download className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Export Data</h3>
            <p className="text-sm text-gray-500">Download all bookmarks as JSON</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          disabled={bookmarks.length === 0}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FileJson size={18} />
          Export to JSON
        </button>
      </div>

      {/* Import */}
      <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Upload className="text-emerald-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Import Data</h3>
            <p className="text-sm text-gray-500">Import bookmarks from JSON file</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="import-input"
        />
        <label 
          htmlFor="import-input"
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileJson size={18} />
          Import from JSON
        </label>
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
        <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">
          Permanently delete all your bookmarks. This action cannot be undone.
        </p>
        <button 
          onClick={handleClearAll}
          disabled={bookmarks.length === 0}
          className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
          Delete All Bookmarks
        </button>
      </div>
    </div>
  );
}
