# P17 Metering — Consolidated Project Evaluation Report

---

## 📄 PAGE 1: Team & Project Identification

### Team Details Table

| S.No | Student Name | Roll No / Reg No | Department | Section / Batch | Project Code |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | Gagan Aditya | 2261543 | B.Tech Computer Science & Engineering (AI & ML) | 5BTAIML | **P17** |
| 2 | Hannah Johnson | 2261544 | B.Tech Computer Science & Engineering (AI & ML) | 5BTAIML | **P17** |
| 3 | Jason Antony | 2261545 | B.Tech Computer Science & Engineering (AI & ML) | 5BTAIML | **P17** |
| 4 | Hebba Benny | 2261546 | B.Tech Computer Science & Engineering (AI & ML) | 5BTAIML | **P17** |

---

### GitHub Repository URL
**Repository**: [https://github.com/your-username/p17-metering](https://github.com/your-username/p17-metering)

---

### Executive Summary
**P17 Metering** is an enterprise-grade, high-throughput SaaS usage-based billing, AI token telemetry metering, and entitlement-gating platform designed for modern API-first services and Generative AI microservices. Traditional flat-rate subscription models cause margin erosion when compute costs scale dynamically per API request or generated token. P17 Metering addresses this challenge by providing real-time telemetry ingestion using secure machine-to-machine API keys (`x-api-key`), multi-tiered bracket pricing calculations, atomic prepaid wallet balance debits (`$inc` operators), real-time zero-balance entitlement gating (`HTTP 402 Payment Required`), automated period-end invoice generation, automated dunning state transitions (`past_due` → `canceled`), and an executive revenue analytics dashboard.

---

## 📄 PAGE 2: System Architecture & Technology Stack

### System Architecture Flow Diagram

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

### Technology Stack Justification
* **Node.js & Express.js**: Asynchronous event-driven I/O provides high-throughput handling of incoming telemetry HTTP requests.
* **MongoDB Atlas & Mongoose**: Flexible document model accommodates dynamic metadata payloads in usage events while enforcing schema validation and compound indexing.
* **React 18 & Vite**: Component-driven architecture delivering fast dashboard rendering, Tailwind styling, and SPA client-side routing.
* **Node-Cache & Express Rate Limit**: Reduces database lookups for entitlement checks during high-volume event bursts and prevents denial-of-service attempts.

---

## 📄 PAGE 3: Database Collection Schemas (ER Breakdown)

```
  +------------------+           +------------------+
  |      User        |           |     Customer     |
  +------------------+           +------------------+
  | _id (PK)         |           | _id (PK)         |
  | name             |           | name             |
  | email (Unique)   |           | email (Unique)   |
  | passwordHash     |           | apiKey (Unique)  |
  | role             |           | status           |
  | customerId (FK) -|---------->|                  |
  +------------------+           +--------|---------+
                                          |
        +---------------------------------+---------------------------------+
        | (1:N)                           | (1:1)                           | (1:N)
        v                                 v                                 v
+------------------+              +------------------+              +------------------+
|   Subscription   |              |      Wallet      |              |    UsageEvent    |
+------------------+              +------------------+              +------------------+
| _id (PK)         |              | _id (PK)         |              | _id (PK)         |
| customerId (FK)  |              | customerId (FK)  |              | customerId (FK)  |
| planId (FK)      |              | balance          |              | subscriptionId   |
| status           |              | currency         |              | eventName        |
| periodStart/End  |              | threshold        |              | units            |
| dunningStatus    |              +------------------+              | calculatedCost   |
+------------------+                                                | timestamp        |
        |                                                           +------------------+
        | (1:N)
        v
+------------------+
|     Invoice      |
+------------------+
| _id (PK)         |
| invoiceNumber    |
| customerId (FK)  |
| lineItems []     |
| baseFee          |
| usageFee         |
| totalAmount      |
| status           |
+------------------+
```

---

## 📄 PAGE 4: 13-Module Functional Implementation Matrix

| # | Spec Module Name | Backend Files | Frontend Files | Status & Functionality Summary |
| :-: | :--- | :--- | :--- | :--- |
| **1** | User Registration & Auth | `authController.js`, `User.js` | `LoginPage.jsx`, `AuthContext.jsx` | Sign-up, login, JWT token generation, bcrypt password hashing, and auto-provisioning of tenant accounts. |
| **2** | Subscription Plan Management | `planController.js`, `Plan.js` | `PlansPage.jsx` | Admin CRUD for subscription plans, base fees, currency, unit names, and multi-tier usage rate arrays. |
| **3** | Subscription Creation Workflow | `subscriptionController.js`, `Subscription.js` | `CustomersPage.jsx` | Assigns a customer to a billing plan with automated 30-day period dates. |
| **4** | Plan Upgrade/Downgrade Logic | `subscriptionController.js` | `CustomersPage.jsx` | Mid-cycle plan modifications; automatically cancels preceding active subscriptions. |
| **5** | Usage Metering Records | `usageController.js`, `UsageEvent.js` | `UsageLogsPage.jsx` | Ingests raw consumption events (`eventName`, `units`, `metadata`, `timestamp`). |
| **6** | Invoice Generation Engine | `invoice.service.js`, `Invoice.js` | `InvoicesPage.jsx` | Periodic billing run engine aggregating base fees and metered usage charges into line items. |
| **7** | Payment Status Tracking | `walletController.js`, `Transaction.js` | `InvoicesPage.jsx` | Tracks invoice payment states (`paid`, `unpaid`), wallet settlements, and audit ledger entries. |
| **8** | Subscription Cancellation & Grace | `dunning.service.js` | `App.jsx` | Period-end cancellation workflows with past-due status transitions. |
| **9** | Coupon / Discount Application | `rating.service.js` | `PlansPage.jsx` | Evaluates free token allowances and bracket discount rates per tier. |
| **10** | Customer Billing Dashboard | `walletController.js`, `Wallet.js` | `WalletPage.jsx` | Customer portal for credit balances, low-balance warning banners, and financial ledgers. |
| **11** | Dunning / Failed Payment | `dunning.service.js` | `AnalyticsDashboard.jsx` | Evaluates overdue invoices, increments retry counts, and triggers `warning` → `final_notice` → `canceled`. |
| **12** | Admin Revenue Reports | `analytics.service.js` | `AnalyticsDashboard.jsx` | Executive metrics: Monthly Recurring Revenue (MRR), Churn Rate %, Token Volume, Outstanding Debts. |
| **13** | Role-Based Access Control (RBAC) | `auth.middleware.js` | `ProtectedRoute.jsx` | Restricts endpoints and UI elements to authorized roles (`admin` vs `customer`). |

---

## 📄 PAGE 5: Core Engineering Algorithms

### 1. Multi-Tiered Bracket Cost Rating Algorithm
The rating engine evaluates raw consumption units across ordered usage tiers.

```javascript
exports.calculateUsageCost = (units, usageTiers = []) => {
  if (!units || units <= 0) return 0;
  let remainingUnits = units;
  let totalCost = 0;
  let previousLimit = 0;

  const sortedTiers = [...usageTiers].sort((a, b) => (a.upTo === null ? 1 : a.upTo - b.upTo));

  for (const tier of sortedTiers) {
    if (remainingUnits <= 0) break;
    const currentLimit = tier.upTo;
    let tierCapacity = currentLimit === null ? remainingUnits : Math.max(0, currentLimit - previousLimit);
    const unitsInTier = Math.min(remainingUnits, tierCapacity);
    totalCost += unitsInTier * tier.unitPrice;
    remainingUnits -= unitsInTier;
    if (currentLimit !== null) previousLimit = currentLimit;
  }
  return Math.round(totalCost * 1000000) / 1000000;
};
```

### 2. Atomic Wallet Balance Deduction (`$inc` Operator)
To eliminate race conditions during high-volume parallel event posts, wallet balances are modified atomically using MongoDB `$inc`:

```javascript
const updatedWallet = await Wallet.findOneAndUpdate(
  { customerId: customer._id },
  { $inc: { balance: -calculatedCost } },
  { new: true }
);
```

---

## 📄 PAGE 6: Postman API Test Logs & Response Scenarios

### Scenario 1: HTTP 201 Created (Successful Telemetry Ingest)
```json
{
  "success": true,
  "message": "Usage event rated & ingested successfully",
  "eventId": "66f1b2c3d4e5f6a7b8c9d0e1",
  "unitsMetered": 15000,
  "calculatedCost": 2.50
}
```

### Scenario 2: HTTP 401 Unauthorized (Invalid API Key Header)
```json
{
  "success": false,
  "message": "Invalid API Key",
  "errorCode": "INVALID_API_KEY"
}
```

### Scenario 3: HTTP 402 Payment Required (Zero-Balance Entitlement Exhausted)
```json
{
  "success": false,
  "message": "Payment Required: Entitlement depleted or zero wallet balance",
  "errorCode": "ENTITLEMENT_EXHAUSTED",
  "walletBalance": 0,
  "hasActiveSubscription": false
}
```

### Scenario 4: HTTP 403 Forbidden (RBAC Role Mismatch)
```json
{
  "success": false,
  "message": "User role 'customer' is not authorized to access this resource",
  "errorCode": "FORBIDDEN"
}
```

---

## 📄 PAGE 7: UI Component Demonstrations & Deployment Verification

### UI Screen Confirmations
1. **Plans Builder & Rate Tier Editor**: Functional interactive modal creating free allowances and bracketed pricing.
2. **Customer Tenant Portal & Key Management**: Single-click API Key copying and subscription plan assignment.
3. **Usage Logs Telemetry**: Real-time log table with JSON metadata preview and live API simulator.
4. **Prepaid Wallet Ledger**: Entitlement warning banners, credit top-up modals, and ledger audit trails.
5. **Invoices & Settlement**: PDF download and print view formatted for corporate accounting.
6. **Executive Revenue Analytics**: Interactive Cards for MRR, Churn Rate %, and Token Volume.

### Final Container & Deployment Verification
* **Swagger UI API Documentation**: Accessible at `http://localhost:5001/api-docs`.
* **Docker Compose**: Successfully orchestrates `backend` (Express), `frontend` (Nginx static build), and `mongodb` (Persistent volume container).
* **CI/CD Pipeline**: GitHub Actions workflow (`.github/workflows/ci.yml`) passing automated linting and integration tests.
