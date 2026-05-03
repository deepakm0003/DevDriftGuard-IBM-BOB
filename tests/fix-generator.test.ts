import { describe, it, expect, vi } from 'vitest';
import { FixGenerator } from '../src/utils/fix-generator.js';
import type { FixGenerationInput } from '../src/utils/fix-generator.js';

describe('FixGenerator', () => {
  const mockInput: FixGenerationInput = {
    category: 'dead_code',
    file: 'src/utils.ts',
    problem: 'Unused function',
    fileContent: `
export function usedFunction() {
  return 'used';
}

export function unusedFunction() {
  return 'unused';
}
    `.trim(),
  };

  describe('Input Validation', () => {
    it('should accept valid input', () => {
      const generator = new FixGenerator();
      expect(() => generator.generateFix(mockInput)).not.toThrow();
    });

    it('should handle input with line numbers', async () => {
      const inputWithLines = {
        ...mockInput,
        lines: '5-8',
      };

      const generator = new FixGenerator();
      // Should not throw
      expect(() => generator.generateFix(inputWithLines)).not.toThrow();
    });
  });

  describe('Response Parsing', () => {
    it('should parse complete AI response correctly', () => {
      const generator = new FixGenerator();
      const mockResponse = `
FIXED_FILE:
export function usedFunction() {
  return 'used';
}

EXPLANATION:
Removed the unused function to reduce code bloat. This improves maintainability and reduces bundle size.

DEPENDENT_CHANGES:
- src/utils.test.ts: Remove tests for unusedFunction
- docs/api.md: Remove documentation for unusedFunction

UNIT_TESTS:
describe('usedFunction', () => {
  it('should return used', () => {
    expect(usedFunction()).toBe('used');
  });
});
      `.trim();

      const result = (generator as any).parseResponse(mockResponse);

      expect(result.fixed_file).toContain('usedFunction');
      expect(result.fixed_file).not.toContain('unusedFunction');
      expect(result.explanation).toContain('Removed the unused function');
      expect(result.dependent_changes).toHaveLength(2);
      expect(result.dependent_changes[0].file).toBe('src/utils.test.ts');
      expect(result.unit_tests).toContain('describe');
    });

    it('should handle response with no dependent changes', () => {
      const generator = new FixGenerator();
      const mockResponse = `
FIXED_FILE:
fixed content

EXPLANATION:
Simple fix with no dependencies.

DEPENDENT_CHANGES:

UNIT_TESTS:
test code
      `.trim();

      const result = (generator as any).parseResponse(mockResponse);

      expect(result.dependent_changes).toHaveLength(0);
    });

    it('should handle malformed response gracefully', () => {
      const generator = new FixGenerator();
      const mockResponse = 'Invalid response format';

      const result = (generator as any).parseResponse(mockResponse);

      expect(result.fixed_file).toBe('');
      expect(result.explanation).toBe('No explanation provided');
      expect(result.dependent_changes).toHaveLength(0);
    });
  });

  describe('Output Formatting', () => {
    it('should format output correctly', () => {
      const generator = new FixGenerator();
      const output = {
        fixed_file: 'export function test() {}',
        explanation: 'Fixed the issue by refactoring.',
        dependent_changes: [
          { file: 'test.ts', change_description: 'Update imports' },
        ],
        unit_tests: 'describe("test", () => {});',
      };

      const formatted = generator.formatOutput(output);

      expect(formatted).toContain('FIXED_FILE:');
      expect(formatted).toContain('EXPLANATION:');
      expect(formatted).toContain('DEPENDENT_CHANGES:');
      expect(formatted).toContain('UNIT_TESTS:');
      expect(formatted).toContain('test.ts: Update imports');
    });

    it('should show "None" for empty dependent changes', () => {
      const generator = new FixGenerator();
      const output = {
        fixed_file: 'code',
        explanation: 'explanation',
        dependent_changes: [],
        unit_tests: 'tests',
      };

      const formatted = generator.formatOutput(output);

      expect(formatted).toContain('DEPENDENT_CHANGES:\nNone');
    });
  });

  describe('Prompt Building', () => {
    it('should build prompt with all required information', () => {
      const generator = new FixGenerator();
      const prompt = (generator as any).buildPrompt(mockInput);

      expect(prompt).toContain('Category: dead_code');
      expect(prompt).toContain('File: src/utils.ts');
      expect(prompt).toContain('Problem: Unused function');
      expect(prompt).toContain('usedFunction');
      expect(prompt).toContain('unusedFunction');
    });

    it('should include line numbers when provided', () => {
      const generator = new FixGenerator();
      const inputWithLines = { ...mockInput, lines: '10-15' };
      const prompt = (generator as any).buildPrompt(inputWithLines);

      expect(prompt).toContain('Lines: 10-15');
    });

    it('should not include line numbers when not provided', () => {
      const generator = new FixGenerator();
      const prompt = (generator as any).buildPrompt(mockInput);

      expect(prompt).not.toContain('Lines:');
    });
  });

  describe('Issue Categories', () => {
    const categories = [
      'dead_code',
      'security',
      'anti_pattern',
      'missing_tests',
      'tight_coupling',
      'outdated_dependency',
    ];

    categories.forEach((category) => {
      it(`should handle ${category} category`, () => {
        const generator = new FixGenerator();
        const input = { ...mockInput, category };
        const prompt = (generator as any).buildPrompt(input);

        expect(prompt).toContain(`Category: ${category}`);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file content', () => {
      const generator = new FixGenerator();
      const input = { ...mockInput, fileContent: '' };
      const prompt = (generator as any).buildPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('Category:');
    });

    it('should handle very long file content', () => {
      const generator = new FixGenerator();
      const longContent = 'x'.repeat(10000);
      const input = { ...mockInput, fileContent: longContent };
      const prompt = (generator as any).buildPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(10000);
    });

    it('should handle special characters in problem description', () => {
      const generator = new FixGenerator();
      const input = {
        ...mockInput,
        problem: 'Function with "quotes" and \'apostrophes\' and $pecial ch@rs',
      };
      const prompt = (generator as any).buildPrompt(input);

      expect(prompt).toContain('Function with "quotes"');
    });
  });

  describe('Dependent Changes Parsing', () => {
    it('should parse multiple dependent changes', () => {
      const generator = new FixGenerator();
      const response = `
FIXED_FILE:
code

EXPLANATION:
explanation

DEPENDENT_CHANGES:
- file1.ts: Change 1
- file2.ts: Change 2
- file3.ts: Change 3

UNIT_TESTS:
tests
      `.trim();

      const result = (generator as any).parseResponse(response);

      expect(result.dependent_changes).toHaveLength(3);
      expect(result.dependent_changes[0].file).toBe('file1.ts');
      expect(result.dependent_changes[1].file).toBe('file2.ts');
      expect(result.dependent_changes[2].file).toBe('file3.ts');
    });

    it('should handle colons in change descriptions', () => {
      const generator = new FixGenerator();
      const response = `
FIXED_FILE:
code

EXPLANATION:
explanation

DEPENDENT_CHANGES:
- config.json: Update port: 3000 to port: 8080

UNIT_TESTS:
tests
      `.trim();

      const result = (generator as any).parseResponse(response);

      expect(result.dependent_changes[0].change_description).toContain('port: 3000 to port: 8080');
    });
  });
});

// Made with Bob
