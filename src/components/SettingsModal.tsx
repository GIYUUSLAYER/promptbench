import type { ApiKeys } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
}

export function SettingsModal({ isOpen, onClose, apiKeys, onSave }: SettingsModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave({
      openai: formData.get('openai') as string,
      anthropic: formData.get('anthropic') as string,
      gemini: formData.get('gemini') as string,
      ollama: formData.get('ollama') as string,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3">API Provider Settings</h3>
        <div className="space-y-3 text-xs font-mono">
          <div><label className="block text-slate-400 mb-1">OpenAI API Key</label><input name="openai" type="password" defaultValue={apiKeys.openai} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" /></div>
          <div><label className="block text-slate-400 mb-1">Anthropic API Key</label><input name="anthropic" type="password" defaultValue={apiKeys.anthropic} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" /></div>
          <div><label className="block text-slate-400 mb-1">Gemini API Key</label><input name="gemini" type="password" defaultValue={apiKeys.gemini} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" /></div>
          <div><label className="block text-slate-400 mb-1">Ollama Base URL</label><input name="ollama" type="text" defaultValue={apiKeys.ollama} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded">Cancel</button>
          <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded">Save Settings</button>
        </div>
      </form>
    </div>
  );
}