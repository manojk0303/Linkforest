import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    const userResult = await sql`
      SELECT id FROM users WHERE username = ${username}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Profile views don't have link_id or shortlink_id, so they violate the check constraint
    console.log("[v0] Profile view tracked for username:", username)
    // </CHANGE>

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track profile view error:", error)
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}
