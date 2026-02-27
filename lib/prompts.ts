import fs from 'fs'
import path from 'path'
import type { SavedPrompt } from './types'

const DATA_PATH = path.join(process.cwd(), 'data', 'prompts.json')

function ensureFile() {
  const dir = path.dirname(DATA_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '[]', 'utf-8')
}

export function loadPrompts(): SavedPrompt[] {
  ensureFile()
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
}

export function savePrompt(prompt: Omit<SavedPrompt, 'id' | 'createdAt'>): SavedPrompt {
  const prompts = loadPrompts()
  const newPrompt: SavedPrompt = {
    ...prompt,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  prompts.push(newPrompt)
  fs.writeFileSync(DATA_PATH, JSON.stringify(prompts, null, 2), 'utf-8')
  return newPrompt
}

export function deletePrompt(id: string): boolean {
  const prompts = loadPrompts()
  const filtered = prompts.filter((p) => p.id !== id)
  if (filtered.length === prompts.length) return false
  fs.writeFileSync(DATA_PATH, JSON.stringify(filtered, null, 2), 'utf-8')
  return true
}
