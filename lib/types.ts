export type MessageRole = 'user' | 'assistant' | 'system'

export interface MessageContent {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

export interface Message {
  id: string
  role: MessageRole
  content: string | MessageContent[]
  timestamp: number
  isStreaming?: boolean
}

export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length?: number
  pricing?: {
    prompt: string
    completion: string
  }
  architecture?: {
    modality?: string
    tokenizer?: string
  }
  top_provider?: {
    max_completion_tokens?: number
  }
}

export interface ModelCapabilities {
  vision: boolean
  imageGeneration: boolean
}

export interface SavedPrompt {
  id: string
  name: string
  role: string
  content: string
  createdAt: number
}

export interface LLMSettings {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
}

export interface ChatRequest {
  messages: { role: MessageRole; content: string | MessageContent[] }[]
  model: string
  systemPrompt?: string
  settings: LLMSettings
}
