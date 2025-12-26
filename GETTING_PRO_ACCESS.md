# Getting Pro Access

To get Pro access to LinkForest, you need to update the `subscription_tier` field in your database.

## Database Field Values

The `subscription_tier` field accepts the following values (case-insensitive):

- `free` - Free tier (default)
- `pro` - Pro tier with all premium features

## How to Upgrade to Pro

### Option 1: Direct Database Update

Connect to your Neon database and run this SQL command:

\`\`\`sql
UPDATE users 
SET subscription_tier = 'pro', 
    subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE email = 'your-email@example.com';
\`\`\`

Replace `your-email@example.com` with your actual email address.

### Option 2: Using Database Client

1. Open your Neon database console
2. Navigate to the SQL editor
3. Run the following query:

\`\`\`sql
-- Check your current subscription
SELECT id, email, username, subscription_tier, subscription_expires_at 
FROM users 
WHERE email = 'your-email@example.com';

-- Update to Pro (adjust the email)
UPDATE users 
SET subscription_tier = 'pro',
    subscription_expires_at = NOW() + INTERVAL '365 days'
WHERE email = 'your-email@example.com';

-- Verify the change
SELECT id, email, username, subscription_tier, subscription_expires_at 
FROM users 
WHERE email = 'your-email@example.com';
\`\`\`

## Accepted Values

The system normalizes the tier value, so these all work:
- `pro` ✓
- `Pro` ✓  
- `PRO` ✓
- `free` (default)
- `Free`
- `FREE`

## Pro Features Unlocked

Once upgraded to Pro, you'll have access to:

1. **Unlimited Links** - Create unlimited bio links (free tier: 5)
2. **Unlimited Short URLs** - Create unlimited short URLs (free tier: 10)
3. **Advanced Blocks** - Social, Page, Accordion, Copy-text blocks
4. **Custom Domain** - Use your own domain for your profile
5. **Custom JavaScript** - Inject custom JS code into your profile
6. **Extended Analytics** - 365 days retention (free tier: 30 days)
7. **Advanced Appearance** - Custom backgrounds, fonts, button styles
8. **No Watermark** - Remove "Create your own LinkForest" footer

## Troubleshooting

If Pro features aren't working after the update:

1. **Clear your session** - Logout and login again
2. **Check the database** - Verify the `subscription_tier` field is set to `'pro'`
3. **Verify expiration** - Make sure `subscription_expires_at` is in the future
4. **Hard refresh** - Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

## Production Setup

For production, you should use the Whop payment integration:

1. Set up your Whop account
2. Configure environment variables:
   - `WHOP_CHECKOUT_URL`
   - `WHOP_WEBHOOK_SECRET`
   - `WHOP_PRO_PLAN_ID`
3. Users will automatically get Pro access when they purchase through Whop

The webhook at `/api/webhooks/whop` will handle automatic subscription updates.
