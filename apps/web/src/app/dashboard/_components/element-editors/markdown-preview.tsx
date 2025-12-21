'use client';

import type { Block } from '@/types/blocks';
import { BlockRenderer } from '@/components/block-renderer';

export function MarkdownPreview({ block }: { block: Block }) {
  return <BlockRenderer block={block} isPreview isInteractive={false} />;
}
