import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function PUT(req: NextRequest, { params }: { params: { profileId: string } }) {
  try {
    const user = await requireAuth()
    const { profileId } = params

    const profile = await prisma.profile.findFirst({
      where: { id: profileId, userId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const { blocks } = await req.json()

    // Delete existing profile blocks
    await prisma.block.deleteMany({
      where: {
        profileId,
        parentType: "PROFILE",
      },
    })

    // Create new blocks
    await prisma.block.createMany({
      data: blocks.map((block: any) => ({
        id: block.id.startsWith("temp-") ? undefined : block.id,
        parentId: profileId,
        parentType: "PROFILE",
        profileId,
        type: block.type,
        order: block.order,
        content: block.content,
        iconName: block.iconName,
        fontColor: block.fontColor,
        bgColor: block.bgColor,
      })),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving blocks:", error)
    return NextResponse.json({ error: "Failed to save blocks" }, { status: 500 })
  }
}
