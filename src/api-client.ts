export class FigmaApiClient {
    constructor(private baseURL: string) {}

    async get<T>(endpoint: string, token: string): Promise<T> {
        const headers = new Headers({ "X-FIGMA-TOKEN": token });
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, { method: "GET", headers });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`Failed to fetch ${url}:`, error);
            throw error;
        }
    }

    // Add other methods (POST, PUT, DELETE) as needed
} 