'use client'

import { useState } from 'react'
import SettingsSidebar from '@/components/SettingsSidebar'
import ChatInterface from '@/components/ChatInterface'
import type { LLMSettings, ModelCapabilities } from '@/lib/types'
import { DEFAULT_LLM_SETTINGS } from '@/lib/types'

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('')
  const [capabilities, setCapabilities] = useState<ModelCapabilities>({
    vision: false,
    imageGeneration: false,
  })
  const [role, setRole] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [settings, setSettings] = useState<LLMSettings>(DEFAULT_LLM_SETTINGS)

  const handleModelChange = (modelId: string, caps: ModelCapabilities) => {
    setSelectedModel(modelId)
    setCapabilities(caps)
  }

  // Build effective system prompt combining role + prompt
  const effectiveSystemPrompt = [role, systemPrompt].filter(Boolean).join('\n\n')

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SettingsSidebar
        selectedModel={selectedModel}
        role={role}
        systemPrompt={systemPrompt}
        settings={settings}
        onModelChange={handleModelChange}
        onRoleChange={setRole}
        onSystemPromptChange={setSystemPrompt}
        onSettingsChange={setSettings}
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
