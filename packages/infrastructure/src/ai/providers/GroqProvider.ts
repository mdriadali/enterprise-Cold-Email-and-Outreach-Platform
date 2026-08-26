import OpenAI from "openai";
import type { IAiProvider } from "@repo/ports";
import type { ErrorResponse } from "@repo/types";

const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export class GroqProvider implements IAiProvider {
    async generate(
        apiKey: string,
        prompt: string
    ): Promise<string | ErrorResponse> {
        const client = new OpenAI({
            apiKey: apiKey.trim(),
            baseURL: "https://api.groq.com/openai/v1",
        });

        const maxRetries = 3;
        let delayMs = 2000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
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

                const generatedText =
                    response.choices[0]?.message?.content?.trim();

                if (!generatedText) {
                    throw new Error("Groq API returned empty response");
                }

                return generatedText;
            } catch (error: any) {
                // ===============================
                // Rate Limit
                // ===============================
                if (
                    error?.status === 429 ||
                    error?.code === "rate_limit_exceeded"
                ) {
                    return {
                        error: {
                            type: "RATE_LIMIT",
                            code: 429,
                            message: "Rate limit exceeded",
                        },
                    };
                }

                // ===============================
                // Invalid API Key
                // ===============================
                if (
                    error?.status === 401 ||
                    error?.status === 403
                ) {
                    return {
                        error: {
                            type: "INVALID_API_KEY",
                            code: error.status,
                            message: "Invalid API key",
                        },
                    };
                }

                // ===============================
                // Service Unavailable
                // ===============================
                if (error?.status === 503) {
                    if (attempt < maxRetries) {

                        await delay(delayMs);
                        delayMs *= 2;
                        continue;
                    }

                    return {
                        error: {
                            type: "SERVICE_UNAVAILABLE",
                            code: 503,
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