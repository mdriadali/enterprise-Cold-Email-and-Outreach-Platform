# Database Package

Shared database package for the Enterprise Cold Email & Outreach Platform.

Provides Prisma Client, database schema, migrations, and database utilities for all applications within the monorepo.

## Responsibilities

* Prisma Client Generation
* Database Models
* Database Enums
* Database Migrations
* PostgreSQL Integration
* Shared Database Access

## Technologies

* PostgreSQL
* Prisma ORM
* Prisma Adapter PG

## Structure

```
prisma/
├── models/
├── enums/
└── migrations/

generated/
└── prisma/

index.ts
```

## Usage

```ts
import { prismaClient } from "@repo/db";
```
