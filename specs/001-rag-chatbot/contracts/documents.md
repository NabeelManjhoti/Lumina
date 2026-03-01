# API Contracts: Documents

**Feature**: 001-rag-chatbot
**Date**: 2026-03-01
**Version**: 1.0.0

---

## Overview

This document defines the REST API contracts for document management operations in the RAG Chatbot Foundation.

**Base URL**: `/api/documents`

**Authentication**: All endpoints require Bearer token authentication via Clerk.

---

## Endpoints

### GET /api/documents

**Summary**: List all documents with filtering and search (Admin/Agent only)

**Authentication**: Required (AGENT or ADMIN role)

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: PROCESSING, READY, FAILED, PARTIAL |
| fileType | string | No | Filter by type: PDF, TXT, DOCX |
| search | string | No | Search by document name (case-insensitive) |
| page | number | No | Page number for pagination (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |

**Request Example**:
```http
GET /api/documents?status=READY&fileType=PDF&page=1&limit=10
Authorization: Bearer <clerk_token>
```

**Response Schema** (200 OK):
```typescript
{
  documents: {
    id: string;
    name: string;
    fileType: 'PDF' | 'TXT' | 'DOCX';
    fileSize: number;
    status: 'PROCESSING' | 'READY' | 'FAILED' | 'PARTIAL';
    chunkCount: number;
    uploadedById: string;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
    processedAt: string | null; // ISO 8601
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Error Responses**:

| Status | Schema | Description |
|--------|--------|-------------|
| 401 | `{ error: string }` | Unauthorized - missing or invalid token |
| 403 | `{ error: string }` | Forbidden - insufficient role (CUSTOMER) |

---

### POST /api/documents

**Summary**: Upload a new document (Admin/Agent only)

**Authentication**: Required (AGENT or ADMIN role)

**Request Body**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Document file (PDF, TXT, or DOCX) |

**Request Example**:
```http
POST /api/documents
Authorization: Bearer <clerk_token>
Content-Type: multipart/form-data

file: <binary_data>
```

**Response Schema** (201 Created):
```typescript
{
  document: {
    id: string;
    name: string;
    fileType: 'PDF' | 'TXT' | 'DOCX';
    fileSize: number;
    status: 'PROCESSING';
    chunkCount: 0;
    createdAt: string;
  };
  jobId: string;
}
```

**Error Responses**:

| Status | Schema | Description |
|--------|--------|-------------|
| 400 | `{ error: string, code: 'INVALID_FILE_TYPE' | 'MISSING_FILE' }` | Invalid file type or missing file |
| 401 | `{ error: string }` | Unauthorized |
| 403 | `{ error: string }` | Forbidden |
| 413 | `{ error: string, code: 'FILE_TOO_LARGE', maxSize: number }` | File exceeds 50MB limit |

---

### GET /api/documents/:id

**Summary**: Get detailed information about a specific document

**Authentication**: Required (any authenticated user)

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Document UUID |

**Request Example**:
```http
GET /api/documents/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <clerk_token>
```

**Response Schema** (200 OK):
```typescript
{
  id: string;
  name: string;
  fileType: 'PDF' | 'TXT' | 'DOCX';
  fileSize: number;
  status: 'PROCESSING' | 'READY' | 'FAILED' | 'PARTIAL';
  uploadedById: string;
  uploadedBy: {
    id: string;
    email: string;
  };
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  job?: {
    status: 'PENDING' | 'CHUNKING' | 'EMBEDDING' | 'COMPLETE' | 'FAILED';
    progress: number;
    errorMessage: string | null;
  };
}
```

**Error Responses**:

| Status | Schema | Description |
|--------|--------|-------------|
| 401 | `{ error: string }` | Unauthorized |
| 404 | `{ error: string, code: 'DOCUMENT_NOT_FOUND' }` | Document not found |

---

### DELETE /api/documents/:id

**Summary**: Delete a document and all its chunks (Admin only)

**Authentication**: Required (ADMIN role only)

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Document UUID |

**Request Example**:
```http
DELETE /api/documents/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <clerk_token>
```

**Response Schema** (204 No Content):
```
(No response body)
```

**Error Responses**:

| Status | Schema | Description |
|--------|--------|-------------|
| 401 | `{ error: string }` | Unauthorized |
| 403 | `{ error: string, code: 'ADMIN_REQUIRED' }` | Forbidden - ADMIN role required |
| 404 | `{ error: string, code: 'DOCUMENT_NOT_FOUND' }` | Document not found |

---

### POST /api/documents/:id/process

**Summary**: Reprocess a document (Admin only)

**Authentication**: Required (ADMIN role only)

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Document UUID |

**Request Example**:
```http
POST /api/documents/550e8400-e29b-41d4-a716-446655440000/process
Authorization: Bearer <clerk_token>
```

**Response Schema** (202 Accepted):
```typescript
{
  jobId: string;
  message: string;
}
```

**Error Responses**:

| Status | Schema | Description |
|--------|--------|-------------|
| 401 | `{ error: string }` | Unauthorized |
| 403 | `{ error: string, code: 'ADMIN_REQUIRED' }` | Forbidden - ADMIN role required |
| 404 | `{ error: string, code: 'DOCUMENT_NOT_FOUND' }` | Document not found |
| 409 | `{ error: string, code: 'ALREADY_PROCESSING' }` | Document is already being processed |

---

## Data Models

### Document

```typescript
interface Document {
  id: string;              // UUID v4
  name: string;            // Original file name (max 255 chars)
  fileType: DocumentType;  // PDF | TXT | DOCX
  fileSize: number;        // Size in bytes
  status: DocumentStatus;  // PROCESSING | READY | FAILED | PARTIAL
  uploadedById: string;    // User ID (Clerk)
  chunkCount: number;      // Number of chunks generated
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
  processedAt: string | null; // ISO 8601 timestamp or null
}

type DocumentType = 'PDF' | 'TXT' | 'DOCX';
type DocumentStatus = 'PROCESSING' | 'READY' | 'FAILED' | 'PARTIAL';
```

### ProcessingJob

```typescript
interface ProcessingJob {
  id: string;           // UUID v4
  documentId: string;   // Document UUID (unique)
  status: JobStatus;    // Current job status
  progress: number;     // 0-100 percentage
  errorMessage: string | null; // Error details if failed
  createdAt: string;    // ISO 8601 timestamp
  completedAt: string | null; // ISO 8601 timestamp or null
}

type JobStatus = 'PENDING' | 'CHUNKING' | 'EMBEDDING' | 'COMPLETE' | 'FAILED';
```

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| GET /api/documents | 100 requests | 1 minute |
| POST /api/documents | 10 requests | 1 minute |
| DELETE /api/documents/:id | 20 requests | 1 minute |
| POST /api/documents/:id/process | 5 requests | 1 minute |

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1672531200
```

**429 Response**:
```typescript
{
  error: string;
  code: 'RATE_LIMIT_EXCEEDED';
  retryAfter: number; // seconds
}
```

---

## Error Handling

### Standard Error Format

```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, string>;
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| UNAUTHORIZED | Missing or invalid authentication token |
| FORBIDDEN | Insufficient permissions for this resource |
| DOCUMENT_NOT_FOUND | Requested document does not exist |
| INVALID_FILE_TYPE | File type is not PDF, TXT, or DOCX |
| FILE_TOO_LARGE | File exceeds 50MB size limit |
| ALREADY_PROCESSING | Document is already being processed |
| RATE_LIMIT_EXCEEDED | Too many requests, retry after specified time |
| INTERNAL_ERROR | Unexpected server error |

---

## Security Considerations

1. **Authentication**: All endpoints require valid Clerk JWT tokens
2. **Authorization**: Role-based access control (AGENT/ADMIN for write operations)
3. **File Validation**: All uploads validated for type and size before processing
4. **Input Sanitization**: File names sanitized to prevent path traversal
5. **CORS**: Restricted to allowed origins only
6. **Rate Limiting**: Applied per-user based on Clerk user ID
