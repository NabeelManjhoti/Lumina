# Research & Technical Decisions: RAG Chatbot Foundation

**Feature**: 001-rag-chatbot
**Date**: 2026-03-01
**Purpose**: Document all technical decisions made during Phase 0 research to resolve NEEDS CLARIFICATION items

---

## Decision 1: Clerk Role-Based Access Control

**Context**: Need to implement Customer/Agent/Admin role separation for route protection

### Decision
Use Clerk metadata with custom `role` attribute stored on user objects. Protect routes using Clerk middleware that checks role claims.

### Rationale
- Clerk provides built-in session management and JWT tokens
- Custom attributes can be added to user metadata
- Middleware can intercept requests and validate roles before route access
- Aligns with constitution requirement for Clerk authentication

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Separate Clerk organizations per role | Too complex for single-tenant app, overkill |
| Custom JWT claims outside Clerk | Duplicates Clerk functionality, adds maintenance |
| Database-only role checking | Slower (requires DB call), Clerk already provides this |

### Implementation Pattern
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up'],
  afterAuth(auth, req) {
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn(req);
    }
    // Check role for protected routes
    if (auth.userId && isAdminRoute(req)) {
      const role = auth.sessionClaims?.metadata?.role;
      if (role !== 'ADMIN' && role !== 'AGENT') {
        return new Response('Forbidden', { status: 403 });
      }
    }
  }
});
```

---

## Decision 2: pgvector Schema Design

**Context**: Need optimal Prisma schema for storing document embeddings with vector similarity search

### Decision
Use separate `Document` and `DocumentChunk` models with pgvector `vector` type for embeddings. Use 1536 dimensions for text-embedding-3-small compatibility.

### Rationale
- Separation allows efficient querying of chunks without loading full document
- pgvector extension provides cosine similarity search natively in PostgreSQL
- 1536 dimensions matches OpenAI/Qwen embedding model output
- Prisma supports pgvector via community extensions

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Store embeddings in separate vector DB (Pinecone, Weaviate) | Adds external dependency, pgvector sufficient for MVP |
| Embed full documents instead of chunks | Loses granularity for precise RAG retrieval |
| Store vectors as JSON/arrays | Cannot use native similarity search, slower |

### Schema Pattern
```prisma
model Document {
  id          String   @id @default(uuid())
  name        String
  fileType    String   // PDF | TXT | DOCX
  fileSize    Int
  status      String   // PROCESSING | READY | FAILED | PARTIAL
  uploadedBy  User     @relation(fields: [uploadedById], references: [id])
  uploadedById String
  chunks      DocumentChunk[]
  chunkCount  Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  processedAt DateTime?
}

model DocumentChunk {
  id          String   @id @default(uuid())
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentId  String
  chunkIndex  Int
  content     String
  embedding   Unsupported("vector(1536)")
  createdAt   DateTime @default(now())

  @@index([documentId])
}
```

---

## Decision 3: Document Chunking Strategy

**Context**: Need best practices for text chunking to optimize RAG retrieval quality

### Decision
Use LangChain's `RecursiveCharacterTextSplitter` with 500-token chunk size and 50-token overlap. Split on semantic boundaries (paragraphs, sentences) when possible.

### Rationale
- 500 tokens balances context completeness with retrieval precision
- 50-token overlap (10%) ensures context continuity between chunks
- Recursive splitting preserves semantic structure better than fixed-size
- LangChain provides battle-tested implementation
- Aligns with constitution performance requirement (500-token chunking)

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Fixed-size character splitting | Breaks mid-sentence, loses semantic meaning |
| Larger chunks (1000+ tokens) | Reduces retrieval precision, more noise |
| Smaller chunks (100-200 tokens) | Loses context, more embeddings to store |
| Semantic chunking (by topic) | More complex, marginal quality improvement |

### Implementation Pattern
```typescript
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
  separators: ["\n\n", "\n", ".", " ", ""],
});

const chunks = await splitter.splitText(documentText);
```

---

## Decision 4: Qwen Embedding Models

**Context**: Need correct API configuration for Qwen embeddings via OpenAI-compatible endpoint

### Decision
Use Qwen embedding models via OpenAI-compatible API with custom `baseURL`. Configure `@qwen/qwen-ai` or `openai` package to point to Qwen's endpoint.

### Rationale
- Qwen provides OpenAI-compatible API for drop-in replacement
- Using official `@qwen` package ensures compatibility and updates
- Fallback to `openai` package with custom `baseURL` if needed
- Embedding dimensions match pgvector schema (1536 for text-embedding-3-small equivalent)

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Direct HTTP calls to Qwen API | More boilerplate, packages handle retries/errors |
| Other embedding providers (Cohere, etc.) | Constitution mandates Qwen models |
| Host our own embedding model | Infrastructure complexity, Qwen API sufficient |

### Implementation Pattern
```typescript
import { OpenAI } from "openai";

const qwenClient = new OpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: "https://api.qwen.ai/v1", // or your Qwen endpoint
});

async function generateEmbedding(text: string) {
  const response = await qwenClient.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}
```

---

## Decision 5: File Upload Pattern

**Context**: Need optimal pattern for file uploads with progress tracking in Next.js 15 App Router

### Decision
Use API route with native `FormData` for file uploads, enabling progress tracking via XMLHttpRequest/fetch with progress events. Store files temporarily, then process asynchronously.

### Rationale
- API routes provide server-side file handling and validation
- FormData enables progress events for UX
- Server Actions don't support progress tracking natively
- Aligns with constitution security requirements (validation, size limits)

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Server Actions directly | No progress event support |
| uploadthing library | Adds dependency, native FormData sufficient |
| Direct-to-S3 presigned URLs | Adds complexity, S3 not required for MVP |
| WebRTC peer-to-peer | Overkill, requires server anyway for storage |

### Implementation Pattern
```typescript
// API Route: app/api/upload/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  // Validate file
  const validTypes = ['application/pdf', 'text/plain', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 });
  }
  
  // Check size (e.g., 50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    return Response.json({ error: 'File too large' }, { status: 413 });
  }
  
  // Store file and create document record
  // Return documentId for processing
}
```

---

## Decision 6: Background Job Pattern

**Context**: Need to handle long-running document chunking and embedding tasks without blocking requests

### Decision
Use Server Action triggered by API route for document processing, with status polling from client. Store processing state in `ProcessingJob` model for progress tracking.

### Rationale
- Server Actions can run longer than typical API routes
- Status polling provides real-time UX without WebSockets complexity
- ProcessingJob model enables resumable jobs and error recovery
- Sufficient for MVP scale (1000 concurrent users)

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| WebSockets for real-time updates | Adds complexity (Socket.io, etc.), polling sufficient |
| External job queue (Bull, Redis) | Infrastructure overhead, overkill for MVP |
| Vercel Cron / scheduled functions | Not suitable for user-triggered immediate processing |
| Serverless background functions | Vendor lock-in, cold starts add latency |

### Implementation Pattern
```typescript
// API Route triggers processing
export async function POST(req: Request) {
  const { documentId } = await req.json();
  
  // Create processing job
  const job = await prisma.processingJob.create({
    data: { documentId, status: 'PENDING' },
  });
  
  // Trigger Server Action (non-blocking)
  processDocumentAction(documentId);
  
  return Response.json({ jobId: job.id });
}

// Server Action for processing
'use server';
export async function processDocumentAction(documentId: string) {
  // Update job status
  await prisma.processingJob.update({
    where: { documentId },
    data: { status: 'CHUNKING', progress: 10 },
  });
  
  // Chunk document
  const chunks = await chunkDocument(documentId);
  await prisma.processingJob.update({
    data: { status: 'EMBEDDING', progress: 50 },
  });
  
  // Generate embeddings
  await generateEmbeddings(chunks);
  await prisma.processingJob.update({
    data: { status: 'COMPLETE', progress: 100 },
  });
}

// Client polls for status
useEffect(() => {
  const interval = setInterval(async () => {
    const job = await fetch(`/api/jobs/${jobId}`).then(r => r.json());
    setProgress(job.progress);
    if (job.status === 'COMPLETE') clearInterval(interval);
  }, 2000);
  return () => clearInterval(interval);
}, []);
```

---

## Summary of Resolved Clarifications

| # | Question | Resolution |
|---|----------|------------|
| 1 | How to implement role-based access? | Clerk metadata + middleware |
| 2 | How to store vector embeddings? | pgvector with Prisma, 1536 dimensions |
| 3 | What chunking strategy? | 500 tokens, 50 overlap, recursive splitter |
| 4 | Which Qwen embedding model? | text-embedding-3-small via OpenAI-compatible API |
| 5 | How to handle file uploads? | API route with FormData, progress tracking |
| 6 | How to process documents async? | Server Action + status polling |

**All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design.**
