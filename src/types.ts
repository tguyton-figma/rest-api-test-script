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