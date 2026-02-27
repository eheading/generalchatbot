'use client'

import { useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  onImageSelect: (base64: string, mimeType: string) => void
  disabled?: boolean
}

export default function ImageUpload({ onImageSelect, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        // dataUrl is "data:image/png;base64,<data>" — extract base64 part
        const base64 = dataUrl.split(',')[1]
        onImageSelect(base64, file.type)
      }
      reader.readAsDataURL(file)
    },
    [onImageSelect],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        title="Attach image (OCR / vision)"
        className="h-9 w-9 shrink-0"
      >
        📎
      </Button>
    </>
  )
}
