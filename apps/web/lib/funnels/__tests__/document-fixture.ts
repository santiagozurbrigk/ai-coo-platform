/**
 * lib/funnels/__tests__/document-fixture.ts
 *
 * Transcripción VERBATIM del documento fuente `Funnel Metrics Standard v1.0`
 * (Aug 2026), tal como aparece en su HTML.
 *
 * Este archivo es la fuente de verdad de los tests de conformidad: no importa
 * nada de `lib/funnels`, sólo copia el documento. Si el documento cambia, se
 * actualiza ACÁ primero y los tests dicen exactamente qué plantillas quedaron
 * desactualizadas.
 *
 * No "arreglar" nada de este archivo para que un test pase. Si un test falla,
 * el error está en la plantilla, no en el documento.
 */

export const DOC_VERSION = "1.0";

/** Tags del encabezado del documento. */
export const DOC_MASTHEAD = {
  spine: "Spend → Cash, 7 stages",
  attribution: "Hyros + Meta + GHL",
  reportingTz: "EST",
  currency: "per-offer, stated",
} as const;

/** Sección 01 — el spine universal. */
export const DOC_SPINE = [
  { n: 1, name: "Spend", metric: "$ deployed / reach" },
  { n: 2, name: "Click", metric: "traffic to funnel" },
  { n: 3, name: "Lead", metric: "opt-in captured" },
  { n: 4, name: "Engaged", metric: "consumed the pitch" },
  { n: 5, name: "Intent", metric: "booked / applied" },
  { n: 6, name: "Sales Conv.", metric: "call / offer live" },
  { n: 7, name: "Cash", metric: "collected revenue" },
] as const;

export type DocFunnelRow = {
  stage: string;
  step: string;
  metric: string;
  range: string;
};

export type DocFunnel = {
  templateId: string;
  title: string;
  sub: string;
  badge: string;
  northStar: string;
  leadingIndicator: string;
  governingRate: string;
  rows: DocFunnelRow[];
};

/** Sección 02 — los tres embudos mapeados. */
export const DOC_FUNNELS: DocFunnel[] = [
  {
    templateId: "webinar",
    title: "Webinar Funnel",
    sub: "One-to-many. Value + pitch delivered live or on evergreen replay, then book-a-call or direct checkout.",
    badge: "Registration-led",
    northStar: "Cost per Sale",
    leadingIndicator: "Show-up rate",
    governingRate: "Attendee → Sale",
    rows: [
      { stage: "Click",       step: "Ad → registration page",        metric: "CTR, cost per click",                   range: "1–3% CTR" },
      { stage: "Lead",        step: "Registration opt-in",           metric: "Reg-page conv., cost/registrant",       range: "25–45% · $3–15" },
      { stage: "Engaged",     step: "Showed up (live + replay)",     metric: "Show-up rate",                          range: "30–50%" },
      { stage: "Engaged",     step: "Stayed to the pitch",           metric: "Stick rate to offer",                   range: "50–70% of attendees" },
      { stage: "Intent",      step: "Clicked CTA / booked call",     metric: "Offer-CTA click rate",                  range: "15–30% of attendees" },
      { stage: "Sales Conv.", step: "Direct buy or closed on call",  metric: "Attendee → sale",                       range: "2–6%" },
      { stage: "Cash",        step: "Payment collected",             metric: "Registrant → sale · cash collected",    range: "1–3% reg → sale" },
    ],
  },
  {
    templateId: "vsl_call",
    title: "VSL Book-a-Call Funnel",
    sub: "Async video pitch → application → sales team closes on a call. The engine for high-ticket.",
    badge: "Application-led",
    northStar: "Cost per Acquisition",
    leadingIndicator: "Cost per booked call",
    governingRate: "Show → Close",
    rows: [
      { stage: "Click",       step: "Ad → VSL page",         metric: "CTR, cost per click",                     range: "1–3% CTR" },
      { stage: "Engaged",     step: "Watched the VSL",       metric: "Play rate, avg watch %",                  range: "55–70% play · to CTA" },
      { stage: "Intent",      step: "Booked / applied",      metric: "Page → booking, cost/booked call",        range: "2–8% · $50–300" },
      { stage: "Intent",      step: "Application quality",   metric: "Qualified rate",                          range: "50–75% qualified" },
      { stage: "Sales Conv.", step: "Showed to the call",    metric: "Show rate",                               range: "50–70%" },
      { stage: "Sales Conv.", step: "Call taken → closed",   metric: "Close rate (of shows)",                   range: "15–30%" },
      { stage: "Cash",        step: "Deposit + collected",   metric: "Booked → close · cash collected %",       range: "10–20% booked → close" },
    ],
  },
  {
    templateId: "dm",
    title: "DM Funnel",
    sub: "Content or ads trigger a conversation. Qualify in the thread, then send an offer or book a call.",
    badge: "Conversation-led",
    northStar: "Cost per Conversation",
    leadingIndicator: "Reply / set rate",
    governingRate: "Conversation → Close",
    rows: [
      { stage: "Click",       step: "Trigger (comment / story / ad)",   metric: "Trigger rate, cost per trigger",        range: "context-set" },
      { stage: "Lead",        step: "Conversation opened",              metric: "Trigger → convo, cost/conversation",    range: "40–70% of triggers" },
      { stage: "Engaged",     step: "Two-way, replied to qualifier",    metric: "Active-reply rate",                     range: "50–70%" },
      { stage: "Intent",      step: "Offer sent or call set",           metric: "Set rate (convo → booked/offer)",       range: "20–40%" },
      { stage: "Sales Conv.", step: "Showed / offer opened",            metric: "Show rate (if call)",                   range: "55–75%" },
      { stage: "Cash",        step: "Closed in thread or on call",      metric: "Conversation → close · cash",           range: "3–10% convo → close" },
    ],
  },
];

/** Sección 03 — KPIs universales. */
export const DOC_KPIS = [
  { abbr: "CAC",       title: "Customer Acquisition Cost",   formula: "total spend ÷ new customers" },
  { abbr: "ROAS",      title: "Return on Ad Spend",          formula: "revenue ÷ ad spend" },
  { abbr: "EPL / EPC", title: "Earnings per Lead / Click",   formula: "revenue ÷ leads (or clicks)" },
  { abbr: "AOV",       title: "Average Order Value",         formula: "revenue ÷ orders" },
  { abbr: "LTV",       title: "Lifetime Value",              formula: "AOV × purchases × retention" },
  { abbr: "CASH",      title: "Cash Collected vs Contracted", formula: "cash in ÷ total contract value" },
] as const;

/** Sección 04 — health bands, con los textos literales de cada celda. */
export const DOC_HEALTH_BANDS = [
  { metric: "LTV : CAC",             good: "≥ 3.0",           watch: "2.0–3.0",     below: "< 2.0",    readAs: "Room to scale vs. margin risk" },
  { metric: "EPL vs CPL",            good: "EPL > 1.5× CPL",  watch: "EPL ≈ CPL",   below: "EPL < CPL", readAs: "Unit economics of the front end" },
  { metric: "Blended ROAS",          good: "≥ 2.0",           watch: "1.3–2.0",     below: "< 1.3",    readAs: "Whole-account profitability" },
  { metric: "Lead → Intent",         good: "at / above bench", watch: "−20% of bench", below: "> −20%", readAs: "Offer / mechanism strength" },
  { metric: "Show rate",             good: "≥ 60%",           watch: "45–60%",      below: "< 45%",    readAs: "Reminder / qualification quality" },
  { metric: "Close rate (of shows)", good: "≥ 25%",           watch: "15–25%",      below: "< 15%",    readAs: "Sales + lead-quality match" },
] as const;

/** Sección 05 — dueño de cada etapa. */
export const DOC_TOOLS = [
  { tool: "Meta Ads",             owns: "Spend, CTR, CPC, cost/lead" },
  { tool: "Hyros",                owns: "True attribution, ROAS, EPL, journeys" },
  { tool: "Landing / VSL page",   owns: "Opt-in %, play rate, watch %" },
  { tool: "WebinarJam / Zoom",    owns: "Show-up, stick rate, CTA clicks" },
  { tool: "Typeform / application", owns: "Qualified rate, booking" },
  { tool: "Calendly",             owns: "Booked calls, show rate" },
  { tool: "GHL pipeline",         owns: "Stage counts, set/close, follow-up" },
  { tool: "Whop / Fanbasis",      owns: "AOV, cash collected, refunds" },
] as const;

/** Sección 05 — cadencia de reporte. */
export const DOC_CADENCE = [
  { when: "Daily",   title: "Pulse",    watches: "spend, leads, CPL, bookings, obvious breaks" },
  { when: "Weekly",  title: "Steering", watches: "show rate, close rate, cost per acquisition, by-source ROAS" },
  { when: "Monthly", title: "Truth",    watches: "blended ROAS, LTV:CAC, cohort retention, cash collected vs contracted" },
] as const;

/** Mapea la etiqueta de etapa del documento al id del spine. */
export const DOC_STAGE_TO_ID: Record<string, string> = {
  "Spend": "spend",
  "Click": "click",
  "Lead": "lead",
  "Engaged": "engaged",
  "Intent": "intent",
  "Sales Conv.": "sales_conv",
  "Cash": "cash",
};
