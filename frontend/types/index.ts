import { DocumentType, DocumentStatus, JobStatus, Role } from '@prisma/client'

/**
 * Document entity with all metadata
 */
export interface Document {
  id: string
  name: string
  fileType: DocumentType
  fileSize: number
  status: DocumentStatus
  uploadedById: string
  chunkCount: number
  createdAt: string
  updatedAt: string
  processedAt: string | null
}

/**
 * Document with upload user information
 */
export interface DocumentWithUser extends Document {
  uploadedBy: {
    id: string
    email: string
  }
}

/**
 * Document chunk with embedding
 */
export interface DocumentChunk {
  id: string
  documentId: string
  chunkIndex: number
  content: string
  embedding: number[] // Vector embedding (1536 dimensions)
  createdAt: string
}

/**
 * Processing job for document
 */
export interface ProcessingJob {
  id: string
  documentId: string
  status: JobStatus
  progress: number
  errorMessage: string | null
  createdAt: string
  completedAt: string | null
}

/**
 * User with role information
 */
export interface User {
  id: string // Clerk user ID
  email: string
  role: Role
  createdAt: string
  updatedAt: string
}

/**
 * API response for document list
 */
export interface DocumentListResponse {
  documents: Document[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * API response for document upload
 */
export interface DocumentUploadResponse {
  document: Document
  jobId: string
}

/**
 * API response for processing job
 */
export interface ProcessingJobResponse {
  jobId: string
  message?: string
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: string
  code?: string
  details?: Record<string, string>
}
