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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { SavedPrompt, UploadedDocument } from '@/lib/types'

interface SystemPromptPanelProps {
  role: string
  systemPrompt: string
  documents: UploadedDocument[]
  onRoleChange: (role: string) => void
  onSystemPromptChange: (prompt: string) => void
  onDocumentsChange: (docs: UploadedDocument[]) => void
}

export default function SystemPromptPanel({
  role,
  systemPrompt,
  documents,
  onRoleChange,
  onSystemPromptChange,
  onDocumentsChange,
}: SystemPromptPanelProps) {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [saveName, setSaveName] = useState('')
  const [saveOpen, setSaveOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchPrompts = () => {
    fetch('/api/prompts')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setSavedPrompts(data))
      .catch(console.error)
  }

  useEffect(() => { fetchPrompts() }, [])

  const handleSave = async () => {
    if (!saveName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saveName.trim(), role, content: systemPrompt, documents }),
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
    if (prompt.documents) onDocumentsChange(prompt.documents)
    setTemplatesOpen(false)
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
        {/* Save Template */}
        <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={!systemPrompt.trim()}>
              Save Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Template name"
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

        {/* Templates browser */}
        <Dialog open={templatesOpen} onOpenChange={(open) => { setTemplatesOpen(open); if (open) fetchPrompts() }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Templates
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Templates</DialogTitle>
            </DialogHeader>
            {savedPrompts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No templates saved yet.</p>
            ) : (
              <ScrollArea className="max-h-[400px] pr-2">
                <div className="space-y-2 pt-2">
                  {savedPrompts.map((p) => (
                    <div key={p.id} className="border rounded-md p-3 space-y-1 group">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{p.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(p.id)}
                        >
                          ✕
                        </Button>
                      </div>
                      {p.role && (
                        <p className="text-xs text-muted-foreground truncate">Role: {p.role}</p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.content}</p>
                      <Separator className="my-1" />
                      <Button size="sm" variant="secondary" className="w-full h-7 text-xs" onClick={() => handleLoad(p)}>
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
