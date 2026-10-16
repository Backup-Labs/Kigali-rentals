# Kigali Rentals — Rwanda Living & Executive Mobility

**Kigali Rentals** is an executive-tier vehicle and property rental web platform engineered for seamless mobility and luxury stays across Rwanda. Built with **Next.js 15 (App Router, React 19, TypeScript)**, **Tailwind CSS**, and bespoke tactile design tokens.

Regulated by the **Rwanda Development Board (RDB)**.

---

## 🎨 Design System & Color Palette

The interface features an ultra-luxury automotive & prestige mobility aesthetic inspired by elite dark mode automotive showrooms:

- **Deep Obsidian (`#0B0C0E` / `#111111`):** The pitch-black primary foundation across body background, dark glass cards, and immersive surfaces.
- **Charcoal Surface (`#141519` / `#1A1B20`):** Elevated tactile card containers with subtle frosted borders (`rgba(255,255,255,0.08)`).
- **Warm Amber Gold (`#FFC72C`):** Vibrant prestige accent for action pills, subtitle eyebrows, active tab indicators, rating stars, and contact icons.
- **Gold Hover / Dark (`#FFD54F` / `#E5B224`):** Skeuomorphic tactile gradients with subtle warm amber glow.
- **Crisp Pure White (`#FFFFFF`):** High-contrast headline typography, pricing figures, and phone numbers.
- **Typography:**
  - **Headings & Badges:** `Tenor Sans` (editorial luxury serif).
  - **Display Marquee:** `Syne` (modern geometric display font).
  - **Body Text & Controls:** `Plus Jakarta Sans` (ultra-legible modern sans).
  - **Numerical Pricing:** `Outfit` with tabular figures (`tnum`).

---

## ✨ Key Features & Experience

### 1. Dual Inventory Discovery (Vehicles & Properties)
- **4x4 Safari & Executive Fleet:** Toyota Land Cruiser Prado TXL, Land Rover Defender 110, RAV4 Hybrid AWD, Mercedes VIP.
- **Furnished Luxury Residences:** Verified apartments and villas across Kiyovu, Nyarutarama, Kimihurura, and Gacuriro.
- **Filter Bar:** Instant tab switching between 4x4 Fleet, Furnished Residences, and Safari Combos.

### 2. Dual Theme Engine (Dark & Light Theme)
- **Instant Seamless Toggle:** Interactive Sun / Moon switch built into both desktop navigation capsule and mobile drawer.
- **Persistent Brand Core:** Retains the prestigious **Warm Amber Gold (`#FFC72C`)** primary identity across both modes (buttons, active pills, star ratings, crest logo, and icons).
- **Dark Theme (Default):** Deep Obsidian (`#0B0C0E`), Charcoal tactile panels (`#141519`), and crisp white typography.
- **Light Theme:** Pearl Off-White canvas (`#F8F9FB`), crisp solid white cards, and high-contrast charcoal text (`#111111`) framed by refined gold accents.
- **Zero FOUC:** Client-side local storage persistence with an instant pre-render script preventing theme flicker.

### 3. Dual Currency Engine (USD & RWF)
- Seamless real-time currency conversion with a persistent toggle in the header and mobile drawer.
- Automatic rate synchronization across listing cards, checkout calculations, and receipts.

### 4. Responsive Navigation
- **Desktop (lg+):** Floating capsule navigation with gold active state indicators, currency toggle, theme switcher, and quick call CTA.
- **Mobile & Tablet:** Minimal top bar with luxury gold crest logo and drawer menu — zero cluttered dual-bars or screen-blocking bottom docks.

### 5. Interactive Hero & Search Hub
- Dynamic badge highlighting Rwanda mobility with rich gold accenting.
- Tabbed vehicle & residence search widget with custom date picker and neighborhood selectors.

### 6. Signature Footer
- Wrapped in **`#0B0C0E`** obsidian black with ambient gold glow.
- Direct concierge booking CTA, newsletter subscription with instant validation, and social links.
- Regulatory RDB compliance verification and copyright bar.
- Continuous infinite right-to-left marquee animation featuring bold **"Kigali Rentals"** branding with gold accents.

### 7. Full Booking & Operations Workflows
- **4-Step Checkout (`/checkout`):** Vehicle verification, digital canvas signature pad, and simulated MTN Mobile Money / Visa checkout.
- **Handover Protocol (`/handover`):** Pre-departure vehicle condition inspection with scratch mapping, odometer logging, and digital sign-off.
- **Admin Hub (`/admin`):** Operations dashboard monitoring fleet occupancy, upcoming returns, maintenance status, and reservation records.

---

## 🏗️ Project Architecture

```
d:\2026-projects\Kigali-Rentals
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx              # Operations Hub: Fleet & property metrics, reservations
│   │   ├── checkout/
│   │   │   └── page.tsx              # 4-Step Checkout with signature pad & MoMo simulator
│   │   ├── handover/
│   │   │   └── page.tsx              # Vehicle Condition Inspection & Handover Protocol
│   │   ├── listings/
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Listing Detail, image gallery, specs & booking card
│   │   ├── globals.css               # Design tokens, skeuomorphic buttons, custom scrollbars
│   │   ├── layout.tsx                # Root layout with Navbar, context provider & Footer
│   │   ├── not-found.tsx             # 404 handler with brand styling
│   │   └── page.tsx                  # Homepage: Hero, discovery grid, neighborhood showcase
│   ├── components/
│   │   ├── ui/
│   │   │   ├── CustomSelect.tsx      # Custom dropdown selector
│   │   │   └── DatePicker.tsx        # Range calendar with preset date selectors
│   │   ├── Footer.tsx                # Brand Obsidian & Gold footer with sliding marquee & RDB badge
│   │   ├── ListingCard.tsx           # Image carousel, specs, pricing, and booking action
│   │   ├── Navbar.tsx                # Floating capsule navbar with scroll spy & mobile drawer
│   │   └── NavigationProgressBar.tsx # Top route transition progress indicator
│   └── lib/
│       ├── mockData.ts               # Kigali fleet & property inventory data
│       ├── rentalContext.tsx         # Global state with currency toggle & booking context
│       └── types.ts                  # TypeScript data models
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18 or higher (v20+ recommended)
- **npm** or **pnpm** / **yarn**

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Run the local development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

### Production Build

```bash
# Compile and build the production bundle
npm run build

# Start the production server
npm run start
```

---

## 🛡️ Regulatory Compliance

All fleet rentals and residential leases conform to Rwandan commercial leasing regulations under the oversight of the **Rwanda Development Board (RDB)**.
