<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0 (MAJOR - initial constitution)

Modified principles:
- None (initial creation)

Added sections:
- I. Technology Stack
- II. User Experience & Design
- III. Code Quality & Architecture
- IV. Testing & Quality Assurance
- V. Security & Compliance
- VI. Performance & Scalability
- Additional Constraints
- Development Workflow & Quality Gates
- Governance

Removed sections:
- None (initial creation)

Templates requiring updates:
- ✅ .specify/templates/plan-template.md (Constitution Check section aligns)
- ✅ .specify/templates/spec-template.md (No changes needed)
- ✅ .specify/templates/tasks-template.md (Testing phases align with Principle IV)
- ✅ .qwen/commands/*.md (No agent-specific references found)

Follow-up TODOs:
- None
-->

# Lumina Constitution

## Core Principles

### I. Technology Stack
The project MUST use the following technology stack exclusively:

- **Framework**: Next.js 15 with App Router and Server Actions
- **Language**: TypeScript in strict mode
- **Styling**: Tailwind CSS with shadcn/ui components (dark theme default)
- **Database**: PostgreSQL with pgvector extension
- **ORM**: Prisma ORM
- **AI/Streaming**: Vercel AI SDK for streaming responses
- **Authentication**: Clerk
- **RAG**: LangChain.js or minimal custom RAG implementation
- **LLM**: Qwen models via official OpenAI-compatible API (@qwen or openai package with custom baseURL)

**Rationale**: This stack provides type safety, modern React patterns, vector similarity search for RAG, and production-ready streaming capabilities.

### II. User Experience & Design
All user interfaces MUST adhere to these design principles:

- **Theme**: Stunning modern dark theme with zinc-950 base and neon accents
- **Visual Style**: Glassmorphism effects, premium aesthetic
- **Animations**: Smooth framer-motion animations for all interactions
- **Responsiveness**: Mobile-first responsive design, perfect on all screen sizes
- **Components**: shadcn/ui components only - no custom component libraries
- **Accessibility**: WCAG 2.1 AA compliance for all interactive elements

**Rationale**: A delightful, premium user experience differentiates the product and ensures user engagement across all devices.

### III. Code Quality & Architecture
All code MUST meet these quality standards:

- **TypeScript**: Strict mode enforced, no `any` types without explicit justification
- **Structure**: Clean folder organization (app/, components/, lib/, types/)
- **Documentation**: Detailed JSDoc comments on all public functions, components, and types
- **Naming**: Descriptive names, no magic numbers or strings
- **Architecture**: Clean architecture with clear separation of concerns
- **Tooling**: ESLint and Prettier enforced on every commit
- **Modularity**: Extremely clean, modular, easy-to-understand code

**Rationale**: High code quality reduces technical debt, enables team collaboration, and ensures long-term maintainability.

### IV. Testing & Quality Assurance (NON-NEGOTIABLE)
Testing is mandatory at every phase:

- **Test Stack**: Vitest for unit tests, React Testing Library for component tests, Playwright for E2E tests
- **Coverage**: After every phase and final build, full test suite MUST run automatically
- **Zero Tolerance**: ALL bugs, warnings, TypeScript errors, and console issues MUST be fixed immediately
- **Automation**: Tests run automatically; bugs are fixed until 100% clean
- **Test Types**:
  - Unit tests for all utility functions and business logic
  - Component tests for all reusable UI components
  - E2E tests for all critical user journeys
  - Contract tests for API endpoints

**Rationale**: Zero-tolerance testing ensures production-ready code at every milestone and prevents bug accumulation.

### V. Security & Compliance
Security is non-negotiable:

- **Authentication**: All routes MUST be protected with proper auth guards
- **File Uploads**: Secure file upload handling with validation and size limits
- **Rate Limiting**: API rate limiting on all public endpoints
- **Environment Variables**: Secrets stored ONLY in environment variables, never in code
- **Input Validation**: All user inputs validated and sanitized
- **CORS**: Proper CORS configuration for API routes

**Rationale**: Security-first development protects user data and prevents common vulnerabilities.

### VI. Performance & Scalability
Performance budgets MUST be maintained:

- **Streaming**: All AI responses MUST use streaming for perceived performance
- **Chunking**: Response chunking at 500 tokens for optimal streaming
- **Search**: Cosine similarity search for vector embeddings
- **Latency**: p95 latency under 200ms for API routes (excluding LLM response time)
- **Bundle Size**: Code splitting and tree shaking enforced
- **Caching**: Proper caching strategies for static and semi-static data

**Rationale**: Streaming and efficient vector search ensure responsive UX even with large knowledge bases.

## Additional Constraints

### Documentation Requirements
- Every route MUST have clear README sections and inline comments
- Every component MUST have JSDoc documentation
- API endpoints MUST document inputs, outputs, and error cases
- Setup instructions MUST be complete and reproducible

### Folder Structure
```
project-root/
├── app/              # Next.js App Router pages and layouts
├── components/       # Reusable React components
├── lib/             # Utility functions and shared logic
├── types/           # TypeScript type definitions
├── prisma/          # Database schema and migrations
├── tests/           # Test files (unit, integration, e2e)
└── docs/            # Documentation files
```

## Development Workflow & Quality Gates

### Phase Completion Criteria
Each development phase MUST complete these gates before proceeding:

1. **Code Complete**: All planned features implemented
2. **Tests Passing**: 100% test pass rate, zero warnings
3. **TypeScript Clean**: No type errors in strict mode
4. **Lint Clean**: ESLint and Prettier pass without errors
5. **Documentation Updated**: All new code documented
6. **Manual Verification**: Features demonstrated and verified

### Commit Standards
- Commits MUST pass all quality gates before pushing
- Commit messages MUST be clear and descriptive
- Feature branches MUST be rebased before merge

## Governance

This constitution supersedes all other development practices and guidelines.

### Amendment Process
- Amendments require documented justification
- Changes MUST specify version bump level (MAJOR/MINOR/PATCH)
- Migration plans required for breaking changes
- All dependent templates MUST be updated for consistency

### Compliance Review
- All PRs MUST verify constitution compliance
- Code reviews MUST check principle adherence
- Complexity decisions MUST be justified against principles

### Versioning Policy
- **MAJOR**: Backward-incompatible changes, principle removals, stack changes
- **MINOR**: New principles, material expansions, new sections
- **PATCH**: Clarifications, wording improvements, typo fixes

**Version**: 1.0.0 | **Ratified**: 2026-03-01 | **Last Amended**: 2026-03-01
