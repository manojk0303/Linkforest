# LinkForest Routing System Documentation

This document explains the complete routing architecture for the LinkForest application, which combines Bitly-style URL shortening with Linktree-style bio link pages.

## Architecture Overview

LinkForest uses a multi-tenant routing system that handles three types of domains:
1. **Main Domain** (`linkfo.rest`) - For short links only
2. **User Subdomains** (`username.linkfo.rest`) - For user profile pages
3. **Custom Domains** (`user-custom-domain.com`) - For verified custom domains

---

## Domain Configuration

### Vercel Domain Setup

In your Vercel project settings, you must configure:

1. **Main Domain**: `linkfo.rest` ✅
2. **Wildcard Subdomain**: `*.linkfo.rest` ✅ (Required for user subdomains)
3. **Custom Domains**: Each user's custom domain must be added manually

### Environment Variables

\`\`\`env
NEXT_PUBLIC_APP_DOMAIN=linkfo.rest
DATABASE_URL=postgresql://...
\`\`\`

---

## Routing Priority

The middleware (`proxy.ts`) handles requests in this order:

### 1. SUBDOMAIN ROUTING (Highest Priority)

**Pattern**: `username.linkfo.rest`

**Behavior**:
- `username.linkfo.rest/` → Shows user's linktree profile
- `username.linkfo.rest/abc` → Redirects to `linkfo.rest/abc` (short link on main domain)

**Database Query**:
\`\`\`sql
SELECT id, username FROM users WHERE subdomain = 'username'
\`\`\`

**Implementation**:
\`\`\`typescript
if (isUserSubdomain && subdomain) {
  // Verify subdomain exists
  const user = await sql`SELECT id, username FROM users WHERE subdomain = ${subdomain}`
  
  if (pathname === '/') {
    // Rewrite to profile page
    return NextResponse.rewrite(`/${username}?subdomain=${subdomain}`)
  }
  
  if (isSingleSlug) {
    // Redirect to main domain for short links
    return NextResponse.redirect(`https://linkfo.rest/${slug}`)
  }
}
\`\`\`

### 2. MAIN DOMAIN ROUTING

**Pattern**: `linkfo.rest`

**Behavior**:
- `linkfo.rest/` → Homepage
- `linkfo.rest/login` → Auth pages (reserved routes)
- `linkfo.rest/dashboard` → Dashboard (reserved routes)
- `linkfo.rest/abc123` → Short link redirect (handled by `[slug]/route.ts`)
- `linkfo.rest/username` → **404** (profiles ONLY on subdomains)

**Implementation**:
\`\`\`typescript
if (isMainDomain) {
  if (pathname === '/' || isReservedRoute(firstSegment)) {
    return NextResponse.next() // Let Next.js handle
  }
  
  if (isSingleSlug) {
    // Let [slug]/route.ts handle short link lookup
    return NextResponse.next()
  }
}
\`\`\`

**Key Point**: Username profiles are NOT accessible on the main domain. Only short links work on `linkfo.rest/slug`.

### 3. CUSTOM DOMAIN ROUTING (Lowest Priority)

**Pattern**: `user-domain.com`

**Behavior**:
- `user-domain.com/` → Shows user's linktree profile
- `user-domain.com/abc` → User's short link (if they created one)

**Database Query**:
\`\`\`sql
SELECT id, username FROM users 
WHERE custom_domain = 'user-domain.com' AND domain_verified = true
\`\`\`

**Implementation**:
\`\`\`typescript
const domainResult = await sql`
  SELECT u.id, u.username FROM users u
  WHERE u.custom_domain = ${hostname} AND u.domain_verified = true
`

if (domainResult.length > 0) {
  if (pathname === '/') {
    return NextResponse.rewrite(`/${username}?customDomain=${hostname}`)
  }
}
\`\`\`

---

## Short Link Handler

**File**: `app/[slug]/route.ts`

**Purpose**: Handles all short link redirects from the main domain

**Query Logic**:
\`\`\`typescript
// Main domain - any user's short link
const shortenedUrl = await sql`
  SELECT su.*, u.username 
  FROM shortened_urls su
  INNER JOIN users u ON su.user_id = u.id
  WHERE su.short_code = ${slug} AND su.is_active = true
`

if (shortenedUrl.length > 0) {
  // Track analytics
  trackAnalyticsEvent(request, { ... })
  
  // Increment click counter
  await sql`UPDATE shortened_urls SET clicks = clicks + 1 WHERE id = ${id}`
  
  // Redirect to original URL
  return NextResponse.redirect(originalUrl)
}

return new NextResponse("Not Found", { status: 404 })
\`\`\`

**Key Features**:
- Tracks click analytics (device, location, referrer)
- Increments click counter
- Returns 404 if short code not found or inactive

---

## Profile Page

**File**: `app/[username]/page.tsx`

**Purpose**: Renders user's linktree profile page

**Access Control**:
- ✅ Accessible via: `username.linkfo.rest/`
- ✅ Accessible via: `custom-domain.com/` (if configured)
- ❌ NOT accessible via: `linkfo.rest/username` (returns 404)

**Implementation**:
\`\`\`typescript
export default async function ProfilePage({ params }) {
  const { username } = await params
  const profile = await getPublicProfile(username)
  
  if (!profile) {
    notFound()
  }
  
  return <PublicProfileView profile={profile} />
}
\`\`\`

---

## Database Schema

### Users Table

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  subdomain VARCHAR(255) UNIQUE,  -- Always equals LOWER(username)
  custom_domain VARCHAR(255),
  domain_verified BOOLEAN DEFAULT false,
  ...
);

CREATE INDEX idx_users_subdomain ON users(subdomain);
\`\`\`

**Important**: The `subdomain` field must always equal `LOWER(username)` for consistent routing.

### Shortened URLs Table

\`\`\`sql
CREATE TABLE shortened_urls (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  original_url TEXT NOT NULL,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  custom_code BOOLEAN DEFAULT false,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  ...
);

CREATE INDEX idx_shortened_urls_short_code ON shortened_urls(short_code);
\`\`\`

---

## Reserved Routes

These routes cannot be used as usernames or short codes:

\`\`\`typescript
const RESERVED_ROUTES = [
  "api", "auth", "admin", "dashboard", "login", "signup",
  "settings", "home", "about", "pricing", "insights", 
  "analytics", "_next", "static", "public", ...
]
\`\`\`

**Enforcement**:
- Username validation during signup
- Short code validation when creating links
- Middleware checks before routing

---

## User Signup Flow

When a user signs up, the `subdomain` field is automatically populated:

\`\`\`typescript
export async function createUser(email, password, username) {
  const subdomain = username.toLowerCase()
  
  await sql`
    INSERT INTO users (email, password_hash, username, subdomain)
    VALUES (${email}, ${passwordHash}, ${username}, ${subdomain})
  `
}
\`\`\`

**Migration for Existing Users**:
\`\`\`sql
-- Run this once to populate subdomain for existing users
UPDATE users 
SET subdomain = LOWER(username) 
WHERE subdomain IS NULL;
\`\`\`

---

## URL Display Logic

### Short Links (Bitly)

Always display on main domain:

\`\`\`typescript
// In components/url-list.tsx
const shortUrl = `linkfo.rest/${shortCode}`
\`\`\`

**Example**:
- User "john" creates short link "abc123"
- Display as: `linkfo.rest/abc123`
- NOT: `john.linkfo.rest/abc123`

### Profile Links (Linktree)

Always display with subdomain:

\`\`\`typescript
// In components/linktree-profile-settings.tsx
const profileUrl = `${username}.linkfo.rest`
\`\`\`

**Example**:
- User "john" 
- Display as: `john.linkfo.rest`
- NOT: `linkfo.rest/john`

---

## Testing Checklist

### Subdomain Routing
- [ ] `john.linkfo.rest/` shows John's profile
- [ ] `manoj.linkfo.rest/` shows Manoj's profile
- [ ] `nonexistent.linkfo.rest/` returns 404
- [ ] `john.linkfo.rest/abc` redirects to `linkfo.rest/abc`

### Main Domain Routing
- [ ] `linkfo.rest/` shows homepage
- [ ] `linkfo.rest/login` shows login page
- [ ] `linkfo.rest/dashboard` requires auth
- [ ] `linkfo.rest/abc123` redirects to original URL (short link)
- [ ] `linkfo.rest/john` returns 404 (no username profiles on main domain)
- [ ] `linkfo.rest/nonexistent` returns 404

### Custom Domain Routing
- [ ] `custom-domain.com/` shows user's profile (if verified)
- [ ] `custom-domain.com/abc` works as short link
- [ ] Unverified custom domain returns 404

### Analytics Tracking
- [ ] Short link clicks are tracked
- [ ] Device type is captured
- [ ] Geographic location is captured (via Vercel headers)
- [ ] Referrer platform is detected

---

## Troubleshooting

### Issue: "Profile not found" on subdomain

**Solution**: Ensure subdomain field is populated

\`\`\`sql
SELECT username, subdomain FROM users WHERE username = 'john';
-- If subdomain is NULL, run:
UPDATE users SET subdomain = LOWER(username) WHERE username = 'john';
\`\`\`

### Issue: Subdomain shows homepage instead of profile

**Solution**: Check middleware logs in production

\`\`\`bash
# Check logs for:
[v0] Middleware - hostname: john.linkfo.rest
[v0] Parsed hostname: { isUserSubdomain: true, subdomain: 'john' }
[v0] Found user for subdomain: { subdomain: 'john', username: 'john' }
\`\`\`

### Issue: Short links not working

**Solution**: Verify short_code in database

\`\`\`sql
SELECT short_code, original_url, is_active 
FROM shortened_urls 
WHERE short_code = 'abc123';
\`\`\`

### Issue: Custom domain not working

**Solution**: 
1. Verify domain added in Vercel project settings
2. Check database: `SELECT custom_domain, domain_verified FROM users WHERE id = '...'`
3. Verify DNS CNAME points to Vercel

---

## Performance Considerations

1. **Database Indexes**: Ensure indexes exist on `subdomain` and `short_code` fields
2. **Middleware Caching**: Consider caching subdomain lookups in production
3. **Analytics**: Use async tracking to avoid blocking redirects

---

## Security Considerations

1. **Reserved Routes**: Prevent malicious users from claiming system routes
2. **SQL Injection**: Always use parameterized queries
3. **Rate Limiting**: Implement rate limits on API routes (already done)
4. **Domain Verification**: Require DNS verification before custom domains go live

---

## Future Enhancements

- [ ] Subdomain caching layer (Redis)
- [ ] Bulk short link creation
- [ ] Link expiration dates
- [ ] Password-protected links
- [ ] A/B testing for links
- [ ] QR code generation
- [ ] Link scheduling (publish at specific time)
