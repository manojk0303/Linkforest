"use client"

import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "use-debounce"
import { toast } from "@/hooks/use-toast"
import { ProfileSettings } from "./profile-settings"
import { BlockList } from "./block-list"
import { StyleSettings } from "./style-settings"
import { LivePreview } from "./live-preview"
import { SaveIndicator } from "./save-indicator"

import type { BlockType } from "@/types/blocks"
import type { ThemeSettings } from "@/lib/theme-settings"

interface LinktreeEditorProps {
  profile: {
    id: string
    slug: string
    displayName: string | null
    bio: string | null
    image: string | null
    themeSettings: ThemeSettings
  }
  initialBlocks: Array<{
    id: string
    type: BlockType
    order: number
    content: any
    iconName?: string | null
    fontColor?: string | null
    bgColor?: string | null
  }>
  pages: Array<{
    id: string
    slug: string
    title: string
    content: string
    icon: string | null
  }>
}

export type SaveStatus = "idle" | "saving" | "saved"

export function LinktreeEditor({ profile: initialProfile, initialBlocks, pages }: LinktreeEditorProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [blocks, setBlocks] = useState(initialBlocks)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")

  // Debounce profile changes for auto-save
  const [debouncedProfile] = useDebounce(profile, 1000)

  // Auto-save profile
  useEffect(() => {
    if (debouncedProfile && debouncedProfile !== initialProfile) {
      saveProfile(debouncedProfile)
    }
  }, [debouncedProfile])

  const saveProfile = useCallback(async (profileData: typeof profile) => {
    setSaveStatus("saving")
    try {
      const response = await fetch(`/api/profiles/${profileData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: profileData.displayName,
          bio: profileData.bio,
          image: profileData.image,
          themeSettings: profileData.themeSettings,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save profile")
      }

      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      console.error("[v0] Save profile error:", error)
      toast({
        title: "Save failed",
        description: "Could not save profile changes",
        variant: "destructive",
      })
      setSaveStatus("idle")
    }
  }, [])

  const saveBlocks = useCallback(
    async (blocksData: typeof blocks) => {
      setSaveStatus("saving")
      try {
        const response = await fetch(`/api/profiles/${profile.id}/blocks`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blocks: blocksData }),
        })

        if (!response.ok) {
          throw new Error("Failed to save blocks")
        }

        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 2000)
      } catch (error) {
        console.error("[v0] Save blocks error:", error)
        toast({
          title: "Save failed",
          description: "Could not save blocks",
          variant: "destructive",
        })
        setSaveStatus("idle")
      }
    },
    [profile.id],
  )

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-2 gap-0">
      {/* Left Panel - Editor */}
      <div className="flex flex-col h-full overflow-y-auto border-r bg-background p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Your Linktree</h1>
          <p className="text-muted-foreground text-sm">Customize your profile and manage your blocks</p>
        </div>

        <ProfileSettings profile={profile} onChange={setProfile} />

        <BlockList
          profileId={profile.id}
          blocks={blocks}
          onBlocksChange={setBlocks}
          onSave={saveBlocks}
          pages={pages}
        />

        <StyleSettings profile={profile} onChange={setProfile} />
      </div>

      {/* Right Panel - Live Preview */}
      <div className="hidden lg:flex flex-col h-full items-center justify-start bg-muted/30 p-6 overflow-y-auto">
        <LivePreview profile={profile} blocks={blocks} />
      </div>

      {/* Save Status Indicator */}
      <SaveIndicator status={saveStatus} />
    </div>
  )
}
