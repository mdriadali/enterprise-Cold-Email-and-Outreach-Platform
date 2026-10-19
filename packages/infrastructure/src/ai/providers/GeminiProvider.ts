import { GoogleGenAI } from "@google/genai";
import { BackoffHelper, RetryPolicy } from "@repo/common";
import type { IAiProvider } from "@repo/ports";
import type { ErrorResponse } from "@repo/types";

import { EmptyResponseError, ServiceUnavailableError } from "../errors/AiErrors";

const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Total provider attempts for a single generation, including the first one.
 * Platform policy: "max 3 tries", never an unbounded retry loop.
 */
const MAX_ATTEMPTS = 3;

/**
 * One cached client per API key. Recreating the client per request opens a new
 * HTTP pool every time and burns through provider connection limits.
 *
 * `retryOptions.attempts: 1` is critical: `@google/genai` retries 5 times by
 * default, which previously multiplied our 3 attempts into up to 15 requests for
 * a single lead.
 */
const clientCache = new Map<string, GoogleGenAI>();

function getClient(apiKey: string): GoogleGenAI {
  const key = apiKey.trim();
  const cached = clientCache.get(key);

  if (cached) {
    return cached;
  }

  const client = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      timeout: REQUEST_TIMEOUT_MS,
      retryOptions: { attempts: 1 },
    },
  });

  clientCache.set(key, client);
  return client;
}

export class GeminiProvider implements IAiProvider {
  async generate(
    apiKey: string,
    prompt: string,
  ): Promise<string | ErrorResponse> {
    const ai = getClient(apiKey);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                subject: { type: "string" },
                greeting: { type: "string" },
                body: { type: "string" },
                closing: { type: "string" },
                personalizationFieldsUsed: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: [
                "subject",
                "greeting",
                "body",
                "closing",
                "personalizationFieldsUsed",
              ],
            },
          },
        });

        const generatedEmail = response.text?.trim();

        if (!generatedEmail) {
          throw new EmptyResponseError();
        }

        return generatedEmail;
      } catch (error) {
        const status = RetryPolicy.statusOf(error);

        // Provider quota exhausted — surface it, do not retry.
        if (status === 429) {
          return {
            error: {
              type: "RATE_LIMIT",
              code: 429,
              message: "Rate limit exceeded",
            },
          };
        }

        // Bad or revoked key.
        if (status === 401 || status === 403) {
          return {
            error: {
              type: "INVALID_API_KEY",
              code: status,
              message: "Invalid API key",
            },
          };
        }

        const retryable = RetryPolicy.isRetryable(error);

        if (retryable && attempt < MAX_ATTEMPTS) {
          await BackoffHelper.delay(
            BackoffHelper.computeDelay(attempt, {
              baseDelayMs: 4_000,
              maxDelayMs: 8_000,
            }),
          );
          continue;
        }

        if (retryable) {
          return {
            error: {
              type: "SERVICE_UNAVAILABLE",
              code: status ?? 503,
              message: "Service unavailable",
            },
          };
        }

        throw error;
      }
    }

    throw new ServiceUnavailableError();
  }
}
