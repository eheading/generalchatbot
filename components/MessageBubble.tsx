'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Message, MessageContent } from '@/lib/types'

interface MessageBubbleProps {
  message: Message
}

function renderContent(content: string | MessageContent[]) {
  if (typeof content === 'string') {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const inline = !match
            return inline ? (
              <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="rounded-md text-sm my-2"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>
          },
          ul({ children }) {
            return <ul className="list-disc pl-4 mb-2">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal pl-4 mb-2">{children}</ol>
          },
          blockquote({ children }) {
            return <blockquote className="border-l-2 pl-3 text-muted-foreground italic">{children}</blockquote>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  // Array content (multimodal)
  return content.map((part, i) => {
    if (part.type === 'text' && part.text) {
      return <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
    }
    if (part.type === 'image_url' && part.image_url) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={part.image_url.url}
          alt="Uploaded image"
          className="max-w-full rounded-md mt-2 max-h-64 object-contain"
        />
      )
    }
    return null
  })
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        } ${message.isStreaming ? 'animate-pulse' : ''}`}
      >
        {renderContent(message.content)}
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  )
}
