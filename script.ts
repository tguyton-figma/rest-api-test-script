import { config } from "./src/core/config.ts";
import { TestRunner } from "./src/testing/runner.ts";
import { ReportGenerator } from "./src/reporting/generator.ts";
import { EndpointProcessor } from "./src/api/endpoints.ts";

const runner = new TestRunner();

async function main() {
    try {
        const allEndpoints = EndpointProcessor.getEndpoints();
        
        if (allEndpoints.length === 0) {
            console.warn('No endpoints found to test');
            return;
        }

        const results = await runner.runTests(allEndpoints);
        const endpointPaths = allEndpoints.map(e => e.path);
        const allUserTypes = Object.keys(config.userTokens);
        
        await ReportGenerator.generateReports(results, endpointPaths, allUserTypes);
    } catch (error) {
        console.error('Error running tests:', error);
        Deno.exit(1);
    }
}

main();