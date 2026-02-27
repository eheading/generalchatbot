# Copilot Instructions — Company AI Chatbot

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

**Next.js 14 App Router** project. All routing is file-based under `app/`.

```
app/
  page.tsx               # Root page — holds all shared state (model, settings, systemPrompt)
  api/
    chat/route.ts         # POST — streams chat from OpenRouter (SSE)
    models/route.ts       # GET  — returns OpenRouter model list + capabilities
    prompts/route.ts      # GET/POST/DELETE — CRUD for data/prompts.json
    generate-image/route.ts # POST — calls OpenRouter image generation
components/
  SettingsSidebar.tsx     # Collapsible left panel composing the three setting panels
  ModelSelector.tsx       # Searchable dropdown populated from /api/models
  SystemPromptPanel.tsx   # Role + system prompt editor; save/load from /api/prompts
  LLMSettingsPanel.tsx    # Sliders for temperature, max_tokens, top_p, penalties
  ChatInterface.tsx       # Main chat window; handles streaming, image gen trigger
  MessageBubble.tsx       # Renders text (via react-markdown) or image content
  ImageUpload.tsx         # File picker for vision image attach (base64)
lib/
  types.ts         # All shared TypeScript types (Message, LLMSettings, SavedPrompt, etc.)
  openrouter.ts    # Server-side OpenRouter API client (streamChatCompletion, generateImage)
  models.ts        # fetchModels() + getModelCapabilities() capability detection
  prompts.ts       # File-based CRUD for data/prompts.json
data/
  prompts.json     # Company-wide saved system prompt presets (gitignored)
```

## Key Conventions

- **API key is server-only**: `OPENROUTER_API_KEY` is never exposed to the client. All OpenRouter calls go through `app/api/` routes.
- **Streaming**: The `/api/chat` route pipes the raw SSE stream from OpenRouter directly to the client. `ChatInterface.tsx` reads it line-by-line (`data: {...}`) and appends delta tokens to the streaming message.
- **Model capabilities**: `lib/models.ts:getModelCapabilities()` detects vision and image-gen support from the model ID and architecture metadata. This controls which UI elements (image upload button, 🎨 generate button) are shown.
- **Multimodal messages**: When an image is attached, the user message `content` is an array of `MessageContent` objects (`{type: 'image_url', image_url: {url: 'data:...;base64,...'}}`). Otherwise it's a plain string.
- **System prompt composition**: In `page.tsx`, `role` and `systemPrompt` are combined as `[role, systemPrompt].filter(Boolean).join('\n\n')` before being sent.
- **Saved prompts**: Stored as a JSON array in `data/prompts.json` on the server. Shared company-wide. The file is gitignored and auto-created by `lib/prompts.ts`.
- **UI library**: Shadcn/ui components live in `components/ui/`. Don't edit them directly — re-run `npx shadcn@latest add <component>` to update.

## Environment

```
OPENROUTER_API_KEY=   # Required. From https://openrouter.ai/keys
NEXT_PUBLIC_APP_URL=  # Optional. Sent as HTTP-Referer to OpenRouter
```
