'use client'

import { useState } from 'react'
import SettingsSidebar from '@/components/SettingsSidebar'
import ChatInterface from '@/components/ChatInterface'
import type { LLMSettings, ModelCapabilities } from '@/lib/types'
import { DEFAULT_LLM_SETTINGS } from '@/lib/types'
import type { UploadedDocument } from '@/components/DocumentPanel'

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('')
  const [capabilities, setCapabilities] = useState<ModelCapabilities>({
    vision: false,
    imageGeneration: false,
  })
  const [role, setRole] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [settings, setSettings] = useState<LLMSettings>(DEFAULT_LLM_SETTINGS)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])

  const handleModelChange = (modelId: string, caps: ModelCapabilities) => {
    setSelectedModel(modelId)
    setCapabilities(caps)
  }

  // Build document context block from selected docs
  const selectedDocs = documents.filter((d) => d.selected)
  const docContext = selectedDocs.length > 0
    ? '\n\n--- Reference Documents ---\n' +
      selectedDocs.map((d) => `[${d.name}]\n${d.content}`).join('\n\n') +
      '\n--- End of Reference Documents ---\n\nBefore answering, check the reference documents above for relevant information.'
    : ''

  // Build effective system prompt combining role + prompt + doc context
  const effectiveSystemPrompt = [role, systemPrompt, docContext].filter(Boolean).join('\n\n')

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SettingsSidebar
        selectedModel={selectedModel}
        role={role}
        systemPrompt={systemPrompt}
        settings={settings}
        documents={documents}
        onModelChange={handleModelChange}
        onRoleChange={setRole}
        onSystemPromptChange={setSystemPrompt}
        onSettingsChange={setSettings}
        onDocumentsChange={setDocuments}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-semibold text-base">Company AI Chatbot</h1>
            {selectedModel && (
              <p className="text-xs text-muted-foreground truncate max-w-xs">{selectedModel}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {selectedDocs.length > 0 && (
              <span className="bg-muted px-2 py-0.5 rounded-full">📄 {selectedDocs.length} doc{selectedDocs.length > 1 ? 's' : ''}</span>
            )}
            {capabilities.vision && <span className="bg-muted px-2 py-0.5 rounded-full">👁 Vision</span>}
            {capabilities.imageGeneration && (
              <span className="bg-muted px-2 py-0.5 rounded-full">🎨 Image Gen</span>
            )}
          </div>
        </header>

        <ChatInterface
          model={selectedModel}
          systemPrompt={effectiveSystemPrompt}
          settings={settings}
          capabilities={capabilities}
        />
      </main>
    </div>
  )
}
