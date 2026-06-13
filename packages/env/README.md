# Environment Package

Shared environment validation package for all applications in the monorepo.

Provides centralized environment variable validation and type-safe configuration management.

## Responsibilities

* Shared Environment Variables
* Server Environment Variables
* Runtime Validation
* Type-Safe Configuration
* Startup Validation

## Features

* Required Variable Validation
* Type Safety
* Fail Fast Startup Validation
* Shared Configuration Across Apps

## Usage

```ts
import { serverEnv } from "@repo/env/server-env";
import { sharedEnv } from "@repo/env/shared-env";
```
