# Implementation Plan: RAG Chatbot Foundation

**Branch**: `001-rag-chatbot` | **Date**: 2026-03-01 | **Spec**: [specs/001-rag-chatbot/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-rag-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a production-grade RAG Chatbot Foundation enabling secure user authentication, admin document upload with automatic chunking/embedding, and document management dashboard. The system uses Next.js 15 App Router with Server Actions, Prisma ORM + PostgreSQL/pgvector for vector storage, Clerk authentication with role-based access (Customer/Agent/Admin), and shadcn/ui dark theme. Users can sign up/login, admins upload knowledge documents (PDF/TXT/DOCX) which are automatically processed into vector embeddings, and all users benefit from accurate AI-powered answers sourced from the knowledge base.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 15, Prisma ORM, Clerk SDK, shadcn/ui, Tailwind CSS, Vercel AI SDK, LangChain.js
**Storage**: PostgreSQL with pgvector extension for vector embeddings
**Testing**: Vitest (unit), React Testing Library (component), Playwright (E2E)
**Target Platform**: Web application (Next.js server + client components)
**Project Type**: Single Next.js web application with App Router
**Performance Goals**: Document processing <2min for 50 pages, p95 latency <200ms (excluding LLM), 1000 concurrent users
**Constraints**: Strict TypeScript, ESLint + Prettier enforced, zero tolerance for bugs/warnings, dark theme only
**Scale/Scope**: MVP foundation with authentication, document upload/processing, and basic admin dashboard

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Technology Stack Compliance ✅ PASS
- Next.js 15 App Router + Server Actions: ✅
- TypeScript strict mode: ✅
- Tailwind CSS + shadcn/ui (dark theme): ✅
- Prisma ORM + PostgreSQL + pgvector: ✅
- Vercel AI SDK for streaming: ✅
- Clerk authentication: ✅
- Qwen models via OpenAI-compatible API: ✅

### Gate 2: UI/Design Compliance ✅ PASS
- Dark theme (zinc-950 base): ✅
- shadcn/ui components only: ✅
- Mobile-first responsive: ✅
- Glassmorphism/neon accents: ✅
- framer-motion animations: ✅

### Gate 3: Code Quality Compliance ✅ PASS
- Strict TypeScript enforced: ✅
- Clean folder structure (app/, components/, lib/, types/): ✅
- JSDoc comments required: ✅
- ESLint + Prettier: ✅

### Gate 4: Testing Compliance ✅ PASS
- Vitest + React Testing Library + Playwright: ✅
- Zero tolerance for bugs: ✅
- Tests after every phase: ✅

### Gate 5: Security Compliance ✅ PASS
- Auth guards on protected routes: ✅
- Secure file uploads with validation: ✅
- Rate limiting on APIs: ✅
- Environment variables for secrets: ✅

### Gate 6: Performance Compliance ✅ PASS
- Streaming responses: ✅
- 500-token chunking: ✅
- Cosine similarity search: ✅

**GATE RESULT**: All constitution principles satisfied. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-rag-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/                 # Next.js project root
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── documents/
│   │   │   ├── upload/
│   │   │   └── layout.tsx
│   │   ├── customer/
│   │   │   └── chat/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── documents/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── [id]/process/
│   │   │       └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── auth/
│   │   ├── sign-in-form.tsx
│   │   └── sign-up-form.tsx
│   ├── documents/
│   │   ├── document-list.tsx
│   │   ├── document-upload.tsx
│   │   ├── document-card.tsx
│   │   └── processing-status.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── theme-provider.tsx
├── lib/
│   ├── prisma.ts
│   ├── clerk.ts
│   ├── embeddings.ts
│   ├── chunking.ts
│   └── utils.ts
├── types/
│   ├── document.ts
│   ├── user.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   │   ├── chunking.test.ts
│   │   └── embeddings.test.ts
│   ├── components/
│   │   ├── document-upload.test.tsx
│   │   └── document-list.test.tsx
│   └── e2e/
│       ├── auth.spec.ts
│       ├── document-upload.spec.ts
│       └── document-management.spec.ts
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Structure Decision**: Existing `frontend/` directory will be used as the Next.js project root. This aligns with the repository's current structure. App Router with route groups for auth and dashboard layouts. API routes for document operations and background processing. All new code will be added to `frontend/` following the constitution-mandated folder organization.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution principles satisfied.

## Phase 0: Research & Technical Decisions

### Research Tasks

1. **Task**: Research Clerk role-based access control patterns for Next.js 15
   - **Output**: How to implement Customer/Agent/Admin roles in Clerk
   - **Decision**: Use Clerk metadata for role storage, middleware for route protection

2. **Task**: Research pgvector schema design for document embeddings
   - **Output**: Optimal Prisma schema for storing vectors with document chunks
   - **Decision**: Separate Document and DocumentChunk models with vector column

3. **Task**: Research document chunking strategies for RAG
   - **Output**: Best practices for text chunking (size, overlap, semantic boundaries)
   - **Decision**: 500-token chunks with 50-token overlap using LangChain text splitter

4. **Task**: Research Qwen embedding models via OpenAI-compatible API
   - **Output**: Correct API configuration and model names for embeddings
   - **Decision**: Use `text-embedding-3-small` or Qwen-specific embedding endpoint

5. **Task**: Research file upload patterns in Next.js 15 App Router
   - **Output**: Server Action vs API route for file uploads with progress
   - **Decision**: API route with uploadthing or native FormData for progress tracking

6. **Task**: Research background job patterns for document processing
   - **Output**: How to handle long-running chunking/embedding tasks
   - **Decision**: Server Action triggered by API route with status polling

## Phase 1: Design & Contracts

### Data Model (data-model.md)

**Entities from spec extended with implementation details:**

1. **User** (managed by Clerk)
   - id: string (Clerk user ID)
   - email: string
   - role: 'CUSTOMER' | 'AGENT' | 'ADMIN'
   - createdAt: DateTime
   - updatedAt: DateTime

2. **Document**
   - id: string (UUID)
   - name: string
   - fileType: string (PDF | TXT | DOCX)
   - fileSize: Int (bytes)
   - status: 'PROCESSING' | 'READY' | 'FAILED' | 'PARTIAL'
   - uploadedById: string (User relation)
   - chunkCount: Int
   - createdAt: DateTime
   - updatedAt: DateTime
   - processedAt: DateTime?

3. **DocumentChunk**
   - id: string (UUID)
   - documentId: string (Document relation)
   - chunkIndex: Int
   - content: String (text content)
   - embedding: Vector (pgvector, 1536 dimensions for text-embedding-3-small)
   - createdAt: DateTime

4. **ProcessingJob**
   - id: string (UUID)
   - documentId: string (Document relation, unique)
   - status: 'PENDING' | 'CHUNKING' | 'EMBEDDING' | 'COMPLETE' | 'FAILED'
   - progress: Int (0-100)
   - errorMessage: String?
   - createdAt: DateTime
   - completedAt: DateTime?

### API Contracts (contracts/)

#### REST API Endpoints

**Documents API**

```yaml
GET /api/documents:
  summary: List all documents (admin only)
  security: Bearer token (Agent/Admin required)
  parameters:
    - name: status
      in: query
      schema: type: string (PROCESSING|READY|FAILED)
    - name: fileType
      in: query
      schema: type: string (PDF|TXT|DOCX)
    - name: search
      in: query
      schema: type: string (search by name)
  responses:
    200: Array<Document>
    401: Unauthorized
    403: Forbidden

POST /api/documents:
  summary: Upload new document (admin only)
  security: Bearer token (Agent/Admin required)
  requestBody:
    content:
      multipart/form-data:
        schema:
          type: object
          properties:
            file: type: string, format: binary
  responses:
    201: { document: Document, jobId: string }
    400: Invalid file type/size
    401: Unauthorized
    403: Forbidden

GET /api/documents/[id]:
  summary: Get document details
  security: Bearer token (required)
  responses:
    200: Document
    404: Not found

DELETE /api/documents/[id]:
  summary: Delete document (admin only)
  security: Bearer token (Agent/Admin required)
  responses:
    204: No content
    404: Not found
    403: Forbidden

POST /api/documents/[id]/process:
  summary: Reprocess document (admin only)
  security: Bearer token (Agent/Admin required)
  responses:
    202: { jobId: string }
    404: Not found
    409: Already processing
```

**Upload API**

```yaml
POST /api/upload:
  summary: Upload file with progress tracking
  security: Bearer token (Agent/Admin required)
  requestBody:
    content:
      multipart/form-data:
        schema:
          type: object
          properties:
            file: type: string, format: binary
  responses:
    200: { url: string, documentId: string }
    400: Invalid file
    413: File too large
```

### Quick Start Guide (quickstart.md)

```markdown
# Quick Start: RAG Chatbot Foundation

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ with pgvector extension
- Clerk account and project
- Qwen API key (or OpenAI-compatible endpoint)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/lumina?schema=public"
   CLERK_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   QWEN_API_KEY="your-key"
   QWEN_BASE_URL="https://api.qwen.ai/v1"
   ```

3. **Setup database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Enable pgvector extension**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

5. **Configure Clerk roles**:
   - Go to Clerk Dashboard > Settings > User Attributes
   - Add custom attribute: `role` (enum: CUSTOMER, AGENT, ADMIN)

6. **Run development server**:
   ```bash
   npm run dev
   ```

7. **Create first admin user**:
   - Visit http://localhost:3000/sign-up
   - Register with email/password
   - In Clerk Dashboard, set user role to ADMIN

## Verify Setup

- [ ] Can sign up and log in
- [ ] Admin can access /admin/documents
- [ ] Can upload a test document
- [ ] Document processes successfully
- [ ] All tests pass: `npm test`
```

## Constitution Check (Post-Design)

*Re-evaluation after Phase 1 design complete*

All gates remain satisfied:
- ✅ Technology Stack: Next.js 15, TypeScript strict, Prisma, PostgreSQL/pgvector, Clerk, shadcn/ui
- ✅ UI/Design: Dark theme, shadcn/ui components, responsive, framer-motion
- ✅ Code Quality: Strict TypeScript, JSDoc, clean architecture
- ✅ Testing: Vitest, RTL, Playwright configured
- ✅ Security: Auth guards, file validation, rate limiting, env vars
- ✅ Performance: Streaming, 500-token chunking, cosine similarity

**GATE RESULT**: Design passes all constitution checks. Ready for implementation.
