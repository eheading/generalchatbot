import type { OpenRouterModel, ModelCapabilities } from './types'

// Models known to support image generation via OpenRouter
const IMAGE_GEN_MODEL_PREFIXES = [
  'openai/dall-e',
  'stability',
  'black-forest-labs',
  'ideogram',
  'google/imagen',
]

// Models known to support vision (image input)
const VISION_MODEL_PATTERNS = [
  'vision',
  'gpt-4o',
  'gpt-4-turbo',
  'claude-3',
  'claude-3-5',
  'gemini',
  'llava',
  'pixtral',
  'qwen-vl',
  'qwen2-vl',
  'mistral-pixtral',
]

export function getModelCapabilities(model: OpenRouterModel): ModelCapabilities {
  const id = model.id.toLowerCase()
  const modality = model.architecture?.modality?.toLowerCase() ?? ''

  const vision =
    modality.includes('image') ||
    VISION_MODEL_PATTERNS.some((p) => id.includes(p))

  const imageGeneration = IMAGE_GEN_MODEL_PREFIXES.some((p) => id.startsWith(p))

  return { vision, imageGeneration }
}

export async function fetchModels(): Promise<OpenRouterModel[]> {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    next: { revalidate: 3600 }, // cache 1 hour
  })
  if (!res.ok) throw new Error(`OpenRouter models fetch failed: ${res.status}`)
  const json = await res.json()
  return json.data as OpenRouterModel[]
}
