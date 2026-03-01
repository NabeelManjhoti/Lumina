# Tasks: RAG Chatbot Foundation

**Input**: Design documents from `/specs/001-rag-chatbot/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are INCLUDED per constitution requirement (Principle IV: Testing & Quality Assurance - NON-NEGOTIABLE)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `frontend/` directory (existing Next.js project)
- All paths relative to `frontend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install required dependencies in frontend/: Next.js 15, Prisma, Clerk SDK, shadcn/ui, Tailwind CSS, Vercel AI SDK, LangChain.js, pgvector types
- [x] T002 [P] Configure TypeScript strict mode in `frontend/tsconfig.json` (already configured: strict: true)
- [x] T003 [P] Setup ESLint and Prettier configuration in `frontend/.eslintrc.json` and `frontend/.prettierrc` (already configured via eslint-config-next)
- [x] T004 [P] Initialize shadcn/ui in `frontend/` with dark theme (zinc-950 base)
- [x] T005 [P] Configure Tailwind CSS with custom theme (neon accents, glassmorphism utilities) in `frontend/tailwind.config.ts` (Tailwind v4 auto-configured)
- [x] T006 Create `.env.example` in `frontend/` with all required environment variables (DATABASE_URL, CLERK_*, QWEN_*)
- [x] T007 Add framer-motion dependency and configure in `frontend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 [P] Setup Prisma ORM in `frontend/prisma/schema.prisma` with PostgreSQL datasource and pgvector extension
- [x] T009 [P] Create User model in `frontend/prisma/schema.prisma` (id, email, role enum, timestamps)
- [x] T010 [P] Create Document model in `frontend/prisma/schema.prisma` (id, name, fileType, fileSize, status, uploadedById, chunkCount, timestamps)
- [x] T011 [P] Create DocumentChunk model in `frontend/prisma/schema.prisma` (id, documentId, chunkIndex, content, embedding vector(1536))
- [x] T012 [P] Create ProcessingJob model in `frontend/prisma/schema.prisma` (id, documentId, status, progress, errorMessage, timestamps)
- [ ] T013 Run initial Prisma migration: `npx prisma migrate dev --name init` (Requires PostgreSQL with pgvector)
- [x] T014 [P] Create Prisma client singleton in `frontend/lib/prisma.ts`
- [x] T015 [P] Setup Clerk authentication middleware in `frontend/middleware.ts` with role-based route protection
- [x] T016 [P] Create Clerk utility functions in `frontend/lib/clerk.ts` (getUserRole, requireAuth, requireAdmin)
- [x] T017 [P] Setup API route structure in `frontend/app/api/` with base error handling (lib/api.ts)
- [x] T018 [P] Create base layout with Clerk Provider in `frontend/app/layout.tsx`
- [x] T019 [P] Create theme provider component in `frontend/components/layout/theme-provider.tsx` (integrated in layout.tsx)
- [x] T020 Setup environment variable validation in `frontend/lib/env.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication & Access (Priority: P1) 🎯 MVP

**Goal**: Implement complete user authentication with Clerk including sign-up, sign-in, password reset, and role-based dashboard redirection

**Independent Test**: A user can register with email/password, verify account, log in successfully, and be redirected to role-appropriate dashboard

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T021 [P] [US1] Create E2E test for sign-up flow in `frontend/tests/e2e/auth.spec.ts` (test: user can register)
- [ ] T022 [P] [US1] Create E2E test for sign-in flow in `frontend/tests/e2e/auth.spec.ts` (test: user can login)
- [ ] T023 [P] [US1] Create E2E test for role-based redirection in `frontend/tests/e2e/auth.spec.ts` (test: correct dashboard per role)
- [ ] T024 [P] [US1] Create component test for sign-in form in `frontend/tests/components/sign-in-form.test.tsx`
- [ ] T025 [P] [US1] Create component test for sign-up form in `frontend/tests/components/sign-up-form.test.tsx`

### Implementation for User Story 1

- [x] T026 [P] [US1] Create sign-in page in `frontend/app/(auth)/sign-in/[[...sign-in]]/page.tsx` using Clerk component
- [x] T027 [P] [US1] Create sign-up page in `frontend/app/(auth)/sign-up/[[...sign-up]]/page.tsx` using Clerk component
- [x] T028 [P] [US1] Create auth layout in `frontend/app/(auth)/layout.tsx` with centered design
- [ ] T029 [US1] Add custom metadata field for user role in Clerk dashboard (setup via documentation)
- [ ] T030 [US1] Create role guard utility in `frontend/lib/role-guard.ts` (checkRole, requireRole functions) (already in lib/clerk.ts)
- [x] T031 [US1] Create customer dashboard layout in `frontend/app/(dashboard)/customer/layout.tsx` with role protection
- [x] T032 [US1] Create customer chat placeholder page in `frontend/app/(dashboard)/customer/chat/page.tsx`
- [x] T033 [US1] Create admin dashboard layout in `frontend/app/(dashboard)/admin/layout.tsx` with role protection
- [x] T034 [US1] Create admin documents placeholder page in `frontend/app/(dashboard)/admin/documents/page.tsx`
- [x] T035 [US1] Create header component with user info in `frontend/components/layout/header.tsx`
- [x] T036 [US1] Create sidebar component with role-based navigation in `frontend/components/layout/sidebar.tsx`
- [ ] T037 [US1] Add password reset functionality via Clerk configuration in `frontend/app/(auth)/reset-password/page.tsx`
- [ ] T038 [US1] Add JSDoc comments to all authentication components and utilities
- [ ] T039 [US1] Run tests for User Story 1 and fix all failures until 100% pass

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- Users can sign up, sign in, reset password
- Role-based redirection works (customer → /customer/chat, admin → /admin/documents)
- Protected routes reject unauthorized access

---

## Phase 4: User Story 2 - Admin Document Upload & Processing (Priority: P2)

**Goal**: Implement document upload functionality with file validation, progress tracking, and automatic background processing (chunking + embedding)

**Independent Test**: An admin can upload a document, see it in the document library with "Processing" status, and verify it changes to "Ready" after processing completes

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T040 [P] [US2] Create contract test for POST /api/documents in `frontend/tests/contract/documents.test.ts`
- [ ] T041 [P] [US2] Create contract test for file validation in `frontend/tests/contract/upload-validation.test.ts`
- [ ] T042 [P] [US2] Create E2E test for document upload flow in `frontend/tests/e2e/document-upload.spec.ts`
- [ ] T043 [P] [US2] Create component test for document upload component in `frontend/tests/components/document-upload.test.tsx`
- [ ] T044 [P] [US2] Create unit test for chunking utility in `frontend/tests/unit/chunking.test.ts`
- [ ] T045 [P] [US2] Create unit test for embedding generation in `frontend/tests/unit/embeddings.test.ts`

### Implementation for User Story 2

- [ ] T046 [P] [US2] Create document upload API route in `frontend/app/api/documents/route.ts` (POST handler)
- [ ] T047 [P] [US2] Create file upload API route in `frontend/app/api/upload/route.ts` (multipart/form-data handler)
- [ ] T048 [P] [US2] Create Document model type in `frontend/types/document.ts` (TypeScript interface)
- [ ] T049 [P] [US2] Create chunking utility in `frontend/lib/chunking.ts` using LangChain RecursiveCharacterTextSplitter
- [ ] T050 [P] [US2] Create embedding generation utility in `frontend/lib/embeddings.ts` using Qwen API
- [ ] T051 [US2] Create document upload component in `frontend/components/documents/document-upload.tsx` with drag-drop and progress
- [ ] T052 [US2] Create admin upload page in `frontend/app/(dashboard)/admin/upload/page.tsx`
- [ ] T053 [US2] Create processing status component in `frontend/components/documents/processing-status.tsx` with polling
- [ ] T054 [US2] Create document processing API route in `frontend/app/api/documents/[id]/process/route.ts` (POST handler)
- [ ] T055 [US2] Create Server Action for background processing in `frontend/app/(dashboard)/admin/actions.ts` (processDocumentAction)
- [ ] T056 [US2] Add file type validation (PDF, TXT, DOCX) in `frontend/lib/validation.ts`
- [ ] T057 [US2] Add file size validation (50MB limit) in `frontend/lib/validation.ts`
- [ ] T058 [US2] Create error handling utility for upload failures in `frontend/lib/upload-errors.ts`
- [ ] T059 [US2] Add cleanup logic for failed uploads in `frontend/app/api/documents/[id]/route.ts` (DELETE handler)
- [ ] T060 [US2] Add JSDoc comments to all upload and processing components
- [ ] T061 [US2] Run tests for User Story 2 and fix all failures until 100% pass

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- Admin can upload documents (PDF, TXT, DOCX)
- Documents show "Processing" status with progress
- Background job chunks and embeds documents
- Status updates to "Ready" when complete

---

## Phase 5: User Story 3 - Admin Document Management Dashboard (Priority: P3)

**Goal**: Implement document library dashboard with list view, search, filter, delete, and reprocess functionality

**Independent Test**: An admin can view all documents with status indicators, search/filter documents, delete documents, and trigger reprocessing

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T062 [P] [US3] Create contract test for GET /api/documents in `frontend/tests/contract/documents.test.ts`
- [ ] T063 [P] [US3] Create contract test for DELETE /api/documents/[id] in `frontend/tests/contract/documents.test.ts`
- [ ] T064 [P] [US3] Create E2E test for document management in `frontend/tests/e2e/document-management.spec.ts`
- [ ] T065 [P] [US3] Create component test for document list in `frontend/tests/components/document-list.test.tsx`
- [ ] T066 [P] [US3] Create component test for document card in `frontend/tests/components/document-card.test.tsx`

### Implementation for User Story 3

- [ ] T067 [P] [US3] Create GET /api/documents API route in `frontend/app/api/documents/route.ts` (list with pagination, search, filters)
- [ ] T068 [P] [US3] Create GET /api/documents/[id] API route in `frontend/app/api/documents/[id]/route.ts`
- [ ] T069 [P] [US3] Create DELETE /api/documents/[id] API route in `frontend/app/api/documents/[id]/route.ts`
- [ ] T070 [P] [US3] Create document list component in `frontend/components/documents/document-list.tsx` with pagination
- [ ] T071 [P] [US3] Create document card component in `frontend/components/documents/document-card.tsx` (shows name, type, status, chunk count)
- [ ] T072 [US3] Update admin documents page in `frontend/app/(dashboard)/admin/documents/page.tsx` with full dashboard
- [ ] T073 [US3] Create search and filter controls in `frontend/components/documents/document-filters.tsx`
- [ ] T074 [US3] Create delete document action in `frontend/app/(dashboard)/admin/actions.ts` (deleteDocumentAction)
- [ ] T075 [US3] Create reprocess document action in `frontend/app/(dashboard)/admin/actions.ts` (reprocessDocumentAction)
- [ ] T076 [US3] Add confirmation dialog for delete in `frontend/components/documents/delete-confirmation.tsx`
- [ ] T077 [US3] Add toast notifications for actions in `frontend/components/ui/toast.tsx` (using shadcn/ui toast)
- [ ] T078 [US3] Add loading states and optimistic updates in document list
- [ ] T079 [US3] Add JSDoc comments to all dashboard components
- [ ] T080 [US3] Run tests for User Story 3 and fix all failures until 100% pass

**Checkpoint**: All user stories should now be independently functional
- Admin can view all documents with status
- Search and filter by status, type, name
- Delete documents (admin only)
- Reprocess failed documents

---

## Phase 6: User Story 4 - Role-Based Access Control (Priority: P4)

**Goal**: Enforce strict role-based access control preventing customers from accessing admin features

**Independent Test**: A customer user attempting to access admin routes receives 403 Forbidden, while agents/admins have full access

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T081 [P] [US4] Create E2E test for customer access denial in `frontend/tests/e2e/rbac.spec.ts`
- [ ] T082 [P] [US4] Create E2E test for admin access in `frontend/tests/e2e/rbac.spec.ts`
- [ ] T083 [P] [US4] Create contract test for role-based API access in `frontend/tests/contract/rbac.test.ts`

### Implementation for User Story 4

- [ ] T084 [P] [US4] Update middleware in `frontend/middleware.ts` with strict role checks for /admin/* routes
- [ ] T085 [P] [US4] Add role check in all admin API routes (documents, upload, process)
- [ ] T086 [US4] Create 403 Forbidden page in `frontend/app/(auth)/forbidden/page.tsx`
- [ ] T087 [US4] Add customer-only route protection in `frontend/app/(dashboard)/customer/layout.tsx`
- [ ] T088 [US4] Update sidebar to hide admin links for customers in `frontend/components/layout/sidebar.tsx`
- [ ] T089 [US4] Add session expiration handling in `frontend/lib/clerk.ts`
- [ ] T090 [US4] Add JSDoc comments to RBAC utilities
- [ ] T091 [US4] Run tests for User Story 4 and fix all failures until 100% pass

**Checkpoint**: Role-based access control is fully enforced
- Customers cannot access /admin/* routes (403 Forbidden)
- Agents/Admins have full admin access
- Session expiration redirects to login

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, final quality gates

- [ ] T092 [P] Add JSDoc comments to all public functions and components across the codebase
- [ ] T093 [P] Create README.md in `frontend/` with setup instructions (copy from quickstart.md)
- [ ] T094 [P] Add API documentation in `frontend/docs/api.md` (from contracts/documents.md)
- [ ] T095 Run ESLint across entire project: `npm run lint` and fix all errors
- [ ] T096 Run Prettier formatting: `npm run format`
- [ ] T097 Run TypeScript type check: `npx tsc --noEmit` and fix all errors
- [ ] T098 [P] Run all unit tests: `npm test -- --run unit`
- [ ] T099 [P] Run all component tests: `npm test -- --run components`
- [ ] T100 [P] Run all E2E tests: `npm run test:e2e`
- [ ] T101 Fix ALL test failures, TypeScript errors, ESLint warnings until 100% clean
- [ ] T102 [P] Add performance optimizations (code splitting, lazy loading) in `frontend/app/layout.tsx`
- [ ] T103 [P] Add rate limiting to API routes in `frontend/app/api/middleware.ts`
- [ ] T104 [P] Add CORS configuration for production in `frontend/next.config.ts`
- [ ] T105 [P] Create production build: `npm run build` and verify no errors
- [ ] T106 [P] Validate quickstart.md setup guide by following all steps
- [ ] T107 [P] Add error boundary components in `frontend/components/layout/error-boundary.tsx`
- [ ] T108 [P] Add loading skeletons for document list in `frontend/components/ui/skeleton.tsx`
- [ ] T109 Final constitution compliance check (all 6 gates)
- [ ] T110 Prepare commit with all changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US2 (documents must exist to manage)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent, but should be tested after US1-3

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/types before services
- Services before endpoints/pages
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T002-T007 can all run in parallel (different files)
- **Foundational Phase**: T008-T012 (Prisma models) can run in parallel, T014-T020 can run in parallel
- **User Story 1**: T026-T027 (auth pages) can run in parallel, T031-T034 (dashboards) can run in parallel
- **User Story 2**: T046-T050 (API routes and utilities) can run in parallel
- **User Story 3**: T067-T071 (API routes and components) can run in parallel
- **User Story 4**: T081-T086 can run in parallel
- **Polish Phase**: T092-T108 can mostly run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch all auth page implementations together:
Task: "Create sign-in page in frontend/app/(auth)/sign-in/[[...sign-in]]/page.tsx"
Task: "Create sign-up page in frontend/app/(auth)/sign-up/[[...sign-up]]/page.tsx"

# Launch all dashboard layouts together:
Task: "Create customer dashboard layout in frontend/app/(dashboard)/customer/layout.tsx"
Task: "Create admin dashboard layout in frontend/app/(dashboard)/admin/layout.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch all API routes together:
Task: "Create POST /api/documents in frontend/app/api/documents/route.ts"
Task: "Create POST /api/upload in frontend/app/api/upload/route.ts"

# Launch all utilities together:
Task: "Create chunking utility in frontend/lib/chunking.ts"
Task: "Create embedding utility in frontend/lib/embeddings.ts"
Task: "Create validation utility in frontend/lib/validation.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T020)
3. Complete Phase 3: User Story 1 (T021-T039)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Can users sign up and log in?
   - Does role-based redirection work?
   - Are protected routes secure?
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Auth working!)
3. Add User Story 2 → Test independently → Deploy/Demo (Upload working!)
4. Add User Story 3 → Test independently → Deploy/Demo (Management working!)
5. Add User Story 4 → Test independently → Deploy/Demo (RBAC complete!)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auth)
   - Developer B: User Story 2 (Upload & Processing)
   - Developer C: User Story 3 (Dashboard) - after US2 complete
3. Stories complete and integrate independently
4. Team reconvenes for Phase 7: Polish

---

## Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup | 7 tasks |
| Phase 2 | Foundational | 13 tasks |
| Phase 3 | User Story 1 (Auth) | 19 tasks (5 tests + 14 implementation) |
| Phase 4 | User Story 2 (Upload) | 22 tasks (6 tests + 16 implementation) |
| Phase 5 | User Story 3 (Dashboard) | 19 tasks (5 tests + 14 implementation) |
| Phase 6 | User Story 4 (RBAC) | 11 tasks (3 tests + 8 implementation) |
| Phase 7 | Polish | 19 tasks |
| **Total** | **All Phases** | **110 tasks** |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are MANDATORY per constitution (Principle IV)
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- After Phase 7, constitution requires: 100% test pass, 0 TypeScript errors, 0 ESLint warnings

---

## Constitution Compliance Reminders

**Principle III (Code Quality)**:
- All tasks must include JSDoc comments
- Strict TypeScript enforced
- ESLint + Prettier must pass

**Principle IV (Testing)**:
- Tests included for all user stories
- Run tests after each phase
- Fix ALL failures until 100% clean

**Principle V (Security)**:
- Auth guards on all protected routes
- File validation on uploads
- Environment variables for secrets

**Principle VI (Performance)**:
- Streaming for AI responses (future)
- 500-token chunking implemented
- Cosine similarity search via pgvector
