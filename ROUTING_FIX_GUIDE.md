# LinkForest Routing Fix - Complete Guide

## What Was Fixed

### 1. Renamed proxy.ts to middleware.ts
Next.js 16 requires the file to be named `middleware.ts` (not proxy.ts). The function inside can be named either `middleware` or exported as default.

### 2. Fixed Route Handler Issues
- Removed `NextResponse.next()` from app/[slug]/route.ts (not allowed in route handlers)
- Removed `notFound()` function calls (use NextResponse with status 404 instead)
- Added proper error handling with status codes

### 3. Updated Domain Configuration
- Updated `parseHostname()` to use "linkfo.rest" as the main domain
- Added proper port stripping for localhost testing
- Improved logging for debugging

### 4. Fixed Middleware Routing Logic
- Uses `NextResponse.rewrite()` for all custom routing
- Properly queries database for subdomains and custom domains
- Passes context via query parameters (subdomain, customDomain)
- Returns proper 404 responses for non-existent domains

## Environment Variables Required

Make sure these are set in your Vercel project:

\`\`\`bash
NEXT_PUBLIC_APP_DOMAIN=linkfo.rest
DATABASE_URL=postgresql://...your-neon-url...
\`\`\`

## How Routing Works Now

### Main Domain (linkfo.rest)
- `/` → Homepage (app/page.tsx)
- `/login` → Login page
- `/signup` → Signup page  
- `/dashboard` → Dashboard (requires auth)
- `/pricing` → Pricing page
- `/username` → User profile (app/[username]/page.tsx)
- `/abc123` → Short link redirect (app/[slug]/route.ts)

### User Subdomain (john.linkfo.rest)
- `/` → Rewrites to `/john` (shows profile)
- `/abc123` → Rewrites to `/abc123?subdomain=john` (short link for that user)

### Custom Domain (mysite.com)
- `/` → Rewrites to `/username` (shows profile)
- `/abc123` → Rewrites to `/abc123?customDomain=mysite.com` (short link for that user)

## Database Schema Requirements

The users table must have these columns:
- `username` (VARCHAR, UNIQUE)
- `subdomain` (VARCHAR, UNIQUE) - Format: "username"
- `custom_domain` (VARCHAR) - Format: "mysite.com"
- `domain_verified` (BOOLEAN)

Run the migration scripts in order:
\`\`\`bash
psql $DATABASE_URL -f scripts/001-create-tables.sql
psql $DATABASE_URL -f scripts/002-add-subscription-tiers.sql
psql $DATABASE_URL -f scripts/004-enterprise-analytics-schema.sql
\`\`\`

## Testing the Routes

1. **Homepage**: https://linkfo.rest/ should show the homepage
2. **Login**: https://linkfo.rest/login should show login page
3. **User Profile**: https://linkfo.rest/john should show john's profile
4. **Short Link**: https://linkfo.rest/abc123 should redirect
5. **Subdomain**: https://john.linkfo.rest/ should show john's profile
6. **Subdomain Short Link**: https://john.linkfo.rest/abc123 should redirect to john's link

## Debugging

Check the console logs for "[v0]" prefixed messages to see:
- Which hostname was detected
- Whether it's main domain, subdomain, or custom domain
- Which routes are being rewritten
- Database query results

## Common Issues

### All routes showing 404
- Check NEXT_PUBLIC_APP_DOMAIN is set correctly
- Verify middleware.ts exists (not proxy.ts)
- Check Vercel build logs for errors

### Subdomain not working
- Verify DNS CNAME record points to linkfo.rest
- Check users table has subdomain column populated
- Verify subdomain value matches username

### Custom domain not working
- Verify DNS CNAME record points to linkfo.rest
- Check custom_domain and domain_verified columns in database
- Run domain verification: `/dashboard/linktree` → Settings → Custom Domain

## Next Steps

1. Deploy to Vercel
2. Set environment variables
3. Configure DNS for subdomains (*.linkfo.rest CNAME to linkfo.rest)
4. Test all routes
5. Remove debug console.log statements once working
