# Tier Configuration Guide

## Overview

All subscription tier benefits and limits are managed in a single configuration file: `config/tier-benefits.ts`

This makes it easy to update pricing, features, and limits without touching multiple files throughout the codebase.

## How It Works

### Configuration File

The `config/tier-benefits.ts` file contains:

\`\`\`typescript
export const TIER_CONFIG: Record<TierName, TierBenefits> = {
  free: {
    name: "free",
    displayName: "Free",
    price: "$0",
    priceDetail: "Forever free",
    maxLinks: 5,
    maxUrls: 10,
    analyticsRetentionDays: 30,
    customDomain: false,
    customJS: false,
    advancedBlocks: false,
    removeWatermark: false,
    features: [...],
    limits: {...}
  },
  pro: {
    // Pro tier config
  }
}
\`\`\`

### Helper Functions

\`\`\`typescript
// Get tier benefits (with fallback to free)
getTierBenefits("pro") // Returns TierBenefits object

// Check if user is Pro
isProTier(user.subscription_tier) // Returns boolean

// Check if user can access a feature
canAccessFeature(user.subscription_tier, "customDomain") // Returns boolean
\`\`\`

## Updating Tier Configuration

### 1. Change Limits

To change feature limits, edit `config/tier-benefits.ts`:

\`\`\`typescript
export const TIER_CONFIG: Record<TierName, TierBenefits> = {
  free: {
    maxLinks: 10,  // Changed from 5 to 10
    maxUrls: 25,   // Changed from 10 to 25
  },
}
\`\`\`

**No restart required!** Changes apply immediately on next request.

### 2. Change Pricing

\`\`\`typescript
export const TIER_CONFIG: Record<TierName, TierBenefits> = {
  pro: {
    price: "$14.99",  // Changed from $9.99
  }
}
\`\`\`

The pricing page will automatically show the new price.

### 3. Add/Remove Features

\`\`\`typescript
export const TIER_CONFIG: Record<TierName, TierBenefits> = {
  pro: {
    features: [
      "Unlimited bio links",
      "Unlimited shortened URLs",
      "365 days analytics",
      "Advanced block types",
      "Custom domain",
      "Custom JavaScript",
      "Priority support",
      "Remove LinkForest branding",
      "Advanced styling options",
      "API access",  // NEW FEATURE
      "White label options",  // NEW FEATURE
    ],
  }
}
\`\`\`

### 4. Add New Tier

If you want to add a "Business" tier:

\`\`\`typescript
export type TierName = "free" | "pro" | "business"  // Add to type

export const TIER_CONFIG: Record<TierName, TierBenefits> = {
  business: {
    name: "business",
    displayName: "Business",
    price: "$29.99",
    priceDetail: "per month",
    maxLinks: -1,
    maxUrls: -1,
    analyticsRetentionDays: 730,  // 2 years
    customDomain: true,
    customJS: true,
    advancedBlocks: true,
    removeWatermark: true,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Advanced analytics",
      "API access",
      "Priority support",
    ],
    limits: {
      links: "Unlimited bio links",
      urls: "Unlimited shortened URLs",
      analytics: "2 years retention",
    },
  },
}
\`\`\`

Then add it to the pricing page by reading from `TIER_CONFIG.business`.

## Where Tier Config is Used

The tier configuration is automatically used in:

1. **Pricing Page** (`app/pricing/page.tsx`)
   - Displays features and pricing
   - Shows tier benefits

2. **API Routes** (All `/api/*` routes)
   - Checks feature limits
   - Enforces tier restrictions

3. **Dashboard Components**
   - Shows upgrade prompts
   - Displays current tier limits

4. **Analytics** (`lib/analytics.ts`)
   - Filters data by retention days
   - Enforces tier-based access

5. **Custom Domain** (`components/custom-domain-settings.tsx`)
   - Shows/hides based on tier
   - Enforces Pro tier requirement

6. **Advanced Blocks** (`components/advanced-block-form.tsx`)
   - Restricts block types by tier
   - Shows upgrade prompts

## Testing Changes

After updating the tier config:

1. **Verify Pricing Page**
   \`\`\`
   Visit /pricing
   Check that new limits/features are displayed
   \`\`\`

2. **Test Feature Gates**
   \`\`\`
   Try creating more links than the new limit
   Verify error message or upgrade prompt
   \`\`\`

3. **Check Analytics**
   \`\`\`
   Visit /dashboard/analytics
   Verify retention period matches config
   \`\`\`

4. **Test Upgrades**
   \`\`\`
   Upgrade to Pro (or use SQL to set tier)
   Verify all Pro features are accessible
   \`\`\`

## Database Updates

When changing tier structure, you may need to update the database:

### Add New Tier

\`\`\`sql
-- No changes needed! The database stores tier as text
-- Just update TIER_CONFIG and it works
\`\`\`

### Migrate Existing Users

\`\`\`sql
-- If you renamed a tier, update existing users:
UPDATE users 
SET subscription_tier = 'business' 
WHERE subscription_tier = 'pro' 
AND some_condition;
\`\`\`

## Common Patterns

### Check if Feature is Available

\`\`\`typescript
import { getTierBenefits } from "@/config/tier-benefits"

const limits = getTierBenefits(user.subscription_tier)
if (limits.customDomain) {
  // Show custom domain settings
}
\`\`\`

### Check Numeric Limits

\`\`\`typescript
const limits = getTierBenefits(user.subscription_tier)
const linksCount = await getUserLinksCount(userId)

// -1 means unlimited
if (limits.maxLinks !== -1 && linksCount >= limits.maxLinks) {
  return { error: "Link limit reached" }
}
\`\`\`

### Show Upgrade Prompt

\`\`\`typescript
import { isProTier } from "@/config/tier-benefits"

if (!isProTier(user.subscription_tier)) {
  return <UpgradePrompt feature="Custom Domain" />
}
\`\`\`

## Best Practices

1. **Always use `getTierBenefits()`** instead of hardcoding limits
2. **Use `-1` for unlimited** in numeric limits
3. **Keep feature names consistent** across free and pro
4. **Update features list** when adding new capabilities
5. **Test both tiers** after making changes

## Troubleshooting

### Changes Not Reflecting

**Issue**: Updated config but pricing page still shows old values

**Solutions**:
1. Hard refresh browser (Cmd/Ctrl + Shift + R)
2. Clear Next.js cache: `rm -rf .next`
3. Restart dev server
4. Check you edited the right file (`config/tier-benefits.ts`)

### Feature Still Restricted

**Issue**: Pro user can't access Pro feature

**Solutions**:
1. Check user's tier in database: `SELECT subscription_tier FROM users WHERE id = X`
2. Verify tier is lowercase ('pro' not 'Pro')
3. Check the feature gate is using `getTierBenefits()` correctly
4. Look for typos in feature names

### Pricing Page Shows Wrong Price

**Issue**: Pricing page doesn't match Whop checkout

**Solutions**:
1. Update Whop product price in dashboard
2. Update `config/tier-benefits.ts` to match
3. Both should be in sync

## FAQ

**Q: Do I need to restart the server after changing config?**
A: No, changes apply immediately in development. In production, you need to redeploy.

**Q: Can I have more than 2 tiers?**
A: Yes! Just add to the `TierName` type and `TIER_CONFIG` object.

**Q: How do I make a feature free for everyone?**
A: Set it to `true` in both free and pro tiers.

**Q: Can I have different retention periods for Bitly vs Linktree analytics?**
A: Currently no, but you can add separate fields like `bitlyRetentionDays` and `linktreeRetentionDays`.

**Q: How do I test Pro features without paying?**
A: Update your user in the database: `UPDATE users SET subscription_tier = 'pro' WHERE email = 'you@example.com'`
