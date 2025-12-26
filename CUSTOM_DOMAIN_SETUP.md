# Custom Domain Setup Guide

LinkForest uses **Cloudflare's free DNS-over-HTTPS API** to verify custom domains at no cost. This means you don't need any paid services or API keys.

## How It Works

1. **You save your domain** in the Custom Domain settings
2. **Add a CNAME record** in your domain registrar's DNS settings
3. **Click "Verify Domain"** - we use Cloudflare's free public DNS resolver to check if your CNAME is set up correctly
4. **Domain gets verified** - your profile is now accessible via your custom domain!

## Step-by-Step Setup

### 1. Add Your Domain in LinkForest

1. Go to Dashboard → Linktree → Settings
2. Find the "Custom Domain" section
3. Enter your domain (e.g., `links.example.com` or `example.com`)
4. Click "Save Domain"

### 2. Configure DNS at Your Registrar

Add a CNAME record with these values:

- **Type**: CNAME
- **Name**: `@` (for root domain) or your subdomain (e.g., `links`)
- **Value**: `linkforest.app` (or your LinkForest domain)
- **TTL**: 3600 (or Auto)

#### Popular Registrars:

**Cloudflare** (Recommended - Free):
1. Go to DNS settings
2. Click "Add record"
3. Type: CNAME, Name: `@`, Target: `linkforest.app`
4. Save

**Namecheap**:
1. Advanced DNS tab
2. Add New Record
3. Type: CNAME Record, Host: `@`, Value: `linkforest.app`
4. Save

**GoDaddy**:
1. DNS Management
2. Add → CNAME
3. Name: `@`, Value: `linkforest.app`
4. Save

**Google Domains**:
1. DNS tab
2. Custom resource records
3. Name: `@`, Type: CNAME, Data: `linkforest.app`
4. Add

### 3. Verify Your Domain

1. Wait 5-10 minutes for DNS propagation (can take up to 48 hours)
2. Return to LinkForest Custom Domain settings
3. Click "Verify Domain"
4. If verification passes, your domain is live!

## Troubleshooting

**"Domain not verified"**: 
- DNS changes can take up to 48 hours to propagate globally
- Check your CNAME record is correctly pointing to `linkforest.app`
- Try using a DNS checker tool: https://dnschecker.org/

**"Invalid domain format"**:
- Make sure you enter just the domain: `example.com` (no http:// or https://)
- Both root domains (`example.com`) and subdomains (`links.example.com`) are supported

**"Domain already in use"**:
- This domain is already verified by another LinkForest user
- Try using a subdomain instead (e.g., `links.example.com`)

## Free DNS Verification

We use Cloudflare's free DNS-over-HTTPS API (https://cloudflare-dns.com/dns-query) which:
- Is completely free with no API key required
- Works globally with high reliability
- Checks CNAME records in real-time
- No rate limits for reasonable use

This means custom domains are completely free for all Pro users!
