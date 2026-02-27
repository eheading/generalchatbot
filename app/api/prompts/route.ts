import { NextResponse } from 'next/server'
import { loadPrompts, savePrompt, deletePrompt } from '@/lib/prompts'

export async function GET() {
  return NextResponse.json(loadPrompts())
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, role, content } = body
  if (!name || !content) {
    return NextResponse.json({ error: 'name and content are required' }, { status: 400 })
  }
  const prompt = savePrompt({ name, role: role ?? '', content })
  return NextResponse.json(prompt, { status: 201 })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }
  const deleted = deletePrompt(id)
  return deleted
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: 'Not found' }, { status: 404 })
}
