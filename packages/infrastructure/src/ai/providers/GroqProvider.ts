import OpenAI from "openai";
import { BackoffHelper, RetryPolicy } from "@repo/common";
import type { IAiProvider } from "@repo/ports";
import type { ErrorResponse } from "@repo/types";

const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Total provider attempts for a single generation, including the first one.
 * The platform policy is "max 3 tries" — after that the key/quota is treated as
 * unavailable instead of hammering the endpoint.
 */
const MAX_ATTEMPTS = 3;

/**
 * Creating an SDK client per request opens a brand new HTTP connection pool for
 * every lead, which drains local sockets and trips provider connection limits.
 * Cache one client per API key so its keep-alive connections are reused.
 */
const clientCache = new Map<string, OpenAI>();

function getClient(apiKey: string): OpenAI {
  const key = apiKey.trim();
  const cached = clientCache.get(key);

  if (cached) {
    return cached;
  }

  const client = new OpenAI({
    apiKey: key,
    baseURL: "https://api.groq.com/openai/v1",
    // The platform owns the retry policy. Disable the SDK's implicit retries
    // (default 2) so one call can never multiply into more provider requests
    // than we intended.
    maxRetries: 0,
    timeout: REQUEST_TIMEOUT_MS,
  });

  clientCache.set(key, client);
  return client;
}

export class GroqProvider implements IAiProvider {
  async generate(
    apiKey: string,
    prompt: string,
  ): Promise<string | ErrorResponse> {
    const client = getClient(apiKey);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that generates high-quality personalized emails.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        });

        const generatedText = response.choices[0]?.message?.content?.trim();

        if (!generatedText) {
          throw new Error("Groq API returned empty response");
        }

        return generatedText;
      } catch (error) {
        const status = RetryPolicy.statusOf(error);
        const code = RetryPolicy.codeOf(error);

        // Provider quota exhausted — surface it so the caller can rotate keys
        // and schedule a reset. Never retried here.
        if (status === 429 || code === "RATE_LIMIT_EXCEEDED") {
          return {
            error: {
              type: "RATE_LIMIT",
              code: 429,
              message: "Rate limit exceeded",
            },
          };
        }

        // Bad or revoked key — retrying cannot help.
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
              baseDelayMs: 2_000,
              maxDelayMs: 8_000,
            }),
          );
          continue;
        }

        // Transient provider failure after the bounded budget.
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

    return {
      error: {
        type: "SERVICE_UNAVAILABLE",
        code: 503,
        message: "Service unavailable",
      },
    };
  }
}
