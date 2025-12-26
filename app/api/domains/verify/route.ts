import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { verifyDomainDNS, updateDomainVerification } from "@/lib/domains"
import { withRateLimit } from "@/lib/middleware"
import { isProTier } from "@/lib/subscription"

async function verifyDomainHandler(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isProTier(user.subscription_tier)) {
      return NextResponse.json({ error: "Custom domain requires Pro subscription" }, { status: 403 })
    }

    if (!user.custom_domain) {
      return NextResponse.json({ error: "No custom domain configured" }, { status: 400 })
    }

    const verification = await verifyDomainDNS(user.custom_domain)

    if (verification.verified) {
      await updateDomainVerification(user.id, true)
    }

    return NextResponse.json({ verification })
  } catch (error) {
    console.error("[v0] Domain verification error:", error)
    return NextResponse.json({ error: "Failed to verify domain" }, { status: 500 })
  }
}

export const POST = withRateLimit(verifyDomainHandler, { max: 10 })
