# AI-Powered Cold Email & Outreach Platform

Enterprise-grade cold email and outreach automation platform built with modern software architecture principles.

Designed to evolve from a personal outbound automation tool into a scalable enterprise outreach infrastructure with AI-powered email generation, lead management, SMTP automation, workflow orchestration, and multi-tenant scalability.

---

## Tech Stack

### Backend
- Bun
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Nodemailer
- Cron Jobs

### Frontend
- Next.js
- React
- TypeScript

### Architecture
- Hexagonal Architecture (Ports & Adapters)
- Class-Based Design
- Dependency Injection
- Domain-Driven Separation

### DevOps
- Docker
- Docker Compose
- GitHub Actions
- Turborepo Monorepo

---

## Key Features

### Authentication
- JWT Authentication
- Refresh Token Flow
- User Profile Management
- API Key Management

### Lead Management
- CSV/Excel Import
- Email Validation
- Duplicate Detection
- Tags & Custom Fields
- Lead Activity Timeline

### AI Email Generation
- OpenAI / Anthropic Support
- Personalized Email Generation
- Dynamic Lead Variables
- Tone & Persona Control
- Translation & Rewrite Tools

### Email Sending
- Custom SMTP Integration
- Scheduler Engine
- Daily Sending Limits
- Ramp-Up System
- Campaign Kill Switch
- Failure Logging

### Analytics
- Lead History Tracking
- Delivery Monitoring
- Campaign Statistics

---

# Architecture

The project follows **Hexagonal Architecture (Ports & Adapters)**.

```text
Presentation Layer
        │
        ▼
Application Layer
        │
        ▼
Domain Layer
        │
        ▼
Infrastructure Layer
```

### Domain
Contains pure business logic.

- No database calls
- No external APIs
- No third-party dependencies

### Application
Contains use cases and interfaces (ports).

Examples:
- ILeadRepository
- IEmailSender
- IAIEngine

### Infrastructure
Contains adapter implementations.

Examples:
- Prisma Repositories
- OpenAI Adapter
- SMTP Adapter

### Presentation
Handles:
- Controllers
- Routes
- Middleware
- Dependency Injection Container

---

# Project Structure

```text
enterprise-Cold-Email-and-Outreach-Platform/

apps/
├── web/                 # Next.js frontend
└── http-server/         # Express backend

packages/
├── db/                  # Prisma & PostgreSQL
├── env/                 # Environment validation
├── ui/                  # Shared UI components
├── eslint-config/
└── typescript-config/

docker-compose.yml
turbo.json
package.json
```

---

# Development Roadmap

## Phase 1 — MVP
- Authentication
- Lead Management
- AI Email Generation
- SMTP Sending
- Daily Limits
- Scheduler Engine

## Phase 2 — Advanced Automation
- Email Warmup
- SMTP Rotation
- Lead Enrichment
- Smart Filtering
- Deliverability Protection

## Phase 3 — AI Agent System
- Research Agent
- Lead Analysis Agent
- Follow-up Agent
- Spam Detection Agent
- Analytics Agent
- Multi-Agent Orchestration

## Phase 4 — Enterprise Scale
- Multi-Tenant Architecture
- RBAC & ABAC
- SSO/SAML
- Audit Logs
- Compliance Controls
- Advanced Security

---

# Local Development

## Clone Repository

```bash
git clone <https://github.com/mdriadali/enterprise-Cold-Email-and-Outreach-Platform>

cd enterprise-Cold-Email-and-Outreach-Platform
```

## Install Dependencies

```bash
bun install
```

## Start Development Environment

```bash
docker compose up -d
```

## Run Applications

Frontend

```bash
bun run dev
```

Backend

```bash
bun run dev
```

---

# Docker

The project uses Docker for consistent local development.

Services include:

- PostgreSQL
- Backend API
- Frontend Application

Start all services:

```bash
docker compose up -d
```

Stop services:

```bash
docker compose down
```

---

# CI/CD

GitHub Actions automatically:

- Install dependencies
- Run lint checks
- Run type checking
- Execute tests
- Build applications
- Validate Docker images

---

# Contributing

1. Fork the repository
2. Create a feature branch
3. Follow Hexagonal Architecture principles
4. Keep domain layer pure
5. Submit a Pull Request

---

# Design Principles

- Clean Architecture
- Hexagonal Architecture
- Class-Based Design
- SOLID Principles
- Dependency Injection
- Separation of Concerns
- Scalable Monorepo Structure

---

# License

MIT License