"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import type { BlockType } from "@/types/blocks"
import { BlockTypeEnum } from "@/lib/block-types"

interface BlockEditorProps {
  block: {
    id: string
    type: BlockType
    content: any
  }
  pages: Array<{
    id: string
    title: string
    slug: string
  }>
  onClose: () => void
  onSave: (updates: any) => void
}

export function BlockEditor({ block, pages, onClose, onSave }: BlockEditorProps) {
  const [content, setContent] = useState(block.content)

  const handleSave = () => {
    onSave({ content })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Block</DialogTitle>
          <DialogDescription>Customize your block content</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Link Button */}
          {block.type === BlockTypeEnum.LINK && (
            <>
              <div className="space-y-2">
                <Label htmlFor="link-title">Title</Label>
                <Input
                  id="link-title"
                  value={content.title || ""}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                  placeholder="My Website"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={content.url || ""}
                  onChange={(e) => setContent({ ...content, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </>
          )}

          {/* Social Icon */}
          {block.type === BlockTypeEnum.SOCIAL && (
            <>
              <div className="space-y-2">
                <Label htmlFor="social-platform">Platform</Label>
                <Select
                  value={content.platform || "twitter"}
                  onValueChange={(value) => setContent({ ...content, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="social-url">URL</Label>
                <Input
                  id="social-url"
                  value={content.url || ""}
                  onChange={(e) => setContent({ ...content, url: e.target.value })}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </>
          )}

          {/* Page Block */}
          {block.type === BlockTypeEnum.PAGE && (
            <>
              <div className="space-y-2">
                <Label htmlFor="page-title">Title</Label>
                <Input
                  id="page-title"
                  value={content.title || ""}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                  placeholder="About Me"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-content">Content (Markdown)</Label>
                <Textarea
                  id="page-content"
                  value={content.markdown || ""}
                  onChange={(e) => setContent({ ...content, markdown: e.target.value })}
                  placeholder="# About Me\n\nWrite your content here..."
                  rows={8}
                />
              </div>
            </>
          )}

          {/* Expand Block */}
          {block.type === BlockTypeEnum.EXPAND && (
            <>
              <div className="space-y-2">
                <Label htmlFor="expand-title">Title</Label>
                <Input
                  id="expand-title"
                  value={content.title || ""}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expand-content">Content</Label>
                <Textarea
                  id="expand-content"
                  value={content.markdown || ""}
                  onChange={(e) => setContent({ ...content, markdown: e.target.value })}
                  placeholder="This content will show when expanded..."
                  rows={6}
                />
              </div>
            </>
          )}

          {/* Copy Text Block */}
          {block.type === BlockTypeEnum.COPY_TEXT && (
            <>
              <div className="space-y-2">
                <Label htmlFor="copy-text">Text to Copy</Label>
                <Input
                  id="copy-text"
                  value={content.text || ""}
                  onChange={(e) => setContent({ ...content, text: e.target.value })}
                  placeholder="hello@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copy-label">Label (Optional)</Label>
                <Input
                  id="copy-label"
                  value={content.label || ""}
                  onChange={(e) => setContent({ ...content, label: e.target.value })}
                  placeholder="Email Address"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
