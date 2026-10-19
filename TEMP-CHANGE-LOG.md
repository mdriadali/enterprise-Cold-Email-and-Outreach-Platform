# TEMP — ফাইল-ধরে-ধরে Change Log (কী, কেন, কোন ক্রমে)

> এই ফাইলটা শুধু **আপনার পড়ার সুবিধার জন্য**। কোনো code এটা import করে না।
> পড়া শেষ হলে নিশ্চিন্তে ডিলিট করতে পারেন — কিছুই ভাঙবে না।

---

## ০. ৩০ সেকেন্ডের সারাংশ

পুরো কাজটা একটাই নিয়মে হয়েছে:

```
প্রতিটা third-party call-এ সর্বোচ্চ ৩ বার try → তারপর fail fast
  ├─ AI provider (Groq/Gemini) limit/outage  → website চালু থাকবে, শুধু ওই key বাদ
  └─ Postgres / Redis / Worker down          → ৩ বার পর process বন্ধ, পুরো project off
```

এই নিয়মটা এক জায়গায় লেখা আছে (`packages/common` + `packages/infrastructure/resilience`),
আর http-server / worker / web তিনজনই সেটাই ব্যবহার করে।

---

## ১. এই ফাইলটা কীভাবে পড়বেন

প্রতিটা step-এ তিনটা জিনিস আছে:

| চিহ্ন | মানে |
|---|---|
| 🆕 | নতুন ফাইল বানানো হয়েছে |
| ✏️ | আগের ফাইলে পরিবর্তন |
| 🔁 | **এই ফাইল আগেও একবার খোলা হয়েছে** — নিচে বলা আছে কোন step-এ |
| 👀 | শুধু পড়ে যাচাই করেছি, কিছু বদলাইনি |

আপনি যদি শুধু "কোন ফাইলে কী হয়েছে" জানতে চান → সরাসরি **শেষের টেবিল (ধাপ ৫)** দেখুন।
পুরো গল্পটা বুঝতে চাইলে → উপর থেকে নিচে পড়ুন।

---

# ২. পর্ব ১ — ভিত্তি তৈরি (shared policy → DB/Redis → AI → SMTP → bootstrap)

### Step 1 · `packages/common/src/retry-policy.ts` 🆕
**কী:** `DEFAULT_MAX_ATTEMPTS = 3`, `BackoffHelper` (delay + jitter), `RetryPolicy` (`statusOf`, `codeOf`, `isRetryable`, `run`)।
**কেন:** প্রতিটা জায়গায় আলাদা আলাদা retry loop ছিল। এখন একটাই bounded policy — কেউ ভুলে infinite loop লিখতে পারবে না।

### Step 2 · `packages/common/src/fatal.ts` 🆕
**কী:** `fatal(reason, cause)` + `setFatalHandler`।
**কেন:** "এখন project বন্ধ করো" — এই একটাই দরজা। সব service একইভাবে exit করে, log-ও একই রকম হয়।

### Step 3 · `packages/common/index.ts` ✏️
**কী:** ৫টা module export করা হলো: `date-helper`, `maskApiKey`, `token-generator`, `retry-policy`, `fatal`।
**কেন:** নতুন ফাইল দুটো বাইরে থেকে import করার জন্য।

---

### Step 4 · `packages/infrastructure/src/resilience/DependencyGuard.ts` 🆕
**কী:** Boot-এর সময় critical dependency (Postgres/Redis) চেক — সর্বোচ্চ ৩ attempt।
**কেন:** DB/Redis নেই অথচ app উঠে গেল — এই half-broken অবস্থা বন্ধ।

### Step 5 · `packages/infrastructure/src/resilience/HealthMonitor.ts` 🆕
**কী:** চালু হওয়ার **পরে** প্রতি ১৫s চেক; টানা ৩ বার fail → `fatal` → exit।
**কেন:** DB/Redis তো চলার মাঝেও মরতে পারে। তখন driver নিজে infinite reconnect করত — সেটা বন্ধ।

### Step 6 · `packages/infrastructure/src/resilience/shutdown.ts` 🆕
**কী:** `registerShutdown` + `installShutdownHooks` (SIGTERM/SIGINT, ১৫s timeout)।
**কেন:** Deploy-এর সময় in-flight request/job মেরে ফেলা যাবে না।

### Step 7 · `packages/infrastructure/src/resilience/index.ts` 🆕
**কী:** উপরের সব একসাথে export।
**কেন:** app গুলো যেন একটাই জায়গা থেকে import করে।
> ⚠️ এই ফাইলটা পরে **Step 33** আর **Step 43**-এ আবার খুলেছি — মনে রাখবেন।

### Step 8 · `packages/infrastructure/package.json` ✏️
**কী:** `"./resilience"` export যোগ + `@repo/common: workspace:*` dependency।
**কেন:** `import ... from "@repo/infrastructure/resilience"` কাজ করার জন্য।
> ❗ এটাই একমাত্র কারণ যার জন্য আপনাকে `bun install` চালাতে হবে (নিচে ধাপ ৫ দেখুন)।

---

### Step 9 · `packages/queue/src/connection.ts` ✏️
**কী:** ioredis-এর `retryStrategy` কে bounded করা (`MAX_RECONNECT_ATTEMPTS = 3`, তারপর `null` = থামো)। সাথে `pingRedis()` (readiness probe) আর `closeRedisConnections()` (shutdown)।
**কেন:** আগে ioredis চিরকাল reconnect করত — এটাই ছিল "onek onek retry"-এর মূল উৎস।
> 📌 ইচ্ছাকৃতভাবে `@repo/common` import করিনি — যাতে `packages/queue` কে ঘুরিয়ে common-এর উপর নির্ভরশীল না বানাই।

### Step 10 · `packages/queue/src/heartbeat.ts` 🆕
**কী:** worker প্রতি ১০s-এ Redis-এ `service:worker:heartbeat` লেখে (TTL ৩০s)। `isServiceAlive()` দিয়ে দেখা যায় worker বেঁচে আছে কি না।
**কেন:** **"worker না উঠলে project off"** — এই নিয়মটা বাস্তবায়নের একমাত্র উপায়। Key নিজেই expire হয়, তাই crash করলে আলাদা cleanup লাগে না।

### Step 11 · `packages/queue/index.ts` ✏️
**কী:** `heartbeat` module-টাও export করা হলো।
**কেন:** http-server আর worker দুজনেরই এটা লাগবে।

---

### Step 12 · `packages/env/src/schema.ts` ✏️
**কী:** `DB_POOL_MAX`, `DB_STATEMENT_TIMEOUT_MS` যোগ।
**কেন:** Connection pool আর query timeout env দিয়ে নিয়ন্ত্রণ — scale করলে DB-র `max_connections` ফুরাবে না।
> ⚠️ এই ফাইলটা পরে **Step 29**-এ আবার খুলেছি।

### Step 13 · `packages/env/src/db-env.ts` ✏️
**কী:** আলাদা করে schema লিখে না রেখে `databaseSchema` spread করা হলো।
**কেন:** দুই জায়গায় দুই রকম validation থাকা বন্ধ।

### Step 14 · `packages/db/index.ts` ✏️
**কী:** pool-এ `max` (env), `statement_timeout`/`query_timeout` (১৫s), `connectionTimeoutMillis`; নতুন `checkDatabase()` আর `closeDatabase()`।
**কেন:** Hang করা query একটা worker slot চিরকাল আটকে রাখত। আর `checkDatabase()` ছাড়া boot gate-এ DB probe করার উপায় নেই।
> ✅ এখানে original আচরণ অটুট: `export * from "@prisma/client"`, `idleTimeoutMillis: 30000`, pool error handler — সবই আছে (পুরোনো build bundle-এর সাথে মিলিয়ে দেখা)।

---

### Step 15 · `packages/infrastructure/src/ai/providers/GroqProvider.ts` ✏️
**কী:** `maxRetries: 0`, `timeout: 30s`, per-API-key client cache, মোট ৩ attempt, 429 → সাথে সাথে `RATE_LIMIT`, 401/403 → `INVALID_API_KEY`, 5xx/network → ৩ বার পর `SERVICE_UNAVAILABLE`।
**কেন:** আগে ৩ (আমাদের loop) × ৩ (SDK-র নিজের retry) = এক lead-এ ৯টা request যেত। Provider limit শেষ হয়ে যেত।

### Step 16 · `packages/infrastructure/src/ai/providers/GeminiProvider.ts` ✏️
**কী:** `httpOptions.retryOptions.attempts: 1` (SDK-র default ছিল **৫**!), `timeout: 30s`, client cache, ৩ attempt cap।
**কেন:** আগে এক lead-এ ১৫টা পর্যন্ত request যেত। এটাই ছিল সবচেয়ে বড় limit-burner।

---

### Step 17 · `apps/worker/src/infrastructure/email/smtp/SmtpTransporter.ts` 🆕
**কী:** প্রতি SMTP account-এ **একটাই pooled connection** (cache), `maxConnections: 1`, `maxMessages: 50`, `socketTimeout: 60s`; password বদলালে pool auto-replace; auth/connection fail হলে invalidate।
**কেন:** আগে **প্রতি মেইলে** নতুন TCP+TLS+AUTH handshake হতো, আর `concurrency 10` মানে একসাথে ১০টা login। Provider এটাকে abuse ভাবে।

### Step 18 · `apps/worker/src/infrastructure/email/smtp/MailSender.ts` ✏️
**কী:** উপরের pooled transporter ব্যবহার; failure-এ classify + pool invalidate।
**কেন:** ১০০০ মেইল = ১০০০ handshake → এখন ১টা connection-এ ৫০টা মেইল।
> ✅ Original-এর `from`/`replyTo`/`subject`/`text`/`html` হুবহু রাখা হয়েছে।

### Step 19 · `apps/worker/src/infrastructure/email/smtp/PlatformMailSender.ts` ✏️
**কী:** একই pooling, কিন্তু platform mailbox (verification / password reset) এর জন্য single cached transporter।
**কেন:** একই কারণ — auth email-ও প্রতি বার নতুন connection খুলত।
> ✅ `secure: === "ssl"`, `requireTLS: === "tls"` — original কোডেই এটাই ছিল, বদলায়নি।

---

### Step 20 · `apps/worker/src/application/usecases/ProcessGenerationJobUseCase.ts` ✏️
**কী:** নিজের `delay` function বাদ → `BackoffHelper.delay`; `MAX_PROVIDER_ATTEMPTS_PER_LEAD = 5 → 3`।
**কেন:** User-এর নিয়ম: "max 3 বার try"। এখানে একটা গুরুত্বপূর্ণ ব্যাপার——এই ৩টা হলো **কতগুলো আলাদা key ঘুরিয়ে try করা হবে**; প্রতিটা key-র ভেতরে provider নিজে আরও ৩টা HTTP attempt করে। তাই তাত্ত্বিক worst case (শুধু 5xx/network-এ): ৩ key × ৩ = **৯ request/lead** — আগে ছিল ৫ key × (৩ manual × SDK-র ২ retry) = **৪৫ request/lead**। 429 হলে provider-লেভেলে retry হয়ই না, তখন সাথে সাথে ওই key বাদ পড়ে।
> ❗ যদি ৯-ও বেশি মনে হয়, `MAX_PROVIDER_ATTEMPTS_PER_LEAD` আরও কমানো যাবে — কিন্তু তখন কম key rotate হবে, মানে rate-limited key থাকলে lead বেশি fail করবে।

### Step 21 · ৪টা worker ফাইল ✏️
`generation.worker.ts`, `resetApiKeyStatus.worker.ts`, `mailsend.worker.ts`, `emailSending.worker.ts`
**কী:** `const worker = new Worker(...)` → `export const worker = new Worker(...)`।
**কেন:** Graceful shutdown-এ `worker.close()` কল করার জন্য instance দরকার। Concurrency (10/5) **বদলাইনি**।

---

### Step 22 · `apps/worker/src/index.ts` ✏️ (১ম সংস্করণ)
**কী:** নতুন bootstrap — `DependencyGuard` → `HealthMonitor` → heartbeat → **তারপর** worker গুলো dynamic `import()` → cron start → shutdown handler → fail হলে `fatal`।
**কেন:**
- Guard আগে, import পরে — কারণ worker/queue import করলেই Redis connection খুলে বসে। আগে import হলে guard-এর কোন মানে থাকত না।
- `logger` আগের মতোই re-export করা হয়েছে (অন্য কেউ import করলে ভাঙবে না)।
> ⚠️ এই ফাইলটা পরে **Step 35** আর **Step 45**-এ আবার খুলেছি।

### Step 23 · `apps/http-server/src/index.ts` ✏️ (১ম সংস্করণ)
**কী:** Boot gate (Postgres + Redis) + `/health` (liveness) + `/ready` (readiness = DB + Redis + worker heartbeat) + HealthMonitor + graceful shutdown।
**কেন:** Docker/load-balancer যেন "worker ছাড়া চলছে" অবস্থাটা unhealthy দেখে।
> ⚠️ এই ফাইলটা পরে **Step 34** আর **Step 44**-এ আবার খুলেছি।
> ❗ **সৎ কথা:** এই ফাইলের পুরোনো build output ছিল না, তাই middleware chain আমি analyze করে পুনর্লিখন করেছি — `git diff apps/http-server/src/index.ts` দিয়ে একবার দেখে নিন (বিশেষত `cors()` ছিল কি না)।

---

# ৩. পর্ব ২ — Web gate, Docker, আর revisit গুলো

### Step 24 · 👀 শুধু পড়া
`packages/typescript-config/base.json`, `apps/web/package.json`, `packages/typescript-config/nextjs.json`
**কেন:** `AbortSignal.timeout` type-check করবে কি না, আর Next 16-এ `instrumentation.ts` কোন জায়গায় থাকে — নিশ্চিত হওয়ার জন্য।

### Step 25 · `apps/web/instrumentation.ts` 🆕 (১ম সংস্করণ)
**কী:** Web চালু হওয়ার আগে http-server-এর `/ready` ৩ বার চেক।
**কেন:** Web-এর সব data http-server থেকে আসে। Platform 준비 না হলে web চালু হওয়ার মানে নেই।
> ⚠️ এই ফাইলটা পরে **Step 36** আর **Step 46**-এ আবার খুলেছি।

### Step 26 · `apps/web/app/api/health/route.ts` 🆕
**কী:** `/api/health` → http-server `/ready` কে proxy করে, 503 হলে unhealthy।
**কেন:** Docker healthcheck যেন "worker নেই" অবস্থাটা ধরে ফেলে।

### Step 27 · `apps/web/proxy.ts` ✏️
**কী:** matcher-এ `api/health` যোগ: `/((?!_next/static|_next/image|favicon.ico|api/health).*)`.
**কেন:** নাহলে auth proxy health probe-টাকেও আটকে দিত → container চিরকাল unhealthy।

### Step 28 · 👀 শুধু পড়া
`docker-compose.production.yml`
**কেন:** বদলানোর আগে বর্তমান restart policy / healthcheck / depends_on দেখে নেওয়া।

---

### Step 29 · `packages/env/src/schema.ts` 🔁 (২য় বার, আগে Step 12)
**কী:** `resilienceSchema` যোগ — `HEALTH_CHECK_INTERVAL_MS`, `FAILURE_THRESHOLD`, `CRASH_LOOP_MAX_RESTARTS`, `CRASH_LOOP_WINDOW_MS`, `CRASH_STATE_DIR` (সবই default সহ)।
**কেন:** ৩/১৫s/৫মিনিট — এই সংখ্যাগুলো code-এ ছড়িয়ে না রেখে env দিয়ে tune করার জন্য।
> 🐞 প্রথম চেষ্টায় edit fail করেছিল (ফাইলের শেষে newline একটু আলাদা ছিল), তাই একই ফাইলে দ্বিতীয়বার edit করি।

### Step 30 · `packages/env/src/server-env.ts` ✏️
**কী:** `resilienceSchema` spread।
### Step 31 · `packages/env/src/worker-env.ts` ✏️
**কী:** `resilienceSchema` spread।
**কেন (দুটোই):** http-server আর worker একই env নাম পড়বে।

---

### Step 32 · `packages/infrastructure/src/resilience/CrashLoopGuard.ts` 🆕
**কী:** Container restart গুনে রাখে (একটা ছোট JSON ফাইল, container-এর নিজের `/tmp`-এ)। ৫ মিনিটে ৩ বারের বেশি হলে caller `exit(0)` করবে।
**কেন:** App নিজে ৩ বার try করে থেমে যায়, কিন্তু **Docker আবার তুলে দেয়** — তাই "onek onek retry" তখনও হতো।
> ⚠️ এই ফাইলটা পরে **Step 42**-এ আবার খুলেছি (একটা আসল bug ধরা পড়েছিল)।

### Step 33 · `packages/infrastructure/src/resilience/index.ts` 🔁 (২য় বার, আগে Step 7)
**কী:** `CrashLoopGuard`-এর export যোগ।
**কেন:** app গুলো এটা import করবে।

### Step 34 · `apps/http-server/src/index.ts` 🔁 (২য় বার, আগে Step 23)
**কী:** env-driven constant + production-এ crash-loop check + `exit(0)`।
**কেন:** Docker-কে "আর তুলো না" বোঝানোর একমাত্র উপায় হলো exit code 0 (`restart: on-failure` শুধু non-zero তে restart করে)।

### Step 35 · `apps/worker/src/index.ts` 🔁 (২য় বার, আগে Step 22)
**কী:** পুরো ফাইল আবার লেখা — env-driven policy, crash-loop check, `Promise.allSettled` দিয়ে worker close, SMTP pool close।
**কেন:** Step 22-এ constant গুলো hardcoded ছিল; এখন env থেকে আসবে।

### Step 36 · `apps/web/instrumentation.ts` 🔁 (২য় বার, আগে Step 25)
**কী:** তিনটা গুরুত্বপূর্ণ guard যোগ:
1. `NEXT_RUNTIME !== "nodejs"` → skip
2. `NEXT_PHASE === "phase-production-build"` → skip ← **এটা ছাড়া `next build`-ই fail করত**, কারণ build-এর সময় কোনো platform চালু থাকে না
3. production ছাড়া gate বন্ধ (dev-এ `bun dev` মরে যেত)
আর boot-gate fail → `exit(0)` (আর Docker তুলবে না)।
**কেন:** উপরের তিনটাই বাস্তবে ভাঙত।

---

### Step 37 · `docker-compose.production.yml` ✏️ (একবারে পুরো ফাইল rewrite)
**কী:**
- `restart: unless-stopped` → **`on-failure`** (তিন service-এ)
- healthcheck `/health` → **`/ready`** (worker heartbeat সহ)
- web-এ `/api/health` healthcheck + `depends_on: http-server: service_healthy`
- **`worker depends_on http-server` সরানো** ← এটা থাকলে deadlock: worker http-server-এর জন্য অপেক্ষা করে, http-server worker-এর heartbeat-এর জন্য
- resilience env গুলো তিন service-এ
**কেন:** "৩ বার পর project off" নিয়মটা orchestration-level-এ পূরণ করতে।
> ⚠️ এই ফাইল পরে **Step 41**-এ আবার খুলেছি।

### Step 38 · `docker-compose.yml` (dev) ✏️
**কী:** http-server healthcheck `/health` → `/ready`, `interval: 5m` → `30s`। বাকি dev config অপরিবর্তিত।
**কেন:** Dev-এও একই আচরণ, কিন্তু startup detection দ্রুত।

---

### Step 39 · `packages/common/src/retry-policy.ts` 🔁 (২য় বার, আগে Step 1)
**কী:** `let lastError: unknown;` → `let lastError: unknown = undefined;`
**কেন:** TypeScript `TS2454 "used before being assigned"` error দিত।

### Step 40 · `packages/infrastructure/src/logger/createLogger.ts` ✏️
**কী:** `axiom.ingest(...)` কে `await` + `try/catch` (ব্যর্থ হলে log drop, app মরে না)।
**কেন:** আগে await না করায় unbounded concurrent request জমত, আর rejection unhandled থাকত। এখন natural backpressure। **Logging কখনো app down করবে না।**

### Step 41 · `docker-compose.production.yml` 🔁 (২য় বার, আগে Step 37)
**কী:** worker service-এ `AXIOM_TOKEN` / `AXIOM_DATASET` যোগ।
**কেন:** Worker-এর logger Axiom-এ পাঠায়, কিন্তু compose worker-কে `BETTER_STACK_*` দিচ্ছিল (যা code-এ কোথাও ব্যবহৃত হয় না) — মানে **worker-এর কোনো remote log-ই যাচ্ছিল না**। `:-` default থাকায় secret না থাকলেও ভাঙবে না।

---

### Step 42 · `packages/infrastructure/src/resilience/CrashLoopGuard.ts` 🔁 (২য় বার, আগে Step 32) — 🐞 আসল bug fix
**কী:** `scheduleStabilityReset()` যোগ। আগে server listen করলেই counter clear হতো।
**কেন:** এতে bug ছিল — service ঠিকঠাক উঠে ১ মিনিট পর runtime-এ মরে গেলে প্রতিবার counter reset হয়ে **আবার infinite restart loop** হতো। এখন counter clear হয় শুধু **টানা ৫ মিনিট বেঁচে থাকলে**।
> এটা ধরতে পেরেছি কারণ শাটডাউন timeline হাতে গুনে দেখেছিলাম।

### Step 43 · `packages/infrastructure/src/resilience/index.ts` 🔁 (৩য় বার, Steps 7 → 33)
**কী:** `scheduleStabilityReset` export।

### Step 44 · `apps/http-server/src/index.ts` 🔁 (৩য় বার, Steps 23 → 34)
**কী:** `clearCrashState` → `scheduleStabilityReset` (`server.listen` callback-এ)।

### Step 45 · `apps/worker/src/index.ts` 🔁 (৩য় বার, Steps 22 → 35)
**কী:** একই পরিবর্তন worker-এ।

### Step 46 · `apps/web/instrumentation.ts` 🔁 (৩য় বার, Steps 25 → 36)
**কী:** `timer.unref?.()` সরানো।
**কেন:** Web-এর tsconfig-এ DOM + Node দুই `setInterval` type আছে — `unref` type-check এ fail করতে পারত। Next server তো event loop বাঁচিয়েই রাখে, তাই দরকারও নেই।

---

### Step 47 · 👀 যাচাই (কোনো ফাইল বদলাইনি)
`apps/worker/dist/index.js` — আপনার **আগের build** (original কোড) এর সাথে মিলিয়ে দেখেছি:
`MailSender` (replyTo), `PlatformMailSender` (ssl/tls), `packages/db` (pool config), worker `index.ts`, `ProcessGenerationJobUseCase` (MAX 5 ছিল), `GroqProvider`, `GeminiProvider` — সব মিলেছে। তাই rewrite-এ আচরণ বদলায়নি, শুধু bounded/pooled হয়েছে।
এছাড়া import নাম যাচাই: `prismaClient`, `SmtpAccount.replyTo`, `SmtpEncryption { NONE, SSL, TLS }`, `queueConnection`, `IAiProvider`, `Transporter` ইত্যাদি।

---

## ৪. এখন আপনাকে যা চালাতে হবে

```bash
# ১. বাধ্যতামূলক — packages/infrastructure এখন @repo/common depend করে
bun install

# ২. type check
bunx turbo run check-types
bunx tsc --noEmit -p apps/http-server     # http-server-এ check-types script নেই

# ৩. build
bun run build:http && bun run build:worker && bun run build:web
```

> ❗ `bun.lock` commit করতে ভুলবেন না — Docker-এ `bun install --frozen-lockfile` চলে, lockfile পুরোনো থাকলে build fail করবে।

### যাচাই করার ২টা জায়গা
```bash
git diff apps/http-server/src/index.ts      # middleware chain ঠিক আছে? (cors?)
git diff docker-compose.production.yml      # ports/env সব আছে?
```

---

## ৫. উল্টো দিক থেকে দেখুন — কোন ফাইল, কোন কোন step-এ

| ফাইল | Step | নতুন/সম্পাদনা |
|---|---|---|
| `packages/common/src/retry-policy.ts` | 1, **39** | 🆕 |
| `packages/common/src/fatal.ts` | 2 | 🆕 |
| `packages/common/index.ts` | 3 | ✏️ |
| `packages/infrastructure/src/resilience/DependencyGuard.ts` | 4 | 🆕 |
| `packages/infrastructure/src/resilience/HealthMonitor.ts` | 5 | 🆕 |
| `packages/infrastructure/src/resilience/shutdown.ts` | 6 | 🆕 |
| `packages/infrastructure/src/resilience/index.ts` | 7, **33, 43** | 🆕 |
| `packages/infrastructure/src/resilience/CrashLoopGuard.ts` | 32, **42** | 🆕 |
| `packages/infrastructure/package.json` | 8 | ✏️ |
| `packages/infrastructure/src/ai/providers/GroqProvider.ts` | 15 | ✏️ |
| `packages/infrastructure/src/ai/providers/GeminiProvider.ts` | 16 | ✏️ |
| `packages/infrastructure/src/logger/createLogger.ts` | 40 | ✏️ |
| `packages/queue/src/connection.ts` | 9 | ✏️ |
| `packages/queue/src/heartbeat.ts` | 10 | 🆕 |
| `packages/queue/index.ts` | 11 | ✏️ |
| `packages/env/src/schema.ts` | 12, **29** | ✏️ |
| `packages/env/src/db-env.ts` | 13 | ✏️ |
| `packages/env/src/server-env.ts` | 30 | ✏️ |
| `packages/env/src/worker-env.ts` | 31 | ✏️ |
| `packages/db/index.ts` | 14 | ✏️ |
| `apps/worker/src/infrastructure/email/smtp/SmtpTransporter.ts` | 17 | 🆕 |
| `apps/worker/src/infrastructure/email/smtp/MailSender.ts` | 18 | ✏️ |
| `apps/worker/src/infrastructure/email/smtp/PlatformMailSender.ts` | 19 | ✏️ |
| `apps/worker/src/application/usecases/ProcessGenerationJobUseCase.ts` | 20 | ✏️ |
| `apps/worker/src/workers/*.worker.ts` (৪টা) | 21 | ✏️ |
| `apps/worker/src/index.ts` | 22, **35, 45** | ✏️ |
| `apps/http-server/src/index.ts` | 23, **34, 44** | ✏️ |
| `apps/web/instrumentation.ts` | 25, **36, 46** | 🆕 |
| `apps/web/app/api/health/route.ts` | 26 | 🆕 |
| `apps/web/proxy.ts` | 27 | ✏️ |
| `docker-compose.yml` | 38 | ✏️ |
| `docker-compose.production.yml` | 37, **41** | ✏️ |

---

## ৬. কোন ফাইলে "৩ বার" সংখ্যাটা কোথায়?

এক জায়গায় বদলাতে চাইলে এই তালিকা দেখুন:

| জায়গা | ফাইল | মান |
|---|---|---|
| সাধারণ retry budget | `packages/common/src/retry-policy.ts` | `DEFAULT_MAX_ATTEMPTS = 3` |
| Boot dependency attempt | `DependencyGuard` (একই constant ব্যবহার করে) | 3 |
| Runtime health failure | `HealthMonitor` → `FAILURE_THRESHOLD` (env, default 3) | 3 |
| Redis reconnect | `packages/queue/src/connection.ts` | `MAX_RECONNECT_ATTEMPTS = 3` |
| AI provider attempt | `GroqProvider` / `GeminiProvider` | `MAX_ATTEMPTS = 3` |
| Per-lead provider rotation | `ProcessGenerationJobUseCase.ts` | `MAX_PROVIDER_ATTEMPTS_PER_LEAD = 3` |
| Container restart budget | `CrashLoopGuard` → `CRASH_LOOP_MAX_RESTARTS` (env) | 3 |

---

## ৭. এখনো বাকি (এই change-এ ধরা হয়নি)

- SMTP account create/update-এ `verify()` কল
- `apps/web/proxy.ts` / axios-এর explicit timeout
- অচল `@logtail/*` dependency + `BETTER_STACK_*` secret পরিষ্কার
- `mailSentDaily` reset bug
- campaign একই `jobId`-এ re-enqueue হওয়ার bug
- Redis limit-counter-এ TTL
- PgBouncer (connection pooler)

---

*এই ফাইলটা documentation only — import করে না, delete করলেও কিছু ভাঙবে না।*
