import { TestResult } from "./types.ts";
import { FigmaApiClient } from "./api-client.ts";
import { config, userSymbols } from "./config.ts";

export class TestRunner {
    private results: TestResult[] = [];
    private apiClient: FigmaApiClient;

    constructor() {
        this.apiClient = new FigmaApiClient(config.baseURL);
    }

    async runTests(endpoints: string[]): Promise<TestResult[]> {
        this.results = [];
        
        for (const [userType, token] of Object.entries(config.userTokens)) {
            for (const endpoint of endpoints) {
                await this.runSingleTest(userType, token, endpoint);
            }
        }

        return this.results;
    }

    private async runSingleTest(userType: string, token: string, endpoint: string): Promise<void> {
        const processedEndpoint = this.processEndpoint(endpoint);
        
        try {
            await this.apiClient.get(processedEndpoint, token);
            this.addResult(endpoint, userType, true);
        } catch (error: unknown) {  // explicitly type the error as unknown
            this.addResult(endpoint, userType, false, error as Error);  // cast to Error
        }
    }

    private processEndpoint(endpoint: string): string {
        return endpoint
            .replace(':file_key', config.fileKeys.CAN_VIEW)
            .replace(':team_id', config.teamId.TEAM_ID)
            .replace(':comment_id', 'someCommentId');
    }

    private addResult(endpoint: string, userType: string, success: boolean, error?: Error): void {
        this.results.push({
            request: {
                method: 'GET',
                endpoint,
                user: `${userSymbols[userType] || '👤'} ${userType}`,
                status: success ? '✅ SUCCESS' : '❌ FAILED',
                ...(error && {
                    error: {
                        status: error instanceof Error && 'status' in error ? (error as { status: number }).status : 500,
                        message: error instanceof Error ? error.message : String(error)
                    }
                })
            }
        });
    }
} 