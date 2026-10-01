# 🏛️ Benta's Funeral Home — Enterprise Operating Platform & Case Management System
### *Continuous Compassionate Service Since 1928 • NYS Establishment Permit #08850*
**Location:** 630 Saint Nicholas Avenue (at W. 141st St), Harlem, New York, NY 10030 • **Phone:** (212) 281-8850

---

## 📌 Executive Summary

**Benta's Funeral Home Operating Platform** is a full-stack, enterprise-grade funeral home management suite engineered specifically for New York statutory compliance (NYS Public Health Law Article 34, 10 NYCRR Part 77, PHL § 4201, and NYC DOHMH Electronic Death Registration).

The platform seamlessly bridges public client-facing services, family care concierge portals, director operations, statutory state filing, multi-party electronic signatures, general ledger accounting, live sanctuary broadcasting, and commercial printing.

---

## 🚀 Key Architecture & Ecosystem

```
                                    ┌─────────────────────────────────────────────────────────┐
                                    │    BENTA'S FUNERAL HOME ENTERPRISE PLATFORM (1928)      │
                                    │          NYS Reg #08850 • 630 St. Nicholas Ave          │
                                    └─────────────────────────────────────────────────────────┘
                                                                 │
                                ┌────────────────────────────────┴────────────────────────────────┐
                                ▼                                                                 ▼
                 ┌──────────────────────────────┐                                  ┌──────────────────────────────┐
                 │   PUBLIC & FAMILY SUITE      │                                  │   DIRECTOR & BACK-OFFICE     │
                 └──────────────────────────────┘                                  └──────────────────────────────┘
                  • Harlem Heritage Public Hub                                      • First Call Rapid Intake
                  • 24/7 AI Family Concierge                                        • Statutory Form AP-47 Studio
                  • Harlem Florist Guild Shop                                       • NYC DOHMH EDRS eVital Filing
                  • Memorial Candle Wall                                            • DocuSign NYS ESRA Signature Hub
                  • Sacred Repertoire Player                                        • QuickBooks 2-Way GL Sync
                  • 360° Living Voice Archive                                       • JPMorgan Check Disbursement
                  • 4K Sanctuary Livestreaming                                      • Day-of-Service Mobile HUD
                  • Split-Pay Crowdfunding Engine                                   • Statutory Discrepancy Engine
```

---

## ⚡ 9 Enterprise API Gateways & AI Engines

The platform includes production-grade integration layers with live / sandbox configurations and automated CLI setup scripts:

| # | Enterprise Service | Gateway Module | Dedicated CLI Tool | Capabilities |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Stripe Merchant Engine** | [`stripePaymentService.ts`](./src/lib/services/stripePaymentService.ts) | `npm run set-stripe` | Credit/Debit card processing (2.9% + $0.30), Apple Pay, Google Pay, Plaid ACH Direct Debit (0.8% capped at $5), Klarna/Affirm BNPL, and Split-Pay Crowdfunding. |
| **2** | **Twilio Cellular SMS Gateway** | [`twilioService.ts`](./src/lib/services/twilioService.ts) | `npm run set-twilio` | Two-way cellular SMS dispatch for families, livery chauffeurs, organists, clergy, and Harlem florists with automated status callbacks. |
| **3** | **Supabase & AWS S3 Cluster** | [`cloudStorageService.ts`](./src/lib/services/cloudStorageService.ts) | `npm run set-cloud` | Real-time multi-device database synchronization across staff iPads/iPhones, and immutable S3 object vault with SHA-256 integrity sealing. |
| **4** | **DocuSign NYS ESRA Signatures** | [`docusignService.ts`](./src/lib/services/docusignService.ts) | `npm run set-docusign` | Legally binding multi-signer envelope dispatch with SMS OTP identity verification for Form AP-47, PHL § 4201 affidavits, and Batesville warranties. |
| **5** | **Intuit QuickBooks Online (QBO)** | [`quickbooksService.ts`](./src/lib/services/quickbooksService.ts) | `npm run set-qbo` | 2-way general ledger sync, automated customer invoice generation from Form AP-47 itemized lines, and incoming payment reconciliation. |
| **6** | **NYC DOHMH eVital / EDRS** | [`edrsVitalService.ts`](./src/lib/services/edrsVitalService.ts) | `npm run set-edrs` | Direct Electronic Death Registration (EDRS) payload generation, statutory validation, and 72-hour burial-transit permit generation. |
| **7** | **Vimeo Enterprise 4K Broadcast** | [`webcastGatewayService.ts`](./src/lib/services/webcastGatewayService.ts) | `npm run set-webcast` | Private, secure 4K sanctuary livestreaming from Chapel 1 Sanctuary, Chapel 2 Parlor, or Repast Room with DVR recording and remote guestbook. |
| **8** | **Harlem Commercial Press Preflight** | [`commercialPressService.ts`](./src/lib/services/commercialPressService.ts) | `npm run set-press` | 300 DPI CMYK PDF preflight engine with 0.125" bleed enforcement, automated folding imposition (4-page bifold, 8-page booklet), and FTP dispatch. |
| **9** | **OpenAI GPT-4o & Whisper** | [`aiGatewayService.ts`](./src/lib/services/aiGatewayService.ts) | `npm run set-ai` | 9-Part Harlem Heritage Biographical Obituary authoring assistant, multi-lingual translation, and Whisper audio transcription for Living Voice memories. |

---

## 🌸 Harlem Florist Guild & Sympathy Boutique

- **Master Florist Partners:** Direct dispatch integration with **Daniela's Flower Shop (3650 Broadway)** and **Barbara's Flowers (2522 Frederick Douglass Blvd)**.
- **Catalog Selections:** Full Casket Sprays, Standing Crosses & Open Wreaths, Bleeding Hearts, Urn Floral Garlands, Gourmet Fruit Comfort Baskets, and Living Peace Lily Planters.
- **Customizations:** Embossed gold-letter satin ribbon banners (*"Beloved Mother"*, *"In God’s Eternal Grace"*), sympathy enclosure cards, and direct delivery to Chapel 1 Sanctuary or the family residence.

---

## 📱 Director Day-of-Service Mobile HUD

- Designed specifically for tablet (iPad) and mobile (iPhone) use on the sanctuary floor.
- **Live Ceremony Countdown & Milestone Progression:** Real-time tracking of visitation, processional, musical solos, eulogy, and cortege departure.
- **Pallbearer Badge Check-in:** Active and honorary pallbearer coordination.
- **JPMorgan Chase Pass-Through Check Disbursement:** 1-click issuance of cash advance checks for Clergy ($350), Organist ($250), and NYC DOHMH certified death certificates ($150).

---

## 🛠️ Technology Stack

- **Frontend Core:** React 18 + TypeScript + Vite 6
- **Styling & Design System:** Tailwind CSS + PostCSS + CSS Variables (Harlem Obsidian, Crimson & Gold Theme)
- **Icons & Animation:** Lucide React, GSAP
- **State Management:** LocalStorage Persistence with Multi-Device Sync Protocol
- **Build Tooling:** TypeScript (`tsc --noEmit`), Vite Production Bundler

---

## 💻 Quick Start & Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
# Server starts on http://localhost:5173/ or http://localhost:5174/
```

### 3. Run Production Typecheck
```bash
npx tsc --noEmit
```

### 4. Build Production Bundle
```bash
npm run build
```

### 5. Interactive CLI Gateway Setup Scripts
```bash
npm run set-stripe     # Configure Stripe Live/Test Keys & Webhook Secret
npm run set-twilio     # Configure Twilio Account SID, Auth Token & Phone Number
npm run set-cloud      # Configure Supabase Project URL, Anon Key & AWS S3 Bucket
npm run set-docusign   # Configure DocuSign Integration Key, RSA Key & Account ID
npm run set-qbo        # Configure QuickBooks Online Client ID, Secret & Realm ID
npm run set-edrs       # Configure NYC DOHMH eVital LFD Credentials & Facility Permit
npm run set-webcast    # Configure Vimeo Enterprise Livestreaming & Webcast Room
npm run set-press      # Configure Harlem Commercial Press 300 DPI Preflight Gateway
npm run set-ai         # Configure OpenAI GPT-4o Key & Whisper Transcription Model
```

---

## ⚖️ Statutory Legal Compliance Notice

*Benta's Funeral Home Inc. operates under New York State Department of Health Bureau of Funeral Directing Establishment Registration #08850. All itemized goods, cash advances, and professional service charges conform strictly with NYS Public Health Law Article 34, 10 NYCRR Part 77, and Federal Trade Commission (FTC) 16 CFR Part 453 Funeral Industry Practices.*
