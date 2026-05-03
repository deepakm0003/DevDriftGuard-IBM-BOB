import type { TechnicalDebtIssue } from '../types/index.js';

export interface PRDescriptionInput {
  issue_title: string;
  explanation: string;
  tests_added: boolean;
  files_changed: string[];
  estimated_hours_saved?: number;
  risk_level?: 'Low' | 'Medium' | 'High';
  risk_justification?: string;
}

export interface PRDescriptionFromFix {
  issue: TechnicalDebtIssue;
  fix_explanation: string;
  code_changes: Array<{ file: string; action: string }>;
  test_changes: Array<{ file: string; action: string }>;
}

/**
 * PR Description Generator
 * 
 * Generates professional GitHub PR descriptions in a standardized format
 */
export class PRDescriptionGenerator {
  /**
   * Generate a complete PR description
   */
  generateDescription(input: PRDescriptionInput): string {
    const summary = this.generateSummary(input);
    const problem = this.generateProblem(input);
    const solution = this.generateSolution(input);
    const testing = this.generateTesting(input);
    const impact = this.generateImpact(input);

    return `## Summary
${summary}

## Problem
${problem}

## Solution
${solution}

## Testing
${testing}

## Impact
${impact}`;
  }

  /**
   * Generate PR description from fix generator output
   */
  generateFromFix(input: PRDescriptionFromFix): string {
    const allFiles = [
      ...input.code_changes.map((c) => c.file),
      ...input.test_changes.map((c) => c.file),
    ];

    const estimatedHours = this.estimateHoursSaved(input.issue);
    const riskLevel = this.assessRiskLevel(input.issue, input.code_changes.length);

    return this.generateDescription({
      issue_title: input.issue.problem,
      explanation: input.fix_explanation,
      tests_added: input.test_changes.length > 0,
      files_changed: allFiles,
      estimated_hours_saved: estimatedHours,
      risk_level: riskLevel.level,
      risk_justification: riskLevel.justification,
    });
  }

  private generateSummary(input: PRDescriptionInput): string {
    const action = this.getActionVerb(input.issue_title);
    const scope = input.files_changed.length === 1 ? 'file' : `${input.files_changed.length} files`;
    
    let summary = `${action} ${input.issue_title.toLowerCase()}. `;
    summary += `This change modifies ${scope} to address the technical debt issue. `;
    
    if (input.tests_added) {
      summary += `Comprehensive tests have been added to verify the fix.`;
    } else {
      summary += `The fix is covered by existing test suite.`;
    }

    return summary;
  }

  private generateProblem(input: PRDescriptionInput): string {
    // Extract technical details from the issue title and explanation
    const problem = `The codebase contained ${input.issue_title.toLowerCase()}, which caused `;
    
    // Infer impact based on common patterns
    if (input.issue_title.toLowerCase().includes('security') || 
        input.issue_title.toLowerCase().includes('vulnerability')) {
      return problem + 'a security vulnerability that could be exploited. This posed a significant risk to data integrity and system security.';
    }
    
    if (input.issue_title.toLowerCase().includes('dead code') || 
        input.issue_title.toLowerCase().includes('unused')) {
      return problem + 'unnecessary code bloat, increasing bundle size and maintenance burden. The unused code created confusion for developers and slowed down the build process.';
    }
    
    if (input.issue_title.toLowerCase().includes('coupling') || 
        input.issue_title.toLowerCase().includes('god object')) {
      return problem + 'tight coupling between modules, making the code difficult to test, maintain, and extend. Changes in one area required modifications across multiple unrelated components.';
    }
    
    if (input.issue_title.toLowerCase().includes('test') || 
        input.issue_title.toLowerCase().includes('coverage')) {
      return problem + 'insufficient test coverage, increasing the risk of bugs in production. Critical code paths were not verified, making refactoring and feature additions risky.';
    }
    
    if (input.issue_title.toLowerCase().includes('dependency') || 
        input.issue_title.toLowerCase().includes('outdated')) {
      return problem + 'outdated dependencies with known security vulnerabilities and missing features. This prevented the team from using modern APIs and exposed the application to security risks.';
    }
    
    // Generic fallback
    return problem + 'technical debt that reduced code quality and developer productivity. ' + input.explanation;
  }

  private generateSolution(input: PRDescriptionInput): string {
    let solution = input.explanation + '\n\n';
    
    solution += 'Changes made:\n';
    input.files_changed.forEach((file) => {
      solution += `- Modified \`${file}\`\n`;
    });
    
    return solution.trim();
  }

  private generateTesting(input: PRDescriptionInput): string {
    if (!input.tests_added) {
      return 'This change is covered by the existing test suite. All existing tests pass without modification.';
    }

    const testFiles = input.files_changed.filter((f) => 
      f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__')
    );

    let testing = 'New tests added:\n';
    
    if (testFiles.length > 0) {
      testFiles.forEach((file) => {
        testing += `- \`${file}\`: Verifies the fix works correctly\n`;
      });
    } else {
      testing += '- Unit tests to verify the fix resolves the issue\n';
      testing += '- Integration tests to ensure no regressions\n';
      testing += '- Edge case tests for boundary conditions\n';
    }
    
    testing += '\nAll tests verify:\n';
    testing += '- The original issue is resolved\n';
    testing += '- No regressions in existing functionality\n';
    testing += '- Edge cases are handled correctly';
    
    return testing;
  }

  private generateImpact(input: PRDescriptionInput): string {
    const hoursPerSprint = input.estimated_hours_saved || this.estimateDefaultHoursSaved(input.issue_title);
    const riskLevel = input.risk_level || 'Low';
    const justification = input.risk_justification || this.getDefaultRiskJustification(riskLevel, input);

    let impact = `**Estimated hours saved per sprint:** ${hoursPerSprint} hours\n\n`;
    impact += `**Risk level:** ${riskLevel}\n\n`;
    impact += `**Justification:** ${justification}`;

    return impact;
  }

  private getActionVerb(issueTitle: string): string {
    const title = issueTitle.toLowerCase();
    
    if (title.includes('remove') || title.includes('delete') || title.includes('dead code')) {
      return 'Removes';
    }
    if (title.includes('fix') || title.includes('resolve')) {
      return 'Fixes';
    }
    if (title.includes('refactor') || title.includes('improve')) {
      return 'Refactors';
    }
    if (title.includes('update') || title.includes('upgrade')) {
      return 'Updates';
    }
    if (title.includes('add') || title.includes('implement')) {
      return 'Adds';
    }
    
    return 'Addresses';
  }

  private estimateDefaultHoursSaved(issueTitle: string): number {
    const title = issueTitle.toLowerCase();
    
    if (title.includes('security') || title.includes('vulnerability')) {
      return 8; // High impact
    }
    if (title.includes('coupling') || title.includes('god object')) {
      return 6; // Significant productivity gain
    }
    if (title.includes('test') || title.includes('coverage')) {
      return 4; // Reduces debugging time
    }
    if (title.includes('dead code') || title.includes('unused')) {
      return 2; // Minor cleanup
    }
    if (title.includes('dependency') || title.includes('outdated')) {
      return 3; // Moderate impact
    }
    
    return 3; // Default estimate
  }

  private estimateHoursSaved(issue: TechnicalDebtIssue): number {
    // Use velocity drag if available
    if (issue.velocity_drag_score) {
      return Math.round(issue.velocity_drag_score);
    }
    
    // Estimate based on category and severity
    const categoryMultiplier: Record<string, number> = {
      security: 4,
      tight_coupling: 3,
      anti_pattern: 3,
      missing_tests: 2,
      outdated_dependency: 2,
      dead_code: 1,
    };
    
    const severityMultiplier: Record<string, number> = {
      critical: 2,
      high: 1.5,
      medium: 1,
      low: 0.5,
    };
    
    const base = categoryMultiplier[issue.category] || 2;
    const multiplier = severityMultiplier[issue.severity] || 1;
    
    return Math.round(base * multiplier);
  }

  private assessRiskLevel(
    issue: TechnicalDebtIssue,
    filesChanged: number
  ): { level: 'Low' | 'Medium' | 'High'; justification: string } {
    // High risk conditions
    if (issue.category === 'security' && issue.severity === 'critical') {
      return {
        level: 'High',
        justification: 'Critical security fix affecting authentication/authorization. Requires thorough security review and testing.',
      };
    }
    
    if (filesChanged > 10) {
      return {
        level: 'High',
        justification: `Large change affecting ${filesChanged} files. Extensive testing required to ensure no regressions.`,
      };
    }
    
    // Medium risk conditions
    if (issue.severity === 'high' || filesChanged > 5) {
      return {
        level: 'Medium',
        justification: 'Significant refactoring with moderate scope. Existing tests provide good coverage.',
      };
    }
    
    if (issue.category === 'tight_coupling' || issue.category === 'anti_pattern') {
      return {
        level: 'Medium',
        justification: 'Architectural change that improves code structure. Well-tested with comprehensive unit tests.',
      };
    }
    
    // Low risk (default)
    return {
      level: 'Low',
      justification: 'Isolated change with minimal impact. Covered by existing and new tests.',
    };
  }

  private getDefaultRiskJustification(
    riskLevel: string,
    input: PRDescriptionInput
  ): string {
    if (riskLevel === 'High') {
      return `Large change affecting ${input.files_changed.length} files. Requires thorough review and testing.`;
    }
    
    if (riskLevel === 'Medium') {
      return `Moderate change with ${input.tests_added ? 'comprehensive' : 'existing'} test coverage. Review recommended.`;
    }
    
    return `Isolated change with minimal impact. ${input.tests_added ? 'New tests added' : 'Covered by existing tests'}.`;
  }
}

/**
 * Quick function to generate PR description
 */
export function generatePRDescription(input: PRDescriptionInput): string {
  const generator = new PRDescriptionGenerator();
  return generator.generateDescription(input);
}

// Made with Bob
