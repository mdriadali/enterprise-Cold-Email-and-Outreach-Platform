# Types Package

Shared TypeScript types and interfaces used across the monorepo.

Provides a single source of truth for DTOs, interfaces, request types, response types, and shared contracts.

## Responsibilities

* Shared Interfaces
* DTO Definitions
* Request Types
* Response Types
* Cross-App Type Sharing

## Structure

```text
src/
├── auth-types.ts
├── user-types.ts
```

## Usage

```ts
import type { UserData } from "@repo/types/user-types";
import type { LoginDto } from "@repo/types/auth-types";
```
