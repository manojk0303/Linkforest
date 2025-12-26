import { sql } from "./db"
import fetch from "node-fetch"

export interface DomainVerificationResult {
  verified: boolean
  records: {
    type: string
    name: string
    value: string
    found: boolean
  }[]
}

// Check if domain is available
export async function isDomainAvailable(domain: string): Promise<boolean> {
  const result = await sql`
    SELECT id FROM users WHERE custom_domain = ${domain} AND domain_verified = true
  `
  return result.length === 0
}

// Get user by custom domain
export async function getUserByDomain(domain: string): Promise<any | null> {
  const result = await sql`
    SELECT username FROM users WHERE custom_domain = ${domain} AND domain_verified = true
  `

  if (result.length === 0) {
    return null
  }

  return result[0]
}

// Verify domain DNS records
export async function verifyDomainDNS(domain: string): Promise<DomainVerificationResult> {
  try {
    const expectedCNAME = process.env.NEXT_PUBLIC_APP_DOMAIN || "linkforest.app"

    // Use Cloudflare's free DNS over HTTPS API for DNS resolution
    // This is completely free and doesn't require any API key
    const dnsUrl = `https://cloudflare-dns.com/dns-query?name=${domain}&type=CNAME`

    const response = await fetch(dnsUrl, {
      headers: {
        Accept: "application/dns-json",
      },
    })

    if (!response.ok) {
      console.error("[v0] DNS query failed:", response.status)
      return {
        verified: false,
        records: [
          {
            type: "CNAME",
            name: domain,
            value: expectedCNAME,
            found: false,
          },
        ],
      }
    }

    const data = await response.json()

    // Check if CNAME record exists and points to our domain
    let found = false
    if (data.Answer && Array.isArray(data.Answer)) {
      for (const answer of data.Answer) {
        if (answer.type === 5) {
          // Type 5 is CNAME
          const cnameValue = answer.data
          // Remove trailing dot if present
          const normalizedCname = cnameValue.endsWith(".") ? cnameValue.slice(0, -1) : cnameValue
          const normalizedExpected = expectedCNAME.endsWith(".") ? expectedCNAME.slice(0, -1) : expectedCNAME

          if (normalizedCname === normalizedExpected) {
            found = true
            break
          }
        }
      }
    }

    const records = [
      {
        type: "CNAME",
        name: domain,
        value: expectedCNAME,
        found,
      },
    ]

    return {
      verified: found,
      records,
    }
  } catch (error) {
    console.error("[v0] Domain verification error:", error)
    return {
      verified: false,
      records: [
        {
          type: "CNAME",
          name: domain,
          value: process.env.NEXT_PUBLIC_APP_DOMAIN || "linkforest.app",
          found: false,
        },
      ],
    }
  }
}

// Update domain verification status
export async function updateDomainVerification(userId: string, verified: boolean): Promise<void> {
  await sql`
    UPDATE users
    SET domain_verified = ${verified},
        updated_at = NOW()
    WHERE id = ${userId}
  `
}

export async function getUserBySubdomain(subdomain: string): Promise<any | null> {
  const result = await sql`
    SELECT username, id FROM users WHERE subdomain = ${subdomain}
  `

  if (result.length === 0) {
    return null
  }

  return result[0]
}

export async function updateUserSubdomain(userId: string, subdomain: string): Promise<void> {
  await sql`
    UPDATE users
    SET subdomain = ${subdomain},
        updated_at = NOW()
    WHERE id = ${userId}
  `
}
