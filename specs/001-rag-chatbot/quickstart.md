# Quick Start Guide: RAG Chatbot Foundation

**Feature**: 001-rag-chatbot
**Date**: 2026-03-01
**Version**: 1.0.0

---

## Overview

This guide walks you through setting up and running the RAG Chatbot Foundation locally for development.

**Prerequisites**:

- Node.js 20.x or higher
- PostgreSQL 15+ with pgvector extension
- Clerk account (free tier sufficient)
- Qwen API key (or OpenAI-compatible endpoint)
- Git

---

## Step 1: Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

---

## Step 2: Environment Configuration

### Create Environment File

```bash
# Copy example environment file
cp .env.example .env.local
```

### Configure Environment Variables

Edit `.env.local` with your credentials:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/lumina?schema=public"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/customer/chat"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/customer/chat"

# Qwen AI (OpenAI-compatible API)
QWEN_API_KEY="your-qwen-api-key"
QWEN_BASE_URL="https://api.qwen.ai/v1"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Obtain API Keys

**Clerk**:

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Navigate to **API Keys** in the dashboard
4. Copy `Secret Key` and `Publishable Key` to `.env.local`

**Qwen API**:

1. Go to [Qwen Cloud](https://cloud.qwen.com/) or your Qwen provider
2. Create an API key
3. Copy the key to `QWEN_API_KEY` in `.env.local`

---

## Step 3: Database Setup

### Install PostgreSQL with pgvector

**Option A: Docker (Recommended)**

```bash
# Start PostgreSQL with pgvector using Docker
docker run -d \
  --name lumina-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lumina \
  -p 5432:5432 \
  pgvector/pgvector:pg15
```

**Option B: Local Installation**

1. Install PostgreSQL 15+ from [postgresql.org](https://www.postgresql.org/download/)
2. Install pgvector extension:
   ```bash
   # macOS (Homebrew)
   brew install pgvector
   
   # Ubuntu/Debian
   sudo apt install postgresql-15-pgvector
   ```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lumina;

# Enable pgvector extension
\c lumina
CREATE EXTENSION IF NOT EXISTS vector;

# Exit
\q
```

### Run Prisma Migrations

```bash
# Ensure you're in frontend directory
cd frontend

# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# OR run migrations (production)
npx prisma migrate dev --name init
```

---

## Step 4: Clerk Configuration

### Configure Custom User Attribute

1. Go to Clerk Dashboard > **Settings** > **User Attributes**
2. Click **Add Attribute**
3. Create custom attribute:
   - **Name**: `role`
   - **Type**: Enum
   - **Values**: `CUSTOMER`, `AGENT`, `ADMIN`
   - **Default**: `CUSTOMER`
   - **Required**: No

### Configure Redirect URLs

In Clerk Dashboard > **Settings** > **Redirect URLs**:

- Add `http://localhost:3000/sign-in`
- Add `http://localhost:3000/sign-up`
- Add `http://localhost:3000/customer/chat`
- Add `http://localhost:3000/admin/documents`

---

## Step 5: Run Development Server

```bash
# Ensure you're in frontend directory
cd frontend

# Start Next.js development server
npm run dev
```

The application will be available at: [http://localhost:3000](http://localhost:3000)

---

## Step 6: Create First Admin User

### Register Account

1. Visit [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
2. Enter email and password
3. Verify email address (check inbox for verification code)

### Assign Admin Role

1. Go to Clerk Dashboard > **Users**
2. Find your user account
3. Click on the user
4. Scroll to **Metadata** section
5. Add custom metadata:
   ```json
   {
     "role": "ADMIN"
   }
   ```
6. Save changes

---

## Step 7: Verify Setup

### Checklist

- [ ] Can access homepage at http://localhost:3000
- [ ] Can sign up with email/password
- [ ] Received email verification
- [ ] Can log in successfully
- [ ] Redirected to appropriate dashboard based on role
- [ ] Admin can access `/admin/documents`
- [ ] Can upload a test document (PDF, TXT, or DOCX)
- [ ] Document shows "Processing" status
- [ ] Document status changes to "Ready" after processing
- [ ] All tests pass

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## Common Issues and Solutions

### Issue: pgvector Extension Not Found

**Error**: `extension "vector" does not exist`

**Solution**:
```sql
-- Connect to your database
psql -U postgres -d lumina

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```

### Issue: Clerk Authentication Fails

**Error**: `Missing publishable key` or `Invalid API key`

**Solution**:

1. Verify `.env.local` contains correct Clerk keys
2. Restart development server after changing env vars
3. Check Clerk dashboard for correct environment (test vs production)

### Issue: Database Connection Failed

**Error**: `Can't reach database server at localhost:5432`

**Solution**:

1. Verify PostgreSQL is running:
   ```bash
   # Docker
   docker ps | grep postgres
   
   # System service
   sudo systemctl status postgresql
   ```
2. Check DATABASE_URL in `.env.local`
3. Verify port 5432 is not blocked by firewall

### Issue: File Upload Fails

**Error**: `File type not allowed` or `File too large`

**Solution**:

1. Ensure file is PDF, TXT, or DOCX format
2. Check file size is under 50MB
3. Verify upload API route is accessible

### Issue: Document Processing Hangs

**Error**: Document stuck in "PROCESSING" status

**Solution**:

1. Check server console for errors
2. Verify Qwen API key is valid
3. Check network connectivity to Qwen API
4. Review ProcessingJob table for error messages:
   ```sql
   SELECT * FROM "processing_jobs" WHERE status = 'FAILED';
   ```

---

## Development Commands

```bash
# Ensure you're in frontend directory
cd frontend

# Start development server
npm run dev

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Create and apply migration
npx prisma db push         # Push schema changes (dev only)
npx prisma generate        # Regenerate Prisma Client
```

---

## Project Structure

```
Lumina/
├── frontend/               # Next.js project root
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/       # Dashboard layouts
│   │   │   ├── admin/         # Admin-only routes
│   │   │   └── customer/      # Customer routes
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── auth/             # Auth-related components
│   │   └── documents/        # Document components
│   ├── lib/                  # Utility functions
│   │   ├── prisma.ts         # Prisma client
│   │   ├── clerk.ts          # Clerk utilities
│   │   └── embeddings.ts     # Embedding generation
│   ├── prisma/               # Database schema
│   │   └── schema.prisma
│   ├── tests/                # Test files
│   │   ├── unit/
│   │   ├── components/
│   │   └── e2e/
│   ├── .env.local            # Environment variables (gitignored)
│   ├── .env.example          # Environment template
│   └── package.json
├── specs/                    # Feature specifications
│   └── 001-rag-chatbot/     # This feature's docs
└── history/                  # Prompt history records
```

---

## Next Steps

After successful setup:

1. **Explore the Admin Dashboard**: Upload test documents and monitor processing
2. **Review API Contracts**: See `contracts/documents.md` for API details
3. **Read Data Model**: See `data-model.md` for schema documentation
4. **Run Tests**: Ensure all tests pass before making changes
5. **Start Development**: Begin implementing features per `tasks.md`

---

## Getting Help

- **Documentation**: See `specs/001-rag-chatbot/` for detailed docs
- **Issues**: Check existing issues in your project tracker
- **API Reference**: [Clerk Docs](https://clerk.com/docs), [Prisma Docs](https://prisma.io/docs)
