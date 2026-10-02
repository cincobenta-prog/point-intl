# 🏛️ BENTA'S FUNERAL HOME (EST. 1928)
# Complete Staff Operational Guide, User Manual & Training Tutorial
### *Preserving Four Generations of Harlem Dignity with Absolute Statutory Precision*

**Facility Location:** 630 Saint Nicholas Avenue, Harlem, New York, NY 10030  
**NYS DOH Establishment Registration:** #08850 | **Careline:** (212) 281-8850  
**Director in Charge:** Jason Benta, Licensed Funeral Director  
**Platform Version:** v2.4.0 (Enterprise Cloud & Offline-First PWA)  
**Production URL:** `https://bentas-funeral-home-os.vercel.app`

---

## 📑 TABLE OF CONTENTS

1. [Introduction & Core Philosophy](#1-introduction--core-philosophy)
2. [Security, Access Control & Architecture](#2-security-access-control--architecture)
3. [The 12-Step Master Mortuary Workflow](#3-the-12-step-master-mortuary-workflow)
   - [Step 1: First Call Intake & Triage](#step-1-first-call-intake--triage)
   - [Step 2: Removal Scheduling & Chain of Custody](#step-2-removal-scheduling--chain-of-custody)
   - [Step 3: Golden Record & Statutory Kinship Verification](#step-3-golden-record--statutory-kinship-verification)
   - [Step 4: Arrangement Conference & Form AP-47 Contract Builder](#step-4-arrangement-conference--form-ap-47-contract-builder)
   - [Step 5: NYC DOHMH EDRS Vital Statistics Rapid-Fill](#step-5-nyc-dohmh-edrs-vital-statistics-rapid-fill)
   - [Step 6: DocuSign Remote Signature Dispatch](#step-6-docusign-remote-signature-dispatch)
   - [Step 7: Memorial Program Builder & Commercial Press Fulfillment](#step-7-memorial-program-builder--commercial-press-fulfillment)
   - [Step 8: Financial Verification, Cash Advance & Check Printing](#step-8-financial-verification-cash-advance--check-printing)
   - [Step 9: Facility Calendar, Chapel Staging & Fleet Dispatch](#step-9-facility-calendar-chapel-staging--fleet-dispatch)
   - [Step 10: Family Care Concierge & Digital Tribute Studio](#step-10-family-care-concierge--digital-tribute-studio)
   - [Step 11: Day of Service HUD & VIP Cortege Execution](#step-11-day-of-service-hud--vip-cortege-execution)
   - [Step 12: QuickBooks Accounting, Stripe Payments & 365-Day Grief Care](#step-12-quickbooks-accounting-stripe-payments--365-day-grief-care)
4. [Departmental Quick Reference Guides](#4-departmental-quick-reference-guides)
5. [Step-by-Step Interactive Tutorials (Walkthroughs)](#5-step-by-step-interactive-tutorials-walkthroughs)
6. [Offline Operations & PWA Troubleshooting](#6-offline-operations--pwa-troubleshooting)
7. [Compliance & Legal Hierarchy Cheat Sheet (NYS PHL § 4201)](#7-compliance--legal-hierarchy-cheat-sheet-nys-phl--4201)
8. [Frequently Asked Questions (FAQ)](#8-frequently-asked-questions-faq)

---

## 1. INTRODUCTION & CORE PHILOSOPHY

For nearly a century—since 1928—Benta’s Funeral Home has been the cornerstone of trust, dignity, and sacred reverence for Harlem families. Our reputation was built by hand: through compassionate eye contact in the arrangement room, meticulous preparation in the care center, and flawless cortege execution on St. Nicholas Avenue.

### The Purpose of This Platform
**Technology will never replace the heart, empathy, or professional instinct of a licensed funeral director.**

Instead, this platform serves as your **digital co-pilot and protective shield**. It eliminates tedious repetitive paperwork, prevents statutory errors before they happen, and frees you to do what you do best: **comfort grieving families.**

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                         THE BENTA "ZERO-GAP" SAFETY ARCHITECTURE                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

   WHAT YOU DO (HUMAN CARE)                      HOW THE SYSTEM PROTECTS YOU (SAFETY ENGINE)
   ────────────────────────                      ───────────────────────────────────────────
   • Comfort the family at First Call     ───▶   • Dispatches driver via SMS & secures custody log
   • Guide package & merchandise choice   ───▶   • Auto-calculates Form AP-47 (0 math errors)
   • Collect vital family history         ───▶   • Cross-checks EDRS for missing mother's maiden name
   • Obtain legally required signatures   ───▶   • SMS OTP DocuSign (Never lose a physical form)
   • Issue cash advance honorariums       ───▶   • 1-Click MICR check printer (Auto-balances GL)
   • Lead sanctuary service & cortege     ───▶   • Mobile HUD with live countdown & driver GPS
   • Comfort family after burial          ───▶   • Automated 365-day grief outreach nurture
```

---

## 2. SECURITY, ACCESS CONTROL & ARCHITECTURE

### Role-Based Access Control (RBAC)
The system enforces strict permission boundaries across 5 user tiers:
1. **Owner / Executive Director (Jason Benta)**: Full access to financial ledgers, system settings, QuickBooks API configurations, staff PINs, and audit logs.
2. **General Manager**: Access to scheduling, staff assignments, check printing, discrepancy overrides, and contract approvals.
3. **Licensed Funeral Director**: Full case management, Form AP-47 drafting, EDRS filing, Day of Service HUD, and family coordination.
4. **Staff / Apprentice**: First Call intake, transport logging, photo uploads, and floral staging.
5. **Family / Public Guest**: Read-only access to their specific decedent's memorial portal, tribute studio, and split-payment portal via secure PIN/Token.

### Zero-Trust Client Storage & Credential Isolation
- **Encrypted Local Vault**: All case records and client storage are encrypted using `enc:v1:` salt-based keystream cryptography with SHA-256 integrity checksums.
- **Client Credential Isolation**: Master API secrets (Twilio AuthToken, Stripe Secret Key, OpenAI Key, QuickBooks Secret, DocuSign RSA Key) are stored exclusively in serverless edge functions (`/api/*`) and are **NEVER** exposed to client browser bundles.
- **Biometric & Passkey Authentication**: Managers and Directors can authenticate using WebAuthn (Touch ID, Face ID, YubiKey) or secure 6-digit PINs.

---

## 3. THE 12-STEP MASTER MORTUARY WORKFLOW

```
  [1. First Call Intake] ──▶ [2. Removal & Custody] ──▶ [3. Golden Record / Kinship]
            │
            ▼
  [4. Arrangement & AP-47] ──▶ [5. EDRS Vital Statistics] ──▶ [6. DocuSign Envelope]
            │
            ▼
  [7. Program Press Builder] ──▶ [8. Cash Advance & Checks] ──▶ [9. Facility & Fleet Scheduling]
            │
            ▼
  [10. Family Tribute Studio] ──▶ [11. Day-of-Service HUD] ──▶ [12. QuickBooks & Grief Nurture]
```

---

### Step 1: First Call Intake & Triage
* **Module**: `FirstCallIntakeModal.tsx`
* **Trigger**: A phone call or first notification received from next-of-kin, hospital morgue, hospice nurse, or NYC Medical Examiner.
* **Key Fields to Capture**:
  1. Informant Legal Name, Relationship, Primary Cellular Phone, Email.
  2. Decedent Full Legal Name, Current Location (e.g., Harlem Hospital Morgue, Mount Sinai, Calvary Hospice, Residence).
  3. Date and Time of Death, Attending Physician / Hospice Nurse name and phone.
  4. Medical Examiner (NYC OCME) Case Number (if applicable).
  5. Initial Service Type Request (Traditional Burial, Direct Cremation, Memorial Service).
* **System Action**: 
  - Immediately assigns a unique tracking ID (e.g., `BFH-2026-0089`).
  - Flags whether an autopsy or OCME release authorization is required.
  - Prepares the Removal Dispatch order with 1 click.

---

### Step 2: Removal Scheduling & Chain of Custody
* **Module**: `RemovalSchedulingModal.tsx`
* **Trigger**: Triage complete; decedent ready for transport to 630 Saint Nicholas Avenue.
* **Operational Flow**:
  1. Select primary transport vehicle (e.g., *Van 1 - Harlem Transfer Unit*).
  2. Assign two-man removal team (Lead Director + Transport Associate).
  3. Verify release requirements (Hospital Release Slip, ME Release Stamp, Residence Stair Chair requirement).
  4. Click **"Dispatch Driver via SMS"**: Sends automated SMS to driver with destination address, morgue entrance details, and decedent identification tags.
  5. Upon arrival at Care Center: Record transfer time, refrigeration unit assignment (`Bay A-1` to `Bay D-4`), and personal effects inventory.

---

### Step 3: Golden Record & Statutory Kinship Verification
* **Module**: `GoldenRecordDetail.tsx` & `DiscrepancyGuardrailModal.tsx`
* **Purpose**: Establish the single source of truth for the decedent and verify legal authority to arrange disposition.
* **The 7-Tier NYS PHL § 4201 Hierarchy Engine**:
  The system automatically verifies informant legal priority:
  1. *Designated Written Agent* (NYS Form PHL 4201 signed prior to death).
  2. *Surviving Spouse* (unless legally separated/divorced).
  3. *Surviving Domestic Partner* (registered with NYC or proving financial interdependence).
  4. *Surviving Adult Children* (Majority consensus required; system flags missing sibling waivers).
  5. *Surviving Parents*.
  6. *Surviving Adult Siblings*.
  7. *Court-Appointed Estate Guardian*.
* **Guardrail**: If an estranged child attempts to arrange without notifying other adult siblings, the system alerts the director and provides the **Sibling Waiver & Kinship Affidavit**.

---

### Step 4: Arrangement Conference & Form AP-47 Contract Builder
* **Module**: `ArrangementContractBuilderModal.tsx`
* **Purpose**: Itemized selection of funeral goods and services in accordance with NYS Public Health Law Article 34 and FTC Funeral Rule.
* **Operational Flow**:
  1. **Select Package Tier**:
     - *Traditional Harlem Heritage Package* (Full 2-Day Viewing, Church Service, Hearse, Limousines).
     - *Classic Sanctuary Service* (Same-Day Viewing & Chapel Service at 630 St. Nicholas).
     - *Direct Cremation / Immediate Burial*.
  2. **Select Casket & Vault** (Integrated Batesville Catalog):
     - Browse high-res photos, 18-gauge steel, solid mahogany, bronze, cherry, or oak selections.
     - Automatically verifies Batesville wholesale stock number and warranty certificate.
  3. **Select Professional Services & Facilities**:
     - Basic Services of Funeral Director & Staff (Mandatory non-declinable fee).
     - Embalming preparation & sanitary care.
     - Dressing, cosmetizing, and hairdressing.
     - Chapel rental (Chapel 1 Sanctuary or Chapel 2 Parlor).
     - Livery (Cadillac Master Hearse + 7-Passenger Family Limousines).
  4. **Itemize Cash Advances**:
     - Certified Death Certificates ($15/copy in NYC).
     - NYC Burial/Transit Permit ($40).
     - NYC Cremation Permit ($40).
     - Clergy & Organist Honorariums.
     - Cemetery Opening/Closing or Crematory Charges.
  5. **Auto-Compute**: The system computes line-by-line totals, NYS sales tax on taxable merchandise, and prints/exports official **NYS Form AP-47** with 0 mathematical errors.

---

### Step 5: NYC DOHMH EDRS Vital Statistics Rapid-Fill
* **Module**: `EdrsRapidFillModal.tsx`
* **Purpose**: Prepare and validate all 18 vital statistics fields for New York City Department of Health and Mental Hygiene Electronic Death Registration System (EDRS).
* **Audit Checklist**:
  - [x] Decedent Full Name & Social Security Number.
  - [x] Date of Birth, Age, Place of Birth (City/State or Foreign Country).
  - [x] Father's Full Name & Mother's Full **Maiden Name** (Crucial: missing maiden name causes EDRS rejection).
  - [x] Usual Occupation & Industry (e.g., "Educator - NYC Board of Education").
  - [x] Highest Level of Education.
  - [x] Armed Forces / Veteran Status (Generates DD-214 flag for military honors at Calverton/Pinelawn).
  - [x] Medical Certifier Physician License Number & Hospital Affiliation.
  - [x] Final Disposition Details (Cemetery Name, City, State).
* **Export**: Generates structured XML and clipboard-ready fields for 1-click transfer to the NYC eVital portal.

---

### Step 6: DocuSign Remote Signature Dispatch
* **Module**: `DocuSignEnvelopeModal.tsx`
* **Purpose**: Obtain legally binding e-signatures compliant with NYS ESRA on all arrangement documents without requiring family to travel back and forth.
* **Operational Flow**:
  1. Assemble Document Package (Form AP-47, Embalming Authorization, Cremation Affidavit, Batesville Selection Sheet).
  2. Enter Informant Mobile Number and Email.
  3. Click **"Dispatch via DocuSign RSA JWT"**: The serverless gateway securely sends an encrypted envelope.
  4. Family completes 2FA SMS verification and signs on smartphone or tablet.
  5. Signed document is automatically cryptographically sealed with SHA-256 hash in the case record.

---

### Step 7: Memorial Program Builder & Commercial Press Fulfillment
* **Module**: `MemorialProgramBuilderModal.tsx` & `CommercialPressFulfillmentModal.tsx`
* **Purpose**: Design, review, and print heirloom-quality funeral program booklets.
* **Operational Flow**:
  1. **Select Layout**: 4-Page Bi-Fold, 8-Page Booklet, or 12-Page Deluxe Magazine.
  2. **Select Theme**: Harlem Burgundy `#991b1b`, Royal Onyx, Heavenly Lilac, or Cathedral Gold.
  3. **Populate Content**:
     - Cover: High-res portrait, full name, sunrise/sunset dates, service location.
     - Obituary: Drafted using the 9-Part Harlem Heritage Method or AI Tribute Co-Pilot.
     - Order of Service: Processional, Scripture Readings (Old/New Testament), Solo, Acknowledgements, Eulogy, Benediction.
     - Photo Gallery: Multi-photo memorial collage.
     - Pallbearers & Active Carriers roster.
  4. **Commercial Press Export**:
     - Click **"Export CMYK Press-Ready PDF"**: Generates 300 DPI high-resolution files with 0.125" bleed, trim marks, and booklet imposition.
     - Click **"Send to Commercial Printer"**: Directly dispatches PDF to Harlem printing partners with count specifications (e.g., 250 copies, 100# gloss text, staple-bound).

---

### Step 8: Financial Verification, Cash Advance & Check Printing
* **Module**: `FinancialVerificationCenter.tsx` & `CashAdvanceCheckPrinterModal.tsx`
* **Purpose**: Manage client deposits, insurance assignments, and issue disbursement checks for third-party vendors without bookkeeping errors.
* **Operational Flow**:
  1. **Review Case Ledger**: Verify total contract balance, payments received, and pending cash advances.
  2. **1-Click MICR Check Printer**:
     - Pre-populates payees: Clergy ($350), Minister of Music ($250), Church Janitorial ($150), NYC DOHMH ($15/ea).
     - Prints standard ANSI MICR-encoded checks with Bank Routing, Account Number, and Check Number.
     - Logs check delivery with timestamp and director signature.
  3. **Government Benefit Claims**:
     - NYC HRA Burial Assistance ($1,700 voucher application generator).
     - VA Burial Benefit Form 21P-530 generator.
     - Social Security Form SSA-721 notification flag.

---

### Step 9: Facility Calendar, Chapel Staging & Fleet Dispatch
* **Module**: `FacilityCalendarView.tsx` & `ManagerDirectorSchedulingView.tsx`
* **Purpose**: Coordinate physical rooms at 630 St. Nicholas Ave and schedule livery fleet without conflicts.
* **Facility Spaces**:
  - *Chapel 1 - Main Sanctuary* (Capacity: 220 guests, 4K Webcast, Organ).
  - *Chapel 2 - Harlem Parlor* (Capacity: 75 guests, Intimate Family Viewings).
  - *The Repast Suite* (Catering, Warmers, Dining Tables).
  - *Care Center Prep Room* (Embalming, Dressing, Casketing).
* **Livery 10-Hour Lock Rule**:
  - Cortege routes and driver assignments lock 10 hours prior to service.
  - Chauffeurs receive turn-by-turn routing, pickup addresses, passenger counts, and cemetery gate instructions (Woodlawn, Ferncliff, Pinelawn, Calverton).

---

### Step 10: Family Care Concierge & Digital Tribute Studio
* **Module**: `FamilyPortalView.tsx`, `DigitalTributeStudioView.tsx`, `FloralTributeShopModal.tsx`, `FamilySplitPaymentPortal.tsx`
* **Purpose**: Provide grieving families with a dignified, collaborative digital suite to participate in memorial planning.
* **Features for Families**:
  1. **AI Care Concierge**: 24/7 empathetic assistant answering questions about funeral etiquette, cemetery directions, and grief counseling.
  2. **Harlem Florist Boutique**: Direct integration with Daniela's Flower Shop and Barbara's Flowers for standing sprays, casket covers, and heart wreaths.
  3. **Family Split-Payment Gateway**: Multiple family members can contribute specific amounts toward the funeral invoice using Credit Card, Debit Card, or Apple Pay via Stripe.
  4. **Living Memories Audio Wall**: Distant family members record spoken voice messages and memories from their phones.
  5. **Sacred Hymn & Scripture Library**: Select service hymns (e.g., *Amazing Grace*, *Precious Lord*, *Great Is Thy Faithfulness*) and Bible scriptures.

---

### Step 11: Day of Service HUD & VIP Cortege Execution
* **Module**: `DirectorDayOfServiceHUDModal.tsx` & `DayOfServiceVIPItineraryModal.tsx`
* **Purpose**: Mobile command center for the Licensed Funeral Director leading the service on an iPad or iPhone.
* **HUD Capabilities**:
  - **Live Countdown Timer**: Tracks Viewing Start ➔ Chapel Service ➔ Eulogy ➔ Final Viewing ➔ Cortege Step-Off.
  - **Sanctuary Controls**: Chapel temperature monitoring, wireless mic levels, and 4K webcast live stream status.
  - **Pallbearer Badge Check**: Confirms active pallbearers (6-8) and provides gloves and boutonnieres.
  - **Floral Staging Verification**: Confirms all ribbons and easel placements match family requests.
  - **Cortege Dispatch Coordinator**: Real-time GPS and contact buttons for Hearse Lead, Family Limousine 1, Limousine 2, and Flower Car.

---

### Step 12: QuickBooks Accounting, Stripe Payments & 365-Day Grief Care
* **Module**: `IntegrationsCommandCenterModal.tsx`, `QuickBooksSyncModal.tsx`, `StripePaymentGatewayModal.tsx`
* **Purpose**: Finalize accounting ledger reconciliation and establish ongoing family care.
* **Operational Flow**:
  1. **QuickBooks Online Sync**: 1-click sync pushes invoice line items, tax collected, and cash advance disbursements directly into QuickBooks chart of accounts.
  2. **Stripe Payment Gateway**: Handles credit card authorizations with instant digital receipts sent to family.
  3. **365-Day Grief Care Automation**: Automated, gentle SMS/email check-ins sent to the next of kin at 30 days, 90 days, 180 days, holidays, and the 1-year memorial anniversary.

---

## 4. DEPARTMENTAL QUICK REFERENCE GUIDES

### A. Funeral Director Quick Checklist
1. `First Call`: Capture caller details ➔ Confirm location & release status ➔ Dispatch removal.
2. `Arrangement`: Open case ➔ Select GPL package ➔ Choose casket ➔ Itemize cash advances ➔ Generate Form AP-47.
3. `Signatures`: Dispatch via DocuSign SMS OTP ➔ Verify completed signatures.
4. `EDRS`: Audit 18 vital fields ➔ Verify Mother's Maiden Name ➔ Submit to NYC eVital for burial permit.
5. `Service Day`: Open Director HUD on iPad ➔ Verify pallbearers & floral placement ➔ Lead service & cortege.

### B. Office Manager / Administrator Checklist
1. `Daily Calendar`: Verify room bookings in Facility Calendar to avoid overlaps between Chapel 1 and Chapel 2.
2. `Check Printing`: Print MICR honorarium checks for Clergy, Music, and Death Certificates prior to 9:00 AM on service morning.
3. `QuickBooks Sync`: Sync completed cases to QuickBooks Online every Friday afternoon.
4. `Permit Tracking`: Ensure certified burial/cremation permits are physically attached to the lead hearse clip board.

---

## 5. STEP-BY-STEP INTERACTIVE TUTORIALS (WALKTHROUGHS)

### Tutorial 1: Creating a Complete Case from First Call to Form AP-47
1. Log in to the Director Backoffice with your Passkey or 6-digit PIN.
2. Click the **"+ New Case Intake"** gold button on the top navigation bar.
3. In the **First Call Intake Modal**, type the decedent's full name (e.g., `Marcus Vance`) and death location (`Harlem Hospital`).
4. Enter informant phone number (`(212) 555-0199`) and click **"Save & Create Golden Record"**.
5. On the Case Record screen, click **"Open Contract Builder"**.
6. Select **"Traditional Harlem Heritage Package"**.
7. In the Casket Selector tab, click **"Batesville 18-Gauge Auburn Sunset"**.
8. In Cash Advances, add `10` Certified Death Certificates ($150.00), Clergy ($350.00), and NYC Burial Permit ($40.00).
9. Click **"Generate Form AP-47"** ➔ Click **"Dispatch via DocuSign"**.

### Tutorial 2: Designing & Exporting a Memorial Program for Commercial Print
1. From the Case Record, click **"Memorial Program Studio"**.
2. Select the **8-Page Booklet** layout and **Harlem Burgundy** theme.
3. Upload the cover portrait; adjust crop to center face.
4. In the Obituary tab, click **"AI Assist"** or paste custom text.
5. In the Order of Service tab, arrange the hymn titles, scripture readers, and eulogist name.
6. Click **"Live Preview"** to inspect all 8 pages in booklet layout.
7. Click **"Export CMYK Press-Ready PDF"** (file downloads with crop marks and 300 DPI resolution).

### Tutorial 3: Using the Director Day-of-Service HUD on Mobile/iPad
1. Open Safari on your iPad and navigate to `https://bentas-funeral-home-os.vercel.app`.
2. Select the active case for today's service.
3. Tap **"Day of Service HUD"** in the top action bar.
4. Review the timeline countdown clock.
5. Tap **"Check Pallbearers"** as each carrier arrives and receives their white gloves.
6. Tap **"Check Webcast"** to ensure the 4K sanctuary video stream is broadcasting live.
7. When service concludes, tap **"Step-Off Cortege"** to send vehicle departure signals to all limousine drivers.

---

## 6. OFFLINE OPERATIONS & PWA TROUBLESHOOTING

### What Happens if the Internet Fails at 630 St. Nicholas Ave?
The platform is built with an **Offline-First Progressive Web App (PWA)** architecture:
- **Automatic Local Caching**: Static assets, form builders, and active case records are automatically saved to your device's local memory and IndexedDB vault.
- **Offline Mode Indicator**: A subtle amber badge `[Offline Mode - Vault Active]` will appear in the top status bar.
- **Continuous Case Work**: You can continue filling out forms, reviewing contracts, and checking off Day of Service HUD items without interruption.
- **Automatic Background Re-Sync**: As soon as Wi-Fi or cellular connectivity is restored, all offline edits, check disbursements, and notes are automatically synchronized to the cloud.

### Installing the BFH App on iPads, iPhones & MacBooks
1. Open Safari on iPad/iPhone.
2. Navigate to `https://bentas-funeral-home-os.vercel.app`.
3. Tap the **Share** button (box with arrow pointing up).
4. Tap **"Add to Home Screen"**.
5. The gold Benta's Funeral Home crest icon will appear on your home screen for instant full-screen app access.

---

## 7. COMPLIANCE & LEGAL HIERARCHY CHEAT SHEET (NYS PHL § 4201)

| Priority Tier | Legal Relationship | Required Documentation / Notes |
| :---: | :--- | :--- |
| **Tier 1** | **Designated Written Agent** | NYS PHL § 4201 Written Authorization Form executed prior to death with 2 witnesses. |
| **Tier 2** | **Surviving Spouse** | Must not be legally divorced or have legal separation decree. |
| **Tier 3** | **Surviving Domestic Partner** | Registered with NYC domestic partnership registry or proof of joint financial interdependence. |
| **Tier 4** | **Surviving Adult Children** | Majority rule (e.g., 2 out of 3 children). System requires kinship waiver from non-signing siblings. |
| **Tier 5** | **Surviving Parents** | Either parent with legal custody / kinship rights. |
| **Tier 6** | **Surviving Adult Siblings** | Majority consensus if no higher priority relative exists. |
| **Tier 7** | **Court-Appointed Guardian** | Letters of Guardianship issued by NY Surrogate's Court. |

---

## 8. FREQUENTLY ASKED QUESTIONS (FAQ)

**Q1: How do I change a misspelled decedent name after creating the case?**  
*A: Open the Case Record, click the "Edit Golden Record" button, update the name, and click "Save". The Discrepancy Engine will automatically propagate the corrected spelling across Form AP-47, EDRS, and the Memorial Program.*

**Q2: How do family members access their private portal?**  
*A: Directors click "Send Family Portal Access SMS" on the Case Overview. The family receives a direct link with a secure one-time PIN that logs them into their dedicated portal.*

**Q3: Can we take split payments from multiple family members?**  
*A: Yes. In the Family Portal or Backoffice, open the "Split Payment Portal". Each family member can select their contribution amount ($500, $1,000, custom) and pay via credit card or Apple Pay. The master invoice updates in real time.*

**Q4: Where do we configure live API keys for Twilio, Stripe, OpenAI, and QuickBooks?**  
*A: Log in as Director/Manager, click "Integrations Command Center" in the top right menu, and open the relevant gateway tab. Enter the keys; they are automatically encrypted and saved to serverless environment storage.*

---

*Benta's Funeral Home, Inc. • Four Generations of Sacred Harlem Heritage • Est. 1928*
