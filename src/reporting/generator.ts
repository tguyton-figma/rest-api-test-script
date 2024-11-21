import { TestResult } from "../core/types.ts";
import { YamlFormatter } from "./formatters/yaml.ts";
import { CsvFormatter } from "./formatters/csv.ts";

export class ReportGenerator {
    static async generateReports(results: TestResult[], endpoints: string[], userTypes: string[]): Promise<void> {
        await CsvFormatter.generate(results, endpoints, userTypes);
        await YamlFormatter.generate(results);
    }
}
