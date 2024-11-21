import { EndpointProcessor } from './endpoints.ts';

export class FigmaApiClient {
    constructor(
        private baseURL: string,
        private token: string
    ) {}

    private async fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeout);
            return response;
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }

    async get<T>(endpoint: string, queryParams?: Record<string, unknown>): Promise<T> {
        const processedEndpoint = EndpointProcessor.process(endpoint);
        let url = `${this.baseURL}${processedEndpoint}`;
        
        if (queryParams && Object.keys(queryParams).length > 0) {
            const params = new URLSearchParams();
            Object.entries(queryParams).forEach(([key, value]) => {
                params.append(key, String(value));
            });
            url += `?${params.toString()}`;
        }
        
        try {
            const response = await this.fetchWithTimeout(url, { 
                method: 'GET',
                headers: {
                    "X-FIGMA-TOKEN": this.token
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`Failed to get from ${url}:`, error);
            throw error;
        }
    }

    async post<T>(endpoint: string, body: JSON): Promise<T> {
        const processedEndpoint = EndpointProcessor.process(endpoint);
        const url = `${this.baseURL}${processedEndpoint}`;
        const headers = new Headers({
            "X-FIGMA-TOKEN": this.token,
            "Content-Type": "application/json"
        });
        
        try {
            const response = await this.fetchWithTimeout(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`Failed to post to ${url}:`, error);
            throw error;
        }
    }
} 