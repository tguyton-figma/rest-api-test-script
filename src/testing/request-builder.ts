import { RequestConfig, HttpMethod } from '../core/types.ts';

export class RequestBuilder {
    static build(request: RequestConfig): Record<string, unknown> {
        if (!request.body) return {};

        switch (request.method) {
            case HttpMethod.GET:
                // For GET requests, return query parameters
                return this.buildQueryParams(request.body);
            case HttpMethod.POST:
                // For POST requests, return body as-is
                return request.body;
            default:
                throw new Error(`Unsupported method: ${request.method}`);
        }
    }

    private static buildQueryParams(params: Record<string, unknown>): Record<string, unknown> {
        // Filter out undefined/null values and convert everything to strings
        return Object.entries(params).reduce((acc, [key, value]) => {
            if (value != null) {
                acc[key] = String(value);
            }
            return acc;
        }, {} as Record<string, unknown>);
    }
}