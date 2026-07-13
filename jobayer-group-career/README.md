# Jobayer Group Career — Complete MLM + E-commerce Platform

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- Cloudflare Account
- Wrangler CLI (`npm install -g wrangler`)

### Setup

```bash
# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create jgcareer-db

# Update wrangler.jsonc with your database_id

# Apply migrations
wrangler d1 migrations apply jgcareer-db --remote

# Run locally
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage (Hero, Features, Stats, HowItWorks, Testimonials, AppInstall)
│   ├── login/             # Member & Company login
│   ├── register/          # Registration with referral
│   ├── dashboard/         # Worker dashboard (tree, commissions, orders, profile)
│   ├── company/           # Company admin (members, products, levels, currencies, settings, translations, test-mode, updates)
│   ├── products/          # Product catalog
│   ├── checkout/          # Checkout with payment
│   ├── app-install/       # PWA install guide
│   └── api/               # API routes (auth, mlm, products, orders, whatsapp, ai)
├── components/
│   ├── layout/            # Navbar, BottomNav, Footer, LanguageSwitcher
│   ├── ui/                # Button, Card
│   ├── home/              # Homepage sections
│   └── mlm/               # MLM specific components
├── lib/
│   ├── auth/              # Worker + Company authentication
│   ├── db/                # Database schema + queries
│   ├── mlm/               # Commission calculation + tree logic
│   ├── payment/           # SSLCommerz integration
│   ├── i18n/              # Translation system
│   └── *.ts              # Utils, store, whatsapp, ai
└── middleware.ts          # Language detection
```

## 🎨 Color Psychology

| Element | Color | Psychology |
|---------|-------|-----------|
| Primary | #1E3A5A | Trust, stability, professionalism |
| Secondary | #FFD700 | Money, success, exclusivity |
| Action | #28A745 | Growth, wealth, positivity |
| Background | #F8FAFC + White | Clean, minimal |

## 🌐 Features

- **Unilevel MLM** — Configurable levels with percentage + fixed commission
- **E-commerce** — Products, cart, SSLCommerz/bKash payment
- **Multi-currency** — BDT, USD, INR, EUR, GBP, MYR, SAR, AED
- **Bilingual** — English + Bengali (1-click switch)
- **PWA** — Install as app on Android/iOS/Desktop
- **Test Mode** — Mock data testing from Company panel
- **WhatsApp** — Automated notifications
- **AI** — OpenRouter integration
- **Company Panel** — Full control without coding
- **Git-based Updates** — GitHub Actions auto-deploy

## 💰 Cost (Cloudflare)

| Stage | Users | Plan | Cost |
|-------|-------|------|------|
| Start | 1-5,000 | Workers Free + D1 Free | $0 |
| Growth | 5,000-50,000 | Workers Paid | $5/mo |
| Scale | 50K-1M+ | Workers Paid | $5-200/mo |
| Enterprise | 1M-100M | Workers Paid | Scale as needed |
