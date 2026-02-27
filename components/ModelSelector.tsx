'use client'

import { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OpenRouterModel, ModelCapabilities } from '@/lib/types'

interface EnrichedModel extends OpenRouterModel {
  capabilities: ModelCapabilities
}

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string, capabilities: ModelCapabilities) => void
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [models, setModels] = useState<EnrichedModel[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setModels(data)
        else setError(data.error ?? 'Failed to load models')
      })
      .catch(() => setError('Failed to load models'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelect = useCallback(
    (id: string) => {
      const model = models.find((m) => m.id === id)
      onModelChange(id, model?.capabilities ?? { vision: false, imageGeneration: false })
    },
    [models, onModelChange],
  )

  const selectedModelData = models.find((m) => m.id === selectedModel)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Model</label>
      {selectedModelData && (
        <div className="flex gap-1 flex-wrap">
          {selectedModelData.capabilities.vision && (
            <Badge variant="secondary" className="text-xs">👁 Vision</Badge>
          )}
          {selectedModelData.capabilities.imageGeneration && (
            <Badge variant="secondary" className="text-xs">🎨 Image Gen</Badge>
          )}
        </div>
      )}
      <Select value={selectedModel} onValueChange={handleSelect} disabled={loading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? 'Loading models…' : 'Select a model'} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder="Search models…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {error && (
            <div className="px-2 py-1 text-sm text-destructive">{error}</div>
          )}
          {filtered.slice(0, 100).map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <span className="flex items-center gap-2">
                <span className="truncate max-w-[240px]">{model.name}</span>
                {model.capabilities.vision && <span className="text-xs opacity-60">👁</span>}
                {model.capabilities.imageGeneration && <span className="text-xs opacity-60">🎨</span>}
              </span>
            </SelectItem>
          ))}
          {filtered.length === 0 && !error && (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">No models found</div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
