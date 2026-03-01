---
id: 0001
title: Create Lumina Constitution
stage: constitution
date: 2026-03-01
surface: agent
model: Qwen Code
feature: none
branch: main
user: HP
command: /sp.constitution Build a production-grade AI-Powered RAG Chatbot + Knowledge Base
labels: ["constitution", "rag-chatbot", "nextjs", "typescript"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - None (constitution update)
---

## Prompt

/sp.constitution

Build a production-grade AI-Powered RAG Chatbot + Knowledge Base (Customer Support Portal).

NON-NEGOTIABLE PRINCIPLES (apply to every phase and every file):
- Tech stack: Next.js 15 (App Router + Server Actions), TypeScript (strict mode), Tailwind CSS + shadcn/ui (default DARK theme), Prisma ORM + PostgreSQL with pgvector, Vercel AI SDK for streaming, Clerk auth, LangChain.js (or minimal custom RAG), Qwen models via official OpenAI-compatible API (use @qwen or openai package with baseURL).
- UI: Stunning modern dark theme (zinc-950 base, neon accents, glassmorphism, smooth framer-motion animations, perfect mobile-first responsive). Use shadcn/ui components only. Make it look premium and delightful.
- Code quality: Extremely clean, modular, easy-to-understand code. Strict TypeScript, proper folder structure (app/, components/, lib/, types/), detailed JSDoc comments, no magic numbers, follow clean architecture. ESLint + Prettier enforced.
- Testing & Quality: After every phase and final build, Qwen Code MUST run full test suite (Vitest unit + React Testing Library + Playwright E2E). Automatically fix ALL bugs, warnings, TypeScript errors, or console issues until 100% clean and bug-free. Zero tolerance for bugs.
- Security: Secure file uploads, rate limiting, proper auth guards, environment variables only.
- Performance: Streaming responses, proper chunking (500 tokens), cosine similarity search.
- Documentation: Every route and component must have clear README sections and inline comments.

This constitution applies to ALL phases. Never deviate.

## Response snapshot

Created the initial Lumina Constitution (v1.0.0) with 6 core principles:
1. Technology Stack - Next.js 15, TypeScript strict, Tailwind + shadcn/ui, Prisma + PostgreSQL/pgvector, Vercel AI SDK, Clerk, LangChain.js, Qwen models
2. User Experience & Design - Dark theme (zinc-950), neon accents, glassmorphism, framer-motion animations, mobile-first responsive
3. Code Quality & Architecture - Clean modular code, strict TypeScript, JSDoc comments, clean architecture, ESLint + Prettier
4. Testing & Quality Assurance - Vitest + React Testing Library + Playwright, zero tolerance for bugs, 100% clean required
5. Security & Compliance - Auth guards, secure uploads, rate limiting, environment variables only
6. Performance & Scalability - Streaming, 500-token chunking, cosine similarity search

Added sections for Additional Constraints, Development Workflow & Quality Gates, and Governance with amendment process and versioning policy.

## Outcome

- ✅ Impact: Initial constitution created with 6 non-negotiable principles for AI-Powered RAG Chatbot project
- 🧪 Tests: None applicable (constitution update)
- 📁 Files: 1 file created (.specify/memory/constitution.md)
- 🔁 Next prompts: /sp.specify to create feature specification, /sp.plan for implementation plan
- 🧠 Reflection: Constitution establishes clear tech stack and quality standards upfront

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): /sp.constitution
- Next experiment: Proceed to feature specification phase with /sp.specify
