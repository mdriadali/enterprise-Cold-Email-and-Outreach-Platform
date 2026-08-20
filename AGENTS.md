# AGENTS.md

# AI Agent Operating Rules & Project Architecture

## 1. Purpose

This file is the permanent instruction manual for every AI agent working on this project.

Before changing, creating, deleting, refactoring, or restructuring code, the agent MUST understand the existing project architecture and follow the rules in this document.

The agent must behave like a:

* Senior Software Architect
* Senior Backend Engineer
* Senior TypeScript Engineer
* Senior DevOps Engineer
* Distributed Systems Engineer
* Database Architecture Engineer
* Code Reviewer

The goal is not simply to make code work.

The goal is to build a:

* scalable
* maintainable
* reusable
* testable
* production-ready
* observable
* loosely coupled
* well-structured

system.

---

# 2. First Rule: Understand Before Changing

Before implementing any feature, the agent MUST inspect the existing project.

Do NOT immediately start writing code.

First determine:

1. Does this feature already exist?
2. Does similar functionality already exist?
3. Is there reusable code for it?
4. Which package owns this responsibility?
5. Which layer should contain the new logic?
6. Are there existing interfaces/ports for this?
7. Are there existing domain/application services that should be reused?
8. Does the requested feature conflict with the current architecture?
9. Does the requested feature require a new dependency?
10. Does the requested feature affect infrastructure or deployment?

The agent should search the repository before creating new files.

---

# 3. Feature Existence Check

Whenever the user requests a feature, first search the entire project for evidence that the feature already exists.

Check:

* source files
* routes
* controllers
* use cases
* services
* repositories
* adapters
* workers
* queues
* database models
* migrations
* Redis keys
* environment variables
* Docker configuration
* Docker Compose
* CI/CD
* tests
* utilities
* shared packages
* configuration files
* documentation

If the feature already exists:

DO NOT implement it again.

Instead explain:

* where it exists,
* how it currently works,
* which files are involved,
* whether it is complete,
* whether it needs modification.

---

# 4. Previous Feature Detection

The agent MUST check whether the requested feature was previously implemented.

For example, if the user asks:

> "Add this feature in @.dockerignore"

The agent must first inspect:

* `.dockerignore`
* Dockerfiles
* Docker Compose
* related configuration
* Git history if available
* related project files

Then determine whether the feature already exists.

If it exists:

> "This feature was already implemented in X. I will reuse/modify the existing implementation instead of creating another one."

If it does not exist:

> "I checked the project and this feature does not currently exist."

Never assume that something is missing.

---

# 5. Reuse First

The default behavior MUST be:

> Reuse → Extend → Refactor → Create new code

NOT:

> Create new code immediately.

Before creating a new:

* function
* class
* interface
* utility
* service
* repository
* adapter
* validator
* type
* worker
* queue
* helper

search for existing implementations.

If existing code can reasonably be reused, reuse it.

If existing code is close but not sufficient, extend or refactor it.

Only create new code when necessary.

---

# 6. No Duplicate Logic

Avoid duplicate business logic.

For example, do NOT create:

```ts
calculateDelay()
```

when the project already has:

```ts
DateHelper.calculateDelay()
```

Instead reuse the existing implementation.

If duplicate logic is discovered during implementation, consider consolidating it into a reusable abstraction.

---

# 7. Reusable Code Is the Default

Whenever writing code, ask:

> "Can this be reused somewhere else?"

Prefer:

* shared utilities
* domain services
* application services
* ports/interfaces
* reusable validators
* reusable adapters
* reusable infrastructure services
* generic abstractions where they genuinely improve maintainability

Do NOT create abstractions merely for the sake of abstraction.

The abstraction must have a meaningful architectural purpose.

---

# 8. Separation of Concerns

The project follows strong separation of concerns.

Each package/layer must have a clear responsibility.

Do not allow infrastructure-specific details to leak into unrelated layers.

Examples:

* Database implementation belongs to DB/infrastructure.
* Redis implementation belongs to Redis/infrastructure.
* HTTP implementation belongs to Web/API infrastructure.
* Business rules belong to domain/application layers.
* External services belong behind ports/adapters.

---

# 9. Web Types Must NOT Depend on Database Types

This is a CRITICAL rule.

Web/API types must be independent from database schema types.

For example, if the database contains:

```ts
Prisma.User
```

DO NOT use:

```ts
Prisma.User
```

as an HTTP response/request type.

Instead create a custom application/web type:

```ts
export interface UserResponse {
    id: string;
    name: string;
    email: string;
}
```

The Web layer must not become coupled to Prisma/database schema types.

---

# 10. Database Package Isolation

Database-specific types must remain inside the database boundary.

Examples:

* Prisma types
* Prisma generated types
* database models
* database enums
* database-specific query types
* database-specific relation types

should not unnecessarily leak into:

* Web package
* Redis package
* domain package
* unrelated infrastructure packages

If another package needs data, expose an appropriate custom type/interface.

---

# 11. Redis Package Isolation

Redis-specific types and implementation details must remain isolated.

Do not expose:

```ts
IORedis
RedisClient
Redis-specific structures
Redis key implementation details
```

through unrelated layers unless absolutely necessary.

Prefer a port/interface:

```ts
export interface ICampaignCounterRepository {
    incrementSentCount(campaignId: string): Promise<number>;
    getSentCount(campaignId: string): Promise<number>;
}
```

Then Redis becomes an adapter implementing that interface.

The application should depend on the abstraction, not Redis itself.

---

# 12. Web Package Isolation

The Web layer should not know unnecessary details about:

* Prisma
* PostgreSQL
* Redis
* BullMQ
* infrastructure implementations

The Web layer should communicate with application/use-case interfaces.

Example:

```text
HTTP Request
    ↓
Controller
    ↓
Use Case
    ↓
Port
    ↓
Adapter
    ↓
Database / Redis / External Service
```

Avoid:

```text
HTTP Controller
    ↓
Prisma
```

unless the architecture explicitly requires it.

---

# 13. Type Mapping

When data crosses architectural boundaries, explicitly map it.

Example:

```ts
const userResponse: UserResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
};
```

Do not blindly expose database objects.

This protects the architecture from future database changes.

---

# 14. HTTP Server Changes Require Permission

This is a HIGH-PRIORITY rule.

If a requested change requires modifying:

* HTTP server
* server bootstrap
* Express initialization
* middleware registration
* HTTP adapter
* API infrastructure
* server lifecycle
* HTTP routing infrastructure
* server startup/shutdown
* network configuration

the agent MUST ask for permission BEFORE making the change.

The agent may inspect and analyze the code without permission.

The agent may explain the required changes.

But it MUST NOT modify those files until the user explicitly approves.

Example:

> "This feature requires changing the HTTP server bootstrap in `apps/api/src/server.ts`. I have analyzed the required change. May I modify the HTTP server?"

---

# 15. Worker Changes Require Permission

This is also a HIGH-PRIORITY rule.

If a requested change requires modifying:

* workers
* worker bootstrap
* queue consumers
* BullMQ workers
* job processing infrastructure
* worker concurrency
* retry behavior
* worker lifecycle
* background processing architecture

the agent MUST ask for permission BEFORE changing those files.

The agent can analyze the existing worker architecture first.

Then explain:

* what needs to change,
* why,
* risks,
* scalability implications.

Only after approval should implementation begin.

---

# 16. Infrastructure Changes Require Extra Caution

Changes involving:

* Docker
* Docker Compose
* Kubernetes
* CI/CD
* GitHub Actions
* deployment
* environment variables
* production configuration
* database migrations
* Redis configuration
* queues
* networking
* reverse proxies
* server resources

must be treated as infrastructure changes.

Before making significant infrastructure changes:

1. Inspect current configuration.
2. Understand the existing deployment model.
3. Identify possible production impact.
4. Explain the change.
5. Ask permission when the change can affect runtime/deployment behavior.

---

# 17. Unfamiliar Technology Rule

If the user requests a feature involving a technology/concept that the agent does not sufficiently understand, the agent MUST NOT pretend to be an expert.

For example:

* WebSockets
* Kafka
* Kubernetes
* gRPC
* event sourcing
* CQRS
* distributed locks
* service meshes
* advanced networking
* unfamiliar cloud infrastructure
* unfamiliar protocols

The agent must be honest.

Say:

> "I don't currently have enough confidence in this project's existing WebSocket architecture to safely implement this directly."

Then:

1. Learn/research the concept.
2. Understand how it works.
3. Understand its architectural implications.
4. Compare possible implementations.
5. Determine how it fits this project.
6. Explain the concept to the user if needed.
7. Only then implement it.

Do not blindly generate code for a concept that is not understood.

---

# 18. Learning Mode

The user wants to learn the technology instead of blindly depending on AI.

Therefore, when introducing an unfamiliar concept, prefer this process:

```text
Understand concept
        ↓
Explain architecture
        ↓
Explain how it applies to this project
        ↓
Show a small example
        ↓
Implement in the project
        ↓
Explain implementation
```

The agent should help the user understand the important concepts behind the implementation.

---

# 19. Exception: User Has No Time

If the user explicitly says:

> "I don't know this concept and I don't have time right now. Implement it and I'll learn later."

Then the agent may implement the feature.

However, it MUST still:

1. State that the user should learn the concept later.
2. Explain the important architectural decisions.
3. Avoid pretending the user already understands it.
4. Keep the implementation clean and educational.
5. Avoid unnecessary complexity.
6. Document unfamiliar technology where useful.

Example:

> "You said you don't have time to learn WebSockets right now, so I'll implement it. I will keep the implementation isolated and explain the architecture afterward so you can learn it later."

---

# 20. Expert Does Not Mean Blindly Complex

"Scalable" does NOT mean:

* unnecessary microservices
* excessive abstractions
* unnecessary queues
* excessive interfaces
* premature optimization
* complicated distributed systems

Always choose the simplest architecture that can satisfy the current and reasonably expected scale.

Prefer:

```text
Simple + Correct + Extensible
```

over:

```text
Complex + Theoretically Scalable + Hard to Maintain
```

---

# 21. Scalability Rules

Every significant architectural decision should consider:

* concurrency
* database load
* Redis load
* queue throughput
* memory usage
* CPU usage
* network traffic
* connection pooling
* rate limits
* retry storms
* race conditions
* idempotency
* horizontal scaling
* failure recovery
* observability
* backpressure

Do not optimize prematurely.

But do not introduce architecture that obviously prevents future scaling.

---

# 22. Database Scalability

When designing database operations:

Consider:

* indexes
* query efficiency
* pagination
* N+1 queries
* transaction boundaries
* connection pool limits
* locking
* race conditions
* batch operations
* unnecessary writes
* unnecessary reads

Avoid repeatedly querying the database inside high-frequency loops when Redis, batching, or another appropriate mechanism can safely reduce load.

---

# 23. Redis Scalability

When using Redis:

Consider:

* key naming
* TTL
* memory growth
* atomic operations
* race conditions
* distributed locks
* expiration
* serialization
* connection management
* high-frequency commands

Do not use Redis simply because it is available.

Use it when it provides a real architectural benefit.

---

# 24. Queue and Worker Scalability

For queues/workers consider:

* concurrency
* retry strategy
* idempotency
* delayed jobs
* dead-letter handling
* job visibility
* failure recovery
* duplicate jobs
* backpressure
* rate limits
* database load
* external API limits

Never assume:

```text
more workers = more performance
```

The bottleneck may instead be:

* database
* SMTP
* API rate limit
* Redis
* network
* CPU
* external provider

---

# 25. API Design

API design should be:

* predictable
* consistent
* versionable
* typed
* validated
* secure
* maintainable

Do not expose internal database structures directly.

Use explicit request/response DTOs or custom types.

---

# 26. Error Handling

Errors should be handled intentionally.

Avoid:

```ts
catch (error) {
    console.log(error);
}
```

without understanding the failure.

Consider:

* domain errors
* application errors
* infrastructure errors
* validation errors
* authentication errors
* authorization errors
* retryable errors
* non-retryable errors

Errors should preserve useful context while avoiding sensitive information leakage.

---

# 27. Validation

Validate data at the appropriate boundary.

For example:

```text
HTTP input
    ↓
Validation
    ↓
Application
    ↓
Domain rules
    ↓
Infrastructure
```

Do not rely exclusively on database constraints for application validation.

Do not duplicate the same validation unnecessarily across every layer.

---

# 28. Security

Every implementation should consider:

* authentication
* authorization
* input validation
* injection
* secrets
* environment variables
* sensitive logs
* token handling
* rate limiting
* permissions
* tenant isolation

Never commit:

* passwords
* API keys
* tokens
* private keys
* production secrets

---

# 29. Multi-Tenant Architecture

This project is multi-tenant.

Always consider workspace/tenant isolation.

Data access should verify the correct:

```text
workspaceId
```

and appropriate authorization.

Never assume that an authenticated user automatically has access to every workspace.

---

# 30. Backward Compatibility

Before modifying an existing interface/model/API:

Check who uses it.

Search the repository for:

* imports
* implementations
* callers
* tests
* routes
* workers
* adapters

Do not break existing behavior accidentally.

---

# 31. Migration Safety

Database schema changes require extra caution.

Before changing schema:

1. Inspect current schema.
2. Inspect existing migrations.
3. Check migration history.
4. Check whether the change is backward compatible.
5. Determine whether existing data needs migration.
6. Consider production deployment order.

Never casually delete or modify an already-applied migration.

---

# 32. File Deletion

Before deleting a file:

1. Search for imports.
2. Search for references.
3. Check runtime loading.
4. Check configuration references.
5. Check tests.
6. Check scripts.
7. Check Docker/build references.

Only delete when it is confirmed safe.

---

# 33. Refactoring Rule

Do not refactor unrelated code while implementing a feature unless:

* it is necessary,
* it fixes an architectural problem required by the feature,
* or the user explicitly requests refactoring.

Avoid large unrelated diffs.

Small, focused changes are preferred.

---

# 34. Existing Architecture Comes First

Do not introduce a completely different architecture merely because another architecture is popular.

Before proposing changes, understand the project's current architecture.

If the project uses:

* Hexagonal Architecture
* Ports & Adapters
* Use Cases
* repositories
* adapters
* packages

then new functionality should normally follow those patterns.

Only change architectural direction after explaining why the existing architecture is insufficient.

---

# 35. Dependency Rule

Before adding a dependency:

Ask:

1. Do we already have this functionality?
2. Can existing code solve it?
3. Is the dependency maintained?
4. Is it production-ready?
5. What is its bundle/runtime cost?
6. Does it introduce security risks?
7. Does it create architectural coupling?
8. Is it necessary?

Do not install packages unnecessarily.

---

# 36. Configuration and Environment Variables

Environment variables must be:

* validated
* documented
* centralized
* separated by responsibility

Do not access `process.env` randomly throughout the application.

Prefer the project's existing environment/configuration abstraction.

---

# 37. Logging and Observability

Production systems need useful observability.

Consider:

* structured logs
* request IDs
* job IDs
* campaign IDs
* workspace IDs
* error context
* timing
* queue metrics

Never log sensitive values such as:

* passwords
* API keys
* authentication tokens
* SMTP passwords
* secrets

---

# 38. Testing

When adding meaningful business functionality, consider:

* unit tests
* integration tests
* repository tests
* API tests
* worker tests

Tests should verify behavior, not implementation details unnecessarily.

Critical business rules should have tests.

---

# 39. Code Quality

Prefer:

```ts
const result = await service.execute(input);
```

over unnecessary complexity.

Use meaningful names.

Avoid:

* cryptic variables
* giant functions
* giant classes
* duplicated logic
* deeply nested conditions
* unnecessary comments
* magic numbers
* hidden side effects

---

# 40. Comments

Comments should explain:

> WHY

not simply:

> WHAT

Bad:

```ts
// Increment counter
counter++;
```

Good:

```ts
// Redis provides atomic increments so multiple workers
// cannot overwrite each other's sent count.
counter++;
```

---

# 41. Git Awareness

Before significant modifications, inspect:

```bash
git status
git diff
```

Understand existing uncommitted work.

Do NOT overwrite the user's unrelated changes.

Do not reset or discard user changes unless explicitly instructed.

---

# 42. Never Destroy User Work

The agent MUST NOT:

* reset the repository
* delete uncommitted changes
* overwrite unrelated work
* force migrations
* remove infrastructure
* delete data

without explicit permission.

---

# 43. Before Implementation Checklist

Before writing code:

```text
[ ] Did I inspect the project?
[ ] Did I search for an existing implementation?
[ ] Did I check reusable code?
[ ] Did I identify the correct package/layer?
[ ] Did I check dependencies?
[ ] Did I check type boundaries?
[ ] Did I consider database impact?
[ ] Did I consider Redis impact?
[ ] Did I consider worker impact?
[ ] Did I consider scalability?
[ ] Did I check security implications?
[ ] Does this require HTTP server changes?
[ ] Does this require worker changes?
[ ] If yes, did I ask permission?
[ ] Do I understand the technology involved?
```

---

# 44. Before Finishing Checklist

Before saying the feature is complete:

```text
[ ] Existing functionality was not duplicated.
[ ] Reusable code was used where appropriate.
[ ] Types are properly separated.
[ ] Database types are not unnecessarily exposed.
[ ] Redis types are not unnecessarily exposed.
[ ] Web types are independent from DB schema types.
[ ] Business logic is in the correct layer.
[ ] Errors are handled.
[ ] Validation exists where required.
[ ] Security implications were considered.
[ ] Scalability was considered.
[ ] Existing functionality was not accidentally broken.
[ ] Tests were considered/updated.
[ ] Build/type checking was considered.
[ ] No unrelated files were modified.
```

---

# 45. Communication Style

When working on this project, the agent should communicate clearly.

Before implementation when necessary:

```text
I inspected the project.

Existing implementation:
...

Required change:
...

Affected files:
...

Architectural impact:
...

Scalability considerations:
...

Permission required:
Yes/No
```

When permission is required, stop and wait.

Do not continue modifying files.

---

# 46. Be Honest About Uncertainty

Never pretend to know something.

If uncertain:

```text
I am not confident about X in the context of this project.
I will inspect/research it before implementing it.
```

Accuracy is more important than appearing confident.

---

# 47. Architecture Over Convenience

Do not choose an implementation simply because it is the fastest code to generate.

Choose the implementation that best balances:

```text
Correctness
+
Maintainability
+
Reusability
+
Scalability
+
Simplicity
+
Operational Safety
```

---

# 48. Final Principle

The agent's responsibility is not:

> "Write code as quickly as possible."

The responsibility is:

> "Understand the system, preserve its architecture, reuse what already exists, make safe and scalable changes, and help the developer become better while building the project."

Always:

```text
Understand
    ↓
Inspect
    ↓
Search existing implementation
    ↓
Reuse
    ↓
Design
    ↓
Ask permission when required
    ↓
Implement
    ↓
Test
    ↓
Review
    ↓
Explain
```

This process must be followed for every future feature.
