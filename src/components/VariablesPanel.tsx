import { Layers } from 'lucide-react';
import type { ParsedVariable } from '../types';

interface VariablesPanelProps {
  variables: ParsedVariable[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function VariablesPanel({ variables, values, onChange }: VariablesPanelProps) {
  return (
    <div className="h-1/2 border-b border-slate-800 flex flex-col bg-slate-900/20 overflow-hidden">
      <div className="p-3 border-b border-slate-800 bg-slate-900/50 text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Layers className="w-4 h-4 text-emerald-400" />
        Variables ({variables.length})
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {variables.length === 0 ? (
          <div className="text-slate-500 text-xs italic">No variables detected. Use {"{{var:string}}"} syntax.</div>
        ) : (
          variables.map((v) => (
            <div key={v.name} className="flex flex-col space-y-1 bg-slate-900/60 p-2.5 rounded border border-slate-800 text-xs">
              <div className="flex justify-between font-mono text-[11px] text-slate-300">
                <span>{v.name}</span>
                <span className="text-slate-500">{v.type}</span>
              </div>
              {v.type === 'select' ? (
                <select
                  value={values[v.name] || ''}
                  onChange={(e) => onChange(v.name, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded p-1.5 focus:border-indigo-500 font-mono"
                >
                  {v.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={values[v.name] || ''}
                  onChange={(e) => onChange(v.name, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded p-1.5 focus:border-indigo-500 font-mono"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}