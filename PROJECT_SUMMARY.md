# LinkForest - Complete Full-Stack Application

## Overview

LinkForest is a production-ready full-stack application combining **Bitly-style URL shortening** with **Linktree-style bio link pages**. Built with Next.js 16, TypeScript, Neon PostgreSQL, and enhanced with Pro-tier features.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5.0+
- **Database**: Neon PostgreSQL (raw SQL queries)
- **Authentication**: Custom bcrypt-based auth with secure sessions
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Payment Integration**: Whop (subscription tiers)

### Project Structure
\`\`\`
linkforest/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   │   ├── bitly/          # URL shortener section
│   │   ├── linktree/       # Bio link editor section
│   │   ├── analytics/      # Analytics dashboard
│   │   └── layout.tsx      # Dashboard layout with nav
│   ├── s/[shortCode]/      # Short URL redirects
│   ├── [username]/         # Public profile pages
│   ├── api/
│   │   ├── auth/           # Login, signup, logout, me
│   │   ├── urls/           # URL shortener CRUD
│   │   ├── bio-links/      # Bio links CRUD + reorder
│   │   ├── analytics/      # Analytics endpoint
│   │   ├── profiles/       # Public profile API
│   │   ├── domains/        # Custom domain verification
│   │   ├── subscription/   # Subscription status
│   │   └── webhooks/whop/  # Payment webhooks
│   └── page.tsx            # Landing page
├── components/
│   ├── linktree-editor.tsx     # Split-view editor with live preview
│   ├── linktree-preview.tsx    # Real-time preview component
│   ├── linktree-appearance.tsx # Theme & styling controls
│   ├── bitly-dashboard.tsx     # URL shortener interface
│   ├── analytics-dashboard.tsx # Unified analytics
│   ├── advanced-block-form.tsx # Block creation (5 types)
│   ├── advanced-block-renderer.tsx # Public block rendering
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── db.ts               # Neon database client
│   ├── auth.ts             # Authentication helpers
│   ├── url-shortener.ts    # URL shortening logic
│   ├── bio-links.ts        # Bio link operations
│   ├── blocks.ts           # Advanced block types
│   ├── analytics.ts        # Analytics aggregation
│   ├── profile.ts          # Profile management
│   ├── subscription.ts     # Tier limits & checks
│   ├── validation.ts       # Zod schemas
│   ├── rate-limit.ts       # Rate limiting
│   ├── middleware.ts       # Auth middleware
│   └── domains.ts          # Custom domain logic
├── scripts/
│   ├── 001-create-tables.sql         # Initial schema
│   ├── 002-add-subscription-tiers.sql # Subscription columns
│   └── 003-add-advanced-blocks.sql    # Block type support
└── proxy.ts                # Middleware for routing & domains
\`\`\`

## Core Features

### 1. URL Shortener (Bitly Clone)
**Location**: `/dashboard/bitly`

**Features**:
- Create short URLs with random or custom codes
- Edit titles and URLs
- Delete URLs
- Click tracking with geolocation
- Reserved code protection
- Short URL format: `yourdomain.com/s/{code}`

**Components**:
- `UrlShortenerForm` - Creation form
- `UrlList` - Manage existing short URLs
- `BitlyDashboard` - Main container

**API Endpoints**:
- `POST /api/urls` - Create short URL
- `GET /api/urls` - List user's URLs
- `PATCH /api/urls/[id]` - Update URL
- `DELETE /api/urls/[id]` - Delete URL
- `GET /s/[shortCode]` - Redirect & track clicks

### 2. Bio Link Builder (Linktree Clone)
**Location**: `/dashboard/linktree`

**Features**:
- **Split-view editor**: Left panel for editing, right panel for live preview
- **5 Block Types**:
  1. **Link** - Standard URL button
  2. **Social** - Auto-detects platform (Twitter, Instagram, etc.)
  3. **Page** - Markdown content subpage (Pro)
  4. **Accordion** - Expandable content (Pro)
  5. **Copy-Text** - Click to copy text (Pro)
- Drag-and-drop reordering
- Show/hide blocks
- Inline editing
- Public profile URL: `yourdomain.com/{username}`

**Components**:
- `LinktreeEditor` - Main split-view interface
- `LinktreePreview` - Live preview in phone mockup
- `AdvancedBlockForm` - Create blocks
- `BioLinkList` - Manage blocks
- `AdvancedBlockRenderer` - Render blocks on public profiles

**Appearance Customization**:
- Theme (Light/Dark)
- Background (Solid/Gradient/Image) - Pro
- Font family (8 Google Fonts) - Pro
- Button styling (border radius, shadows) - Pro
- Profile settings (avatar, bio, display name)

**API Endpoints**:
- `POST /api/bio-links` - Create block
- `GET /api/bio-links` - List user's blocks
- `PATCH /api/bio-links/[id]` - Update block
- `DELETE /api/bio-links/[id]` - Delete block
- `POST /api/bio-links/reorder` - Reorder blocks
- `POST /api/bio-links/[id]/click` - Track clicks

### 3. Analytics
**Location**: `/dashboard/analytics`

**Features**:
- Unified analytics for both URL shortener and bio links
- **Metrics**:
  - Total clicks (all time)
  - Clicks today, this week, this month
  - Top short URLs (by clicks)
  - Top bio links (by clicks)
  - 30-day click chart
  - Recent activity with geolocation
- **Tier-based retention**:
  - Free: 30 days
  - Pro: 365 days

**Components**:
- `AnalyticsDashboard` - Comprehensive analytics view

**API Endpoints**:
- `GET /api/analytics` - Get user analytics

### 4. Authentication System
**Features**:
- Custom authentication with bcrypt password hashing
- Secure HTTP-only cookie sessions
- Username uniqueness validation
- Reserved username protection
- Real-time username availability check

**API Endpoints**:
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user
- `GET /api/username/check` - Check username availability

### 5. Subscription Tiers (Whop Integration)
**Tiers**:

| Feature | Free | Pro |
|---------|------|-----|
| Short URLs | 50 | Unlimited |
| Bio Links | 10 | Unlimited |
| Analytics Retention | 30 days | 365 days |
| Advanced Blocks | ❌ | ✅ |
| Custom Domain | ❌ | ✅ |
| Custom JS | ❌ | ✅ |
| Appearance Customization | ❌ | ✅ |
| Watermark Removal | ❌ | ✅ |

**Webhook Integration**:
- `POST /api/webhooks/whop` - Handle subscription events
- Signature verification
- Auto upgrade/downgrade on payment events

### 6. Pro Features

#### Custom Domain Support
**Location**: `/dashboard/linktree` → Settings tab

**Features**:
- Add custom domain (e.g., `links.yourbrand.com`)
- DNS verification (CNAME record check)
- Domain availability checking
- Automatic routing via middleware
- Step-by-step setup instructions

#### Custom JavaScript Injection
**Location**: `/dashboard/linktree` → Settings tab

**Features**:
- Add custom JavaScript to public profile
- Security warnings and best practices
- Scoped execution (only on user's profile)
- Code editor interface

#### Advanced Appearance
**Location**: `/dashboard/linktree` → Appearance tab

**Features**:
- Custom backgrounds (gradients, images)
- Font family selection
- Button style controls
- Live preview of changes

## Security Features

### 1. Rate Limiting
- IP-based rate limiting on all API routes
- Default: 100 requests per minute
- Configurable per endpoint

### 2. Input Validation
- Zod schema validation on all inputs
- Sanitization of user data
- URL validation for shortened links
- Username format validation

### 3. SQL Injection Prevention
- Parameterized queries using Neon's SQL template literals
- No string concatenation in queries

### 4. Authentication
- bcrypt password hashing (10 rounds)
- Secure HTTP-only session cookies
- Server-side session validation
- Protected routes with middleware

### 5. Reserved Routes
- Protected usernames: `api`, `dashboard`, `s`, `login`, `signup`, `admin`
- Short code conflict prevention
- Username collision detection

## Database Schema

### Tables

#### users
- Authentication & profile information
- Subscription tier
- Theme & appearance settings
- Custom domain configuration

#### sessions
- Active user sessions
- Expiration tracking

#### shortened_urls
- Short code mapping
- Click tracking
- User ownership

#### bio_links
- Block data (title, URL, icon)
- Block type & custom data
- Position for ordering
- Visibility toggle

#### analytics
- Click tracking
- Geolocation data (country, city)
- IP address (for rate limiting)
- Timestamp

## Routing Structure

### Public Routes
- `/` - Landing page
- `/login` - Sign in
- `/signup` - Sign up
- `/[username]` - Public profile pages
- `/s/[shortCode]` - Short URL redirects

### Protected Routes (Dashboard)
- `/dashboard` - Redirects to `/dashboard/bitly`
- `/dashboard/bitly` - URL shortener
- `/dashboard/linktree` - Bio link editor
- `/dashboard/analytics` - Analytics dashboard

### API Routes
All API routes are protected (except auth endpoints) and include:
- Authentication checks
- Rate limiting
- Input validation
- Error handling

## Environment Variables

\`\`\`env
# Database
DATABASE_URL=postgresql://...

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Payments (Whop)
WHOP_WEBHOOK_SECRET=whsec_...
WHOP_API_KEY=...

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Setup Instructions

### 1. Database Setup
\`\`\`bash
# Add your Neon DATABASE_URL to .env
DATABASE_URL=postgresql://user:pass@host/db

# Run migration scripts in order
# These create all necessary tables and indexes
\`\`\`

### 2. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 3. Run Development Server
\`\`\`bash
pnpm dev
\`\`\`

### 4. Run SQL Scripts
The app includes a built-in script runner. Execute scripts in this order:
1. `scripts/001-create-tables.sql` - Base schema
2. `scripts/002-add-subscription-tiers.sql` - Subscription columns
3. `scripts/003-add-advanced-blocks.sql` - Block type support

### 5. Configure Whop (Optional)
1. Create a Whop app
2. Add webhook URL: `https://yourdomain.com/api/webhooks/whop`
3. Add `WHOP_WEBHOOK_SECRET` and `WHOP_API_KEY` to environment variables

## User Experience

### For End Users

1. **Sign Up**
   - Choose unique username
   - Set password
   - Instant account creation

2. **Create Short URLs**
   - Navigate to Bitly section
   - Paste long URL
   - Get instant short link
   - Track clicks in Analytics

3. **Build Bio Link Page**
   - Navigate to Linktree section
   - Add blocks (links, social, pages, etc.)
   - Customize appearance
   - See live preview
   - Share profile URL

4. **View Analytics**
   - Navigate to Analytics section
   - See unified stats for all links
   - Track performance over time
   - Analyze geographic data

5. **Upgrade to Pro**
   - Unlock advanced features
   - Remove watermark
   - Add custom domain
   - Customize appearance

### For Developers

**Modern Stack**:
- Next.js 16 with App Router
- React Server Components
- Turbopack for fast builds
- TypeScript for type safety

**Best Practices**:
- Component composition
- Server/client separation
- Proper error handling
- Loading states
- SEO optimization

**Extensibility**:
- Modular architecture
- Clear separation of concerns
- Reusable components
- Well-documented code

## Key Design Decisions

### 1. Routing Strategy
- **Short URLs**: `/s/[code]` instead of `/[code]` to avoid conflicts with usernames
- **Public Profiles**: `/[username]` for clean, shareable URLs
- **Dashboard Sections**: Separate routes for better organization

### 2. Authentication
- Custom implementation instead of third-party for full control
- Bcrypt for production-grade security
- HTTP-only cookies for XSS protection

### 3. Database
- Raw SQL instead of ORM for:
  - Better performance
  - Full SQL feature access
  - Explicit query control
  - Easier debugging

### 4. Subscription Model
- Server-side enforcement
- Feature gates throughout codebase
- Graceful degradation for free tier

### 5. Linktree UX
- Split-view editor matching real Linktree experience
- Live preview for instant feedback
- Tab-based navigation (Links, Appearance, Settings)
- Professional, intuitive interface

## Deployment

### Recommended Platform: Vercel

1. **Connect Repository**
   - Push to GitHub
   - Import to Vercel

2. **Configure Environment Variables**
   - Add `DATABASE_URL`
   - Add `NEXT_PUBLIC_APP_URL`
   - Add Whop credentials (if using payments)

3. **Deploy**
   - Automatic deployments on push
   - Preview deployments for PRs

4. **Run Database Migrations**
   - Execute SQL scripts against production database

### Custom Domain Setup (for Pro users)

1. **Add Domain to Vercel**
   - Project Settings → Domains
   - Add custom domain

2. **Configure DNS**
   - Users point CNAME to your domain
   - Verify DNS records via app UI

## Future Enhancements

### Potential Features
- [ ] QR code generation for links
- [ ] Link scheduling (publish/unpublish dates)
- [ ] A/B testing for bio links
- [ ] Team collaboration features
- [ ] API for developers
- [ ] Bulk import/export
- [ ] Social media integrations
- [ ] Email capture forms
- [ ] Advanced analytics (UTM tracking)
- [ ] Mobile app

### Performance Optimizations
- [ ] Redis caching for analytics
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] Edge function deployment

## Support & Resources

### Documentation
- All code includes inline comments
- Type definitions for better IntelliSense
- Example usage in components

### Troubleshooting

**Issue**: Short URLs not redirecting
- Check `/s/[shortCode]/route.ts` is created
- Verify database has `shortened_urls` table
- Check short code exists in database

**Issue**: Profile not loading
- Check username format (lowercase, alphanumeric, hyphens)
- Verify user exists in database
- Check `[username]/page.tsx` dynamic route

**Issue**: Live preview not updating
- Check `refreshTrigger` prop is being updated
- Verify API endpoints are responding
- Check browser console for errors

## Conclusion

LinkForest is a production-ready, feature-complete application that combines the best of URL shortening and bio link building. With enterprise-grade security, comprehensive analytics, and a Pro tier for monetization, it's ready to scale and serve real users.

The clean architecture, modern tech stack, and focus on user experience make it both maintainable for developers and delightful for end users.

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**License**: MIT (or your chosen license)
