import { describe, it, expect } from 'vitest';
import { SimpleRanker, rankIssuesSimple } from '../src/utils/simple-ranker.js';
import type { TechnicalDebtIssue } from '../src/types/index.js';

describe('SimpleRanker', () => {
  const ranker = new SimpleRanker();

  const mockIssues: TechnicalDebtIssue[] = [
    {
      id: 'critical-1',
      category: 'security',
      file: 'src/auth.ts',
      problem: 'SQL injection vulnerability',
      impact: 'Critical security risk',
      estimated_fix_hours: 3,
      severity: 'critical',
      auto_fixable: false,
    },
    {
      id: 'low-1',
      category: 'dead_code',
      file: 'src/utils.ts',
      problem: 'Unused function',
      impact: 'Increases bundle size',
      estimated_fix_hours: 0.5,
      severity: 'low',
      auto_fixable: true,
    },
    {
      id: 'high-1',
      category: 'anti_pattern',
      file: 'src/service.ts',
      problem: 'God object pattern',
      impact: 'Hard to maintain',
      estimated_fix_hours: 8,
      severity: 'high',
      auto_fixable: false,
    },
    {
      id: 'medium-1',
      category: 'missing_tests',
      file: 'src/payment.ts',
      problem: 'No unit tests',
      impact: 'High risk of bugs',
      estimated_fix_hours: 4,
      severity: 'medium',
      auto_fixable: false,
    },
  ];

  describe('Score Calculation', () => {
    it('should calculate score using formula: (hours × 1.5) + severity_weight', () => {
      const result = ranker.rankIssues(mockIssues);
      
      // Critical: (3 × 1.5) + 10 = 14.5
      const criticalIssue = result.prioritized.find((i) => i.id === 'critical-1');
      expect(criticalIssue?.score).toBe(14.5);

      // Low: (0.5 × 1.5) + 1 = 1.75
      const lowIssue = result.prioritized.find((i) => i.id === 'low-1');
      expect(lowIssue?.score).toBe(1.75);

      // High: (8 × 1.5) + 7 = 19
      const highIssue = result.prioritized.find((i) => i.id === 'high-1');
      expect(highIssue?.score).toBe(19);

      // Medium: (4 × 1.5) + 4 = 10
      const mediumIssue = result.prioritized.find((i) => i.id === 'medium-1');
      expect(mediumIssue?.score).toBe(10);
    });

    it('should rank issues by score in descending order', () => {
      const result = ranker.rankIssues(mockIssues);
      
      // Should be ordered: high-1 (19), critical-1 (14.5), medium-1 (10), low-1 (1.75)
      expect(result.prioritized[0].id).toBe('high-1');
      expect(result.prioritized[1].id).toBe('critical-1');
      expect(result.prioritized[2].id).toBe('medium-1');
      expect(result.prioritized[3].id).toBe('low-1');
    });
  });

  describe('Priority Assignment', () => {
    it('should assign "Fix now" to critical issues', () => {
      const result = ranker.rankIssues(mockIssues);
      const criticalIssue = result.prioritized.find((i) => i.id === 'critical-1');
      expect(criticalIssue?.priority).toBe('Fix now');
    });

    it('should assign "Fix now" to high score issues (>= 15)', () => {
      const result = ranker.rankIssues(mockIssues);
      const highScoreIssue = result.prioritized.find((i) => i.score >= 15);
      expect(highScoreIssue?.priority).toBe('Fix now');
    });

    it('should assign "This sprint" to medium score issues (>= 8)', () => {
      const result = ranker.rankIssues(mockIssues);
      const mediumIssue = result.prioritized.find((i) => i.id === 'medium-1');
      expect(mediumIssue?.priority).toBe('This sprint');
    });

    it('should assign "Later" to low score issues', () => {
      const result = ranker.rankIssues(mockIssues);
      const lowIssue = result.prioritized.find((i) => i.id === 'low-1');
      expect(lowIssue?.priority).toBe('Later');
    });
  });

  describe('ROI Statement Generation', () => {
    it('should generate ROI statements for all issues', () => {
      const result = ranker.rankIssues(mockIssues);
      
      result.prioritized.forEach((issue) => {
        expect(issue.roi_statement).toMatch(/Fixing this saves ~\d+ hours\/month/);
      });
    });

    it('should estimate higher monthly savings for security issues', () => {
      const result = ranker.rankIssues(mockIssues);
      const securityIssue = result.prioritized.find((i) => i.id === 'critical-1');
      
      const hoursMatch = securityIssue?.roi_statement.match(/~(\d+)/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      
      expect(hours).toBeGreaterThan(10);
    });
  });

  describe('Summary Calculations', () => {
    it('should calculate total estimated hours', () => {
      const result = ranker.rankIssues(mockIssues);
      
      // 3 + 0.5 + 8 + 4 = 15.5
      expect(result.total_estimated_hours).toBe(15.5);
    });

    it('should calculate monthly time loss', () => {
      const result = ranker.rankIssues(mockIssues);
      
      expect(result.monthly_time_loss).toMatch(/\d+ hours/);
      
      const hours = parseInt(result.monthly_time_loss);
      expect(hours).toBeGreaterThan(0);
    });
  });

  describe('JSON Input/Output', () => {
    it('should accept JSON string with issues array', () => {
      const jsonInput = JSON.stringify({ issues: mockIssues });
      const result = ranker.rankFromJSON(jsonInput);
      
      expect(() => JSON.parse(result)).not.toThrow();
      
      const parsed = JSON.parse(result);
      expect(parsed.prioritized).toBeDefined();
      expect(parsed.total_estimated_hours).toBe(15.5);
    });

    it('should accept JSON string with direct issues array', () => {
      const jsonInput = JSON.stringify(mockIssues);
      const result = ranker.rankFromJSON(jsonInput);
      
      const parsed = JSON.parse(result);
      expect(parsed.prioritized).toHaveLength(4);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => ranker.rankFromJSON('invalid json')).toThrow();
    });
  });

  describe('Standalone Function', () => {
    it('should work with rankIssuesSimple function', () => {
      const result = rankIssuesSimple(mockIssues);
      
      expect(result.prioritized).toHaveLength(4);
      expect(result.total_estimated_hours).toBe(15.5);
      expect(result.monthly_time_loss).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty issues array', () => {
      const result = ranker.rankIssues([]);
      
      expect(result.prioritized).toHaveLength(0);
      expect(result.total_estimated_hours).toBe(0);
      expect(result.monthly_time_loss).toBe('0 hours');
    });

    it('should handle single issue', () => {
      const result = ranker.rankIssues([mockIssues[0]]);
      
      expect(result.prioritized).toHaveLength(1);
      expect(result.total_estimated_hours).toBe(3);
    });

    it('should round scores to 2 decimal places', () => {
      const issue: TechnicalDebtIssue = {
        id: 'test',
        category: 'dead_code',
        file: 'test.ts',
        problem: 'Test',
        impact: 'Test',
        estimated_fix_hours: 1.333,
        severity: 'low',
        auto_fixable: true,
      };

      const result = ranker.rankIssues([issue]);
      
      // (1.333 × 1.5) + 1 = 2.9995 → 3.00
      expect(result.prioritized[0].score).toBe(3);
    });
  });
});

// Made with Bob
