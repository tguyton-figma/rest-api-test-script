import { RequestConfig } from '../core/types.ts';

export class ResponseValidator {
    static validate(
        response: unknown,
        schema?: RequestConfig['expectedSchema']
    ): boolean {
        if (!schema?.response) return true;
        
        try {
            return this.validateSchema(response, schema.response);
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }
    
    private static validateSchema(
        data: unknown,
        schema: Record<string, unknown>
    ): boolean {
        if (!data || typeof data !== 'object') return false;
        
        return Object.entries(schema).every(([key, expectedType]) => {
            const value = (data as Record<string, unknown>)[key];
            return this.validateType(value, expectedType as string);
        });
    }

    private static validateType(value: unknown, expectedType: string): boolean {
        const typeChecks = {
            'string': (v: unknown): boolean => typeof v === 'string',
            'number': (v: unknown): boolean => typeof v === 'number',
            'boolean': (v: unknown): boolean => typeof v === 'boolean',
            'array': Array.isArray,
            'object': (v: unknown): boolean => v !== null && typeof v === 'object' && !Array.isArray(v),
            'null': (v: unknown): boolean => v === null,
            'date': (v: unknown): boolean => v instanceof Date
        };

        return typeChecks[expectedType as keyof typeof typeChecks]?.(value) ?? false;
    }
}