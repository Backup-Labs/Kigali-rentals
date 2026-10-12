# Kigali Rentals Frontend Web Platform

**Kigali Rentals** is Rwanda's unified property and vehicle rental platform built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, and modern UI components.

---

## 🏗️ Refined Next.js Project Structure

The project strictly follows standard Next.js directory conventions utilizing the `src/` root directory:

```
d:\2026-projects\Kigali-Rentals
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx              # Operations Hub: Metrics, Timeline, Inventory & Tasks
│   │   ├── checkout/
│   │   │   └── page.tsx              # 4-Step Checkout with MoMo/Card Simulator & Signature
│   │   ├── handover/
│   │   │   └── page.tsx              # Condition Inspection Tool & Comparison Protocol
│   │   ├── listings/
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Listing Detail, Gallery, Specs & Booking Card
│   │   ├── globals.css               # Clean typography, custom scrollbars, light-theme tokens
│   │   ├── layout.tsx                # App root layout with Navbar, Footer & MobileBottomNav
│   │   └── page.tsx                  # Home & Discovery with Light Theme & Hero Photography
│   ├── components/
│   │   ├── ui/
│   │   │   ├── CustomSelect.tsx      # Interactive custom dropdown with descriptions & checkmarks
│   │   │   └── DatePicker.tsx        # Custom range calendar with month view, presets & range preview
│   │   ├── Footer.tsx                # Trust badges, contacts, neighborhood guides
│   │   ├── ListingCard.tsx           # Image carousel, capacity chips, ratings, price breakdown
│   │   ├── MobileBottomNav.tsx       # Touch-first bottom dock for mobile viewports
│   │   └── Navbar.tsx                # Clean light-theme header with orange & green accents
│   └── lib/
│       ├── mockData.ts               # Realistic Kigali sample data (Kiyovu, Nyarutarama, Prado, etc.)
│       ├── rentalContext.tsx         # State store with LocalStorage persistence & 10-min hold timer
│       └── types.ts                  # Comprehensive TypeScript type definitions
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Theme & Rwandan Color Tokens

- **Light Theme Surface:** `#FAF7F2` (Warm sand) and pure `#FFFFFF` cards with subtle slate borders.
- **Accent Action:** Terracotta Clay / Warm Orange (`#C85A2A` / `terracotta`) for CTAs, active highlights, and badges.
- **Secondary Support:** Olive / Forest Green (`#5A6B3C` / `olive`) for verification tags, eco/nature specs, and operational status.
- **Primary Text & Headings:** Syne font with deep slate / charcoal (`#0D3846` / `slate-900`) contrast.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
http://localhost:3000
```
