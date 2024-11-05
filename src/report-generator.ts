import { TestResult } from "./types.ts";
import { userSymbols } from "./config.ts";
import * as YAML from "https://deno.land/std@0.199.0/yaml/mod.ts";

export class ReportGenerator {
    static async generateReports(results: TestResult[], endpoints: string[], userTypes: string[]): Promise<void> {
        await this.generateCsvReport(results, endpoints, userTypes);
        await this.generateYamlReport(results);
    }

    static async generateYamlReport(results: TestResult[]): Promise<void> {
        const groupedByEndpoint: Record<string, TestResult[]> = {};
        
        results.forEach(result => {
            const key = `${result.request.method} ${result.request.endpoint}`;
            if (!groupedByEndpoint[key]) {
                groupedByEndpoint[key] = [];
            }
            groupedByEndpoint[key].push(result);
        });

        const cleanResults = Object.fromEntries(
            Object.entries(groupedByEndpoint)
                .filter(([_, values]) => values && values.length > 0)
                .map(([key, values]) => [
                    key,
                    values.map(v => ({
                        request: {
                            method: v.request.method,
                            endpoint: v.request.endpoint,
                            user: v.request.user,
                            status: v.request.status,
                            ...(v.request.error && { error: v.request.error })
                        }
                    }))
                ])
        );

        try {
            await Deno.writeTextFile(
                "./api-test-results.yaml",
                YAML.stringify({ results: cleanResults }),
                { create: true }
            );
            console.log("✅ Test results saved to api-test-results.yaml");
        } catch (error) {
            console.error("❌ Error writing test results:", error);
            throw error;
        }
    }

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
            const userType = result.request.user.replace(/^[^\w]+ /, '');
            const status = result.request.error ? 
                `❌ ${result.request.error.status || ''}` : 
                '✅';
            resultMap.get(endpoint)?.set(userType, status);
        });

        return resultMap;
    }
} 