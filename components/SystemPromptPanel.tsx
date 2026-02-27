'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { SavedPrompt } from '@/lib/types'

interface SystemPromptPanelProps {
  role: string
  systemPrompt: string
  onRoleChange: (role: string) => void
  onSystemPromptChange: (prompt: string) => void
}

export default function SystemPromptPanel({
  role,
  systemPrompt,
  onRoleChange,
  onSystemPromptChange,
}: SystemPromptPanelProps) {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [saveName, setSaveName] = useState('')
  const [saveOpen, setSaveOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/prompts')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setSavedPrompts(data))
      .catch(console.error)
  }, [])

  const handleSave = async () => {
    if (!saveName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saveName.trim(), role, content: systemPrompt }),
      })
      const saved = await res.json()
      setSavedPrompts((prev) => [...prev, saved])
      setSaveName('')
      setSaveOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/prompts?id=${id}`, { method: 'DELETE' })
    setSavedPrompts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleLoad = (prompt: SavedPrompt) => {
    onRoleChange(prompt.role)
    onSystemPromptChange(prompt.content)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Role</label>
      <Input
        placeholder="e.g. You are a helpful assistant…"
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        className="text-sm"
      />

      <label className="text-sm font-medium">System Prompt</label>
      <Textarea
        placeholder="Enter system prompt…"
        value={systemPrompt}
        onChange={(e) => onSystemPromptChange(e.target.value)}
        className="text-sm min-h-[100px] resize-y"
      />

      <div className="flex items-center gap-2">
        <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={!systemPrompt.trim()}>
              Save Preset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save System Prompt</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Preset name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <Button onClick={handleSave} disabled={saving || !saveName.trim()} className="w-full">
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {savedPrompts.length > 0 && (
        <>
          <Separator />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Saved Presets</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {savedPrompts.map((p) => (
              <div key={p.id} className="flex items-center gap-2 group">
                <button
                  className="flex-1 text-left text-sm truncate hover:text-primary transition-colors py-1"
                  onClick={() => handleLoad(p)}
                  title={p.content}
                >
                  {p.name}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(p.id)}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
