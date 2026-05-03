import OpenAI from 'openai';
import { config } from '../config/index.js';
import type { TechnicalDebtIssue } from '../types/index.js';

export interface FixGenerationInput {
  category: string;
  file: string;
  problem: string;
  lines?: string;
  fileContent: string;
}

export interface FixGenerationOutput {
  fixed_file: string;
  explanation: string;
  dependent_changes: Array<{
    file: string;
    change_description: string;
  }>;
  unit_tests: string;
}

export class FixGenerator {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || config.openai.apiKey,
      baseURL: config.openai.baseURL,
    });
  }

  /**
   * Generate a complete fix for a technical debt issue
   */
  async generateFix(input: FixGenerationInput): Promise<FixGenerationOutput> {
    const prompt = this.buildPrompt(input);

    try {
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are a senior engineer fixing a specific technical debt issue.

Your task:
1. Produce the complete fixed version of the file
2. Explain in 2 sentences what you changed and why
3. List any other files that need corresponding changes
4. Write 3 unit tests that verify your fix works correctly

Format your response EXACTLY as:

FIXED_FILE:
[complete file content]

EXPLANATION:
[2 sentence explanation]

DEPENDENT_CHANGES:
[list of files and what to change, one per line in format "filename: description"]

UNIT_TESTS:
[test code]`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseResponse(content);
    } catch (error) {
      throw new Error(`Failed to generate fix: ${error}`);
    }
  }

  /**
   * Generate fix from a TechnicalDebtIssue object
   */
  async generateFixFromIssue(
    issue: TechnicalDebtIssue,
    fileContent: string
  ): Promise<FixGenerationOutput> {
    return this.generateFix({
      category: issue.category,
      file: issue.file,
      problem: issue.problem,
      fileContent,
    });
  }

  private buildPrompt(input: FixGenerationInput): string {
    return `
Issue details:
- Category: ${input.category}
- File: ${input.file}
- Problem: ${input.problem}
${input.lines ? `- Lines: ${input.lines}` : ''}

Here is the current file content:
\`\`\`
${input.fileContent}
\`\`\`

Please provide the complete fix following the specified format.
`;
  }

  private parseResponse(content: string): FixGenerationOutput {
    try {
      // Extract sections using regex
      const fixedFileMatch = content.match(/FIXED_FILE:\s*([\s\S]*?)(?=EXPLANATION:|$)/i);
      const explanationMatch = content.match(/EXPLANATION:\s*([\s\S]*?)(?=DEPENDENT_CHANGES:|$)/i);
      const dependentChangesMatch = content.match(/DEPENDENT_CHANGES:\s*([\s\S]*?)(?=UNIT_TESTS:|$)/i);
      const unitTestsMatch = content.match(/UNIT_TESTS:\s*([\s\S]*?)$/i);

      const fixedFile = fixedFileMatch ? fixedFileMatch[1].trim() : '';
      const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided';
      const dependentChangesText = dependentChangesMatch ? dependentChangesMatch[1].trim() : '';
      const unitTests = unitTestsMatch ? unitTestsMatch[1].trim() : '';

      // Parse dependent changes
      const dependentChanges = dependentChangesText
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const [file, ...descParts] = line.split(':');
          return {
            file: file.trim().replace(/^-\s*/, ''),
            change_description: descParts.join(':').trim(),
          };
        })
        .filter((change) => change.file && change.change_description);

      return {
        fixed_file: fixedFile,
        explanation,
        dependent_changes: dependentChanges,
        unit_tests: unitTests,
      };
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }

  /**
   * Format the output as a readable string
   */
  formatOutput(output: FixGenerationOutput): string {
    let result = 'FIXED_FILE:\n';
    result += output.fixed_file + '\n\n';

    result += 'EXPLANATION:\n';
    result += output.explanation + '\n\n';

    result += 'DEPENDENT_CHANGES:\n';
    if (output.dependent_changes.length === 0) {
      result += 'None\n\n';
    } else {
      output.dependent_changes.forEach((change) => {
        result += `- ${change.file}: ${change.change_description}\n`;
      });
      result += '\n';
    }

    result += 'UNIT_TESTS:\n';
    result += output.unit_tests + '\n';

    return result;
  }
}

/**
 * Standalone function for quick fix generation
 */
export async function generateQuickFix(
  category: string,
  file: string,
  problem: string,
  fileContent: string
): Promise<FixGenerationOutput> {
  const generator = new FixGenerator();
  return generator.generateFix({
    category,
    file,
    problem,
    fileContent,
  });
}

// Made with Bob
