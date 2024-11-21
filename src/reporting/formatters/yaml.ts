import { TestResult } from "../../core/types.ts";
import * as YAML from "https://deno.land/std@0.199.0/yaml/mod.ts";

export class YamlFormatter {
    static async generate(results: TestResult[]): Promise<void> {
        const groupedByEndpoint = this.groupResults(results);
        const cleanResults = this.cleanResults(groupedByEndpoint);

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

    private static groupResults(results: TestResult[]): Record<string, TestResult[]> {
        const grouped: Record<string, TestResult[]> = {};
        
        results.forEach(result => {
            const key = `${result.request.method} ${result.request.endpoint}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(result);
        });

        return grouped;
    }

    private static cleanResults(groupedResults: Record<string, TestResult[]>) {
        return Object.fromEntries(
            Object.entries(groupedResults)
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
    }
}
