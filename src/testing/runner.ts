import { TestResult, RequestConfig, HttpMethod } from '../core/types.ts';
import { FigmaApiClient } from '../api/client.ts';
import { config } from '../core/config.ts';
import { EndpointProcessor } from '../api/endpoints.ts';
import { ResponseValidator } from './validator.ts';
import { RequestBuilder } from './request-builder.ts';

export class TestRunner {
    private results: TestResult[] = [];

    constructor() {
        this.results = [];
    }

    async runTests(requests: RequestConfig[]): Promise<TestResult[]> {
        this.results = [];
        
        for (const [userType, token] of Object.entries(config.userTokens)) {
            for (const request of requests) {
                await this.executeTest(request, userType, token);
            }
        }

        return this.results;
    }

    private async executeTest(
        request: RequestConfig,
        userType: string,
        token: string
    ): Promise<void> {
        const apiClient = new FigmaApiClient(config.baseURL, token);
        const processedPath = EndpointProcessor.process(request.path);
        const requestBody = RequestBuilder.build(request);
        
        console.log('\n-------------------');
        console.log(`🔍 Testing ${request.method} ${processedPath}`);
        console.log('Parameters:', JSON.stringify(requestBody, null, 2));
        
        try {
            const response = await this.executeRequest(apiClient, request.method, processedPath, requestBody);
            const success = ResponseValidator.validate(response, request.expectedSchema);
            console.log(`${success ? '✅ PASS' : '❌ FAIL'} ${request.method} ${processedPath}`);
            this.addResult(request, userType, success);
        } catch (error: unknown) {
            console.log(`❌ FAIL ${request.method} ${processedPath}`);
            console.log('Error:', (error as Error).message);
            this.addResult(request, userType, false, error as Error);
        }
        console.log('-------------------\n');
    }

    private executeRequest(
        apiClient: FigmaApiClient,
        method: HttpMethod,
        path: string,
        requestData?: Record<string, unknown>
    ): Promise<unknown> {
        switch (method) {
            case HttpMethod.GET:
                return apiClient.get(path, requestData);
            case HttpMethod.POST:
                return apiClient.post(path, requestData as unknown as JSON);
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    }

    private addResult(
        request: RequestConfig,
        userType: string,
        success: boolean,
        error?: Error
    ): void {
        this.results.push({
            request: {
                method: request.method,
                endpoint: request.path,
                user: userType,
                status: success ? 'success' : 'failed',
                ...(error && {
                    error: {
                        message: error.message,
                        status: ('status' in error ? error.status as number : undefined)
                    }
                }),
                body: request.body as JSON | undefined,
                expectedSchema: request.expectedSchema
            }
        });
    }
}