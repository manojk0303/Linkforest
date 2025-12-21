import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { normalizeThemeSettings } from "@/lib/theme-settings"
import { LinktreeEditor } from "./_components/linktree-editor"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

export default async function LinktreePage({
  searchParams,
}: {
  searchParams: { profile?: string }
}) {
  const user = await requireAuth()

  const profiles = await prisma.profile.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      displayName: true,
      status: true,
    },
  })

  const selectedProfileId =
    searchParams.profile && profiles.some((p) => p.id === searchParams.profile) ? searchParams.profile : profiles[0]?.id

  if (!selectedProfileId) {
    return (
      <div className="space-y-8">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Linktree", href: "/dashboard/linktree" },
          ]}
        />
        <div className="text-center">
          <h2 className="text-2xl font-bold">No profile found</h2>
          <p className="text-muted-foreground">Create a profile from the dashboard first.</p>
        </div>
      </div>
    )
  }

  const profile = await prisma.profile.findFirst({
    where: { id: selectedProfileId, userId: user.id, deletedAt: null },
    include: {
      blocks: {
        where: { parentType: "PROFILE" },
        orderBy: { order: "asc" },
      },
      pages: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!profile) {
    return (
      <div className="space-y-8">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Linktree", href: "/dashboard/linktree" },
          ]}
        />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Profile not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <LinktreeEditor
        profile={{
          id: profile.id,
          slug: profile.slug,
          displayName: profile.displayName,
          bio: profile.bio,
          image: profile.image,
          themeSettings: normalizeThemeSettings(profile.themeSettings),
        }}
        initialBlocks={profile.blocks.map((block) => ({
          id: block.id,
          type: block.type,
          order: block.order,
          content: block.content as any,
          iconName: block.iconName,
          fontColor: block.fontColor,
          bgColor: block.bgColor,
        }))}
        pages={profile.pages.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          content: p.content,
          icon: p.icon,
        }))}
      />
    </div>
  )
}
