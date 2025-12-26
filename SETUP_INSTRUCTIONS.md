# LinkForest Setup Instructions

## Prerequisites

1. **Neon Database**: Sign up at [neon.tech](https://neon.tech)
2. **Node.js**: Version 18 or higher
3. **pnpm**: Install with `npm install -g pnpm`

## Step 1: Database Setup

### 1.1 Get Your Database URL

1. Create a new project in Neon
2. Copy your connection string (it looks like: `postgresql://user:password@host.neon.tech/dbname`)
3. Create a `.env` file in the project root

### 1.2 Configure Environment Variables

Create a `.env` file with the following:

\`\`\`env
DATABASE_URL=your_neon_database_url_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 1.3 Run Database Scripts

**IMPORTANT**: You must run ALL three database scripts in order:

\`\`\`bash
# 1. Create base tables
psql $DATABASE_URL -f scripts/001-create-tables.sql

# 2. Add subscription features
psql $DATABASE_URL -f scripts/002-add-subscription-tiers.sql

# 3. Add advanced block support
psql $DATABASE_URL -f scripts/003-add-advanced-blocks.sql
\`\`\`

**If you don't have `psql` installed**, you can:

1. Go to your Neon dashboard → SQL Editor
2. Copy and paste each script one by one
3. Run them in order

**Or use the Neon API**:

\`\`\`bash
# Install neon CLI
npm install -g neonctl

# Run scripts
cat scripts/001-create-tables.sql | neonctl sql-execute --connection-string "$DATABASE_URL"
cat scripts/002-add-subscription-tiers.sql | neonctl sql-execute --connection-string "$DATABASE_URL"
cat scripts/003-add-advanced-blocks.sql | neonctl sql-execute --connection-string "$DATABASE_URL"
\`\`\`

## Step 2: Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

## Step 3: Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Step 4: Create Your First User

1. Go to `/signup` and create an account
2. The user will be created with `subscription_tier = 'free'` by default

## Step 5: Upgrade to Pro (for testing Pro features)

Since Whop integration requires real payment setup, you can manually upgrade your test user in the database:

\`\`\`sql
-- Update your user to Pro tier
UPDATE users 
SET subscription_tier = 'pro', 
    subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE email = 'your@email.com';
\`\`\`

## Common Issues & Solutions

### Issue: "Cannot read properties of undefined (reading 'maxUrls')"

**Cause**: Database scripts not run, or `subscription_tier` column missing

**Solution**:
1. Verify all 3 SQL scripts have been executed
2. Check that the column exists:
   \`\`\`sql
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'users' AND column_name = 'subscription_tier';
   \`\`\`
3. If missing, run `scripts/002-add-subscription-tiers.sql` again

### Issue: Theme not reflecting on public profile

**Cause**: Theme data not saved or not fetched properly

**Solution**:
1. Check the browser console for the debug logs: `[v0] User subscription_tier:` and `[v0] Subscription limits:`
2. Update your profile theme in the Linktree → Settings tab
3. Verify the theme is saved in the database:
   \`\`\`sql
   SELECT username, theme, background_type, font_family FROM users WHERE username = 'yourname';
   \`\`\`

### Issue: Profile photo not centered

**Solution**: The profile photo should already be centered. If not:
1. Clear your browser cache
2. Check if custom CSS is interfering
3. Verify the Avatar component is rendering properly

### Issue: Rate limit errors

**Cause**: Too many requests in development (rate limiting is active)

**Solution**: 
1. Temporarily increase limits in `lib/rate-limit.ts`
2. Or wait 60 seconds for the rate limit to reset

## Pro Features

The following features require Pro tier (`subscription_tier = 'pro'`):

- **Unlimited Links**: Free users limited to 5 bio links
- **Unlimited URLs**: Free users limited to 10 shortened URLs  
- **Advanced Blocks**: Page, Accordion, Copy-text blocks
- **Custom Domain**: Use your own domain instead of linkforest.app/username
- **Custom JavaScript**: Inject custom JS into your public profile
- **Enhanced Appearance**: Background images, custom fonts, button styling
- **Extended Analytics**: 365 days retention (vs 30 days for free)

## Whop Integration (Optional)

To enable real payment processing:

1. Sign up at [whop.com](https://whop.com)
2. Create a product with two plans (Free, Pro)
3. Get your Webhook Secret and Product IDs
4. Add to `.env`:
   \`\`\`env
   WHOP_CHECKOUT_URL=https://whop.com/checkout/your-product-id
   WHOP_WEBHOOK_SECRET=your_webhook_secret
   WHOP_PRO_PLAN_ID=plan_pro
   \`\`\`
5. Configure webhook endpoint: `https://yourdomain.com/api/webhooks/whop`

## Project Structure

\`\`\`
linkforest/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages (Bitly, Linktree, Analytics)
│   ├── [username]/        # Public profile pages
│   └── s/[shortCode]/     # Short URL redirects
├── components/            # React components
├── lib/                   # Utility functions
├── scripts/              # Database setup scripts
└── public/               # Static assets
\`\`\`

## Support

If you encounter issues:

1. Check the console logs for `[v0]` debug messages
2. Verify all database scripts have been run
3. Ensure environment variables are set correctly
4. Check that your Neon database is active

## Next Steps

1. Customize your profile in the Linktree section
2. Create short URLs in the Bitly section
3. View analytics for both features
4. Upgrade to Pro to unlock advanced features
5. Configure custom domain (Pro feature)

Enjoy your LinkForest app! 🌲🔗
