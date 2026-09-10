# P17 Metering — Presentation Deck Script (15-Slide Master Outline)

---

## 📍 Slide 1: Title & Team Information
* **Slide Title**: P17 Metering — SaaS Usage-Based Billing & AI Token Metering Platform
* **Subtitle**: Advanced JavaScript Backend Frameworks (Node.js & Express JS) — CIA-3 Assessment
* **Presenters**: G.Gagan Aditya (2463020), Hanna Johnson (2463022), Jason Antony - L (2463025), Heba Benny (2463024)
* **Department**: B.Tech in AIML
* **Section / Batch**: 5BTAIML | Project Code: **P17**
* **Institution**: Christ University & L&T EduTech

---

## 📍 Slide 2: Problem Statement
* **Key Challenge**: Traditional flat-rate monthly subscriptions fail to address the financial and technical reality of modern AI applications (e.g. streaming LLMs like GPT-4, serverless APIs) where compute costs scale dynamically per API call or generated token.
* **Core Issues**:
  * Fixed subscription pricing causes margin erosion on heavy users.
  * Inability to ingest high-throughput API telemetry in real-time.
  * Lack of entitlement gating leads to unpaid usage leakage.
* **Solution**: **P17 Metering** — An API-first platform providing high-throughput usage ingestion, multi-tier bracket pricing calculations, atomic wallet debits, and real-time entitlement gating (`HTTP 402`).

---

## 📍 Slide 3: Project Objectives & Core Scope
* **Primary Goals**:
  1. Model multi-tenant customers, plans, subscriptions, and invoices in MongoDB Atlas.
  2. Implement high-volume telemetry ingestion via secure machine-to-machine API keys (`x-api-key`).
  3. Execute multi-tier bracket pricing algorithms (e.g., first 10k free, next 90k at $0.001/unit).
  4. Enforce real-time zero-balance entitlement gating (`HTTP 402 Payment Required`).
  5. Automate period-end invoice generation and dunning state transitions (`past_due` → `canceled`).
  6. Expose executive revenue analytics (MRR, Churn Rate %, Token Volume).

---

## 📍 Slide 4: Technology Stack
* **Backend Architecture**: Node.js, Express.js (Modular MVC folder structure).
* **Database & Data Layer**: MongoDB Atlas, Mongoose ODM (Indexes, compound indexes, `$inc` atomic operators).
* **Frontend Web App**: React 18 (Vite), Tailwind CSS, Lucide Icons, Axios API Client.
* **Security & Auth**: JSON Web Tokens (JWT), bcryptjs password hashing, Helmet HTTP hardening, Express Mongo Sanitize.
* **API Docs & Observability**: OpenAPI 3.0, Swagger UI (`/api-docs`), Node-Cache TTL, Winston structured JSON logging.
* **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD pipeline (`ci.yml`).

---

## 📍 Slide 5: Layered Architecture & Security Pipeline
* **Dual-Authentication Pipeline**:
  * **User Dashboard Flow**: User → React Web App → JWT Bearer Token (`Authorization: Bearer <token>`) → `verifyJWT` → `requireRole('admin')` → Express Controllers.
  * **Telemetry Ingestion Flow**: AI Microservice → API Header (`x-api-key: p17_live_...`) → `verifyApiKey` → `checkEntitlement` (TTL Cache) → Rating Engine → Usage Ingest & Atomic Wallet Debit.

---

## 📍 Slide 6: Database ER Schema & Collection Design
* **Primary Collections**:
  * `User`: Auth credentials, roles (`admin` / `customer`), customerId ref.
  * `Customer`: Company profile, email, unique indexed `apiKey`.
  * `Plan`: Name, base fee, currency, unit name, `usageTiers` array `[{ upTo, unitPrice }]`.
  * `Subscription`: Links Customer and Plan; tracks billing cycle dates and dunning states.
  * `UsageEvent`: Raw consumption logs (`units`, `calculatedCost`, `metadata`, indexed `timestamp`).
  * `Wallet`: Prepaid balance, auto-topup threshold.
  * `Transaction`: Financial ledger audit trail (`credit` / `debit`).
  * `Invoice`: Period-end line items, base fees, usage fees, status (`paid` / `unpaid`).

---

## 📍 Slide 7: High-Throughput Usage Ingestion & Rating Engine
* **Ingestion Endpoint**: `POST /api/v1/usage/ingest`
* **Rating Engine Logic**:
  * Evaluates incoming raw consumption units against the active subscription's `usageTiers`.
  * Multi-bracket tier cost computation:
    $$\text{Cost} = \sum_{i=1}^{n} \text{Units}_{i} \times \text{UnitPrice}_{i}$$
  * Precise monetary rounding to 6 decimal places.

---

## 📍 Slide 8: Prepaid Wallet Balance & Entitlement Gating (HTTP 402)
* **Race-Condition Safety**: Utilizes MongoDB `$inc` atomic operators to credit and debit wallet balances concurrently without read-modify-write race conditions.
* **Entitlement Gating (`checkEntitlement` Middleware)**:
  * Checks in-memory Node-Cache (30s TTL) for wallet balance.
  * If `activeSubscription == null` AND `wallet.balance <= 0`:
    * Immediately halts execution and returns `HTTP 402 Payment Required: Entitlement Exhausted`.
    * Protects infrastructure from un-metered compute drain.

---

## 📍 Slide 9: Invoicing & Automated Dunning Lifecycle
* **Periodic Invoice Engine**:
  * Aggregates base plan fees + period metered usage charges.
  * Generates itemized line items and invoice records.
* **Dunning State Transitions**:
  * Overdue / zero-balance accounts undergo automated retries:
  * Attempt 1: Subscription marked `past_due` (Dunning status: `warning`).
  * Attempt 2: Final notice issued (Dunning status: `final_notice`).
  * Attempt 3: Subscription terminated (Status: `canceled`, Dunning status: `terminated`).

---

## 📍 Slide 10: Executive Revenue Analytics Dashboard
* **SaaS Metrics Calculated**:
  * **MRR (Monthly Recurring Revenue)**: Sum of active subscription base fees.
  * **Churn Rate %**: $\frac{\text{Canceled Subscriptions}}{\text{Total Subscriptions}} \times 100$
  * **Total Metered Tokens**: Aggregate of all ingested usage event units.
  * **Outstanding Debt**: Sum of all unpaid invoice amounts.

---

## 📍 Slide 11: UI Walkthrough — Plans Builder & Customer Portal
* **Plans Builder Page**: Form to configure base fees, currencies, unit names, and dynamic tier limit inputs.
* **Customer Portal**: Table showing onboarded tenant developers, copyable API keys, active plan status tags, and subscription assignment modals.

---

## 📍 Slide 12: UI Walkthrough — Wallet Ledger & Executive Dashboard
* **Prepaid Wallet Page**: Displaying active balance, low-balance warning banner, top-up modal, and full financial ledger audit log.
* **Executive Analytics View**: Metric cards for MRR, token volume, churn rate, and invoice progress charts.

---

## 📍 Slide 13: Postman API Demonstration & Validation Results
* **Postman Collection**: `P17_Metering_Complete.postman_collection.json` (7 folders, 18 requests).
* **Automated Assertions**: Checks status codes (`200 OK`, `201 Created`, `401 Unauthorized`, `402 Payment Required`).
* **Environment Variable Auto-Capture**: Automatically captures signed JWT token on login and API keys on customer onboarding.

---

## 📍 Slide 14: Engineering Challenges & Key Learnings
* **Challenges Overcome**:
  1. Preventing race conditions during parallel usage ingestion → Resolved using Mongoose `$inc` atomic operators.
  2. Reducing database query overhead on high-frequency API calls → Resolved using Node-Cache TTL entitlement caching.
  3. Port collision on Mac (`ControlCenter PID 600`) → Re-configured default backend port to `5001`.
* **Key Learnings**:
  * Production API security (Helmet, NoSQL sanitization, rate limiting).
  * Designing scalable usage-based billing algorithms.

---

## 📍 Slide 15: Conclusion & Q&A
* **Summary**: P17 Metering successfully meets all 13 spec modules, providing a robust, containerized, and documented usage-based billing platform for AI and API products.
* **Documentation Links**:
  * Swagger UI: `http://localhost:5001/api-docs`
  * GitHub Repository: `https://github.com/your-username/p17-metering`
* **Thank You! Questions & Viva Demonstration.**
