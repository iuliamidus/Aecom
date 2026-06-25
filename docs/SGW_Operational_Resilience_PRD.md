# Product Requirements Document
## SGW Operational Resilience Decision Support Platform — MVP

**Audience:** Technical delivery team
**Client:** Southeastern Grid & Water (SGW)
**Version:** 1
**Author:** Iulia Midus, AECOM AI Solution Engineering

---

## TL;DR PRD — One-Page Summary

- **Problem.** Before a severe-weather event, no one at SGW can quickly answer which critical assets will fail, what the customer impact will be, and where to stage crews — the data is fragmented across GIS, maintenance, weather and field-ops systems.
- **Product.** A decision-support platform that gives the emergency operations team a single 48-hour-ahead asset-risk view and a human-approved crew deployment plan. **AI recommends; humans decide.**
- **Primary user.** EOC Duty Manager ("Marcus"). Secondary: asset/risk engineer, leadership, field crew lead. Regulators/insurers are downstream beneficiaries.
- **MVP (Phase 1).** Unified asset model across grid + water; predictive asset-risk scoring; impact/outage forecast; deployment optimisation (with zone-staging fallback); cross-domain dependency graph; thin read-only GenAI copilot; full audit log.
- **AI portfolio.** Predictive ML, time-series forecasting and constrained optimisation (Phase 1); anomaly detection and computer vision (Phase 2); reinforcement learning and a resilience digital twin (future).
- **Non-functional.** 99.95%+ multi-AZ availability; hundreds of concurrent users; explainable + auditable AI; zero-trust, RBAC + MFA, role/region data segregation; full observability and model-drift monitoring.
- **Key dependencies.** Governed data lake; secured read-only access to source systems; identity provider; routing/ETA service; weather feed; cloud landing zone.
- **Success.** Leading metrics first (time-to-situational-awareness, recommendation acceptance, % pre-event deployments); outage-duration reduction as the lagging outcome.

---

## 1. Product Purpose & Value Proposition

SGW cannot, today, answer a question that determines how a severe-weather event unfolds: *in the next 48 hours, which of our critical assets are most likely to fail, what will the customer impact be, and where should we position our limited crews and equipment to minimise restoration time?* The data exists, but lives across multiple disconnected systems. This product answers that question — fast, with evidence — for the person who has to act on it.

**Objectives (prioritised — the traceability backbone for every requirement below):**

| # | Objective | How we measure it |
|---|-----------|-------------------|
| O1 | Cut time-to-situational-awareness before an event | Minutes from forecast trigger to a ranked, evidence-backed risk view (baseline set in discovery) |
| O2 | Shift operations from reactive to proactive | % of crew deployments initiated pre-event vs post-failure |
| O3 | Make every recommendation explainable and auditable | % of AI outputs showing confidence + factors; 100% of operator actions logged |
| O4 | Integrate with, not replace, existing systems | Number of source systems integrated read-only with zero workflow change |

**Product principles (the compass for trade-offs):** (1) AI recommends, humans decide — no autonomous action on critical infrastructure; (2) degrade gracefully on dirty/incomplete data, always surfacing confidence and evidence; (3) integrate, don't rip-and-replace; (4) explainability and auditability are requirements, not features; (5) earn trust before automation.

---

## 2. Problem Definition & Business Context

SGW serves 8M+ residents across coastal and inland regions exposed to hurricanes, flooding, heatwaves and wildfires, operating substations, transmission networks, water-treatment facilities and pumping stations. It faces rising operational costs, more service disruptions, growing insurance premiums and tightening regulatory pressure on climate resilience.

The operational root cause is **fragmentation**: under time pressure the decision-maker must manually reconcile GIS (*where* assets are), maintenance (*condition*), weather (*incoming hazard*) and field-ops (*crew availability*). No one sees them all together. The result maps directly to the objectives: no real-time situational awareness (O1), structurally reactive operations (O2), and poorly documented decisions for after-action review and regulators (O3).

**Why it matters:** longer outages and slower restoration drive direct cost, customer harm, regulatory exposure and higher premiums. Proactive pre-positioning is the highest-leverage lever available without replacing capital assets.

---

## 3. Key Assumptions & Unknowns

The case is intentionally incomplete. Each assumption is tied to a design consequence and a risk-if-wrong — an assumption that changes no decision isn't worth listing.

| Assumption | How it shapes the solution | Risk if wrong / mitigation |
|---|---|---|
| GIS asset inventory exists (location + type) | Built on GIS read-only as the asset spine | Patchy inventory → cover only assets in GIS; gaps flagged, not invented |
| Historical outage/failure records exist | Risk scores are learned, not just rules | Sparse history → transparent rules+features baseline, learn as data accrues |
| Weather forecast feeds (e.g. NOAA) reachable via API | Forecast is the trigger and a model input | Latency/outage → cache last-good forecast, show staleness |
| Maintenance/condition data is **inconsistent in quality** | Models tolerate missing fields and surface confidence | Treated as a first-class design constraint, not an edge case |
| **(A5)** Crew roster + routing/ETA capability available | Enables the full deployment optimisation | **If absent, optimisation falls back to zone-level staging** — the biggest scope dependency |
| Cloud-first; near-real-time ingestion possible | Event-streaming integration layer | On-prem constraints → batch ingestion with a defined refresh cadence |
| Storms are the primary disruption source | Workflow organised around an event with lead time | Heatwave/wildfire have different lead times — noted for expansion |

**Open unknowns for discovery:** sensor/telemetry coverage; per-source freshness SLAs; existing incident tooling (integrate vs replace); regulatory reporting formats; crew-skill granularity.

---

## 4. Target Users & Pain Points

We narrow deliberately: the MVP centres on one primary persona; others are secondary.

**Primary — "Marcus", EOC Duty Manager.** Runs the Emergency Operations Center during activations, juggling multiple systems under time pressure. His recurring problem is learning *after the fact* that a critical asset failed he could have pre-staged crews for. His goals: see what's at risk early, deploy limited crews where they matter most, keep leadership informed, and keep a defensible record of every call.

| Persona | Role in MVP | Primary pain point | What the product gives them |
|---|---|---|---|
| **EOC Duty Manager (primary)** | Daily user | Fragmented view; reactive deployment; manual reconciliation | Single risk view + approved deployment plan + queryable copilot |
| Asset / Risk Engineer | Validates & tunes the model | Can't quantify which assets are most exposed | Transparent risk scoring with contributing factors |
| Leadership / Exec | Consumes situational awareness | No real-time, evidence-backed picture | Summary view + projected customer impact |
| Field Crew Lead | Receives the plan | Unclear, late tasking | Clear, prioritised, region-scoped assignments |

Regulators and insurers are **downstream beneficiaries** of the audit trail and reporting — not MVP users.

---

## 5. Proposed AI Capabilities

A portfolio of AI techniques, not a single LLM, mapped to the **before / during / after** lifecycle. Every output carries confidence + contributing factors, and every model is versioned and drift-monitored (§9). Only reinforcement learning and the digital twin are genuinely future-state.

**Before — predict & prepare (Phase 1 / MVP)**

1. **Predictive Asset Risk Engine** (*predictive ML*) — scores each asset's failure risk from attributes, forecast hazard exposure and failure history; outputs a ranked score with confidence + top factors. One **common asset-risk schema** scores grid and water assets together. *HITL: advisory; engineer overrides feed retraining.*
2. **Impact & Outage Forecasting** (*time-series*) — projects customers affected and restoration duration by region/time window. *HITL: informs the leadership brief; never auto-published.*
3. **Deployment Optimisation** (*constrained optimisation — assignment + routing + sequencing*) — recommends a crew deployment/staging plan minimising expected restoration time under crew and travel constraints. *HITL: operator approves/edits/rejects — never auto-dispatches; falls back to zone-level staging if routing data is missing.*

**During — respond & coordinate (Phase 2)**

4. **Anomaly Detection** (*streaming / unsupervised ML*) — flags early-warning signals (unusual vibration, pressure loss, transformer overheating) on live telemetry, ranked by severity. *HITL: surfaced for triage; no auto-shutdown.*
5. **Computer Vision** (*image models*) — damage assessment, flood-extent and vegetation-encroachment detection from drone/satellite/crew imagery, feeding updated impact estimates. *HITL: reviewed before action.*

**Throughout**

6. **GenAI EOC Copilot** (*LLM + read-only RAG*) — natural-language query and incident summaries over the outputs above (e.g. "highest flood-risk substations in 24h?"); answers cite underlying assets/scores. *HITL: read-only; takes no actions.*

**Cross-domain dependency graph (differentiator):** asset interdependencies (*substation → pumping station → water-treatment*) so a predicted grid failure propagates into water-service impact — making "all domains" one coherent system rather than parallel pipelines.

**Future-state:** reinforcement learning for adaptive crew dispatch (once enough operational history exists to learn safely); a full **Resilience Digital Twin** for "what-if Category 4 landfall here" simulation.

---

## 6. Functional & Non-Functional Requirements

MoSCoW prioritisation — **Must / Should / Could** (out-of-scope items are **Won't (this time)**, §10) — each traceable to an objective. *Must* means the product does not ship without it.

### Functional

| Rank | Requirement | Priority | Traces to |
|---|---|---|---|
| F1 | Ingest GIS, maintenance, weather and crew data into a unified asset model (read-only) | Must | O4 |
| F2 | Per-asset failure-risk scores with confidence + contributing factors | Must | O1, O3 |
| F3 | Single risk view: rank assets across all domains on one map/list | Must | O1 |
| F4 | Project customer impact and restoration duration | Must | O1 |
| F5 | Human-approvable deployment/staging plan; capture approve/edit/reject | Must | O2, O3 |
| F6 | Cross-domain dependency graph (grid failures → water impact) | Should | O1 |
| F7 | GenAI copilot: NL query + incident summary over outputs | Should | O1 |
| F8 | Full audit log of recommendations, model version, operator actions | Must | O3 |
| F9 | Graceful fallback to zone-level staging when routing data is missing | Must | O2 |
| F10 | After-action / regulatory report export | Could | O3 |

### Non-Functional

| Requirement | Target | Notes |
|---|---|---|
| **Availability** | 99.95%+, multi-AZ with automated failover + degraded-operating mode | Must stay usable *during* the disaster; no single point of failure |
| **Scalability** | Hundreds of concurrent users across regions; thousands of assets; millions of telemetry events/day | Horizontal auto-scaling, read replicas, partitioned event streams, caching |
| **Performance** | Risk view refresh within minutes of a new forecast; queries in seconds | Supports O1 |
| **Explainability** | Confidence + contributing factors on every recommendation | Principle, not optional |
| **Auditability** | Full traceability: model version, inputs, recommendation, action | Regulatory requirement |
| **Security** | Zero-trust; encryption in transit/at rest; RBAC + MFA; role/region data segregation; audit logging | Critical-infrastructure baseline (§9) |
| **Observability** | Central logging, metrics, tracing; SLO alerting; model performance & drift monitoring | Every component *and* model monitored |
| **Maintainability** | Infrastructure-as-code, CI/CD, swappable adapters | Supports O4 and safe iteration |

---

## 7. High-Level Architecture & Integrations

Four layers for delivery-team clarity; internally a ports-and-adapters (hexagonal) approach lets GIS systems, weather providers and the LLM be swapped without touching domain logic.

- **L1 — Data Sources:** GIS, maintenance/EAM, weather (NOAA + commercial), field-ops/crew, telemetry, satellite/drone imagery.
- **L2 — Integration:** event-streaming ingestion, data lake, and the **unified asset model + dependency graph** (canonical, cross-domain).
- **L3 — Intelligence:** risk, forecast, optimisation, anomaly, vision and copilot models — each behind an explainability/audit wrapper.
- **L4 — Experience:** EOC operations dashboard (primary), leadership summary, NL copilot.

**Cloud & resilience:** managed-service-first, deployed across **multiple availability zones with automated failover**; stateless services behind load balancers with **horizontal auto-scaling**; **read replicas + caching** for dashboard spikes; partitioned event streams for telemetry; **IaC + CI/CD** for repeatable, auditable deployments.

**Cross-cutting concerns** apply to every layer: security (zero-trust, RBAC, encryption), observability (logs, metrics, traces, model monitoring), and the explainability/audit wrapper on every model output.

---

## 8. Data Requirements & Dependencies

| Source | Data | Quality consideration |
|---|---|---|
| GIS | Asset location, type, topology | Completeness defines coverage; gaps flagged not imputed |
| Maintenance / EAM | Condition, age, work-order history | **Assumed inconsistent** — model tolerates missing fields |
| Weather | Forecast (wind, flood/surge), historical | Latency → cache last-good, show staleness |
| Outage history | Past failures and restorations | Sparsity → transparent baseline |
| Crew / field ops | Roster, skills, location, equipment | Drives optimisation; absence triggers fallback (F9) |
| External maps | Flood/wildfire maps, road network/travel times | Hazard exposure and routing |

The **common asset-risk schema** (one record shape for any asset: type, age, condition, hazard exposure, criticality, customers-served) lets one model and one ranked list span all domains. The **dependency graph** encodes which assets depend on which, enabling cross-domain cascade reasoning.

**Key delivery dependencies** (prerequisites, not outputs, of Phase 1): a **governed data lake** (precedes modelling); **secured read-only access to source systems** plus the data-sharing agreements/credentials to reach them; an **identity provider (SSO/IdP)** backing RBAC, MFA and segregation; a **routing/ETA service** (else optimisation degrades to zone staging, A5); a **weather feed subscription/API** with an agreed SLA; and a **cloud landing zone** (multi-AZ networking, IaC, observability) before application workloads.

---

## 9. Security, Governance & Human-in-the-Loop

**Human-in-the-loop is the governing stance.** AI supports; humans decide.

| Decision | Human approval required? |
|---|---|
| Asset-risk scoring | No (advisory only) |
| Crew deployment / staging | **Yes** |
| Asset shutdown / de-energisation | **Yes** |
| Emergency declaration | **Yes** |
| Public communications | **Yes** |

**Security & access segregation.** Zero-trust with encryption in transit and at rest. **RBAC** with least privilege + MFA governs *what each role can do*; **role/region-based data segregation** governs *what each role can see* — a crew lead sees only their region's assets and tasks; leadership sees the cross-region summary. Separation of duties applies to sensitive actions; all access is logged.

**Observability & AI governance.** Every component emits logs, metrics and traces to a central stack with SLO alerting. Every model is **versioned and monitored** for performance and **drift**, with automatic alerts when accuracy degrades or inputs shift. Mandatory explainability accompanies every output, and every operator action is logged against the recommendation and model version that informed it — a complete, reconstructable decision trail for regulators and early warning before a model misbehaves.

---

## 10. Success Metrics, MVP Scope & Delivery Priorities

**Metrics — leading first.** Outcome metrics take seasons to attribute; adoption and decision-speed metrics prove value sooner. All targets need a discovery-phase baseline.

| Metric | Type | Target framing |
|---|---|---|
| Time-to-situational-awareness | Leading | Establish baseline, then reduce |
| Recommendation acceptance rate | Leading | Track approve/edit/reject — a direct trust signal |
| % deployments initiated pre-event | Leading | Increase vs reactive baseline (O2) |
| Outage / restoration duration | Lagging | Reduce vs historical baseline, per comparable event |
| Avoided customer-minutes lost | Lagging | Modelled against counterfactual |

- **In (MVP):** F1–F5, F8, F9 (Must) plus F6 dependency graph and F7 copilot (Should); the four Phase-1 AI capabilities; the four-layer architecture with read-only integrations.
- **Out of the MVP:** anomaly detection and computer vision (Phase 2, during-event); reinforcement learning and the resilience digital twin (future); autonomous action of any kind (out of scope); F10 (a Could).

**Delivery priorities:**

1. **Phase 1 — Foundation & MVP:** integrations + unified asset model; risk engine + impact forecast; single risk view; deployment optimisation with fallback; audit log; thin copilot.
2. **Phase 2 — During-event:** live telemetry + anomaly detection; computer-vision damage assessment; richer copilot.
3. **Phase 3 — Learn & scale:** RL-assisted dispatch; resilience digital twin; expansion to more hazards (heatwave, wildfire) and regions.

---

*Living document. Open §3 unknowns should be resolved with SGW during discovery and folded back in. Requirements trace to O1–O4; any scope change is evaluated against those objectives and the §1 principles.*
