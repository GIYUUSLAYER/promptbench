export interface DiffChunk {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

export function computeSimpleDiff(oldText: string, newText: string): DiffChunk[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const chunks: DiffChunk[] = [];

  const maxLines = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      if (oldLine !== undefined) {
        chunks.push({ type: 'unchanged', value: oldLine });
      }
    } else {
      if (oldLine !== undefined) {
        chunks.push({ type: 'removed', value: oldLine });
      }
      if (newLine !== undefined) {
        chunks.push({ type: 'added', value: newLine });
      }
    }
  }

  return chunks;
}