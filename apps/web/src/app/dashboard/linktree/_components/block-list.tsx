"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, Trash2, Edit, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BlockType } from "@/types/blocks"
import { BlockTypeEnum, createDefaultBlockContent } from "@/lib/block-types"
import { BlockEditor } from "./block-editor"

interface BlockListProps {
  profileId: string
  blocks: Array<{
    id: string
    type: BlockType
    order: number
    content: any
  }>
  onBlocksChange: (blocks: any[]) => void
  onSave: (blocks: any[]) => void
  pages: Array<{
    id: string
    slug: string
    title: string
    content: string
    icon: string | null
  }>
}

const blockTypeLabels = {
  [BlockTypeEnum.LINK]: "Link Button",
  [BlockTypeEnum.SOCIAL]: "Social Icon",
  [BlockTypeEnum.PAGE]: "Page",
  [BlockTypeEnum.EXPAND]: "Expand/Accordion",
  [BlockTypeEnum.COPY_TEXT]: "Copy Text",
  [BlockTypeEnum.BUTTON]: "Button",
  [BlockTypeEnum.MARKDOWN]: "Markdown",
} as const

export function BlockList({ profileId, blocks, onBlocksChange, onSave, pages }: BlockListProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const handleAddBlock = (type: BlockType) => {
    const newBlock = {
      id: `temp-${Date.now()}`,
      type,
      order: blocks.length,
      content: createDefaultBlockContent(type),
    }
    const updatedBlocks = [...blocks, newBlock]
    onBlocksChange(updatedBlocks)
    setEditingBlockId(newBlock.id)
    setShowAddMenu(false)
  }

  const handleDeleteBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter((b) => b.id !== blockId).map((b, index) => ({ ...b, order: index }))
    onBlocksChange(updatedBlocks)
    onSave(updatedBlocks)
  }

  const handleMoveBlock = (blockId: string, direction: "up" | "down") => {
    const currentIndex = blocks.findIndex((b) => b.id === blockId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= blocks.length) return

    const updatedBlocks = [...blocks]
    ;[updatedBlocks[currentIndex], updatedBlocks[newIndex]] = [updatedBlocks[newIndex], updatedBlocks[currentIndex]]

    const reordered = updatedBlocks.map((b, index) => ({ ...b, order: index }))
    onBlocksChange(reordered)
    onSave(reordered)
  }

  const handleUpdateBlock = (blockId: string, updates: any) => {
    const updatedBlocks = blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
    onBlocksChange(updatedBlocks)
    onSave(updatedBlocks)
  }

  const editingBlock = editingBlockId ? blocks.find((b) => b.id === editingBlockId) : null

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Block Elements</CardTitle>
            <div className="relative">
              <Button size="sm" onClick={() => setShowAddMenu(!showAddMenu)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Block
              </Button>
              {showAddMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-popover p-1 shadow-md z-10">
                  <button
                    onClick={() => handleAddBlock(BlockTypeEnum.LINK)}
                    className="w-full px-2 py-1.5 text-left text-sm hover:bg-accent rounded-sm"
                  >
                    Link Button
                  </button>
                  <button
                    onClick={() => handleAddBlock(BlockTypeEnum.SOCIAL)}
                    className="w-full px-2 py-1.5 text-left text-sm hover:bg-accent rounded-sm"
                  >
                    Social Icon
                  </button>
                  <button
                    onClick={() => handleAddBlock(BlockTypeEnum.PAGE)}
                    className="w-full px-2 py-1.5 text-left text-sm hover:bg-accent rounded-sm"
                  >
                    Page
                  </button>
                  <button
                    onClick={() => handleAddBlock(BlockTypeEnum.EXPAND)}
                    className="w-full px-2 py-1.5 text-left text-sm hover:bg-accent rounded-sm"
                  >
                    Expand/Accordion
                  </button>
                  <button
                    onClick={() => handleAddBlock(BlockTypeEnum.COPY_TEXT)}
                    className="w-full px-2 py-1.5 text-left text-sm hover:bg-accent rounded-sm"
                  >
                    Copy Text
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {blocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No blocks yet</p>
              <p className="text-sm">Click "Add Block" to get started</p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div
                key={block.id}
                className={cn("group flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-accent")}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{blockTypeLabels[block.type]}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {block.content.title || block.content.text || block.content.label || "Untitled"}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveBlock(block.id, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveBlock(block.id, "down")}
                    disabled={index === blocks.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingBlockId(block.id)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteBlock(block.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {editingBlock && (
        <BlockEditor
          block={editingBlock}
          pages={pages}
          onClose={() => setEditingBlockId(null)}
          onSave={(updates) => {
            handleUpdateBlock(editingBlock.id, updates)
            setEditingBlockId(null)
          }}
        />
      )}
    </>
  )
}
