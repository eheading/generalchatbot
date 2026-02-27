import { streamChatCompletion } from '@/lib/openrouter'
import type { ChatRequest } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json()
    const upstream = await streamChatCompletion(body)

    return new Response(upstream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
