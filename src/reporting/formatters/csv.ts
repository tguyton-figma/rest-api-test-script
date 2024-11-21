import { TestResult } from "../../core/types.ts";
import { userSymbols } from "../../core/config.ts";

export class CsvFormatter {
    static async generate(results: TestResult[], endpoints: string[], userTypes: string[]): Promise<void> {
        const csvRows = this.generateRows(results, endpoints, userTypes);
        
        try {
            await Deno.writeTextFile(
                "./api-permissions-matrix.csv",
                csvRows.join('\n'),
                { create: true }
            );
            console.log("✅ Permission matrix saved to api-permissions-matrix.csv");
        } catch (error) {
            console.error("❌ Error writing permission matrix:", error);
            throw error;
        }
    }

    private static generateRows(results: TestResult[], endpoints: string[], userTypes: string[]): string[] {
        const timestamp = new Date().toISOString();
        const header = [
            `# Generated: ${timestamp}`,
            `Method,Endpoint,${userTypes.map(user => `${userSymbols[user] || '👤'} ${user}`).join(',')}`
        ];
        const resultMap = this.createResultMap(results);
        
        const dataRows = endpoints.map(endpoint => {
            const method = results.find(r => r.request.endpoint === endpoint)?.request.method || 'GET';
            const rowData = [method, endpoint];
            userTypes.forEach(userType => {
                const status = resultMap.get(endpoint)?.get(userType) || 'N/A';
                rowData.push(status);
            });
            return rowData.join(',');
        });

        return [...header, ...dataRows];
    }

    private static createResultMap(results: TestResult[]): Map<string, Map<string, string>> {
        const resultMap = new Map<string, Map<string, string>>();
        
        results.forEach(result => {
            const endpoint = result.request.endpoint;
            if (!resultMap.has(endpoint)) {
                resultMap.set(endpoint, new Map());
            }
            const userType = result.request.user.replace(/^[^\w]+ /, '');
            const status = result.request.error ? 
                `❌ ${result.request.error.status || ''}` : 
                '✅';
            resultMap.get(endpoint)?.set(userType, status);
        });

        return resultMap;
    }
}
