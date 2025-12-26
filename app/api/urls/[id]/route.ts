import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { deleteShortenedUrl } from "@/lib/url-shortener"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await deleteShortenedUrl(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete URL error:", error)
    return NextResponse.json({ error: "Failed to delete URL" }, { status: 500 })
  }
}
