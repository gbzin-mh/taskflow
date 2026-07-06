import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1024;

const MAX_SYSTEM_LENGTH = 20_000;
const MAX_MESSAGE_LENGTH = 8_000;
const MAX_MESSAGES = 50;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function isValidMessage(m: unknown): m is ChatMessage {
  if (typeof m !== 'object' || m === null) return false;
  const { role, content } = m as Record<string, unknown>;
  return (
    (role === 'user' || role === 'assistant') &&
    typeof content === 'string' &&
    content.length > 0 &&
    content.length <= MAX_MESSAGE_LENGTH
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[api/chat] ANTHROPIC_API_KEY não configurada no ambiente');
    return res.status(500).json({ error: 'Serviço de IA indisponível no momento' });
  }

  const body = req.body ?? {};
  const { system, messages } = body as { system?: unknown; messages?: unknown };

  if (typeof system !== 'string' || system.length === 0 || system.length > MAX_SYSTEM_LENGTH) {
    return res.status(400).json({ error: 'Parâmetro "system" inválido' });
  }
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isValidMessage)
  ) {
    return res.status(400).json({ error: 'Parâmetro "messages" inválido' });
  }

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: (messages as ChatMessage[]).map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      console.error('[api/chat] Erro da Anthropic API:', upstream.status, errText);
      return res.status(502).json({ error: 'Erro ao consultar o assistente de IA' });
    }

    const data = (await upstream.json()) as { content?: Array<{ text: string }> };
    const text = data.content?.[0]?.text ?? '';
    return res.status(200).json({ text });
  } catch (err) {
    console.error('[api/chat] Falha ao chamar Anthropic API:', err);
    return res.status(500).json({ error: 'Falha interna ao processar a solicitação' });
  }
}
