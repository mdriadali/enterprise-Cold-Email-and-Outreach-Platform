/*
  Warnings:

  - The values [OPENAI,ANTHROPIC] on the enum `AiProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AiProvider_new" AS ENUM ('GEMINI', 'GROQ', 'OPENROUTER', 'CEREBRAS');
ALTER TABLE "public"."AiApi" ALTER COLUMN "aiProvider" DROP DEFAULT;
ALTER TABLE "AiApi" ALTER COLUMN "aiProvider" TYPE "AiProvider_new" USING ("aiProvider"::text::"AiProvider_new");
ALTER TYPE "AiProvider" RENAME TO "AiProvider_old";
ALTER TYPE "AiProvider_new" RENAME TO "AiProvider";
DROP TYPE "public"."AiProvider_old";
ALTER TABLE "AiApi" ALTER COLUMN "aiProvider" SET DEFAULT 'GEMINI';
COMMIT;
