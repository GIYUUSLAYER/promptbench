import type { LLMProvider, ApiKeys } from '../types';

interface ExecuteParams {
  provider: LLMProvider;
  prompt: string;
  apiKeys: ApiKeys;
  onChunk: (chunk: string) => void;
}

export async function streamLLMResponse({
  provider,
  prompt,
  apiKeys,
  onChunk,
}: ExecuteParams): Promise<void> {
  if (provider === 'openai') {
    const apiKey = apiKeys.openai;
    if (!apiKey) throw new Error('OpenAI API Key is missing. Add it in API Keys.');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI error: ${res.statusText}`);
    }

    await readStream(res, (data) => {
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        const text = json.choices?.[0]?.delta?.content;
        if (text) onChunk(text);
      } catch {
        // Ignore partial chunks
      }
    });
  } else if (provider === 'anthropic') {
    const apiKey = apiKeys.anthropic;
    if (!apiKey) throw new Error('Anthropic API Key is missing. Add it in API Keys.');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic error: ${res.statusText}`);
    }

    await readStream(res, (data) => {
      try {
        const json = JSON.parse(data);
        if (json.type === 'content_block_delta' && json.delta?.text) {
          onChunk(json.delta.text);
        }
      } catch {
        // Ignore partial parse
      }
    });
  } else if (provider === 'gemini') {
    const apiKey = apiKeys.gemini;
    if (!apiKey) throw new Error('Google Gemini API Key is missing. Add it in API Keys.');

    // Step 1: Dynamically query available models for this key
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listRes = await fetch(listUrl);

    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      throw new Error(`Gemini API Key Error: ${err.error?.message || listRes.statusText}`);
    }

    const listData = await listRes.json();
    const availableModels: Array<{ name: string; supportedGenerationMethods: string[] }> = listData.models || [];

    // Filter models that support generateContent
    const validModels = availableModels.filter((m) =>
      m.supportedGenerationMethods?.includes('generateContent')
    );

    if (validModels.length === 0) {
      throw new Error('No models supporting generateContent found for this Gemini API key.');
    }

    // Pick a flash model if available, otherwise pick the first supported model
    const chosenModelObj =
      validModels.find((m) => m.name.includes('flash')) || validModels[0];
    const targetModel = chosenModelObj.name; // e.g. "models/gemini-..."

    // Step 2: Execute generateContent with the verified active model
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`;
    const res = await fetch(generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gemini Error (${targetModel}): ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      onChunk(text);
    } else {
      throw new Error('No content returned from Gemini.');
    }
  } else if (provider === 'ollama') {
    const baseUrl = apiKeys.ollama || 'http://localhost:11434';
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3', prompt, stream: true }),
    });

    if (!res.ok) throw new Error(`Ollama server error: ${res.statusText}`);

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) onChunk(json.response);
        } catch {
          // Ignore partial line
        }
      }
    }
  }
}

async function readStream(response: Response, onLine: (line: string) => void) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        onLine(trimmed.slice(6));
      }
    }
  }
}