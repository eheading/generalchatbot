'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { UploadedDocument } from '@/lib/types'

export type { UploadedDocument }

interface DocumentPanelProps {
  documents: UploadedDocument[]
  onDocumentsChange: (docs: UploadedDocument[]) => void
}

const ACCEPTED = '.txt,.md,.csv,.json,.xml,.html,.log'

export default function DocumentPanel({ documents, onDocumentsChange }: DocumentPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setLoading(true)
    try {
      const newDocs: UploadedDocument[] = []
      for (const file of Array.from(files)) {
        // Skip duplicates by name
        if (documents.some((d) => d.name === file.name)) continue
        const content = await readFile(file)
        newDocs.push({ id: crypto.randomUUID(), name: file.name, content, selected: true })
      }
      onDocumentsChange([...documents, ...newDocs])
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const toggleSelect = (id: string) => {
    onDocumentsChange(documents.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d)))
  }

  const removeDoc = (id: string) => {
    onDocumentsChange(documents.filter((d) => d.id !== id))
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

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? 'Reading…' : '+ Upload Documents'}
      </Button>

      {documents.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 group py-1">
              <input
                type="checkbox"
                id={`doc-${doc.id}`}
                checked={doc.selected}
                onChange={() => toggleSelect(doc.id)}
                className="h-3.5 w-3.5 accent-primary shrink-0"
              />
              <label
                htmlFor={`doc-${doc.id}`}
                className="flex-1 text-sm truncate cursor-pointer"
                title={doc.name}
              >
                {doc.name}
              </label>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0"
                onClick={() => removeDoc(doc.id)}
              >
                ✕
              </Button>
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
