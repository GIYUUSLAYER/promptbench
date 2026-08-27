import { useState } from 'react';
import type { LLMProvider } from '../types';

interface ExecutionOutputProps {
  compiledText: string;
  selectedProvider: LLMProvider;
  onProviderChange: (provider: LLMProvider) => void;
  executionResult: string;
}

export function ExecutionOutput({ compiledText, selectedProvider, onProviderChange, executionResult }: ExecutionOutputProps) {
  const [activeTab, setActiveTab] = useState<'response' | 'compiled' | 'json'>('response');

  const payload = {
    openai: { model: "gpt-4o", messages: [{ role: "user", content: compiledText }] },
    anthropic: { model: "claude-3-5-sonnet-20241022", max_tokens: 1024, messages: [{ role: "user", content: compiledText }] },
    gemini: { contents: [{ parts: [{ text: compiledText }] }] },
    ollama: { model: "llama3", prompt: compiledText, stream: false }
  };

  return (
    <div className="h-1/2 flex flex-col overflow-hidden bg-slate-950">
      <div className="p-2 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs font-mono">
          <button onClick={() => setActiveTab('response')} className={`px-3 py-1 rounded transition-colors ${activeTab === 'response' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Model Response</button>
          <button onClick={() => setActiveTab('compiled')} className={`px-3 py-1 rounded transition-colors ${activeTab === 'compiled' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Compiled Text</button>
          <button onClick={() => setActiveTab('json')} className={`px-3 py-1 rounded transition-colors ${activeTab === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>API Payload</button>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <label>Target:</label>
          <select value={selectedProvider} onChange={(e) => onProviderChange(e.target.value as LLMProvider)} className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-mono">
            <option value="openai">OpenAI (gpt-4o)</option>
            <option value="anthropic">Anthropic (claude-3-5-sonnet)</option>
            <option value="gemini">Google Gemini (gemini-1.5-pro)</option>
            <option value="ollama">Ollama (Local llama3)</option>
          </select>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
        {activeTab === 'response' && (
          <div className="whitespace-pre-wrap">{executionResult || <span className="text-slate-500 italic">Click "Run Prompt" to execute.</span>}</div>
        )}
        {activeTab === 'compiled' && <div className="whitespace-pre-wrap">{compiledText}</div>}
        {activeTab === 'json' && <pre className="text-emerald-400">{JSON.stringify(payload[selectedProvider], null, 2)}</pre>}
      </div>
    </div>
  );
}