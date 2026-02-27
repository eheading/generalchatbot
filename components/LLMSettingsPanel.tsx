'use client'

import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import type { LLMSettings } from '@/lib/types'

interface LLMSettingsPanelProps {
  settings: LLMSettings
  onSettingsChange: (settings: LLMSettings) => void
}

interface SettingRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (val: number) => void
}

function SettingRow({ label, value, min, max, step, onChange }: SettingRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v) && v >= min && v <= max) onChange(v)
          }}
          className="h-6 w-16 text-xs text-right px-1"
        />
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  )
}

export default function LLMSettingsPanel({ settings, onSettingsChange }: LLMSettingsPanelProps) {
  const update = (key: keyof LLMSettings) => (val: number) =>
    onSettingsChange({ ...settings, [key]: val })

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">LLM Settings</label>

      <SettingRow
        label="Temperature"
        value={settings.temperature}
        min={0}
        max={2}
        step={0.01}
        onChange={update('temperature')}
      />
      <SettingRow
        label="Max Tokens"
        value={settings.maxTokens}
        min={1}
        max={32000}
        step={1}
        onChange={update('maxTokens')}
      />
      <SettingRow
        label="Top P"
        value={settings.topP}
        min={0}
        max={1}
        step={0.01}
        onChange={update('topP')}
      />
      <SettingRow
        label="Frequency Penalty"
        value={settings.frequencyPenalty}
        min={-2}
        max={2}
        step={0.01}
        onChange={update('frequencyPenalty')}
      />
      <SettingRow
        label="Presence Penalty"
        value={settings.presencePenalty}
        min={-2}
        max={2}
        step={0.01}
        onChange={update('presencePenalty')}
      />
    </div>
  )
}
