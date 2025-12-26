# LinkForest Middleware Setup Guide

## What Was Fixed

### 1. Root-Level Middleware Created
**File**: `middleware.ts` (in project root, same level as `package.json`)

This middleware handles all routing logic for LinkForest's multi-tenant architecture.

### 2. Routing Strategy

#### Main Domain (linkfo.rest)
- `/` → Homepage
- `/login`, `/signup`, `/pricing`, etc. → Reserved routes (pass through)
- `/username` → User profile page (if username exists)
- `/abc123` → Short link redirect (if not a username)

#### User Subdomain (username.linkfo.rest)
- `/` → User's profile page
- `/abc123` → User's short link redirect

#### Custom Domain (user.com)
- `/` → User's profile page
- `/abc123` → User's short link redirect

### 3. Database Queries

The middleware performs these queries:

\`\`\`sql
-- Check if slug is a username
SELECT id, username FROM users WHERE username = ?

-- Verify subdomain exists
SELECT id, username FROM users WHERE subdomain = ?

-- Check custom domain
SELECT u.id, u.username FROM users u 
WHERE u.custom_domain = ? AND u.domain_verified = true
\`\`\`

### 4. Reserved Routes Protected

These routes are always passed through to Next.js:
- System: `api`, `auth`, `admin`, `dashboard`, `settings`
- Public: `login`, `signup`, `pricing`, `insights`
- Technical: `_next`, `static`, `favicon`, `robots`, `sitemap`

### 5. Environment Variable

Set this in your `.env`:
\`\`\`env
NEXT_PUBLIC_APP_DOMAIN=linkfo.rest
\`\`\`

## Testing Checklist

After deploying:

1. ✅ Main domain profile: `linkfo.rest/manoj` → Shows manoj's profile
2. ✅ Subdomain profile: `manoj.linkfo.rest` → Shows manoj's profile
3. ✅ Main domain short link: `linkfo.rest/abc123` → Redirects to target URL
4. ✅ Subdomain short link: `manoj.linkfo.rest/abc123` → Redirects to target URL
5. ✅ Reserved routes work: `linkfo.rest/login`, `linkfo.rest/dashboard`
6. ✅ Custom domain (if configured): `user.com` → User's profile

## Validation Fix

**File**: `lib/validation.ts`

Added `"divider"` to the `block_type` enum:

\`\`\`typescript
block_type: z.enum(["link", "page", "accordion", "copy-text", "social", "divider"])
\`\`\`

Now divider blocks can be created without validation errors.

## URL Display Updates

**Files Updated**:
- `components/linktree-profile-settings.tsx` - Shows username as subdomain format
- `components/url-list.tsx` - Displays short URLs without `/s/` prefix

URLs now display as:
- Profile: `username.linkfo.rest`
- Short links: `linkfo.rest/abc123` or `username.linkfo.rest/abc123`

## Debugging

The middleware includes console logs for debugging:
- `[v0] Middleware - hostname: ... pathname: ...`
- `[v0] Parsed hostname: { isMainDomain, isUserSubdomain, subdomain }`
- `[v0] Found username, rewriting to profile: ...`
- `[v0] Not a username, treating as short code: ...`

Check your server logs (or Vercel function logs) to see routing decisions.

## Common Issues

### Issue: All routes return 404
**Solution**: Ensure `middleware.ts` is in the root directory (not `/lib/`)

### Issue: "middleware is not a function"
**Solution**: Check that the file exports a function named `middleware` (not `proxy`)

### Issue: Subdomain not working locally
**Solution**: Update your `/etc/hosts` file:
\`\`\`
127.0.0.1 linkfo.rest
127.0.0.1 manoj.linkfo.rest
\`\`\`

### Issue: Database connection errors
**Solution**: Ensure `DATABASE_URL` is set in your environment variables

## Next Steps

1. Deploy to Vercel
2. Configure your domain DNS:
   - Add A/AAAA records for `linkfo.rest`
   - Add wildcard CNAME for `*.linkfo.rest` pointing to your Vercel deployment
3. Test all routing scenarios
4. Set up custom domain verification for users

## Analytics Enhancement

The insights system is already enterprise-grade with:
- ✅ User agent parsing (browser, OS, device)
- ✅ Geographic data from Vercel headers (free!)
- ✅ Referrer platform detection
- ✅ UTM parameter tracking
- ✅ Comprehensive dashboard with charts
- ✅ Separate Bitly and Linktree analytics
- ✅ Tier-based retention (30 days free, 365 days pro)

No additional work needed for analytics - it's production-ready!
