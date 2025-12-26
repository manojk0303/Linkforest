# Custom Domain Setup Guide

## Overview
LinkForest allows Pro users to use their own custom domain for their profile page instead of the default `linkforest.app/username` URL.

## Step 1: Add Your Domain

1. Go to **Dashboard > Linktree > Settings**
2. Scroll to the **Custom Domain** section (Pro only)
3. Enter your domain name (e.g., `mywebsite.com` or `links.mywebsite.com`)
4. Click **Save Domain**

## Step 2: Configure DNS

After saving your domain, you'll see DNS configuration instructions. Add a CNAME record in your domain registrar's DNS settings:

\`\`\`
Type: CNAME
Name: @ (for root domain) or subdomain name
Value: linkforest.app (or your app's domain)
TTL: Automatic or 3600
\`\`\`

### Popular Domain Registrars:

**Cloudflare:**
1. Log into Cloudflare dashboard
2. Select your domain
3. Go to DNS > Records
4. Click "Add record"
5. Select CNAME, enter "@" for name, "linkforest.app" for target
6. Save

**GoDaddy:**
1. Log into GoDaddy
2. Go to My Products > DNS
3. Click "Add" under Records
4. Select CNAME, enter "@", point to "linkforest.app"
5. Save

**Namecheap:**
1. Log into Namecheap
2. Go to Domain List > Manage
3. Advanced DNS tab
4. Add New Record: CNAME, "@", "linkforest.app"
5. Save

**Note:** For root domains (@), some registrars require ANAME or ALIAS records instead of CNAME. Check your registrar's documentation.

## Step 3: Verify Domain

1. Wait 5-60 minutes for DNS propagation (can take up to 48 hours)
2. Return to LinkForest settings
3. Click **Verify Domain**
4. Once verified, your custom domain is live!

## Troubleshooting

**"Invalid domain format" error:**
- Ensure you're only entering the domain name (no http://, https://, or www)
- Correct: `example.com` or `links.example.com`
- Incorrect: `https://example.com` or `www.example.com`

**Domain not verifying:**
- Check that DNS changes have propagated (use dnschecker.org)
- Ensure CNAME record points exactly to "linkforest.app"
- Try using a subdomain (links.example.com) instead of root domain
- Contact your domain registrar for help with DNS setup

**"Domain already in use" error:**
- This domain is already connected to another LinkForest account
- Choose a different domain or subdomain

## Free vs Paid Options

**Option 1: Use a Subdomain (Free)**
- Register a free domain from Freenom, .tk, .ml, .ga domains
- Or use a subdomain from your existing domain (links.example.com)

**Option 2: Register a Domain (Paid)**
- Buy from Namecheap, GoDaddy, Cloudflare (~$10-15/year)
- More professional and memorable

**Option 3: Use Free DNS Services**
- Cloudflare (free tier includes DNS management)
- Most registrars include free DNS with domain purchase

## How It Works

When someone visits your custom domain:
1. DNS resolves your domain to LinkForest servers
2. LinkForest checks if domain is verified in our database
3. Your profile loads with your custom URL
4. All links and analytics work normally

Your profile is accessible from both:
- `linkforest.app/username` (always works)
- `yourcustomdomain.com` (after verification)
