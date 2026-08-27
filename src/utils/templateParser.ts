import type { ParsedVariable } from '../types';

export function parseTemplateVariables(template: string): ParsedVariable[] {
  const regex = /(?:\{\{|\$\{|<|\[\[)\s*([a-zA-Z0-9_]+)(?::([a-zA-Z0-9_]+(?:\([^\)]*\))?))?\s*(?:\}\}|>|\]\])/g;
  const variables: ParsedVariable[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(template)) !== null) {
    const [, name, typeString] = match;
    if (seen.has(name)) continue;
    seen.add(name);

    let type: ParsedVariable['type'] = 'string';
    let options: string[] = [];

    if (typeString) {
      if (typeString.startsWith('select(')) {
        type = 'select';
        options = typeString.slice(7, -1).split(',').map((s) => s.trim()).filter(Boolean);
      } else if (['number', 'textarea'].includes(typeString.toLowerCase())) {
        type = typeString.toLowerCase() as ParsedVariable['type'];
      }
    }

    variables.push({ rawMatch: match[0], name, type, options });
  }

  return variables;
}

export function compileTemplate(template: string, values: Record<string, string>): string {
  const regex = /(?:\{\{|\$\{|<|\[\[)\s*([a-zA-Z0-9_]+)(?::[^\}\]>]+)?\s*(?:\}\}|>|\]\])/g;
  return template.replace(regex, (match, varName) => (values[varName] !== undefined ? values[varName] : match));
}