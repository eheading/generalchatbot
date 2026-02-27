import { NextResponse } from 'next/server'
import { generateImage } from '@/lib/openrouter'

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json()
    if (!prompt || !model) {
      return NextResponse.json({ error: 'prompt and model are required' }, { status: 400 })
    }
    const url = await generateImage(prompt, model)
    return NextResponse.json({ url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
