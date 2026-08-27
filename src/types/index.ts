export type VariableType = 'string' | 'number' | 'textarea' | 'select';

export interface ParsedVariable {
  name: string;
  type: VariableType;
  options?: string[];
  rawMatch: string;
}

export interface TestCase {
  id: string;
  name: string;
  values: Record<string, string>;
}

export interface PromptVersion {
  id: string;
  versionNumber: number;
  template: string;
  createdAt: string;
  note?: string;
}

// Re-export Preset interface required by PresetsDrawer and App
export interface Preset {
  id: string;
  name: string;
  template: string;
  values: Record<string, string>;
}

export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama';

export interface ApiKeys {
  openai: string;
  anthropic: string;
  gemini: string;
  ollama: string;
}