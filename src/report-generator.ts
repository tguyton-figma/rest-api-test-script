import { TestResult } from "./types.ts";
import { userSymbols } from "./config.ts";

export class ReportGenerator {
    static async generateCsvReport(results: TestResult[], endpoints: string[], userTypes: string[]): Promise<void> {
        const csvRows = this.generateCsvRows(results, endpoints, userTypes);
        
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

    private static generateCsvRows(results: TestResult[], endpoints: string[], userTypes: string[]): string[] {
        const header = [`Endpoint,${userTypes.map(user => `${userSymbols[user] || '👤'} ${user}`).join(',')}`];
        const resultMap = this.createResultMap(results);
        
        const dataRows = endpoints.map(endpoint => {
            const rowData = [endpoint];
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
            const userType = result.request.user.split(' ')[1];
            const status = result.request.error ? 
                `❌ ${result.request.error.status || ''}` : 
                '✅';
            resultMap.get(endpoint)?.set(userType, status);
        });

        return resultMap;
    }
} 