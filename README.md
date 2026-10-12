# INTEGRITY OS — AI-Powered Payment Integrity Intelligence

An enterprise-grade, portfolio-quality innovation command center designed to demonstrate strategic product thinking, analytical depth, AI literacy, and frontend architecture for the **Assistant Manager — AI Strategy & Innovation** role within Healthcare Payment Integrity at **EXL**.

---

## 1. Executive Product Vision

Healthcare payment integrity ensures that medical claims are paid accurately according to contracts, statutory coverage rules, and correct medical coding. Operational challenges include:
- Inpatient DRG upcoding and CC/MCC secondary diagnosis inflation.
- High-volume modifier -25 unbundling on minor surgical procedures.
- Specialty injectable dosage and unit multiplier errors (HCPCS J-codes).
- Unbundled ambulatory facility fees and unlisted code abuse.
- Cross-facility transfer date overlaps and statutory per-diem discharge misclassifications.
- Unstructured medical record audit bottlenecks (80+ page chart reviews).

**Integrity OS** embodies the central innovation principle:
> **"Every AI initiative must connect a business problem, an evidence trail, a measurable hypothesis, an accountable owner, and a scale-or-stop decision."**

The platform rejects "AI-only" bias: deterministic clearinghouse rules, SQL analytical monitoring, supervised machine learning, document OCR, and generative AI compete objectively on technical feasibility, total cost of ownership, time to value, and governance risk.

---

## 2. Key Modules & The Signature Feature

1. **Executive Innovation Command Center (`/`)**:
   - Reconciled operational KPI cards (opportunities, active pilots, gross/net benefits, governance debt).
   - Embedded signature **Innovation Decision Graph**.
   - Deterministic *"What Needs Attention?"* diagnostic engine scanning live pilot milestones and unverified baselines.
   - Recharts visual pipeline distribution, pilot recovery trajectories, and technology mix.

2. **Opportunity Radar & Prioritization Engine (`/opportunities`)**:
   - Filterable portfolio of payment integrity problems.
   - **Transparent Weighted Scoring Engine**:
     $$\text{Score} = 0.30 \times \text{Impact} + 0.20 \times \text{Feasibility} + 0.20 \times \text{Data} + 0.15 \times \text{Strategy} + 0.15 \times \text{Time}$$
   - Interactive weight adjusters (must sum to 100%).
   - Dynamic rule-based *"Why this, why now?"* synthesis.
   - Full opportunity creation, editing, and deletion with validation.

3. **Claim Intelligence Investigation Workbench (`/claims`)**:
   - 60+ realistic, synthetic claims across 6 clinical categories (Inpatient DRG, Outpatient Surgery, Professional E&M, Durable Medical Equipment, Pharmacy Injectable, Radiology & Lab).
   - Realistic INR values, expected payable calculations, and simulated risk scores (0–100).
   - Side drawer featuring transparent decision support explaining synthetic feature activations (GMLOS deviations, modifier frequency spikes, drug dosage BSA variances).
   - Status dispositioning (Flagged, Under review, Confirmed error, Cleared, Insufficient evidence) with reviewer note taking.
   - CSV export and batch CSV import with format validation and error feedback.

4. **Solution Lab (`/solutions`)**:
   - Side-by-side trade-off evaluations: Rules & Edits vs SQL Analytics vs ML Risk Scoring vs Generative AI vs Hybrid.
   - Architectural business judgment: Recommends rules when simple rules suffice (e.g. Modifier -25); highlights hallucination risk and 100% human-in-the-loop requirements for GenAI.

5. **Pilot Portfolio & Proof-of-Concept Tracker (`/pilots`)**:
   - Kanban pipeline and high-density table views.
   - Budget utilization tracking and baseline vs target vs observed performance metrics.
   - **The Scale-Readiness Gate**: Enforces all 7 mandatory criteria (hypothesis, verified baseline, observed findings, finance-reviewed assumptions, documented risks, council governance approval, business owner acceptance). Blocks production scale if any condition is unmet.

6. **Value Realization Studio (`/value`)**:
   - Interactive commercial financial model:
     - Potential Annual Exposure: $\text{Volume} \times \text{Error Rate} \times \text{Avg Overpayment}$
     - Incremental Recovery Benefit: $\text{Exposure} \times \text{Detection Lift} \times \text{Realization Rate} \times \text{Adoption Rate}$
     - Operational Labor Capacity Value: $\text{Hours Saved} \times \text{Reviewer Rate}$
     - First-Year Net Position, ROI %, and Payback Period.
   - Multi-year cash flows and 3-Year NPV with user-adjustable discount rate.
   - Sensitivity matrix heatmap (Detection Lift vs Realization Rate).
   - 1-Click scenario presets (Conservative, Base Case, Optimistic).

7. **AI Governance & Risk Docket (`/governance`)**:
   - Responsible AI cards: intended use, PHI isolation, model limitations, human oversight mandates, and fallback procedures.
   - **Governance Debt Tracker**: Unresolved compliance items classified by severity (Critical, High, Medium) and age in days.
   - Session audit trail logging user determinations and weight changes to LocalStorage.

8. **Executive Briefing Studio (`/briefing`)**:
   - Structured 13-section leadership memo generator in plain business English.
   - Audience toggles (Executive Leadership, CFO & Actuarial, CMO & Clinical Policy, VP Operations).
   - Copy to clipboard, download Markdown file, and print view.

9. **Settings & Methodology (`/settings`)**:
   - Weight formula adjustment, currency notation toggles, methodology guide, and one-click demo data reset.

---

## 3. Technology Stack & Architectural Principles

- **Framework**: React 19 + TypeScript (strict typing).
- **Build Tool**: Vite 8.
- **Styling**: Tailwind CSS v4 with dark editorial theme (`#0B1020` canvas, `#11192B` secondary, `#172238` elevated, `#39D6C4` teal accent, `#789BFF` blue accent).
- **Navigation**: React Router (HashRouter for iframe compatibility).
- **Charts**: Recharts.
- **Icons**: Lucide React.
- **State & Persistence**: React Context with LocalStorage persistence.
- **Backend-Free Architecture**: Zero server requirements, zero paid external AI APIs, zero external databases. All scoring, sensitivity matrices, and briefings run deterministically on the client.

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ and npm.

### Installation
```bash
# Clone the repository and install dependencies
npm install
```

### Development Server
```bash
# Start Vite development server on port 3000
npm run dev
```

### Production Build & Verification
```bash
# Compile and verify production build
npm run build
```

---

## 5. How to Reset Demo State
To restore the demo to its baseline synthetic dataset:
1. Navigate to **Settings** (`/settings`) or click the user menu in the top bar.
2. Click **Reset Demo Data**.
3. Confirm the dialog prompt. LocalStorage keys will be cleared and the original synthetic records reloaded.

---

## 6. Future Extensibility (Connecting a Live Backend)

While Integrity OS is built as a self-contained client-side prototype, its architecture is engineered for straightforward enterprise backend integration:
1. **API Abstraction Layer**: Replace the LocalStorage hooks in `src/context/AppContext.tsx` with REST/GraphQL query hooks (e.g. TanStack Query).
2. **Real Claims Pipeline**: Ingest 837/835 EDI feeds into Snowflake / Databricks; connect Claim Intelligence to backend microservices.
3. **ML Scoring Service**: Swap simulated risk scores with inferences from a live Vertex AI or SageMaker endpoint (e.g. XGBoost model serving endpoints).
4. **LLM Orchestration**: Connect the Executive Briefing and Clinical Document Synthesizer to a secure HIPAA-compliant LLM gateway with grounded RAG and optical coordinate return.
5. **Role-Based Access Control (RBAC)**: Implement enterprise SSO (Okta / Azure AD) to partition auditor vs governance board privileges.

---

## 7. Synthetic Data & Non-Affiliation Disclaimer

This is a fictional prototype built for interview portfolio evaluation. It is not an official EXL product. All payer names (Aegis Health Plan), providers, claims, diagnosis codes, model metrics, and savings figures are synthetic estimates. Contains zero Protected Health Information (PHI).
