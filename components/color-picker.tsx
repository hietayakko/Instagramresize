"use client"

import type React from "react"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  id?: string
}

export default function ColorPicker({ color, onChange, id }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(color)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (/^#([0-9A-F]{3}){1,2}$/i.test(e.target.value)) {
      onChange(e.target.value)
    }
  }

  const presetColors = [
    "#ffffff", // 白
    "#000000", // 黒
    "#f8fafc", // スレート 50
    "#f1f5f9", // スレート 100
    "#e2e8f0", // スレート 200
    "#cbd5e1", // スレート 300
    "#94a3b8", // スレート 400
    "#64748b", // スレート 500
    "#475569", // スレート 600
    "#334155", // スレート 700
    "#1e293b", // スレート 800
    "#0f172a", // スレート 900
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" className="w-full justify-start text-left font-normal h-12">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded border" style={{ backgroundColor: color }} />
            <span>{color}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                className={cn(
                  "h-8 w-8 rounded-md border border-muted",
                  color === presetColor && "ring-2 ring-primary ring-offset-2",
                )}
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor)
                  setInputValue(presetColor)
                }}
                type="button"
                title={presetColor}
              />
            ))}
          </div>
          <div className="space-y-1">
            <Label htmlFor="color-input">カスタムカラー</Label>
            <div className="flex gap-2">
              <div className="h-10 w-10 rounded border" style={{ backgroundColor: inputValue }} />
              <Input
                id="color-input"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="#ffffff"
                className="flex-1 h-10"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
