# HTTP Server

Express.js backend for the Enterprise Cold Email & Outreach Platform.

Built using Hexagonal Architecture, Class-Based Design, Dependency Injection, PostgreSQL, Prisma ORM, and Bun.

## Responsibilities

### Authentication & Authorization

* User Registration
* User Login
* JWT Authentication
* Refresh Token Management
* Profile Management
* Role-Based Access Control (Future)

### Lead Management

* CSV Lead Import
* Lead Validation
* Duplicate Detection
* Lead Tagging
* Lead Metadata Management
* Lead History Tracking

### AI Services

* AI Email Generation
* Email Rewriting
* Email Translation
* Dynamic Lead Personalization
* Multiple AI Provider Support

### Email Delivery

* SMTP Configuration Management
* Email Queue Processing
* Email Sending
* Failure Handling
* Retry Mechanisms
* Delivery Tracking

### Campaign Management

* Daily Sending Limits
* Ramp-Up Automation
* Campaign Pause / Resume
* Scheduler Execution

### Analytics

* Email Activity Tracking
* Open Tracking
* Click Tracking
* Reply Tracking
* Campaign Statistics

### Infrastructure

* PostgreSQL Integration
* Prisma ORM
* Background Jobs
* Cron Scheduler
* Environment Validation
* Logging

## Architecture

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

### Presentation

* Controllers
* Routes
* Middleware
* Dependency Container

### Application

* Use Cases
* Ports (Interfaces)

### Domain

* Business Rules
* Validation
* Core Logic

### Infrastructure

* Prisma Repositories
* SMTP Adapters
* AI Providers
* External Services

## Run

```bash
bun run dev
```
