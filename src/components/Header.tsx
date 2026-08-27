import { useRef } from 'react';
import { Play, Settings, Menu, Download, Upload } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  onExecute: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function Header({
  onOpenSettings,
  onToggleSidebar,
  onExecute,
  onExport,
  onImport,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-indigo-500/20">
          PB
        </div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          PromptBench
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          Import
        </button>

        <button
          onClick={onExport}
          className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Export
        </button>

        <button
          onClick={onOpenSettings}
          className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center gap-1.5"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          API Keys
        </button>

        <button
          onClick={onExecute}
          className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Run Prompt
        </button>
      </div>
    </header>
  );
}