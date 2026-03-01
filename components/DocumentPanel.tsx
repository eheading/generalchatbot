'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { UploadedDocument } from '@/lib/types'

export type { UploadedDocument }

interface DocumentPanelProps {
  documents: UploadedDocument[]
  onDocumentsChange: (docs: UploadedDocument[]) => void
}

const TEXT_TYPES = '.txt,.md,.csv,.json,.xml,.html,.log'
const ACCEPTED = `${TEXT_TYPES},.pdf,.doc,.docx`

const BINARY_EXTS = ['.pdf', '.doc', '.docx']

function isBinary(name: string) {
  return BINARY_EXTS.some((ext) => name.toLowerCase().endsWith(ext))
}

async function parseViaApi(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/parse-document', { method: 'POST', body: fd })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Parse failed' }))
    throw new Error(err.error ?? 'Parse failed')
  }
  const data = await res.json()
  return data.text as string
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export default function DocumentPanel({ documents, onDocumentsChange }: DocumentPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  // selection mode for bulk removal
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setLoading(true)
    try {
      const newDocs: UploadedDocument[] = []
      for (const file of Array.from(files)) {
        if (documents.some((d) => d.name === file.name)) continue
        const content = isBinary(file.name)
          ? await parseViaApi(file)
          : await readAsText(file)
        newDocs.push({ id: crypto.randomUUID(), name: file.name, content, selected: true })
      }
      onDocumentsChange([...documents, ...newDocs])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const toggleContextSelect = (id: string) => {
    onDocumentsChange(documents.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d)))
  }

  const toggleBulkSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const removeSelected = () => {
    onDocumentsChange(documents.filter((d) => !selected.has(d.id)))
    setSelected(new Set())
    setSelectMode(false)
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Documents</label>
      <p className="text-xs text-muted-foreground">
        Selected documents are injected as context before each reply.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => inputRef.current?.click()}
          disabled={loading || selectMode}
        >
          {loading ? 'Reading…' : '+ Upload Documents'}
        </Button>

        {documents.length > 0 && !selectMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectMode(true)}
          >
            Select
          </Button>
        )}
      </div>

      {selectMode && (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            disabled={selected.size === 0}
            onClick={removeSelected}
          >
            Remove ({selected.size})
          </Button>
          <Button variant="outline" size="sm" onClick={exitSelectMode}>
            Cancel
          </Button>
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 group py-1">
              {selectMode ? (
                <input
                  type="checkbox"
                  checked={selected.has(doc.id)}
                  onChange={() => toggleBulkSelect(doc.id)}
                  className="h-3.5 w-3.5 accent-destructive shrink-0"
                />
              ) : (
                <input
                  type="checkbox"
                  id={`doc-${doc.id}`}
                  checked={doc.selected}
                  onChange={() => toggleContextSelect(doc.id)}
                  className="h-3.5 w-3.5 accent-primary shrink-0"
                />
              )}
              <label
                htmlFor={selectMode ? undefined : `doc-${doc.id}`}
                className="flex-1 text-sm truncate cursor-pointer"
                title={doc.name}
                onClick={selectMode ? () => toggleBulkSelect(doc.id) : undefined}
              >
                {doc.name}
              </label>
            </div>
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No documents uploaded yet.</p>
      )}
    </div>
  )
}

