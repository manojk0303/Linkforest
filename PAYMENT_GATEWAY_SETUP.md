# Payment Gateway Setup Guide - Whop Integration

## Overview

LinkForest uses [Whop](https://whop.com) as the payment gateway for handling subscriptions. Whop is a modern, creator-focused payment platform that handles billing, subscription management, and customer portals.

## Why Whop?

- **Creator-friendly**: Built specifically for digital products and SaaS
- **No code required**: Easy integration with webhooks
- **Customer portal**: Users can manage subscriptions themselves
- **Multiple payment methods**: Cards, PayPal, crypto, and more
- **Instant payouts**: Get paid faster than traditional payment processors
- **Low fees**: Competitive pricing for creators and businesses

## Setup Instructions

### Step 1: Create a Whop Account

1. Go to [dash.whop.com](https://dash.whop.com) and sign up
2. Complete your business profile
3. Connect your payout method (bank account or PayPal)

### Step 2: Create Your Product

1. Navigate to **Products** in your Whop dashboard
2. Click **Create Product**
3. Fill in product details:
   - **Name**: LinkForest Pro
   - **Price**: $9.99 (or your preferred price)
   - **Billing Cycle**: Monthly
   - **Description**: Unlimited links, custom domain, advanced analytics, and more

4. Save your product and copy the **Product ID** (looks like `prod_xxxxx`)

### Step 3: Get API Credentials

1. Go to **Settings** → **API Keys** in Whop dashboard
2. Create a new API key:
   - **Name**: LinkForest Production
   - **Permissions**: Read/Write access to subscriptions and webhooks
3. Copy the API key (starts with `whop_`)

### Step 4: Configure Webhooks

1. In Whop dashboard, go to **Settings** → **Webhooks**
2. Click **Add Webhook**
3. Configure webhook:
   - **URL**: `https://your-domain.com/api/webhooks/whop`
   - **Events**: Select these events:
     - `payment.succeeded`
     - `payment.failed`
     - `subscription.created`
     - `subscription.canceled`
     - `subscription.renewed`
4. Copy the **Webhook Secret** (starts with `whsec_`)

### Step 5: Add Environment Variables

Add these to your `.env` file or Vercel project settings:

\`\`\`bash
# Whop Configuration
WHOP_API_KEY=whop_xxxxxxxxxxxxx
WHOP_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
WHOP_COMPANY_ID=biz_xxxxxxxxxxxxx
WHOP_PRODUCT_ID=prod_xxxxxxxxxxxxx
\`\`\`

To find your Company ID:
- Go to Whop dashboard → **Settings** → **Company**
- Copy the Company ID (looks like `biz_xxxxx`)

### Step 6: Test the Integration

1. **Test Webhook**: In Whop dashboard, use the "Send Test Event" button
2. **Test Purchase**: Create a test subscription:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
3. **Verify Database**: Check that user's `subscription_tier` updates to `pro`

### Step 7: Go Live

1. In Whop dashboard, switch from Test Mode to Live Mode
2. Replace test API keys with live API keys in your environment variables
3. Test with a real purchase (you can refund it immediately)
4. Monitor the webhook logs in Whop dashboard

## How It Works

### Purchase Flow

1. User clicks "Get Pro Access" on pricing page
2. User is redirected to Whop checkout page
3. User completes payment on Whop
4. Whop sends webhook to `/api/webhooks/whop`
5. Webhook handler updates user's tier in database
6. User gets instant access to Pro features

### Subscription Management

Users can manage their subscription through the Whop customer portal:
- Update payment method
- View invoices
- Cancel subscription
- Download receipts

The portal URL is automatically sent to customers after purchase.

## Troubleshooting

### Webhooks Not Working

1. Check webhook URL is publicly accessible
2. Verify webhook secret matches environment variable
3. Check webhook logs in Whop dashboard for errors
4. Ensure your API route is not behind authentication

### User Not Upgraded After Payment

1. Check webhook was received (Whop dashboard → Webhooks → Logs)
2. Verify `user_id` or `email` is correctly passed in webhook
3. Check database logs for update errors
4. Test webhook manually using Whop's "Send Test Event"

### Test Payments Not Working

1. Ensure you're in Test Mode in Whop dashboard
2. Use official test card numbers from Whop docs
3. Check browser console for JavaScript errors

## Alternative Payment Gateways

If you prefer not to use Whop, here are alternatives:

### Stripe (Most Popular)

- **Pros**: Industry standard, excellent docs, many features
- **Cons**: More complex setup, higher fees, longer payouts
- **Setup**: Replace Whop webhook with Stripe webhook, use `@stripe/stripe-js`

### LemonSqueezy

- **Pros**: Creator-friendly, handles taxes automatically
- **Cons**: Limited customization, newer platform
- **Setup**: Similar webhook approach to Whop

### Paddle

- **Pros**: Handles VAT/taxes, merchant of record
- **Cons**: Higher fees, less flexible
- **Setup**: Use Paddle.js and webhook system

## Security Best Practices

1. **Always verify webhook signatures** - Already implemented in `/api/webhooks/whop`
2. **Use HTTPS only** - Required for webhook endpoints
3. **Store API keys in environment variables** - Never commit to git
4. **Implement rate limiting** - Already implemented in middleware
5. **Log all payment events** - For audit trail and debugging

## Support

- **Whop Documentation**: [docs.whop.com](https://docs.whop.com)
- **Whop Support**: support@whop.com
- **Whop Discord**: [discord.gg/whop](https://discord.gg/whop)

## Testing Checklist

- [ ] Webhook endpoint is accessible
- [ ] Webhook signature verification works
- [ ] Test payment upgrades user to Pro
- [ ] Test cancellation downgrades user to Free
- [ ] User can access Pro features after upgrade
- [ ] Analytics shows correct retention period
- [ ] Custom domain feature unlocks for Pro users
- [ ] Pricing page shows correct Whop checkout link
