# Company AI Chatbot

A general-purpose chatbot for exploring LLMs via [OpenRouter](https://openrouter.ai).

## Features

- **Model selector** — search and select any model available on OpenRouter, with vision/image-gen capability badges
- **System prompt & role** — configure a system prompt and role; save/load named presets (shared company-wide)
- **LLM settings** — temperature, max tokens, top P, frequency penalty, presence penalty
- **OCR / vision** — attach images as input to vision-capable models
- **Image generation** — generate images directly in chat with supported models
- **Streaming responses** — real-time token streaming with stop support

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your OpenRouter API key:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local`:
   ```
   OPENROUTER_API_KEY=your_key_here
   ```
   Get a key at [openrouter.ai/keys](https://openrouter.ai/keys).

3. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Saved Prompts

System prompt presets are stored in `data/prompts.json` on the server and shared across all users. The file is auto-created on first save.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Shadcn/ui + Tailwind CSS
- OpenRouter API
