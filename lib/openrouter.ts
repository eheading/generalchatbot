import type { ChatRequest } from './types'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

function getHeaders() {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY is not set')
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    'X-Title': 'Company AI Chatbot',
  }
}

export async function streamChatCompletion(req: ChatRequest): Promise<ReadableStream> {
  const messages = req.systemPrompt
    ? [{ role: 'system', content: req.systemPrompt }, ...req.messages]
    : req.messages

  const body = {
    model: req.model,
    messages,
    stream: true,
    temperature: req.settings.temperature,
    max_tokens: req.settings.maxTokens,
    top_p: req.settings.topP,
    frequency_penalty: req.settings.frequencyPenalty,
    presence_penalty: req.settings.presencePenalty,
  }

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter chat error ${res.status}: ${err}`)
  }

  return res.body!
}

export async function generateImage(prompt: string, model: string): Promise<string> {
  // OpenRouter image generation uses the same chat completions endpoint.
  // Image models return the result URL in choices[0].message.content.
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter image gen error ${res.status}: ${err}`)
  }

  const json = await res.json()
  const content: string = json.choices?.[0]?.message?.content ?? ''

  // Response may be a plain URL, a markdown image ![...](url), or JSON
  // Try markdown image first: ![alt](url)
  const mdMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/)
  if (mdMatch) return mdMatch[1]

  // Plain URL
  const urlMatch = content.match(/(https?:\/\/[^\s"'<>]+)/)
  if (urlMatch) return urlMatch[1]

  // Some models return JSON like {"url":"..."}
  try {
    const parsed = JSON.parse(content)
    if (parsed.url) return parsed.url
    if (parsed.data?.[0]?.url) return parsed.data[0].url
  } catch {
    // not JSON
  }

  throw new Error(`Could not extract image URL from response: ${content.slice(0, 200)}`)
}
