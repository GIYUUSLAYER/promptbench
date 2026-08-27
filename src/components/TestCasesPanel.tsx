import { Plus, Trash2, Check, FlaskConical } from 'lucide-react';
import type { TestCase } from '../types';

interface TestCasesPanelProps {
  testCases: TestCase[];
  activeTestCaseId: string | null;
  onSelectTestCase: (id: string) => void;
  onSaveCurrentAsTestCase: () => void;
  onDeleteTestCase: (id: string) => void;
}

export function TestCasesPanel({
  testCases,
  activeTestCaseId,
  onSelectTestCase,
  onSaveCurrentAsTestCase,
  onDeleteTestCase,
}: TestCasesPanelProps) {
  return (
    <div className="border-b border-slate-800 bg-slate-900/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-semibold uppercase text-slate-400 flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
          Test Cases ({testCases.length})
        </span>
        <button
          onClick={onSaveCurrentAsTestCase}
          className="text-[11px] font-mono px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> Save Current Inputs
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {testCases.length === 0 ? (
          <span className="text-slate-500 text-xs italic font-mono">No saved test cases yet.</span>
        ) : (
          testCases.map((tc) => {
            const isActive = tc.id === activeTestCaseId;
            return (
              <div
                key={tc.id}
                onClick={() => onSelectTestCase(tc.id)}
                className={`group flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono cursor-pointer transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-200 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {isActive && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                <span>{tc.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTestCase(tc.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}