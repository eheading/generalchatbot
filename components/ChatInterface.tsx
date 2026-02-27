'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { generateId } from '@/lib/utils'
import MessageBubble from './MessageBubble'
import ImageUpload from './ImageUpload'
import type { Message, LLMSettings, MessageContent, ModelCapabilities } from '@/lib/types'

interface ChatInterfaceProps {
  model: string
  systemPrompt: string
  settings: LLMSettings
  capabilities: ModelCapabilities
}

export default function ChatInterface({
  model,
  systemPrompt,
  settings,
  capabilities,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [pendingImage, setPendingImage] = useState<{ base64: string; mimeType: string } | null>(null)
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Scroll to bottom when messages update
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  const handleImageSelect = useCallback((base64: string, mimeType: string) => {
    setPendingImage({ base64, mimeType })
  }, [])

  const handleSend = async () => {
    const text = input.trim()
    if ((!text && !pendingImage) || !model || streaming) return

    let userContent: string | MessageContent[]
    if (pendingImage) {
      const parts: MessageContent[] = []
      if (text) parts.push({ type: 'text', text })
      parts.push({
        type: 'image_url',
        image_url: { url: `data:${pendingImage.mimeType};base64,${pendingImage.base64}` },
      })
      userContent = parts
    } else {
      userContent = text
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: userContent,
      timestamp: Date.now(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setPendingImage(null)
    setStreaming(true)

    const assistantId = generateId()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true },
    ])

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model,
          systemPrompt: systemPrompt || undefined,
          settings,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content ?? ''
            if (delta) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: (m.content as string) + delta } : m,
                ),
              )
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${(e as Error).message}`, isStreaming: false }
            : m,
        ),
      )
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
      )
      setStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setStreaming(false)
  }

  const handleClear = () => {
    abortRef.current?.abort()
    setMessages([])
    setStreaming(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm mt-20">
            {model ? 'Start a conversation…' : 'Select a model to begin'}
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div className="h-2" />
      </div>

      {/* Input area */}
      <div className="border-t bg-background p-4 space-y-2 shrink-0">
        {pendingImage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>🖼 Image attached</span>
            <button
              onClick={() => setPendingImage(null)}
              className="text-destructive hover:underline text-xs"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {capabilities.vision && (
            <ImageUpload onImageSelect={handleImageSelect} disabled={streaming} />
          )}

          <Textarea
            placeholder={
              !model
                ? 'Select a model first…'
                : capabilities.vision
                ? 'Message… (attach an image for OCR/vision)'
                : 'Message… (Shift+Enter for newline)'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!model || streaming}
            className="flex-1 min-h-[44px] max-h-[200px] resize-none text-sm"
            rows={1}
          />

          {streaming ? (
            <Button variant="destructive" size="sm" onClick={handleStop} className="shrink-0">
              Stop
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!model || (!input.trim() && !pendingImage)}
              className="shrink-0"
            >
              Send
            </Button>
          )}
        </div>

        {messages.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear chat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
