
export class AiError extends Error {
    constructor(
        message:string,
    ){
        super(message)
    }
}


export class RateLimitError extends AiError {
    constructor(message = "API quota exceeded") {
        super(message);
        this.name = "RateLimitError";
    }
}

export class InvalidApiKeyError extends AiError {
    constructor(message = "Invalid API Key") {
        super(message);
        this.name = "InvalidApiKeyError";
    }
}

export class ServiceUnavailableError extends AiError {
    constructor(message = "AI Service Unavailable") {
        super(message);
        this.name = "ServiceUnavailableError";
    }
}

export class EmptyResponseError extends AiError {
    constructor(message = "Gemini returned empty response") {
        super(message);
        this.name = "EmptyResponseError";
    }
}