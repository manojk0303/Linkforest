import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { normalizeThemeSettings } from '@/lib/theme-settings';
import { createDefaultBlockContent } from '@/lib/block-types';
import { PageViewTracker } from '@/components/page-view-tracker';
import { BlockRenderer } from '@/components/block-renderer';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Block as UiBlock, BlockContent, BlockParentType, BlockType } from '@/types/blocks';

export const dynamic = 'force-dynamic';

function resolveLucideIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  const Icon = (LucideIcons as Record<string, unknown>)[name];
  return typeof Icon === 'function' ? (Icon as LucideIcon) : null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; pageSlug: string };
}): Promise<Metadata> {
  const page = await prisma.page.findFirst({
    where: {
      slug: params.pageSlug,
      isPublished: true,
      profile: {
        slug: params.slug,
        deletedAt: null,
        status: 'ACTIVE',
      },
    },
    include: {
      profile: {
        select: { displayName: true, slug: true },
      },
    },
  });

  if (!page) {
    return {
      title: 'Page not found',
      robots: { index: false, follow: false },
    };
  }

  const title = `${page.title} - ${page.profile.displayName || '@' + page.profile.slug}`;

  return {
    title,
    description: `Read ${page.title} on ${page.profile.displayName || '@' + page.profile.slug}'s profile`,
    alternates: {
      canonical: `/${page.profile.slug}/${page.slug}`,
    },
  };
}

export default async function PagePage({ params }: { params: { slug: string; pageSlug: string } }) {
  const page = await prisma.page.findFirst({
    where: {
      slug: params.pageSlug,
      isPublished: true,
      profile: {
        slug: params.slug,
        deletedAt: null,
        status: 'ACTIVE',
      },
    },
    include: {
      profile: {
        select: {
          slug: true,
          displayName: true,
          bio: true,
          image: true,
          themeSettings: true,
        },
      },
      blocks: {
        where: { parentType: 'PAGE' },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!page) {
    notFound();
  }

  const theme = normalizeThemeSettings(page.profile.themeSettings);
  const PageIcon = resolveLucideIcon(page.icon);

  const blocks: UiBlock[] = page.blocks.map((block) => {
    const content =
      block.content && typeof block.content === 'object'
        ? (block.content as unknown as BlockContent)
        : createDefaultBlockContent(block.type as unknown as BlockType);

    return {
      id: block.id,
      type: block.type as unknown as BlockType,
      order: block.order,
      parentId: block.parentId,
      parentType: block.parentType as unknown as BlockParentType,
      profileId: block.profileId,
      pageId: block.pageId,
      iconName: block.iconName,
      fontColor: block.fontColor,
      bgColor: block.bgColor,
      content,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
      page: null,
    };
  });

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: 'var(--font-outfit)',
      }}
    >
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <Link
            href={`/${page.profile.slug}`}
            className="inline-flex items-center text-sm transition-opacity hover:opacity-80"
            style={{ color: theme.textColor }}
          >
            ← Back to {page.profile.displayName || page.profile.slug}
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold" style={{ color: theme.textColor }}>
            {PageIcon ? <PageIcon className="mr-3 inline h-8 w-8" /> : null}
            {page.title}
          </h1>
        </div>

        {/* Render blocks */}
        <div className="space-y-6">
          {page.blocks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-xl" style={{ color: theme.textColor }}>
                This page is currently empty
              </p>
              <p style={{ color: theme.textColor, opacity: 0.7 }}>
                No content has been added to this page yet.
              </p>
            </div>
          ) : (
            blocks.map((block) => <BlockRenderer key={block.id} block={block} />)
          )}
        </div>
      </main>

      {/* Track page view */}
      <PageViewTracker pageId={page.id} />
    </div>
  );
}
