# P17 Metering — SaaS Usage-Based Billing & AI Token Metering Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-emerald.svg)](https://www.mongodb.com/cloud/atlas)
[![Docker](https://img.shields.io/badge/Docker-Containers-blue.svg)](https://www.docker.com/)

**P17 Metering** is a corporate-grade, high-throughput SaaS usage-based billing, AI token telemetry metering, and entitlement-gating platform built for modern API-first applications and Generative AI microservices. Inspired by industry systems like Stripe Billing and Metering API gateways, P17 Metering enables multi-tenant SaaS companies to measure usage in real-time, execute multi-tiered bracket rating calculations, manage prepaid wallet credit debits atomically, enforce zero-balance entitlement gating (`HTTP 402 Payment Required`), handle automated dunning workflows, and generate period-end itemized invoices.

---

## 👥 Team & Project Details

### Team Details Table

| S.No | Student Name | Roll No / Registration No | Department | Section / Batch | Project Code |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | Gagan Aditya | 2261543 | B.Tech Computer Science & Engineering (AI & ML) | 5-BTCS-A | **P17** |
| 2 | Team Member 2 | 2261544 | B.Tech Computer Science & Engineering | 5-BTCS-A | **P17** |
| 3 | Team Member 3 | 2261545 | B.Tech Computer Science & Engineering | 5-BTCS-A | **P17** |
| 4 | Team Member 4 (if applicable) | 2261546 | B.Tech Computer Science & Engineering | 5-BTCS-A | **P17** |

* **Course Name**: Advanced JavaScript Backend Frameworks (Node.js & Express JS)
* **Assessment**: Continuous Internal Assessment - 3 (CIA-3 Project Development)
* **Institution**: Christ University & L&T EduTech

---

## 📄 Problem Statement

Traditional flat-rate monthly subscriptions fail to address the operational dynamics of modern streaming Generative AI models (LLMs), serverless computing, and API-first SaaS platforms where infrastructure costs scale dynamically per API call or generated token. **P17 Metering** solves this challenge by providing an end-to-end backend and full-stack billing architecture that ingests raw, high-volume consumption telemetry via secure API keys (`x-api-key`), evaluates consumption against multi-bracket usage rate tiers (free allowances, volume discounts), atomically debits prepaid wallet credit balances using race-condition-safe database operations, enforces real-time zero-balance entitlement gating (`HTTP 402 Payment Required`), executes automated dunning state transitions (`past_due` → `canceled`), and aggregates period-end itemized invoices and executive MRR/Churn analytics dashboards.

---

## 🛠️ Technology Stack

* **Backend Framework**: Node.js, Express.js (Modular MVC architecture)
* **Database & ORM**: MongoDB Atlas, Mongoose ODM (Indexes, compound indexes, `$inc` atomic operators)
* **Frontend UI**: React 18 (Vite), Tailwind CSS, Lucide Icons, Axios Client
* **Security & Auth**: JSON Web Tokens (JWT), bcryptjs password hashing, Helmet HTTP hardening, Express Mongo Sanitize
* **API Documentation**: OpenAPI 3.0 Specification, Swagger UI (`/api-docs`)
* **Reliability & Rate Limiting**: Node-Cache (In-memory TTL entitlement cache), Express Rate Limit (Per-API-Key and IP limits), Winston structured JSON logging
* **Containerization & CI/CD**: Docker, Multi-stage Dockerfiles, Docker Compose, GitHub Actions (`ci.yml`)

---

## 📋 13-Module Specification Compliance Matrix

| # | Spec Required Module | Backend Implementation File | Frontend Implementation File | Description / Feature Summary |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **User Registration & Auth** | [`authController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/authController.js) | [`LoginPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/LoginPage.jsx) | Sign-up, login, JWT issuance, bcrypt password hashing, and auto-provisioning of tenant accounts. |
| **2** | **Subscription Plan Management** | [`planController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/planController.js) | [`PlansPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/PlansPage.jsx) | Admin CRUD for subscription plans, base fees, currency, unit names, and multi-tier usage rate arrays. |
| **3** | **Subscription Creation Workflow** | [`subscriptionController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/subscriptionController.js) | [`CustomersPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/CustomersPage.jsx) | Assigns a customer to a billing plan with automated 30-day period dates. |
| **4** | **Plan Upgrade/Downgrade Logic** | [`subscriptionController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/subscriptionController.js) | [`CustomersPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/CustomersPage.jsx) | Mid-cycle plan modifications; automatically cancels preceding active subscriptions. |
| **5** | **Usage Metering Records** | [`usageController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/usageController.js) | [`UsageLogsPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/UsageLogsPage.jsx) | Ingests raw consumption events (`eventName`, `units`, `metadata`, `timestamp`). |
| **6** | **Invoice Generation Engine** | [`invoice.service.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/services/invoice.service.js) | [`InvoicesPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/InvoicesPage.jsx) | Periodic billing run engine aggregating base fees and metered usage charges into line items. |
| **7** | **Payment Status Tracking** | [`walletController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/walletController.js) | [`InvoicesPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/InvoicesPage.jsx) | Tracks invoice payment states (`paid`, `unpaid`), wallet settlements, and audit ledger entries. |
| **8** | **Subscription Cancellation & Grace** | [`dunning.service.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/services/dunning.service.js) | [`App.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/App.jsx) | Period-end cancellation workflows with past-due status transitions. |
| **9** | **Coupon / Discount Application** | [`rating.service.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/services/rating.service.js) | [`PlansPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/PlansPage.jsx) | Evaluates free token allowances and bracket discount rates per tier. |
| **10** | **Customer Billing Dashboard** | [`walletController.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/controllers/walletController.js) | [`WalletPage.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/WalletPage.jsx) | Customer portal for credit balances, low-balance warning banners, and financial ledgers. |
| **11** | **Dunning / Failed Payment Workflow** | [`dunning.service.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/services/dunning.service.js) | [`AnalyticsDashboard.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/AnalyticsDashboard.jsx) | Evaluates overdue invoices, increments retry counts, and triggers `warning` → `final_notice` → `canceled`. |
| **12** | **Admin Revenue Reports** | [`analytics.service.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/services/analytics.service.js) | [`AnalyticsDashboard.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/pages/AnalyticsDashboard.jsx) | Executive metrics: Monthly Recurring Revenue (MRR), Churn Rate %, Token Volume, Outstanding Debts. |
| **13** | **Role-Based Access Control (RBAC)** | [`auth.middleware.js`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/backend/src/middlewares/auth.middleware.js) | [`ProtectedRoute.jsx`](file:///Users/gaganaditya/Desktop/Sulli/p17-metering/frontend/src/components/ProtectedRoute.jsx) | Restricts endpoints and UI elements to authorized roles (`admin` vs `customer`). |

---

## 📡 REST API Endpoint Reference

| Method | Endpoint Path | Authentication | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register a new User account (Admin or Customer tenant). |
| `POST` | `/api/v1/auth/login` | Public | Authenticate credentials & receive a signed JWT token. |
| `GET` | `/api/v1/auth/me` | JWT | Fetch current authenticated user profile & tenant details. |
| `GET` | `/api/v1/plans` | Public | List all active pricing & metering plans. |
| `POST` | `/api/v1/plans` | JWT Admin | Create a new plan with tiered pricing rules. |
| `GET` | `/api/v1/customers` | JWT | Fetch all customer tenants (populated with active subscriptions). |
| `POST` | `/api/v1/customers` | JWT Admin | Onboard a new customer & generate a unique API Key. |
| `POST` | `/api/v1/subscriptions` | JWT Admin | Assign or upgrade a customer subscription plan. |
| `POST` | `/api/v1/usage/ingest` | `x-api-key` + Entitlement | High-throughput telemetry ingestion & rating. Returns `402` if credit is 0. |
| `GET` | `/api/v1/usage/logs` | JWT | Fetch metered usage logs (Admin views all; Customer views own). |
| `GET` | `/api/v1/wallets` | JWT | Fetch prepaid wallet balance & transaction ledger. |
| `POST` | `/api/v1/wallets/topup` | JWT | Add prepaid credits to a customer wallet ($inc atomic balance). |
| `GET` | `/api/v1/invoices` | JWT | List issued invoices. |
| `POST` | `/api/v1/invoices/:id/pay` | JWT | Settle an unpaid invoice using wallet funds or card. |
| `POST` | `/api/v1/invoices/generate` | JWT Admin | Trigger a period-end batch billing run across subscriptions. |
| `GET` | `/api/v1/analytics/dashboard` | JWT Admin | Executive MRR, Churn, Token Volume, and Dunning analytics. |
| `GET` | `/api-docs` | Public | **Interactive OpenAPI 3.0 / Swagger UI Documentation**. |
| `GET` | `/health/liveness` | Public | Container liveness check probe (`200 OK`). |
| `GET` | `/health/readiness` | Public | Container readiness probe (verifies MongoDB Atlas connection). |

---

## 🗄️ Database Collection Schemas Summary (ER Notes)

### 1. `users` Collection
* **Fields**: `name` (String), `email` (String, Unique), `passwordHash` (String, Selected: false), `role` (Enum: `['admin', 'customer']`), `customerId` (Ref: Customer).

### 2. `customers` Collection
* **Fields**: `name` (String), `email` (String, Unique), `apiKey` (String, Unique, Indexed), `currency` (String), `status` (Enum: `['active', 'suspended']`).

### 3. `plans` Collection
* **Fields**: `name` (String, Unique), `description` (String), `baseFee` (Number), `currency` (String), `unitName` (String), `usageTiers` (Array of `{ upTo: Number, unitPrice: Number }`), `isActive` (Boolean).

### 4. `subscriptions` Collection
* **Fields**: `customerId` (Ref: Customer), `planId` (Ref: Plan), `status` (Enum: `['active', 'past_due', 'canceled']`), `currentPeriodStart` (Date), `currentPeriodEnd` (Date), `retryCount` (Number), `dunningStatus` (Enum: `['none', 'warning', 'final_notice', 'terminated']`).
* **Compound Index**: `{ customerId: 1, status: 1 }`.

### 5. `usageEvents` Collection
* **Fields**: `customerId` (Ref: Customer), `subscriptionId` (Ref: Subscription), `eventName` (String), `units` (Number), `calculatedCost` (Number), `metadata` (Mixed Object), `timestamp` (Date).
* **Compound Indexes**: `{ customerId: 1, timestamp: -1 }`, `{ customerId: 1, eventName: 1 }`.

### 6. `wallets` Collection
* **Fields**: `customerId` (Ref: Customer, Unique), `balance` (Number), `currency` (String), `autoTopUp` (Boolean), `threshold` (Number).

### 7. `transactions` Collection
* **Fields**: `customerId` (Ref: Customer), `amount` (Number), `type` (Enum: `['credit', 'debit']`), `description` (String), `metadata` (Mixed Object), `timestamp` (Date).

### 8. `invoices` Collection
* **Fields**: `invoiceNumber` (String, Unique), `customerId` (Ref: Customer), `subscriptionId` (Ref: Subscription), `lineItems` (Array of `{ description, quantity, amount }`), `baseFee` (Number), `usageFee` (Number), `totalAmount` (Number), `status` (Enum: `['draft', 'paid', 'unpaid', 'void']`), `billingPeriod` (`{ start, end }`), `dueDate` (Date), `paidAt` (Date).

---

## ⚡ Quick Local Setup & Installation Guide

### Prerequisites
* **Node.js**: v18.x or v20.x installed
* **MongoDB**: MongoDB Atlas Cluster URI or local MongoDB instance

---

### Step 1: Clone Repository & Setup Environment Files

```bash
git clone https://github.com/your-username/p17-metering.git
cd p17-metering
```

Create `/backend/.env` file:
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/p17_metering?retryWrites=true&w=majority
NODE_ENV=development
JWT_SECRET=p17_development_secret_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Create `/frontend/.env` file:
```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

---

### Step 2: Install Dependencies & Run Backend Server

```bash
cd backend
npm install
npm start
```
*Backend will connect to MongoDB Atlas and launch on `http://localhost:5001`.*

---

### Step 3: Launch Frontend Application

Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend will launch on `http://localhost:3000` (or `http://localhost:5173`).*

---

### Step 4: Access Swagger Interactive Docs & Application

* **Web Application UI**: `http://localhost:3000`
* **Swagger API Documentation**: `http://localhost:5001/api-docs`

---

## 🐳 Docker Container Execution

To run the full stack (Backend, Frontend, and MongoDB) using Docker Compose:

```bash
docker-compose up --build
```

* **Frontend**: `http://localhost:8080`
* **Backend API**: `http://localhost:5001/api/v1`
* **Swagger UI**: `http://localhost:5001/api-docs`
