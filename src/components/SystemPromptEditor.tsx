import { Code2 } from 'lucide-react';
import { estimateTokenCount, calculateEstimatedCost } from '../utils/tokenEstimator';
import type { LLMProvider } from '../types';

interface SystemPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  selectedProvider: LLMProvider;
}

export function SystemPromptEditor({ value, onChange, selectedProvider }: SystemPromptEditorProps) {
  const tokens = estimateTokenCount(value);
  const cost = calculateEstimatedCost(tokens, selectedProvider);

  return (
    <section className="col-span-6 border-r border-slate-800 flex flex-col h-full bg-slate-900/30">
      <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="font-semibold uppercase tracking-wider flex items-center gap-2 text-slate-300">
          <Code2 className="w-4 h-4 text-indigo-400" /> System Prompt
        </span>
        <div className="flex items-center gap-3">
          <span>Tokens: <strong className="text-indigo-400">~{tokens}</strong></span>
          <span>Cost: <strong className="text-emerald-400">${cost.toFixed(6)}</strong></span>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 p-4 bg-slate-950 text-slate-200 font-mono text-sm border-none focus:outline-none resize-none leading-relaxed"
        placeholder="Type prompt template here..."
      />
    </section>
  );
}