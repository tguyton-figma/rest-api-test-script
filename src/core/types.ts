// Core types and interfaces
export interface TestResult {
    request: {
        method: string;
        endpoint: string;
        user: string;
        status: string;
        error?: {
            status?: number;
            message: string;
        };
        body?: JSON;
        expectedSchema?: {
            request?: Record<string, unknown>;
            response?: Record<string, unknown>;
        };
        validationRule?: {
            required?: string[];
            format?: Record<string, string>;
            constraints?: Record<string, unknown>;
        };
    };
}

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
}

export interface RequestConfig {
    method: HttpMethod;
    path: string;
    body?: Record<string, unknown>;
    expectedSchema?: {
        request?: Record<string, unknown>;
        response?: Record<string, unknown>;
    };
}

export interface ApiConfig {
    baseURL: string;
    userTokens: Record<string, string>;
    teamId: Record<string, string>;
    fileKeys: Record<string, string>;
    commentIds?: Record<string, string>;
    nodeIds?: Record<string, string>;
    imageIds?: Record<string, string>;
} 