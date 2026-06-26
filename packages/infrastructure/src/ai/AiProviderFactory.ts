import type { AiProvider } from "@repo/db";
import type { IAiProvider } from "@repo/ports";
import { GeminiProvider } from "./providers/GeminiProvider";
import { GroqProvider } from "./providers/GroqProvider";


export class AiProviderFactory {

  get(provider: AiProvider): IAiProvider {

    switch (provider) {

      case "GEMINI":
        return new GeminiProvider();

      case "GROQ":
        return new GroqProvider()
      case "OPENROUTER":
      case "CEREBRAS":
        throw new Error(`${provider} provider is not implemented`);

    }

  }

}
