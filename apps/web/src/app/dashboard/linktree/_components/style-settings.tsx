"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { ThemeSettings } from "@/lib/theme-settings"

interface StyleSettingsProps {
  profile: {
    themeSettings: ThemeSettings
  }
  onChange: (profile: any) => void
}

export function StyleSettings({ profile, onChange }: StyleSettingsProps) {
  const handleThemeChange = (field: string, value: any) => {
    onChange({
      ...profile,
      themeSettings: { ...profile.themeSettings, [field]: value },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Button Styling (Global)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Border Radius</Label>
          <input
            type="range"
            value={profile.themeSettings.buttonBorderRadius || 8}
            onChange={(e) => handleThemeChange("buttonBorderRadius", Number.parseInt(e.target.value))}
            max={50}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">{profile.themeSettings.buttonBorderRadius || 8}px</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-bg">Button Background</Label>
          <div className="flex gap-2">
            <Input
              id="button-bg"
              type="color"
              value={profile.themeSettings.buttonBackground || "#000000"}
              onChange={(e) => handleThemeChange("buttonBackground", e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={profile.themeSettings.buttonBackground || "#000000"}
              onChange={(e) => handleThemeChange("buttonBackground", e.target.value)}
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-text">Button Text Color</Label>
          <div className="flex gap-2">
            <Input
              id="button-text"
              type="color"
              value={profile.themeSettings.buttonTextColor || "#ffffff"}
              onChange={(e) => handleThemeChange("buttonTextColor", e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={profile.themeSettings.buttonTextColor || "#ffffff"}
              onChange={(e) => handleThemeChange("buttonTextColor", e.target.value)}
              placeholder="#ffffff"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
