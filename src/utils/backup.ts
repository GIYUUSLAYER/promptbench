import type { TestCase, PromptVersion, Preset } from '../types';

export interface PromptBenchBackup {
  version: string;
  exportedAt: string;
  template: string;
  testCases: TestCase[];
  versions: PromptVersion[];
  presets: Preset[];
}

export function exportBackup(
  template: string,
  testCases: TestCase[],
  versions: PromptVersion[],
  presets: Preset[]
) {
  const backupData: PromptBenchBackup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    template,
    testCases,
    versions,
    presets,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `promptbench-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importBackup(
  file: File,
  onSuccess: (data: PromptBenchBackup) => void,
  onError: (errorMsg: string) => void
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content) as PromptBenchBackup;

      if (!parsed.template || !Array.isArray(parsed.testCases)) {
        throw new Error('Invalid PromptBench backup format.');
      }

      onSuccess(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse JSON backup file.';
      onError(msg);
    }
  };
  reader.readAsText(file);
}