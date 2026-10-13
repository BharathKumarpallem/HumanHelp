# HumanHelp — A Trusted Human Services Platform

> **"Find the Right Help. With Greater Confidence."**  
> Modern, responsive, full-stack marketplace connecting people with verified real-world professionals, built upon transparent upfront pricing, regulatory credential verification, and fair human dispute arbitration.

[![Live Demo](https://img.shields.io/badge/Live_URL-GitHub_Pages-0D9488?style=for-the-badge&logo=github)](https://bharathkumarpallem.github.io/HumanHelp/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-16324F?style=for-the-badge&logo=github)](https://github.com/BharathKumarpallem/HumanHelp)

- 🌐 **Live Website URL:** [https://bharathkumarpallem.github.io/HumanHelp/](https://bharathkumarpallem.github.io/HumanHelp/)
- 📦 **GitHub Repository:** [https://github.com/BharathKumarpallem/HumanHelp](https://github.com/BharathKumarpallem/HumanHelp)

---

## 1. Executive Summary & Core Principles

HumanHelp is designed to solve the trust deficit in modern service marketplaces:

- **Trust before growth:** Real licenses and credentials inspected before granting status badges. No paid advertising badges or misleading "100% Guaranteed" claims.
- **Transparent pricing:** Upfront fixed or hourly rates agreed before dispatch. Surcharges cannot be added without customer sign-off.
- **Strictly verified reviews:** Reviews are unlocked only for authenticated customers with completed bookings. Zero fake testimonials.
- **Human accountability in consequential decisions:** Dispute rulings and verification applications are adjudicated by human compliance officers, not automated algorithms.
- **Safety and emergency clarity:** Prominent notice that HumanHelp connects users with independent professionals and is not an emergency dispatch service.

---

## 2. Architecture Overview

HumanHelp runs as a **single, unified full-stack application** on a single port (`http://localhost:5173`):

```
HumanHelp Unified Full-Stack Platform (Single Port 5173)
├── Unified Express Server & Vite HMR Engine (server/index.ts)
│   ├── Serves React 19 Frontend with Tailwind CSS & Lucide Icons
│   ├── Serves REST API routes (/api/*) directly on the same host & port
│   ├── Integrated Session, Persona & Role Authorization
│   ├── Model-Independent AI Matching Engine (/api/ai/assistant)
│   └── Multi-perspective Roles (Customer, Provider, Administrator)
│
└── Database & Persistence Layer
    ├── Active Atomic JSON Store (server/data/db.json) with Seed Data & Reset
    └── Supabase PostgreSQL Migration with Row Level Security (supabase/migrations/20261012_init.sql)
```

---

## 3. Project Folder Structure

```
HumanHelp/
├── .env.example                       # Environment variables template
├── index.html                         # Typography, favicon, and SEO meta tags
├── package.json                       # Scripts for concurrent client & server execution
├── postcss.config.js                  # PostCSS plugins
├── tailwind.config.js                 # Trust-focused color tokens, shadows, and dark mode
├── tsconfig.json                      # Project TypeScript root configuration
├── tsconfig.app.json                  # React application TypeScript configuration
├── tsconfig.node.json                 # Node configuration
├── vite.config.ts                     # Vite build & /api proxy to localhost:3001
├── public/                            # Static assets
├── server/                            # BACKEND SERVICE LAYER
│   ├── index.ts                       # Express 5 application and route mounts
│   ├── db.ts                          # Database persistence service & CRUD operations
│   ├── data/
│   │   ├── initialData.ts             # Rich seed dataset with verified profiles
│   │   └── db.json                    # Active persistent database store
│   └── routes/
│       ├── admin.ts                   # Platform metrics, audit logs, and demo reset
│       ├── ai.ts                      # AI discovery assistant with factual provider matching
│       ├── auth.ts                    # Session authentication & demo persona switcher
│       ├── bookings.ts                # Lifecycle state transitions & slot validation
│       ├── categories.ts              # Service categories and licensing rules
│       ├── disputes.ts                # Customer dispute filing & human arbitration
│       ├── messages.ts                # Booking-linked private messenger
│       ├── providers.ts               # Multi-filter provider discovery & service listings
│       ├── reviews.ts                 # Verified booking review validation & responses
│       ├── safety.ts                  # Safety guidelines & confidential incident reports
│       └── verifications.ts           # Credential evidence review queue
├── src/                               # FRONTEND REACT APPLICATION
│   ├── index.css                      # Tailwind base, utilities, and glass cards
│   ├── main.tsx                       # React application bootstrap
│   ├── App.tsx                        # Router layout and global modal mounts
│   ├── types/
│   │   └── index.ts                   # Shared TypeScript domain interfaces
│   ├── context/
│   │   └── AuthContext.tsx            # Global state, theme, favorites, and notifications
│   ├── services/
│   │   └── api.ts                     # Frontend HTTP API client
│   ├── components/
│   │   ├── AIAssistantWidget.tsx      # Floating natural language service matcher
│   │   ├── BookingModal.tsx           # Multi-step booking & escrow pricing breakdown
│   │   ├── DisputeModal.tsx           # Formal dispute submission modal
│   │   ├── Footer.tsx                 # Safety notice, category links, and reset demo tool
│   │   ├── Navbar.tsx                 # Header navigation, notifications, and dark toggle
│   │   ├── PersonaSwitcher.tsx        # 1-click test role switcher (Customer/Provider/Admin)
│   │   ├── ProviderCard.tsx           # Provider summary with verified badges and rates
│   │   ├── ReviewModal.tsx            # Completed service rating & review modal
│   │   └── VerificationBadge.tsx      # Interactive badge with transparency tooltip
│   └── pages/
│       ├── AdminDashboardPage.tsx     # Compliance oversight, queues, disputes & audit log
│       ├── AIAssistantPage.tsx        # Dedicated full-page AI discovery workspace
│       ├── AuthPage.tsx               # Login, sign-up, and demo account shortcuts
│       ├── CustomerDashboardPage.tsx  # Customer bookings overview & saved specialists
│       ├── ExploreServicesPage.tsx    # Multi-faceted search, filters, and directory
│       ├── HomePage.tsx               # Marketplace landing page & trust highlights
│       ├── MessagesPage.tsx           # Booking-linked private chat thread
│       ├── MyBookingsPage.tsx         # Full lifecycle booking tracking & actions
│       ├── ProviderDashboardPage.tsx  # Provider schedule, listings, and request inbox
│       ├── ProviderProfilePage.tsx    # Verified provider profile, services, and reviews
│       └── SafetyCenterPage.tsx       # Safety guidelines and incident reporting desk
└── supabase/
    └── migrations/
        └── 20261012_init.sql          # Complete PostgreSQL schema & RLS policies
```

---

## 4. Setup and Local Development Instructions

### Prerequisites
- Node.js `v20.x` or higher
- npm `v10.x` or higher

### Quick Start (Runs both Frontend & Backend)

1. Clone or navigate to the project directory:
   ```bash
   cd c:\Users\bhara\Desktop\HumanHelp
   ```

2. Install dependencies (already pre-installed):
   ```bash
   npm install
   ```

3. Start the unified full-stack application (Frontend + Backend + DB combined):
   ```bash
   npm run dev
   ```

4. Open your browser:
   - **Unified Application (Frontend + Backend + DB):** [http://localhost:5173](http://localhost:5173)
   - **Backend API Health Check:** [http://localhost:5173/api/health](http://localhost:5173/api/health)
   - **All API routes:** [http://localhost:5173/api/*](http://localhost:5173/api/) (e.g. `/api/providers`, `/api/categories`, `/api/bookings`)
  ```
- To test the production build:
  ```bash
  npm run build
  ```

---

## 5. Demo Personas & Testing Guide

HumanHelp includes a built-in **1-click Persona Switcher** located in the top navigation bar. Click the pill in the header to switch perspectives instantly:

| Persona | Name | Role | What to Test |
| :--- | :--- | :--- | :--- |
| **Customer** | Alex Rivera | `customer` | Discover services, submit booking requests, file disputes, view upcoming appointments, leave verified reviews on completed services. |
| **Provider** | Elena Chen | `provider` | Review incoming booking requests, accept/decline jobs, add new service packages, toggle accepting status, submit credentials for verification. |
| **Administrator** | Marcus Vance | `admin` | Inspect the verification queue, approve credentials or reject with feedback, arbitrate disputes, inspect platform audit trails. |

---

## 6. Supabase Setup & Security Policy Instructions

The application works completely out of the box with the local persistent database. To connect a production Supabase project:

1. Create a project on [Supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/migrations/20261012_init.sql`](file:///c:/Users/bhara/Desktop/HumanHelp/supabase/migrations/20261012_init.sql).
4. In your `.env` file, set:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
5. Row Level Security (RLS) is automatically enabled:
   - Customers can read and update only their own private bookings and messages.
   - Providers can manage only their own listings and schedules.
   - Administrators only have access to the audit logs and verification decisions.

---

## 7. Model-Independent AI Discovery Assistant

The AI Service Discovery Assistant operates on a server-side abstraction layer (`/api/ai/assistant`):

- **Data Grounding:** The assistant strictly parses user service queries and cross-references active records from the database. It will **never** invent providers, make up ratings, or fabricate availability.
- **Provider Agnostic:** By default, it runs an intelligent keyword and constraint extraction engine with zero external dependencies. If an API key is placed in `.env` (`GEMINI_API_KEY` or `OPENAI_API_KEY`), the server utilizes the external LLM through secure server-side calls without exposing keys to the browser.
- **One-Click Pre-filling:** Matched cards returned by the assistant include a direct "Book Now" action that immediately launches the pre-filled booking modal.

---

## 8. Feature Deliverables Matrix

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Marketplace Homepage** | Implemented | Search, hero, category cards, how it works, verified showcase, FAQ, footer |
| **Service Discovery & Search** | Implemented | Query matching, category filter, price slider, rating filter, verified badges |
| **Provider Profiles** | Implemented | Credential inspection, packages, hourly/fixed rates, verified reviews, languages |
| **Interactive Booking Flow** | Implemented | Service selection, slot validation, conflict detection, 5% escrow fee, cancellation terms |
| **Booking Lifecycle** | Implemented | Requested -> Accepted -> Confirmed -> In Progress -> Completed -> Cancelled / Disputed |
| **Reviews & Ratings** | Implemented | Server-validated: only permitted on authenticated completed bookings |
| **In-Platform Messaging** | Implemented | Booking-linked chat threads, read receipts, sender roles |
| **Trust & Verification Desk** | Implemented | Document uploads, admin review queue, approval badges, audit logs |
| **Dispute Resolution Desk** | Implemented | Customer claim filing, evidence notes, human administrative arbitration |
| **Role-Based Dashboards** | Implemented | Tailored workspaces for Customer, Provider, and Admin |
| **Safety & Incident Reporting** | Implemented | Clear emergency notice, trust guidelines, confidential reporting intake |
| **AI Discovery Assistant** | Implemented | Natural language matching, factual grounding, direct booking action |
| **PostgreSQL Schema & RLS** | Implemented | Full migration script with indexes, constraints, and security policies |
| **Local Persistent Store** | Implemented | Atomic JSON store with full demo reset capability |

---

## 9. Test Report & Verification Summary

A comprehensive automated browser test was performed using the browser subagent. All acceptance criteria were verified:

- [x] Application loads at `http://localhost:5173/` with full responsive layout.
- [x] Express backend responds on `http://localhost:3001/api/health`.
- [x] Filtering and search on `/explore` dynamically updates results.
- [x] Verification badges render with explanatory transparency tooltips.
- [x] Booking request creation validates slots and records new booking entries.
- [x] Review creation rejects non-completed bookings and prevents duplicate reviews.
- [x] 1-click persona switching smoothly transitions between Customer, Provider, and Admin dashboards.
- [x] AI Discovery Assistant matches real providers without hallucinations.
- [x] Browser console verified clean with zero runtime exceptions.
