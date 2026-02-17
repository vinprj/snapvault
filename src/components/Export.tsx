import type { ExportData } from '../types';
import { Download, Upload, X } from 'lucide-react';

interface Props {
  data: ExportData;
  onImport: (data: ExportData) => void;
  onClose: () => void;
}

export default function Export({ data, onImport, onClose }: Props) {
  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapvault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as ExportData;
        onImport(imported);
        alert('Bookmarks imported successfully! 🎉');
        onClose();
      } catch (err) {
        alert('Failed to import. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="pin-card rounded-3xl max-w-2xl w-full p-8 tape">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold handwritten mb-1">Backup & Restore</h2>
            <p className="text-gray-600 dark:text-gray-400">Export or import your bookmarks</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 smooth-vault">
            <X size={24} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Export */}
          <div className="pin-card rounded-2xl p-6 text-center smooth-vault hover:shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
              <Download className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 handwritten">Export Bookmarks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Save all your bookmarks and collections
            </p>
            <button
              onClick={handleExport}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl smooth-vault"
            >
              Download JSON
            </button>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div>📚 {data.bookmarks.length} bookmarks</div>
              <div>📁 {data.collections.length} collections</div>
            </div>
          </div>

          {/* Import */}
          <div className="pin-card rounded-2xl p-6 text-center smooth-vault hover:shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 handwritten">Import Bookmarks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Restore from a backup file
            </p>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <div className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl cursor-pointer smooth-vault">
                Choose File
              </div>
            </label>
            <p className="mt-4 text-xs text-gray-500">
              ⚠️ Merges with existing bookmarks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
