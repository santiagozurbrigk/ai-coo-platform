\# SYSTEM ARCHITECTURE

Version: MVP V1

\====================================================  
ARCHITECTURE PHILOSOPHY  
\====================================================

The system must be:

\- Simple  
\- Scalable  
\- AI-first  
\- Async-first  
\- Context-centric

Avoid:

\- microservices  
\- unnecessary complexity  
\- premature optimization

The MVP should operate as a modular monolith.

\====================================================  
HIGH LEVEL ARCHITECTURE  
\====================================================

Frontend (Next.js)  
↓  
API Layer  
↓  
Application Services  
↓  
Queue Layer  
↓  
AI Processing Layer  
↓  
Database  
↓  
Integrations

\====================================================  
TECH STACK  
\====================================================

Frontend:  
\- Next.js App Router  
\- TypeScript  
\- Tailwind  
\- Shadcn/UI  
\- Framer Motion

Backend:  
\- Next.js  
\- Server Actions  
\- API Routes

Database:  
\- PostgreSQL  
\- Supabase

Vector Storage:  
\- pgvector

Queue:  
\- BullMQ

Redis:  
\- Upstash

Auth:  
\- Clerk

Emails:  
\- Resend

AI:  
\- Claude API

Hosting:  
\- Vercel  
\- Railway

\====================================================  
DATABASE TABLES  
\====================================================

ORGANIZATIONS

id  
name  
created\_at  
status

\----------------------------------------------------

USERS

id  
organization\_id  
role  
email  
name  
password\_hash  
status

\----------------------------------------------------

ROLES

Founder  
Admin  
ProjectManager  
Setter  
Operator  
Viewer

\----------------------------------------------------

CONTEXT\_SOURCES

id  
organization\_id  
source\_type

Types:

FATHOM  
LOOM  
NOTION  
GOOGLE\_DOC  
PDF  
AIRTABLE  
SHEETS

\----------------------------------------------------

CONTEXT\_DOCUMENTS

id  
organization\_id  
source\_id  
title  
content  
summary  
created\_at

\----------------------------------------------------

DOCUMENT\_CHUNKS

id  
document\_id  
content  
embedding

\====================================================  
VECTOR SEARCH  
\====================================================

Use:

pgvector

Purpose:

semantic retrieval

Used by:

\- SOP generation  
\- sales analysis  
\- operational reports  
\- recommendations

\====================================================  
SALES TABLES  
\====================================================

CONVERSATIONS

id  
organization\_id  
external\_id  
setter\_id

status

ACTIVE  
GHOSTED  
BOOKED  
CLOSED

\----------------------------------------------------

MESSAGES

id  
conversation\_id  
sender  
message  
timestamp

\====================================================  
BOOKING DETECTION TABLE  
\====================================================

BOOKING\_EVENTS

id  
conversation\_id  
detected\_by\_ai  
confidence  
detected\_at

\====================================================  
OPERATIONAL TABLES  
\====================================================

WEEKLY\_INPUTS

id  
organization\_id  
department  
type

TEXT  
AUDIO  
FORM

content

\====================================================  
REPORTS  
\====================================================

id  
organization\_id  
week  
summary  
risks  
recommendations

\====================================================  
SOP TABLES  
\====================================================

SOPS

id  
organization\_id  
title  
goal  
content  
status

ACTIVE  
OUTDATED  
DRAFT

\====================================================  
AI JOBS  
\====================================================

AI\_JOBS

id  
organization\_id  
type

SOP\_GENERATION

REPORT\_GENERATION

SALES\_ANALYSIS

STATUS

PENDING  
PROCESSING  
COMPLETE  
FAILED

\====================================================  
QUEUE DESIGN  
\====================================================

BullMQ Queues:

sales-analysis

report-generation

sop-generation

embedding-generation

integration-sync

\====================================================  
INTEGRATION LAYER  
\====================================================

ManyChat Sync

↓

Normalize

↓

Internal Schema

↓

Store

\====================================================

Airtable

↓

Normalize

↓

Store

\====================================================

Notion

↓

Normalize

↓

Store

\====================================================

Google Docs

↓

Normalize

↓

Store

\====================================================

Fathom

↓

Import Transcript

↓

Chunk

↓

Embed

↓

Store

\====================================================

Loom

↓

Import Transcript

↓

Chunk

↓

Embed

↓

Store

\====================================================  
SCALABILITY  
\====================================================

Target MVP:

10 organizations

↓

50 organizations

↓

100 organizations

No architectural changes required.

Only scale:

\- Railway  
\- Redis  
\- Supabase

\====================================================  
BACKUPS  
\====================================================

Daily database backups.

Weekly storage backups.

\====================================================  
SECURITY  
\====================================================

RBAC

Role-based access.

Organization isolation.

Server-side authorization.

No client-side permissions.  
