import { GoogleGenAI } from "@google/genai";
import type { IAiProvider } from "@repo/ports";

import {
    RateLimitError,
    InvalidApiKeyError,
    ServiceUnavailableError,
    EmptyResponseError,
} from "../errors/AiErrors";
import type { ErrorResponse } from "@repo/types";

const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export class GeminiProvider implements IAiProvider {

    async generate(apiKey: string, prompt: string): Promise<string | ErrorResponse> {

        const ai = new GoogleGenAI({ apiKey });

        const maxRetries = 3;
        let delayMs = 4000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {

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
                                    items: { type: "string" }
                                }
                            },
                            required: [
                                "subject",
                                "greeting",
                                "body",
                                "closing",
                                "personalizationFieldsUsed"
                            ]
                        }
                    }
                });

                const generatedEmail = response.text?.trim();

                if (!generatedEmail) {
                    throw new EmptyResponseError();
                }

                return generatedEmail;

            } catch (error: any) {


                if (error?.status === 429) {
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
                            message: "invalid Api key",
                        },
                    };
                }

                // ===============================
                // Server Busy
                // ===============================
                if (error?.status === 503) {

                    if (attempt < maxRetries) {

                        console.warn(
                            `Gemini busy. Retry ${attempt}/${maxRetries}`
                        );

                        await delay(delayMs);

                        delayMs *= 2;

                        continue;
                    }
                    return {
                        error: {
                            type: "SERVICE_UNAVAILABLE",
                            code: 503,
                            message: "Service Unavailable ",
                        },
                    };
                }
                console.error(error);
                throw error;
            }
        }

        throw new ServiceUnavailableError();
    }
}