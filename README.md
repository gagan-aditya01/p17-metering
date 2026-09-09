<div align="center">

  # ⚡ P17 METERING
  ### *Real-Time AI Token Telemetry, Usage-Based Billing & Entitlement Engine*

  [![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-v20.x-emerald.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-v4.x-lightgrey.svg?style=for-the-badge&logo=express)](https://expressjs.com/)
  [![React](https://img.shields.io/badge/React-v18.x-cyan.svg?style=for-the-badge&logo=react)](https://react.dev/)
  [![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-green.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
  [![Docker](https://img.shields.io/badge/Docker-Containers-blue.svg?style=for-the-badge&logo=docker)](https://www.docker.com/)
  [![OpenAPI](https://img.shields.io/badge/Swagger-OpenAPI--3.0-brightgreen.svg?style=for-the-badge&logo=swagger)](http://localhost:5001/api-docs)

  ---

  [**Key Features**](#-key-features) •
  [**Architecture**](#-system-architecture--event-pipeline) •
  [**API Reference**](#-api-endpoints-reference) •
  [**13-Module Matrix**](#-spec-13-module-compliance-matrix) •
  [**Local Setup**](#-quick-start--local-setup) •
  [**Swagger UI**](#-interactive-swagger-api-docs)

</div>

---

## 🏛️ Academic & Team Details

> **Continuous Internal Assessment 3 (CIA-3 Project Development)**  
> **Course**: Advanced JavaScript Backend Frameworks (Node.js & Express JS)  
> **Department**: Department of Computer Science & Engineering (Artificial Intelligence & Machine Learning)  
> **Institution**: Christ University & L&T EduTech  
> **Batch / Section**: 5BTAIML | **Project Code**: `P17`

### 👥 Engineering Team Roster

| S.No | Student Name | Registration No | Department | Section / Batch | Project Role |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | **Gagan Aditya** | `2261543` | B.Tech CSE (AI & ML) | `5BTAIML` | Lead Architect & Full-Stack Engineer |
| 2 | **Hannah Johnson** | `2463022` | B.Tech CSE (AI & ML) | `5BTAIML` | Backend Engineer & Database Designer |
| 3 | **Jason Antony** | `2463025` | B.Tech CSE (AI & ML) | `5BTAIML` | Frontend Engineer & UI Specialist |
| 4 | **Hebba Benny** | `2463024` | B.Tech CSE (AI & ML) | `5BTAIML` | QA Engineer & API Test Automation |

---

## 🎯 Executive Overview & Problem Statement

### The Problem
Traditional flat-rate monthly SaaS pricing breaks down in the era of Generative AI (LLMs), serverless infrastructure, and streaming APIs. When compute costs scale dynamically per prompt token, image generation, or API invocation, static $29/month tiers cause severe margin erosion on power users while overcharging light consumers.

### The Solution: P17 Metering
**P17 Metering** is a high-throughput usage telemetry, multi-bracket rating, and real-time entitlement gating engine built explicitly for API-first companies and AI microservices. Inspired by Stripe Billing and Lago, P17 Metering provides:

- 🚀 **High-Throughput Ingestion**: Ingests raw telemetry events via secure `x-api-key` headers.
- 🧮 **Multi-Tiered Bracket Rating Engine**: Computes exact monetary costs per event across customizable pricing tiers (e.g. 10k free tokens, next 90k at $0.001/unit).
- 🔒 **Race-Condition-Safe Ledger**: Credits & debits prepaid wallet balances using atomic MongoDB `$inc` operators.
- ⛔ **Entitlement Gating (`HTTP 402 Payment Required`)**: Intercepts unauthorized API calls instantly when credit reaches zero using an in-memory TTL cache.
- 🔁 **Automated Dunning & Invoicing**: Period-end itemized invoice aggregation and multi-step dunning workflow (`active` → `past_due` → `canceled`).

---

## ⚡ Key Features & Capability Matrix

```
       ┌────────────────────────────────────────────────────────────────────────┐
       │                       P17 METERING PLATFORM CORE                       │
       └──────────────────────────────────┬─────────────────────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
  ┌─────▼──────────┐              ┌───────▼────────┐              ┌─────────▼────────┐
  │  REAL-TIME     │              │  DYNAMIC TIER  │              │   ENTITLEMENT    │
  │  INGESTION     │              │ RATING ENGINE  │              │  GATING (402)    │
  │  Via x-api-key │              │ Multi-Bracket  │              │  TTL Cache Gating│
  └────────────────┘              └────────────────┘              └──────────────────┘
        │                                 │                                 │
        └─────────────────────────────────┼─────────────────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
  ┌─────▼──────────┐              ┌───────▼────────┐              ┌─────────▼────────┐
  │ ATOMIC WALLET  │              │ REVENUE MRR    │              │ AUTOMATED PDF    │
  │ LEDGER DEBITS  │              │ ANALYTICS      │              │ INVOICING        │
  │ Safe $inc Ops  │              │ Executive Hub  │              │ Line-Item Logs   │
  └────────────────┘              └────────────────┘              └──────────────────┘
```

---

## 🏗️ System Architecture & Event Pipeline

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYERS                                     |
|  +-----------------------------------+   +-------------------------------------+  |
|  |   React 18 Web App (Admin/User)   |   |   AI Microservice / External API    |  |
|  +-----------------------------------+   +-------------------------------------+  |
+------------------|-----------------------------------|----------------------------+
                   | JWT Bearer Token                  | x-api-key Header
                   v                                   v
+-----------------------------------------------------------------------------------+
|                            EXPRESS BACKEND GATEWAY                                |
|  +-----------------------------------------------------------------------------+  |
|  | Security Pipeline: Helmet | Mongo Sanitize | CORS | Rate Limiter             |  |
|  +-----------------------------------------------------------------------------+  |
|  | Authentication & RBAC: verifyJWT | verifyApiKey | requireRole('admin')       |  |
|  +-----------------------------------------------------------------------------+  |
|  | Entitlement Gating Middleware: checkEntitlement (Node-Cache 30s TTL)         |  |
|  +-----------------------------------------------------------------------------+  |
|  | Business Logic Services: Rating Engine | Invoice Service | Dunning Service  |  |
|  +-----------------------------------------------------------------------------+  |
+------------------|-----------------------------------|----------------------------+
                   |                                   |
                   v                                   v
+-----------------------------------------------------------------------------------+
|                             PERSISTENCE & OBSERVABILITY                           |
|  +------------------------------------+   +------------------------------------+  |
|  | MongoDB Atlas (Mongoose ODM)       |   | Winston Structured JSON Logger     |  |
|  +------------------------------------+   +------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 📑 Spec 13-Module Compliance Matrix

| # | Spec Module Name | Backend Core File | Frontend View Component | Feature Highlights & Logic Summary |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **User Registration & Auth** | [`authController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/authController.js) | [`LoginPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/LoginPage.jsx) | Sign-up/Login, JWT token signing, bcrypt hashing, and automatic tenant profile provisioning. |
| **2** | **Subscription Plan Management** | [`planController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/planController.js) | [`PlansPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/PlansPage.jsx) | Admin CRUD for base fees, currencies, unit names, and multi-tier usage rate arrays. |
| **3** | **Subscription Creation Workflow** | [`subscriptionController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/subscriptionController.js) | [`CustomersPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/CustomersPage.jsx) | Customer subscription linking with automated 30-day period calculation. |
| **4** | **Plan Upgrade/Downgrade Logic** | [`subscriptionController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/subscriptionController.js) | [`CustomersPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/CustomersPage.jsx) | Instant mid-cycle plan switches; auto-cancels old active subscriptions. |
| **5** | **Usage Metering Records** | [`usageController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/usageController.js) | [`UsageLogsPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/UsageLogsPage.jsx) | Ingests consumption events (`eventName`, `units`, `metadata`, `timestamp`). |
| **6** | **Invoice Generation Engine** | [`invoice.service.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/services/invoice.service.js) | [`InvoicesPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/InvoicesPage.jsx) | Period-end billing run engine compiling base plan costs + metered charges into itemized invoices. |
| **7** | **Payment Status Tracking** | [`walletController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/walletController.js) | [`InvoicesPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/InvoicesPage.jsx) | Wallet debit transactions, payment status tags (`paid`, `unpaid`), and audit ledgers. |
| **8** | **Subscription Cancellation & Grace** | [`dunning.service.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/services/dunning.service.js) | [`App.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/App.jsx) | Grace period access management and automated status deprecations. |
| **9** | **Coupon / Discount Application** | [`rating.service.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/services/rating.service.js) | [`PlansPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/PlansPage.jsx) | Dynamic free token allowance evaluation and tiered bracket discount logic. |
| **10** | **Customer Billing Dashboard** | [`walletController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/walletController.js) | [`WalletPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/WalletPage.jsx) | Customer credit hub, low-balance warning banners, and real-time ledger entries. |
| **11** | **Dunning / Failed Payment Workflow** | [`dunning.service.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/services/dunning.service.js) | [`AnalyticsDashboard.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/AnalyticsDashboard.jsx) | Overdue invoice retry tracker; triggers `warning` → `final_notice` → `canceled`. |
| **12** | **Admin Revenue Reports** | [`analytics.service.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/services/analytics.service.js) | [`AnalyticsDashboard.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/AnalyticsDashboard.jsx) | Executive metrics: Monthly Recurring Revenue (MRR), Churn Rate %, and Token Volume. |
| **13** | **Role-Based Access Control (RBAC)** | [`auth.middleware.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/middlewares/auth.middleware.js) | [`ProtectedRoute.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/components/ProtectedRoute.jsx) | Scopes endpoints and UI navigation strictly to `admin` or `customer` roles. |

---

## 📡 REST API Endpoints Reference

```http
# Authentication Routes
POST   /api/v1/auth/register      - Register user account & auto-provision customer tenant
POST   /api/v1/auth/login         - Authenticate user credentials & receive JWT token
GET    /api/v1/auth/me            - Fetch current user profile & tenant details (JWT)

# Metering & Usage Routes
POST   /api/v1/usage/ingest       - Ingest & rate usage event (Header: x-api-key)
GET    /api/v1/usage/logs         - Retrieve metered usage logs (JWT)

# Wallets & Prepaid Credit Routes
GET    /api/v1/wallets            - Fetch wallet balance & transaction ledger (JWT)
POST   /api/v1/wallets/topup      - Top up prepaid credit balance (JWT)

# Plan & Customer Management (Admin)
GET    /api/v1/plans              - List active plans (Public)
POST   /api/v1/plans              - Create new plan with usage tiers (JWT Admin)
GET    /api/v1/customers          - List customer tenants (JWT)
POST   /api/v1/customers          - Onboard customer tenant & generate API key (JWT Admin)
POST   /api/v1/subscriptions      - Assign subscription plan to customer (JWT Admin)

# Invoicing & Executive Analytics
GET    /api/v1/invoices           - Fetch customer invoices (JWT)
POST   /api/v1/invoices/:id/pay   - Settle invoice using wallet balance (JWT)
POST   /api/v1/invoices/generate  - Trigger period-end batch billing run (JWT Admin)
GET    /api/v1/analytics/dashboard- Executive MRR, Churn & Token Volume dashboard (JWT Admin)

# Observability & OpenAPI Documentation
GET    /api-docs                  - Interactive Swagger UI Documentation
GET    /health/liveness           - Kubernetes / Docker liveness probe (200 OK)
GET    /health/readiness          - DB connection readiness probe
```

---

## 📖 Interactive Swagger API Docs

Explore, test, and execute all API endpoints directly in your browser via Swagger UI:

👉 **[http://localhost:5001/api-docs](http://localhost:5001/api-docs)**

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
* **Node.js**: `v18.x` or `v20.x`
* **MongoDB**: MongoDB Atlas Cluster URI (or local MongoDB)

### 2. Environment Configuration
Create `backend/.env`:
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/p17_metering?retryWrites=true&w=majority
NODE_ENV=development
JWT_SECRET=p17_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

### 3. Run Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5001`.*

### 4. Run Frontend App
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🐳 Docker Deployment

Run the complete multi-container stack with MongoDB, Express API, and Nginx React frontend:

```bash
docker-compose up --build
```

- **Frontend App**: `http://localhost:8080`
- **Backend API**: `http://localhost:5001/api/v1`
- **Swagger Docs**: `http://localhost:5001/api-docs`

---

<div align="center">
  <sub>P17 Metering — Built for Christ University & L&T EduTech Advanced JavaScript Assessment. Released under the MIT License.</sub>
</div>
