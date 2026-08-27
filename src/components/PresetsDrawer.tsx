import type { Preset } from '../types';

interface PresetsDrawerProps {
  isOpen: boolean;
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  onDelete: (id: string) => void;
}

export function PresetsDrawer({ isOpen, presets, onSelect, onDelete }: PresetsDrawerProps) {
  return (
    <aside className={`w-64 border-r border-slate-800 bg-slate-900/90 flex flex-col transition-all duration-300 shrink-0 ${isOpen ? '' : '-ml-64'}`}>
      <div className="p-3 border-b border-slate-800 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
        Presets
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {presets.map((p) => (
          <div key={p.id} onClick={() => onSelect(p)} className="p-2 rounded hover:bg-slate-800 cursor-pointer text-xs font-mono flex items-center justify-between text-slate-300">
            <span>{p.name}</span>
            <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} className="text-slate-600 hover:text-rose-400">&times;</button>
          </div>
        ))}
      </div>
    </aside>
  );
}