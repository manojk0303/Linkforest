"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import type { ThemeSettings } from "@/lib/theme-settings"

interface ProfileSettingsProps {
  profile: {
    displayName: string | null
    bio: string | null
    image: string | null
    themeSettings: ThemeSettings
  }
  onChange: (profile: any) => void
}

export function ProfileSettings({ profile, onChange }: ProfileSettingsProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...profile, [field]: value })
  }

  const handleThemeChange = (field: string, value: any) => {
    onChange({
      ...profile,
      themeSettings: { ...profile.themeSettings, [field]: value },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile-image">Profile Image</Label>
          <div className="flex items-center gap-4">
            {profile.image && (
              <img
                src={profile.image || "/placeholder.svg"}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
          <Input
            id="profile-image"
            type="url"
            value={profile.image || ""}
            onChange={(e) => handleChange("image", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            value={profile.displayName || ""}
            onChange={(e) => handleChange("displayName", e.target.value)}
            placeholder="Your Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell people about yourself..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Background Style</Label>
          <Select
            value={profile.themeSettings.backgroundType || "solid"}
            onValueChange={(value) => handleThemeChange("backgroundType", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid Color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {profile.themeSettings.backgroundType === "solid" && (
          <div className="space-y-2">
            <Label htmlFor="bg-color">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={profile.themeSettings.backgroundColor || "#ffffff"}
                onChange={(e) => handleThemeChange("backgroundColor", e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={profile.themeSettings.backgroundColor || "#ffffff"}
                onChange={(e) => handleThemeChange("backgroundColor", e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
        )}

        {profile.themeSettings.backgroundType === "gradient" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="gradient-start">Gradient Start Color</Label>
              <div className="flex gap-2">
                <Input
                  id="gradient-start"
                  type="color"
                  value={profile.themeSettings.gradientStart || "#ffffff"}
                  onChange={(e) => handleThemeChange("gradientStart", e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={profile.themeSettings.gradientStart || "#ffffff"}
                  onChange={(e) => handleThemeChange("gradientStart", e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradient-end">Gradient End Color</Label>
              <div className="flex gap-2">
                <Input
                  id="gradient-end"
                  type="color"
                  value={profile.themeSettings.gradientEnd || "#000000"}
                  onChange={(e) => handleThemeChange("gradientEnd", e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={profile.themeSettings.gradientEnd || "#000000"}
                  onChange={(e) => handleThemeChange("gradientEnd", e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </>
        )}

        {profile.themeSettings.backgroundType === "image" && (
          <div className="space-y-2">
            <Label htmlFor="bg-image">Background Image URL</Label>
            <Input
              id="bg-image"
              type="url"
              value={profile.themeSettings.backgroundImage || ""}
              onChange={(e) => handleThemeChange("backgroundImage", e.target.value)}
              placeholder="https://example.com/background.jpg"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Font Family</Label>
          <Select
            value={profile.themeSettings.fontFamily || "inter"}
            onValueChange={(value) => handleThemeChange("fontFamily", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="poppins">Poppins</SelectItem>
              <SelectItem value="montserrat">Montserrat</SelectItem>
              <SelectItem value="playfair">Playfair Display</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
