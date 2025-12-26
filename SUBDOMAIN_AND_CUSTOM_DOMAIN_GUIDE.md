# Complete Guide: Subdomains & Custom Domains in LinkForest

## Overview

LinkForest supports three types of URLs for accessing user profiles:

1. **Subdomain** (Free): `username.linkfo.rest` - Automatically created when user signs up
2. **Main Domain** (N/A for profiles): `linkfo.rest/username` - NOT SUPPORTED (profiles only on subdomains)
3. **Custom Domain** (Pro): `your-domain.com` - User brings their own domain

## URL Structure

LinkForest uses a clean routing system that separates profiles from short links:

- **Profile Pages**: `username.linkfo.rest/` → `/[username]/page.tsx`
- **Short Links**: 
  - On subdomain: `username.linkfo.rest/abc123` → `/l/[slug]/route.ts`
  - On main domain: `linkfo.rest/abc123` → `/l/[slug]/route.ts`

This structure eliminates routing conflicts and makes the system more maintainable.

## How Subdomains Work

### Automatic Creation

When a user signs up with username "katani", the system automatically:

```sql
INSERT INTO users (username, subdomain, ...) 
VALUES ('katani', 'katani', ...);
```

The `subdomain` field is ALWAYS the lowercase version of the username.

### DNS Configuration

**For Production (Vercel):**

You MUST configure wildcard DNS in your domain settings:

1. Go to your DNS provider (e.g., Cloudflare, Namecheap)
2. Add a CNAME record:
   ```
   Host: *.linkfo.rest
   Value: cname.vercel-dns.com
   ```
3. This allows `any-username.linkfo.rest` to route to your Vercel deployment

**In Vercel Project Settings:**

1. Go to Project Settings → Domains
2. Add domain: `linkfo.rest` (main domain)
3. Add domain: `*.linkfo.rest` (wildcard subdomain)
4. Vercel will automatically provision SSL certificates

### How Routing Works

**Request**: `https://katani.linkfo.rest/`

1. **DNS Resolution**: `*.linkfo.rest` CNAME → Vercel
2. **Middleware (`proxy.ts`)**:
   - Parses hostname: `{ isUserSubdomain: true, subdomain: 'katani' }`
   - Queries database: `SELECT username FROM users WHERE subdomain = 'katani'`
   - If found: Rewrites to `/${username}` (served by `/[username]/page.tsx`)
   - If not found: Returns 404
3. **Next.js Router**: Serves `/app/[username]/page.tsx`
4. **Profile Page**: Fetches user data and renders public profile

**Request**: `https://katani.linkfo.rest/abc123` (short link)

1. **DNS Resolution**: `*.linkfo.rest` CNAME → Vercel
2. **Middleware (`proxy.ts`)**:
   - Detects single-segment path
   - Rewrites to `/l/abc123?subdomain=katani`
3. **Next.js Router**: Serves `/app/l/[slug]/route.ts`
4. **Short Link Handler**: 
   - Queries database for short code "abc123" owned by "katani"
   - If found: Redirects to original URL
   - If not found: Returns 404

### Troubleshooting Subdomains

**Issue 1: "Profile not found" on subdomain**

```sql
-- Check if user exists and has subdomain
SELECT username, subdomain FROM users WHERE username = 'katani';

-- If subdomain is NULL, fix it:
UPDATE users SET subdomain = LOWER(username) WHERE username = 'katani';
```

**Issue 2: Subdomain shows homepage instead of profile**

- Check Vercel logs for middleware errors
- Verify `NEXT_PUBLIC_APP_DOMAIN=linkfo.rest` is set
- Confirm wildcard domain `*.linkfo.rest` is added in Vercel

**Issue 3: SSL certificate error**

- Vercel automatically provisions SSL for wildcard domains
- Wait 5-10 minutes after adding the domain
- Check Vercel dashboard for certificate status

**Issue 4: Subdomain returns 404**

Run the diagnostic script:
```bash
psql $DATABASE_URL -f scripts/check-subdomains.sql
```

This will:
- Check if subdomain column exists
- Count users with missing subdomains
- Automatically populate missing subdomains

## How Custom Domains Work

Custom domains allow Pro users to access their profile at their own domain instead of a subdomain.

### User Setup Flow

**Step 1: User Saves Custom Domain**

In the LinkForest dashboard:
1. User enters domain: `my-site.com` or `links.my-site.com`
2. System saves to database: `UPDATE users SET custom_domain = 'my-site.com' WHERE id = ?`
3. `domain_verified` is set to `false` initially

**Step 2: DNS Instructions**

User must add a CNAME record in their DNS settings:

```
Host: my-site.com (or links.my-site.com)
Value: linkfo.rest (or cname.vercel-dns.com)
TTL: 3600
```

**Step 3: Domain Verification**

LinkForest uses **Cloudflare's free DNS-over-HTTPS API** (no API key required!) to verify:

```typescript
// In lib/domains.ts
const dnsUrl = `https://cloudflare-dns.com/dns-query?name=${domain}&type=CNAME`
const response = await fetch(dnsUrl, {
  headers: { Accept: "application/dns-json" }
})
```

If CNAME points to `linkfo.rest`, the system updates:
```sql
UPDATE users SET domain_verified = true WHERE id = ?
```

**Step 4: Add Domain to Vercel**

**IMPORTANT**: Custom domains MUST be manually added in Vercel:

1. Go to Vercel Project Settings → Domains
2. Click "Add Domain"
3. Enter the user's custom domain (e.g., `my-site.com`)
4. Vercel will provision SSL certificate

**Alternatively**, use the Vercel API to automate this:
```bash
curl -X POST "https://api.vercel.com/v10/projects/${PROJECT_ID}/domains" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -d '{"name": "my-site.com"}'
```

### How Custom Domain Routing Works

**Request**: `https://my-site.com/`

1. **DNS Resolution**: `my-site.com` CNAME → Vercel
2. **Middleware (`proxy.ts`)**:
   - Parses hostname: `{ isMainDomain: false, isUserSubdomain: false }`
   - Queries database: `SELECT username FROM users WHERE custom_domain = 'my-site.com' AND domain_verified = true`
   - If found: Rewrites to `/${username}?customDomain=my-site.com`
   - If not found: Returns 404
3. **Next.js Router**: Serves `/app/[username]/page.tsx`
4. **Profile Page**: Renders user's public profile

**Request**: `https://my-site.com/abc123` (short link on custom domain)

1. **DNS Resolution**: `my-site.com` CNAME → Vercel
2. **Middleware (`proxy.ts`)**:
   - Detects custom domain + single-segment path
   - Rewrites to `/l/abc123?customDomain=my-site.com`
3. **Next.js Router**: Serves `/app/l/[slug]/route.ts`
4. **Short Link Handler**: Queries database and redirects

### Custom Domain Requirements

- User MUST have Pro subscription (`subscription_tier = 'pro'`)
- Domain MUST have CNAME pointing to `linkfo.rest`
- Domain MUST be verified (`domain_verified = true`)
- Domain MUST be added to Vercel project

### Troubleshooting Custom Domains

**Issue 1: Domain not working after DNS setup**

```sql
-- Check verification status
SELECT username, custom_domain, domain_verified FROM users WHERE id = 'user-id';

-- Manually verify:
-- 1. Check DNS: dig my-site.com
-- 2. Run verification API: POST /api/domains/verify
```

**Issue 2: "Domain not found" error**

- Verify domain is added in Vercel Project Settings
- Check Vercel logs for routing errors
- Confirm CNAME record propagation (use https://dnschecker.org)

**Issue 3: SSL error on custom domain**

- Vercel provisions SSL automatically (takes 5-10 minutes)
- Ensure domain is added in Vercel dashboard
- Check domain status in Vercel for certificate errors

## Subdomain vs Custom Domain Comparison

| Feature | Subdomain (Free) | Custom Domain (Pro) |
|---------|------------------|---------------------|
| URL Format | `username.linkfo.rest` | `your-domain.com` |
| Setup Required | Automatic | Manual DNS setup |
| Cost | Free | Pro plan required |
| SSL Certificate | Auto (Vercel) | Auto (Vercel) |
| Branding | LinkForest branded | Fully custom |
| Verification | None | DNS CNAME required |
| Vercel Setup | Wildcard covers all | Each domain added individually |

## Implementation Checklist

### For Subdomains (Automatic)

- [x] `subdomain` column in users table
- [x] Wildcard domain `*.linkfo.rest` added to Vercel
- [x] Middleware detects and routes subdomains
- [x] Auto-populate subdomain on user signup
- [x] Script to fix missing subdomains: `check-subdomains.sql`

### For Custom Domains (Manual)

- [x] `custom_domain` and `domain_verified` columns in users table
- [x] Domain verification API using Cloudflare DNS-over-HTTPS
- [x] Middleware routes verified custom domains
- [x] UI component for users to manage custom domain
- [x] Pro subscription tier check
- [ ] Automated Vercel domain addition (requires API integration)

## Why Profiles Don't Work on Main Domain

**Request**: `https://linkfo.rest/katani`

**Design Decision**: Profiles are ONLY accessible via subdomains (`katani.linkfo.rest`) to:
1. Keep short links clean on the main domain
2. Avoid routing conflicts between profiles and short links
3. Provide clear branding separation (Bitly vs Linktree functionality)

The middleware explicitly returns 404 for profile paths on the main domain.

## Code References

| Feature | File | Function |
|---------|------|----------|
| Subdomain detection | `lib/constants.ts` | `parseHostname()` |
| Middleware routing | `proxy.ts` | `proxy()` |
| Domain verification | `lib/domains.ts` | `verifyDomainDNS()` |
| Profile rendering | `app/[username]/page.tsx` | `ProfilePage` |
| Short link handler | `app/l/[slug]/route.ts` | `GET` |
| Custom domain UI | `components/custom-domain-settings.tsx` | Component |

## Testing

**Local Testing with Subdomains:**

Add to `/etc/hosts`:
```
127.0.0.1 linkfo.rest
127.0.0.1 katani.linkfo.rest
127.0.0.1 john.linkfo.rest
```

Then test:
- `http://linkfo.rest:3000/` → Homepage
- `http://katani.linkfo.rest:3000/` → Katani's profile
- `http://linkfo.rest:3000/abc123` → Short link redirect (via `/l/abc123`)
- `http://katani.linkfo.rest:3000/abc123` → Short link owned by Katani (via `/l/abc123`)

**Production Testing:**

1. Create test user with username "testuser"
2. Visit `https://testuser.linkfo.rest` → Should show profile
3. Create short link "test123"
4. Visit `https://linkfo.rest/test123` → Should redirect
5. Visit `https://testuser.linkfo.rest/test123` → Should redirect (if owned by testuser)
6. (Pro) Set custom domain "test.example.com"
7. Add domain to Vercel
8. Visit `https://test.example.com` → Should show profile

## Free DNS Verification

LinkForest uses **Cloudflare's public DNS-over-HTTPS API** which is:
- ✅ Completely free (no API key needed)
- ✅ No rate limits for reasonable usage
- ✅ Fast and reliable
- ✅ Supports all DNS record types

**Alternative APIs:**
- Google DNS: `https://dns.google/resolve?name=${domain}&type=CNAME`
- Quad9: `https://dns.quad9.net:5053/dns-query?name=${domain}&type=CNAME`

All are free and don't require authentication!

## Conclusion

LinkForest's domain system is production-ready and scalable:
- Automatic subdomain provisioning for all users
- Pro-tier custom domain support with verification
- Free, reliable DNS verification
- Clear separation between short links (main domain) and profiles (subdomains)
- Comprehensive error handling and debugging tools

The only manual step required is adding individual custom domains to Vercel, which can be automated using the Vercel API.
