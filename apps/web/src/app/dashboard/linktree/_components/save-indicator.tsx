"use client"

import { CheckCircle2, Loader2 } from "lucide-react"
import type { SaveStatus } from "./linktree-editor"

interface SaveIndicatorProps {
  status: SaveStatus
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === "idle") return null

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-background px-4 py-2 shadow-lg border">
      {status === "saving" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm font-medium">Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">Saved</span>
        </>
      )}
    </div>
  )
}
