import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SystemPromptEditor } from './components/SystemPromptEditor';
import { VariablesPanel } from './components/VariablesPanel';
import { ExecutionOutput } from './components/ExecutionOutput';
import { SettingsModal } from './components/SettingsModal';
import { PresetsDrawer } from './components/PresetsDrawer';
import { TestCasesPanel } from './components/TestCasesPanel';
import { parseTemplateVariables, compileTemplate } from './utils/templateParser';
import { computeSimpleDiff } from './utils/diffEngine';
import { exportBackup, importBackup } from './utils/backup';
import { streamLLMResponse } from './utils/llmClient';
import type { LLMProvider, ApiKeys, Preset, TestCase, PromptVersion } from './types';
import { GitCommit, Copy, Check, Loader2 } from 'lucide-react';

const INITIAL_TEMPLATE = `You are a customer support agent.

Customer: {{customer_name:string}}
Issue: {{customer_issue:textarea}}

Respond in {{language:select(English, French, Arabic, Spanish)}}.
Tone: {{tone:select(Professional, Friendly, Formal, Concise)}}`;

export default function App() {
  const [template, setTemplate] = useState<string>(() => localStorage.getItem('pb_template') || INITIAL_TEMPLATE);
  const [varValues, setVarValues] = useState<Record<string, string>>({
    customer_name: 'Ahmed',
    customer_issue: 'I need a full refund for order #8492.',
    language: 'English',
    tone: 'Professional',
  });

  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 'tc-1',
      name: 'English Refund',
      values: { customer_name: 'Ahmed', customer_issue: 'I need a full refund for order #8492.', language: 'English', tone: 'Professional' },
    },
    {
      id: 'tc-2',
      name: 'French Missing Delivery',
      values: { customer_name: 'Sophie', customer_issue: "Mon colis n'est jamais arrivé.", language: 'French', tone: 'Friendly' },
    },
  ]);

  const [activeTestCaseId, setActiveTestCaseId] = useState<string | null>('tc-1');
  const [versions, setVersions] = useState<PromptVersion[]>([
    { id: 'v1', versionNumber: 1, template: INITIAL_TEMPLATE, createdAt: new Date().toLocaleTimeString() },
  ]);
  const [selectedDiffVersionId, setSelectedDiffVersionId] = useState<string | null>(null);

  const [provider, setProvider] = useState<LLMProvider>('openai');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  // Persistence for API Keys
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const saved = localStorage.getItem('pb_api_keys');
    return saved ? JSON.parse(saved) : { openai: '', anthropic: '', gemini: '', ollama: 'http://localhost:11434' };
  });

  // Live execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string>('');

  const [presets, setPresets] = useState<Preset[]>([{ id: '1', name: 'Customer Support Bot', template: INITIAL_TEMPLATE, values: {} }]);

  const parsedVars = parseTemplateVariables(template);
  const compiledText = compileTemplate(template, varValues);

  useEffect(() => {
    localStorage.setItem('pb_template', template);
  }, [template]);

  const handleSaveApiKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem('pb_api_keys', JSON.stringify(keys));
  };

  const handleExecutePrompt = async () => {
    setIsExecuting(true);
    setExecutionResult('');
    try {
      await streamLLMResponse({
        provider,
        prompt: compiledText,
        apiKeys,
        onChunk: (chunk) => setExecutionResult((prev) => prev + chunk),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Execution failed';
      setExecutionResult(`[Error]: ${msg}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCreateVersion = () => {
    const nextVer = versions.length + 1;
    const newVer: PromptVersion = {
      id: `v${nextVer}`,
      versionNumber: nextVer,
      template,
      createdAt: new Date().toLocaleTimeString(),
    };
    setVersions([newVer, ...versions]);
  };

  const handleSelectTestCase = (id: string) => {
    const tc = testCases.find((t) => t.id === id);
    if (tc) {
      setActiveTestCaseId(tc.id);
      setVarValues(tc.values);
    }
  };

  const handleSaveCurrentAsTestCase = () => {
    const name = prompt('Enter a name for this test case:', `Test #${testCases.length + 1}`);
    if (!name) return;
    const newTc: TestCase = {
      id: `tc-${Date.now()}`,
      name,
      values: { ...varValues },
    };
    setTestCases([...testCases, newTc]);
    setActiveTestCaseId(newTc.id);
  };

  const handleCopyPreparedPrompt = () => {
    navigator.clipboard.writeText(compiledText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWorkbench = () => {
    exportBackup(template, testCases, versions, presets);
  };

  const handleImportWorkbench = (file: File) => {
    importBackup(
      file,
      (data) => {
        setTemplate(data.template);
        if (data.testCases) setTestCases(data.testCases);
        if (data.versions) setVersions(data.versions);
        if (data.presets) setPresets(data.presets);
        alert('Workbench backup imported successfully!');
      },
      (errorMsg) => {
        alert(`Failed to import backup: ${errorMsg}`);
      }
    );
  };

  const diffVersion = versions.find((v) => v.id === selectedDiffVersionId);
  const diffChunks = diffVersion ? computeSimpleDiff(diffVersion.template, template) : [];

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans antialiased">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onExecute={handleExecutePrompt}
        onExport={handleExportWorkbench}
        onImport={handleImportWorkbench}
      />

      <div className="flex-1 flex overflow-hidden">
        <PresetsDrawer
          isOpen={isSidebarOpen}
          presets={presets}
          onSelect={(p) => setTemplate(p.template)}
          onDelete={(id) => setPresets(presets.filter((p) => p.id !== id))}
        />

        <main className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* LEFT: System Prompt & Version Control */}
          <section className="col-span-6 border-r border-slate-800 flex flex-col h-full bg-slate-900/30">
            <div className="p-2.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase text-slate-300">Prompt Template</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">v{versions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateVersion}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1"
                >
                  <GitCommit className="w-3 h-3 text-indigo-400" /> Save Version
                </button>
                {versions.length > 1 && (
                  <select
                    value={selectedDiffVersionId || ''}
                    onChange={(e) => setSelectedDiffVersionId(e.target.value || null)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded px-2 py-1"
                  >
                    <option value="">No Diff</option>
                    {versions.map((v) => (
                      <option key={v.id} value={v.id}>Diff vs v{v.versionNumber}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {selectedDiffVersionId ? (
              <div className="flex-1 p-4 bg-slate-950 overflow-y-auto font-mono text-xs leading-relaxed space-y-1">
                <div className="text-slate-500 text-[11px] mb-2 border-b border-slate-800 pb-1">
                  Comparing current editor vs <strong>v{diffVersion?.versionNumber}</strong>:
                </div>
                {diffChunks.map((chunk, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded ${
                      chunk.type === 'added'
                        ? 'bg-emerald-950/60 text-emerald-300 border-l-2 border-emerald-500'
                        : chunk.type === 'removed'
                        ? 'bg-rose-950/60 text-rose-300 border-l-2 border-rose-500 line-through'
                        : 'text-slate-400'
                    }`}
                  >
                    {chunk.value || ' '}
                  </div>
                ))}
              </div>
            ) : (
              <SystemPromptEditor value={template} onChange={setTemplate} selectedProvider={provider} />
            )}
          </section>

          {/* RIGHT: Variables, Test Cases, and Output Workbench */}
          <section className="col-span-6 flex flex-col h-full overflow-hidden bg-slate-950">
            <TestCasesPanel
              testCases={testCases}
              activeTestCaseId={activeTestCaseId}
              onSelectTestCase={handleSelectTestCase}
              onSaveCurrentAsTestCase={handleSaveCurrentAsTestCase}
              onDeleteTestCase={(id) => setTestCases(testCases.filter((t) => t.id !== id))}
            />

            <VariablesPanel
              variables={parsedVars}
              values={varValues}
              onChange={(name, val) => {
                setActiveTestCaseId(null);
                setVarValues((prev) => ({ ...prev, [name]: val }));
              }}
            />

            <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Live Compiled Output</span>
                {isExecuting && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-indigo-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Streaming...
                  </span>
                )}
              </div>
              <button
                onClick={handleCopyPreparedPrompt}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Prepared Prompt'}
              </button>
            </div>

            <ExecutionOutput
              compiledText={compiledText}
              selectedProvider={provider}
              onProviderChange={setProvider}
              executionResult={
                isExecuting
                  ? executionResult || 'Streaming response...'
                  : executionResult || '[Workbench Mode]: Add your API key and click "Run Prompt" to execute live requests.'
              }
            />
          </section>
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onSave={handleSaveApiKeys}
      />
    </div>
  );
}