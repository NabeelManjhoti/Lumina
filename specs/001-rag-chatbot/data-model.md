# Data Model: RAG Chatbot Foundation

**Feature**: 001-rag-chatbot
**Date**: 2026-03-01
**Source**: Derived from spec.md entities and research.md technical decisions

---

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │ (managed by Clerk)
│─────────────│
│ id          │
│ email       │
│ role        │◄────┐
│ createdAt   │     │
│ updatedAt   │     │
└─────────────┘     │
      │1            │
      │             │
      │*            │1
┌─────────────┐     │
│  Document   │─────┘
│─────────────│
│ id          │
│ name        │
│ fileType    │
│ fileSize    │
│ status      │
│ uploadedById│
│ chunkCount  │
│ createdAt   │
│ updatedAt   │
│ processedAt │
└─────────────┘
      │1
      │
      │*
┌─────────────┐
│DocumentChunk│
│─────────────│
│ id          │
│ documentId  │
│ chunkIndex  │
│ content     │
│ embedding   │ (vector(1536))
│ createdAt   │
└─────────────┘

┌─────────────┐
│ProcessingJob│
│─────────────│
│ id          │
│ documentId  │ (unique)
│ status      │
│ progress    │
│ errorMessage│
│ createdAt   │
│ completedAt │
└─────────────┘
```

---

## Entity Definitions

### User

**Purpose**: Represents a platform user with authentication credentials and role-based permissions.

**Management**: Handled by Clerk authentication service. Local database references store Clerk user IDs.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Clerk user ID | Primary key, matches Clerk ID |
| email | String | User email address | Unique, validated format |
| role | Enum | User role: CUSTOMER, AGENT, ADMIN | Default: CUSTOMER |
| createdAt | DateTime | Account creation timestamp | Auto-generated |
| updatedAt | DateTime | Last update timestamp | Auto-updated |

**Validation Rules**:
- Email must be valid format and verified by Clerk
- Role must be one of: CUSTOMER, AGENT, ADMIN
- Role changes must be performed by ADMIN users in Clerk dashboard

**Relationships**:
- One-to-Many with Document (user can upload multiple documents)

---

### Document

**Purpose**: Represents an uploaded knowledge base document with metadata and processing status.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Document UUID | Primary key, UUID v4 |
| name | String | Original file name | Max 255 characters |
| fileType | Enum | File format: PDF, TXT, DOCX | Validated on upload |
| fileSize | Int | File size in bytes | Max 50MB (52428800) |
| status | Enum | Processing status: PROCESSING, READY, FAILED, PARTIAL | Default: PROCESSING |
| uploadedById | String | Reference to User.id | Foreign key, cascade delete |
| chunkCount | Int | Number of chunks generated | Default: 0, min: 0 |
| createdAt | DateTime | Upload timestamp | Auto-generated |
| updatedAt | DateTime | Last metadata update | Auto-updated |
| processedAt | DateTime? | Processing completion timestamp | Nullable |

**Validation Rules**:
- File type must be PDF, TXT, or DOCX
- File size must not exceed 50MB
- Status transitions: PROCESSING → READY | FAILED | PARTIAL
- chunkCount must match actual chunks in DocumentChunk table when READY

**Relationships**:
- Many-to-One with User (uploadedBy)
- One-to-Many with DocumentChunk (cascade delete)
- One-to-One with ProcessingJob

**State Transitions**:
```
PROCESSING ─┬─> READY
            ├─> FAILED
            └─> PARTIAL
```

---

### DocumentChunk

**Purpose**: Represents a segmented portion of a document with vector embedding for similarity search.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Chunk UUID | Primary key, UUID v4 |
| documentId | String | Reference to Document.id | Foreign key, cascade delete |
| chunkIndex | Int | Position in document | Min: 0, unique per document |
| content | String | Text content of chunk | Max 4000 characters |
| embedding | Vector | 1536-dimensional embedding | pgvector type |
| createdAt | DateTime | Chunk creation timestamp | Auto-generated |

**Validation Rules**:
- chunkIndex must be sequential (0, 1, 2, ...)
- content should be approximately 500 tokens (soft constraint)
- embedding must have exactly 1536 dimensions
- content is derived from document text via chunking algorithm

**Relationships**:
- Many-to-One with Document (cascade delete)

**Indexes**:
- Composite index on (documentId, chunkIndex) for ordered retrieval
- pgvector index on embedding for cosine similarity search

---

### ProcessingJob

**Purpose**: Tracks background processing of uploaded documents including chunking and embedding generation.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Job UUID | Primary key, UUID v4 |
| documentId | String | Reference to Document.id | Unique, foreign key |
| status | Enum | Job status: PENDING, CHUNKING, EMBEDDING, COMPLETE, FAILED | Default: PENDING |
| progress | Int | Progress percentage | Min: 0, Max: 100 |
| errorMessage | String? | Error details if failed | Nullable |
| createdAt | DateTime | Job creation timestamp | Auto-generated |
| completedAt | DateTime? | Job completion timestamp | Nullable |

**Validation Rules**:
- documentId must be unique (one job per document)
- Progress must correlate with status:
  - PENDING: 0-9%
  - CHUNKING: 10-49%
  - EMBEDDING: 50-99%
  - COMPLETE: 100%
  - FAILED: any (with errorMessage)
- Status transitions must be sequential (no skipping)

**Relationships**:
- One-to-One with Document

**State Transitions**:
```
PENDING → CHUNKING → EMBEDDING → COMPLETE
                              └──> FAILED (at any stage)
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgvector]
}

enum Role {
  CUSTOMER
  AGENT
  ADMIN
}

enum DocumentType {
  PDF
  TXT
  DOCX
}

enum DocumentStatus {
  PROCESSING
  READY
  FAILED
  PARTIAL
}

enum JobStatus {
  PENDING
  CHUNKING
  EMBEDDING
  COMPLETE
  FAILED
}

model User {
  id        String   @id // Clerk user ID
  email     String   @unique
  role      Role     @default(CUSTOMER)
  documents Document[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Document {
  id          String         @id @default(uuid())
  name        String
  fileType    DocumentType
  fileSize    Int
  status      DocumentStatus @default(PROCESSING)
  uploadedBy  User           @relation(fields: [uploadedById], references: [id])
  uploadedById String
  chunks      DocumentChunk[]
  chunkCount  Int            @default(0)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  processedAt DateTime?
  job         ProcessingJob?

  @@index([uploadedById])
  @@index([status])
  @@map("documents")
}

model DocumentChunk {
  id         String   @id @default(uuid())
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentId String
  chunkIndex Int
  content    String
  embedding  Unsupported("vector(1536)")
  createdAt  DateTime @default(now())

  @@unique([documentId, chunkIndex])
  @@index([documentId])
  @@map("document_chunks")
}

model ProcessingJob {
  id          String    @id @default(uuid())
  document    Document  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentId  String    @unique
  status      JobStatus @default(PENDING)
  progress    Int       @default(0)
  errorMessage String?
  createdAt   DateTime  @default(now())
  completedAt DateTime?

  @@index([status])
  @@map("processing_jobs")
}
```

---

## Database Migrations

### Initial Migration

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enum types
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'AGENT', 'ADMIN');
CREATE TYPE "DocumentType" AS ENUM ('PDF', 'TXT', 'DOCX');
CREATE TYPE "DocumentStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED', 'PARTIAL');
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'CHUNKING', 'EMBEDDING', 'COMPLETE', 'FAILED');

-- Create tables (see Prisma schema above)

-- Create pgvector index for similarity search
CREATE INDEX ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);
```

---

## Validation Rules Summary

### File Upload Validation
- **Allowed Types**: PDF, TXT, DOCX
- **Max Size**: 50MB (52428800 bytes)
- **File Name**: Max 255 characters, no special characters

### Document Processing Validation
- **Chunk Size**: Target 500 tokens (±10%)
- **Chunk Overlap**: 50 tokens
- **Embedding Dimensions**: Exactly 1536
- **Processing Timeout**: 10 minutes per document

### Access Control Validation
- **Upload**: AGENT or ADMIN only
- **View All Documents**: AGENT or ADMIN only
- **Delete/Reprocess**: ADMIN only
- **Customer Access**: Read-only (future chat feature)

---

## Data Retention

- **User Data**: Retained until account deletion
- **Documents**: Retained until manually deleted by admin
- **Processing Jobs**: Retained indefinitely for audit trail
- **Failed Jobs**: Retained for 30 days, then eligible for cleanup

---

## Indexes for Performance

| Table | Index | Purpose |
|-------|-------|---------|
| Document | uploadedById | Fast lookup by user |
| Document | status | Filter by processing status |
| DocumentChunk | documentId | Fetch chunks for document |
| DocumentChunk | embedding (HNSW) | Cosine similarity search |
| ProcessingJob | status | Find pending/failed jobs |
