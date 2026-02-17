import type { Bookmark, Collection, ExportData } from '../types';
import { Download, Upload, FileJson, FileText } from 'lucide-react';

interface ImportExportProps {
  bookmarks: Bookmark[];
  collections: Collection[];
  onImport: (data: ExportData) => void;
  onClose: () => void;
}

export default function ImportExport({ bookmarks, collections, onImport, onClose }: ImportExportProps) {
  const exportJSON = () => {
    const data: ExportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      bookmarks,
      collections: collections.map(c => ({ ...c, password: undefined, isLocked: undefined })) // Don't export passwords
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `snapvault-export-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportHTML = () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${collections.map(col => {
  const colBookmarks = bookmarks.filter(b => b.collectionId === col.id);
  if (colBookmarks.length === 0) return '';
  
  return `  <DT><H3>${col.icon} ${col.name}</H3>
  <DL><p>
${colBookmarks.map(b => `    <DT><A HREF="${b.url}" ADD_DATE="${Math.floor(b.createdAt / 1000)}">${b.title}</A>`).join('\n')}
  </DL><p>`;
}).join('\n')}
${bookmarks.filter(b => !b.collectionId).map(b => `  <DT><A HREF="${b.url}" ADD_DATE="${Math.floor(b.createdAt / 1000)}">${b.title}</A>`).join('\n')}
</DL><p>`;

    const blob = new Blob([html], { type: 'text/html' });
    downloadFile(blob, `snapvault-bookmarks-${new Date().toISOString().split('T')[0]}.html`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ExportData;
        
        if (confirm(`Import ${data.bookmarks.length} bookmarks and ${data.collections.length} collections? This will merge with existing data.`)) {
          onImport(data);
          alert('Data imported successfully!');
          onClose();
        }
      } catch (error) {
        alert('Invalid file format. Please select a valid SnapVault export file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Import & Export</h2>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Bookmarks
            </h3>
            <div className="space-y-2">
              <button
                onClick={exportJSON}
                className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-3"
              >
                <FileJson className="w-5 h-5 text-blue-600" />
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">Export as JSON</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Full backup with all data</div>
                </div>
              </button>

              <button
                onClick={exportHTML}
                className="w-full p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-3"
              >
                <FileText className="w-5 h-5 text-green-600" />
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">Export as HTML</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Browser-compatible format</div>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Bookmarks
            </h3>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <div className="w-full p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer text-center">
                <div className="font-medium text-sm">Choose JSON file to import</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Merges with existing bookmarks</div>
              </div>
            </label>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Tip:</strong> Passwords for locked collections are not exported for security.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {bookmarks.length} bookmarks • {collections.length} collections
          </div>
        </div>
      </div>
    </div>
  );
}
