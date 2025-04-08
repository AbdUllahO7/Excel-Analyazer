"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [value, setValue] = useState(color || "#000000")

  useEffect(() => {
    setValue(color)
  }, [color])

  const handleChange = (newColor: string) => {
    setValue(newColor)
    onChange(newColor)
  }

  const presetColors = [
    "#FF6B6B",
    "#4CAF50",
    "#2196F3",
    "#FFC107",
    "#9C27B0",
    "#FF5722",
    "#607D8B",
    "#795548",
    "#8BC34A",
    "#673AB7",
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: value }} />
            <span>{value}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Pick a color</Label>
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: value }} />
              <Input value={value} onChange={(e) => handleChange(e.target.value)} className="flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Presets</Label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className="h-6 w-6 rounded-md border"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleChange(presetColor)}
                  type="button"
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="color-picker">Custom</Label>
            <Input
              id="color-picker"
              type="color"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              className="h-10 w-full p-1"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
