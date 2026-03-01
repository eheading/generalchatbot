'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import ModelSelector from './ModelSelector'
import SystemPromptPanel from './SystemPromptPanel'
import LLMSettingsPanel from './LLMSettingsPanel'
import DocumentPanel from './DocumentPanel'
import type { UploadedDocument } from './DocumentPanel'
import type { LLMSettings, ModelCapabilities } from '@/lib/types'
import { DEFAULT_LLM_SETTINGS } from '@/lib/types'

interface SettingsSidebarProps {
  selectedModel: string
  role: string
  systemPrompt: string
  settings: LLMSettings
  documents: UploadedDocument[]
  onModelChange: (modelId: string, capabilities: ModelCapabilities) => void
  onRoleChange: (role: string) => void
  onSystemPromptChange: (prompt: string) => void
  onSettingsChange: (settings: LLMSettings) => void
  onDocumentsChange: (docs: UploadedDocument[]) => void
}

export default function SettingsSidebar({
  selectedModel,
  role,
  systemPrompt,
  settings,
  documents,
  onModelChange,
  onRoleChange,
  onSystemPromptChange,
  onSettingsChange,
  onDocumentsChange,
}: SettingsSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <div className="flex flex-col items-center w-10 border-r py-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(false)}
          title="Open settings"
        >
          ⚙
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-80 border-r shrink-0 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-sm">Settings</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCollapsed(true)}>
          ←
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />

          <Separator />

          <SystemPromptPanel
            role={role}
            systemPrompt={systemPrompt}
            documents={documents}
            onRoleChange={onRoleChange}
            onSystemPromptChange={onSystemPromptChange}
            onDocumentsChange={onDocumentsChange}
          />

          <Separator />

          <DocumentPanel
            documents={documents}
            onDocumentsChange={onDocumentsChange}
          />

          <Separator />

          <LLMSettingsPanel settings={settings} onSettingsChange={onSettingsChange} />

          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground text-xs"
              onClick={() => onSettingsChange(DEFAULT_LLM_SETTINGS)}
            >
              Reset to defaults
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
