MANDATORY RULE

Before every task, read:

/docs/PROJECT\_CONSTITUTION.md  
/docs/SYSTEM\_ARCHITECTURE.md  
/docs/AI\_ENGINE\_SPEC.md  
/docs/UI\_UX\_SPEC.md

Treat them as the source of truth.

Never make architectural decisions without checking those documents first.

Always read:

/docs/PROJECT\_CONSTITUTION.md  
/docs/SYSTEM\_ARCHITECTURE.md  
/docs/AI\_ENGINE\_SPEC.md  
/docs/UI\_UX\_SPEC.md

before generating code.

Never create features that violate the product vision.

Prioritize:  
\- simplicity  
\- scalability  
\- AI-first architecture  
\- visual-first UX

Always use TypeScript.

Always follow the established architecture.

Before touching `apps/web` components or routes, read `.cursor/rules/nextjs-rsc-boundaries.md` and follow RSC import rules (no client exports in `shared/index.ts`; no barrel imports from `app/**`).

CURRENT PHASE

PHASE 0

Frontend Visualization Phase

Build:  
\- Design System  
\- Components  
\- Screens  
\- Navigation  
\- Mock Data

Do NOT build:  
\- Backend  
\- APIs  
\- Database  
\- Claude integrations  
\- Authentication  
\- Redis  
\- Queue Workers

Priority:  
1\. UX  
2\. Visual Design  
3\. Information Architecture  
4\. Navigation  
5\. Reusable Components

