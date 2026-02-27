import { NextResponse } from 'next/server'
import { fetchModels, getModelCapabilities } from '@/lib/models'

export async function GET() {
  try {
    const models = await fetchModels()
    const enriched = models.map((m) => ({
      ...m,
      capabilities: getModelCapabilities(m),
    }))
    return NextResponse.json(enriched)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
