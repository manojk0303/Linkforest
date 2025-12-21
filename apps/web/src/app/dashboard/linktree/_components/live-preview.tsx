"use client"

import { Smartphone } from "lucide-react"
import type { BlockType } from "@/types/blocks"
import { BlockTypeEnum } from "@/lib/block-types"
import type { ThemeSettings } from "@/lib/theme-settings"

interface LivePreviewProps {
  profile: {
    displayName: string | null
    bio: string | null
    image: string | null
    themeSettings: ThemeSettings
  }
  blocks: Array<{
    id: string
    type: BlockType
    content: any
  }>
}

export function LivePreview({ profile, blocks }: LivePreviewProps) {
  const getBackgroundStyle = () => {
    const { themeSettings } = profile
    if (themeSettings.backgroundType === "gradient") {
      return {
        background: `linear-gradient(135deg, ${themeSettings.gradientStart || "#ffffff"}, ${themeSettings.gradientEnd || "#000000"})`,
      }
    }
    if (themeSettings.backgroundType === "image" && themeSettings.backgroundImage) {
      return {
        backgroundImage: `url(${themeSettings.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    }
    return {
      backgroundColor: themeSettings.backgroundColor || "#ffffff",
    }
  }

  const buttonStyle = {
    borderRadius: `${profile.themeSettings.buttonBorderRadius || 8}px`,
    backgroundColor: profile.themeSettings.buttonBackground || "#000000",
    color: profile.themeSettings.buttonTextColor || "#ffffff",
  }

  return (
    <div className="w-full max-w-[375px] sticky top-6">
      <div className="flex items-center justify-center mb-4 gap-2 text-muted-foreground">
        <Smartphone className="h-4 w-4" />
        <span className="text-sm font-medium">Live Preview</span>
      </div>

      <div className="relative mx-auto" style={{ width: "375px", height: "812px" }}>
        {/* iPhone Frame */}
        <div className="absolute inset-0 rounded-[3rem] bg-black p-3 shadow-2xl">
          <div className="relative h-full w-full overflow-hidden rounded-[2.5rem]" style={getBackgroundStyle()}>
            {/* Status Bar */}
            <div className="h-11 bg-black/20 backdrop-blur-sm" />

            {/* Content */}
            <div className="h-[calc(100%-2.75rem)] overflow-y-auto px-6 py-8">
              {/* Profile Section */}
              <div className="flex flex-col items-center text-center mb-8">
                {profile.image && (
                  <img
                    src={profile.image || "/placeholder.svg"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white shadow-lg"
                  />
                )}
                {profile.displayName && (
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.displayName}</h1>
                )}
                {profile.bio && <p className="text-sm text-gray-700 max-w-xs">{profile.bio}</p>}
              </div>

              {/* Blocks */}
              <div className="space-y-3">
                {blocks.map((block) => (
                  <div key={block.id}>
                    {block.type === BlockTypeEnum.LINK && (
                      <button
                        className="w-full px-6 py-4 text-center font-medium transition-transform hover:scale-105"
                        style={buttonStyle}
                      >
                        {block.content.title || "Untitled Link"}
                      </button>
                    )}
                    {block.type === BlockTypeEnum.SOCIAL && (
                      <button
                        className="w-full px-6 py-4 text-center font-medium transition-transform hover:scale-105"
                        style={buttonStyle}
                      >
                        {block.content.platform || "Social"} →
                      </button>
                    )}
                    {block.type === BlockTypeEnum.PAGE && (
                      <button
                        className="w-full px-6 py-4 text-center font-medium transition-transform hover:scale-105"
                        style={buttonStyle}
                      >
                        {block.content.title || "Page"} →
                      </button>
                    )}
                    {block.type === BlockTypeEnum.EXPAND && (
                      <button
                        className="w-full px-6 py-4 text-left font-medium transition-transform hover:scale-105"
                        style={buttonStyle}
                      >
                        {block.content.title || "Expand"} ▼
                      </button>
                    )}
                    {block.type === BlockTypeEnum.COPY_TEXT && (
                      <button
                        className="w-full px-6 py-4 text-center font-medium transition-transform hover:scale-105"
                        style={buttonStyle}
                      >
                        📋 {block.content.label || "Copy Text"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
