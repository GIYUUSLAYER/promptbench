import { OpenAI } from 'openai';
import { GoogleGenAI } from '@google/genai';
import type { LLMProvider, ApiKeys } from '../types';

export async function executePrompt(
  provider: LLMProvider,
  prompt: string,
  apiKeys: ApiKeys
): Promise<string> {
  switch (provider) {
    case 'openai': {
      if (!apiKeys.openai) throw new Error('Missing OpenAI API Key in Settings.');
      const openai = new OpenAI({ apiKey: apiKeys.openai, dangerouslyAllowBrowser: true });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });
      return response.choices[0]?.message?.content || 'No response received.';
    }

    case 'gemini': {
      if (!apiKeys.gemini) throw new Error('Missing Gemini API Key in Settings.');
      const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
      });
      return response.text || 'No response received.';
    }

    case 'anthropic': {
      if (!apiKeys.anthropic) throw new Error('Missing Anthropic API Key in Settings.');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKeys.anthropic,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.content[0]?.text || 'No response received.';
    }

    case 'ollama': {
      const baseUrl = apiKeys.ollama || 'http://localhost:11434';
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3', prompt, stream: false }),
      });
      const data = await res.json();
      return data.response || 'No response received.';
    }

    default:
      throw new Error('Unsupported provider.');
  }
}