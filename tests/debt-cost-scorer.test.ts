import { describe, it, expect } from 'vitest';
import { DebtCostScorer, scoreDebtQuick } from '../src/utils/debt-cost-scorer.js';
import type { TechnicalDebtIssue } from '../src/types/index.js';

describe('DebtCostScorer', () => {
  const scorer = new DebtCostScorer();

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
      blast_radius: 5,
    },
    {
      id: 'high-1',
      category: 'tight_coupling',
      file: 'src/service.ts',
      problem: 'God object pattern',
      impact: 'Hard to maintain',
      estimated_fix_hours: 8,
      severity: 'high',
      auto_fixable: false,
      blast_radius: 8,
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
      blast_radius: 2,
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
      blast_radius: 1,
    },
  ];

  describe('DCS Calculation', () => {
    it('should calculate DCS using formula: (hours × 1.5) + (blast_radius × 0.8) + (severity_weight × 10)', () => {
      const result = scorer.scoreDebt(mockIssues);

      // Critical: (3 × 1.5) + (5 × 0.8) + (4 × 10) = 4.5 + 4 + 40 = 48.5
      const criticalIssue = result.prioritized_debt.find((i) => i.issue_id === 'critical-1');
      expect(criticalIssue?.dcs_score).toBe(48.5);

      // High: (8 × 1.5) + (8 × 0.8) + (3 × 10) = 12 + 6.4 + 30 = 48.4
      const highIssue = result.prioritized_debt.find((i) => i.issue_id === 'high-1');
      expect(highIssue?.dcs_score).toBe(48.4);

      // Medium: (4 × 1.5) + (2 × 0.8) + (2 × 10) = 6 + 1.6 + 20 = 27.6
      const mediumIssue = result.prioritized_debt.find((i) => i.issue_id === 'medium-1');
      expect(mediumIssue?.dcs_score).toBe(27.6);

      // Low: (0.5 × 1.5) + (1 × 0.8) + (1 × 10) = 0.75 + 0.8 + 10 = 11.55
      const lowIssue = result.prioritized_debt.find((i) => i.issue_id === 'low-1');
      expect(lowIssue?.dcs_score).toBe(11.55);
    });

    it('should sort issues by DCS score in descending order', () => {
      const result = scorer.scoreDebt(mockIssues);

      // Should be ordered by DCS: critical-1 (48.5), high-1 (48.4), medium-1 (27.6), low-1 (11.55)
      expect(result.prioritized_debt[0].issue_id).toBe('critical-1');
      expect(result.prioritized_debt[1].issue_id).toBe('high-1');
      expect(result.prioritized_debt[2].issue_id).toBe('medium-1');
      expect(result.prioritized_debt[3].issue_id).toBe('low-1');
    });

    it('should use severity weights correctly', () => {
      const testIssue: TechnicalDebtIssue = {
        id: 'test',
        category: 'security',
        file: 'test.ts',
        problem: 'Test',
        impact: 'Test',
        estimated_fix_hours: 0,
        severity: 'critical',
        auto_fixable: false,
        blast_radius: 0,
      };

      const result = scorer.scoreDebt([testIssue]);
      // Only severity weight: 4 × 10 = 40
      expect(result.prioritized_debt[0].dcs_score).toBe(40);
    });
  });

  describe('Priority Assignment', () => {
    it('should assign "Fix this week" to critical severity', () => {
      const result = scorer.scoreDebt(mockIssues);
      const criticalIssue = result.prioritized_debt.find((i) => i.issue_id === 'critical-1');
      expect(criticalIssue?.fix_priority).toBe('Fix this week');
    });

    it('should assign "Fix this week" to DCS >= 50', () => {
      const highDCSIssue: TechnicalDebtIssue = {
        id: 'high-dcs',
        category: 'tight_coupling',
        file: 'test.ts',
        problem: 'High DCS issue',
        impact: 'Test',
        estimated_fix_hours: 20,
        severity: 'high',
        auto_fixable: false,
        blast_radius: 10,
      };

      const result = scorer.scoreDebt([highDCSIssue]);
      // (20 × 1.5) + (10 × 0.8) + (3 × 10) = 30 + 8 + 30 = 68
      expect(result.prioritized_debt[0].dcs_score).toBeGreaterThanOrEqual(50);
      expect(result.prioritized_debt[0].fix_priority).toBe('Fix this week');
    });

    it('should assign "Fix this sprint" to DCS >= 30', () => {
      const result = scorer.scoreDebt(mockIssues);
      const highIssue = result.prioritized_debt.find((i) => i.issue_id === 'high-1');
      expect(highIssue?.fix_priority).toBe('Fix this sprint');
    });

    it('should assign "Fix this quarter" to DCS >= 15', () => {
      const result = scorer.scoreDebt(mockIssues);
      const mediumIssue = result.prioritized_debt.find((i) => i.issue_id === 'medium-1');
      expect(mediumIssue?.fix_priority).toBe('Fix this quarter');
    });

    it('should assign "Monitor" to DCS < 15', () => {
      const result = scorer.scoreDebt(mockIssues);
      const lowIssue = result.prioritized_debt.find((i) => i.issue_id === 'low-1');
      expect(lowIssue?.fix_priority).toBe('Monitor');
    });
  });

  describe('Sprint Velocity Drag', () => {
    it('should calculate velocity drag for all issues', () => {
      const result = scorer.scoreDebt(mockIssues);

      result.prioritized_debt.forEach((issue) => {
        expect(issue.sprint_velocity_drag).toMatch(/\d+ hours\/sprint lost/);
      });
    });

    it('should calculate higher drag for tight_coupling and anti_pattern', () => {
      const result = scorer.scoreDebt(mockIssues);
      const couplingIssue = result.prioritized_debt.find((i) => i.issue_id === 'high-1');

      const dragHours = parseInt(couplingIssue?.sprint_velocity_drag.split(' ')[0] || '0');
      expect(dragHours).toBeGreaterThan(10);
    });
  });

  describe('ROI Calculation', () => {
    it('should calculate ROI for all issues', () => {
      const result = scorer.scoreDebt(mockIssues);

      result.prioritized_debt.forEach((issue) => {
        expect(issue.roi_if_fixed_now).toBeDefined();
        expect(issue.roi_if_fixed_now.length).toBeGreaterThan(0);
      });
    });

    it('should show savings in dollars for high-impact issues', () => {
      const result = scorer.scoreDebt(mockIssues);
      const highImpactIssue = result.prioritized_debt[0];

      expect(highImpactIssue.roi_if_fixed_now).toMatch(/saves \$[\d,]+ over 6 months/);
    });

    it('should handle minimal ROI cases', () => {
      const minimalIssue: TechnicalDebtIssue = {
        id: 'minimal',
        category: 'dead_code',
        file: 'test.ts',
        problem: 'Minimal impact',
        impact: 'Test',
        estimated_fix_hours: 10,
        severity: 'low',
        auto_fixable: true,
        blast_radius: 1,
      };

      const result = scorer.scoreDebt([minimalIssue]);
      // May show minimal ROI if cost of fixing > savings
      expect(result.prioritized_debt[0].roi_if_fixed_now).toBeDefined();
    });
  });

  describe('Financial Summary', () => {
    it('should calculate total debt hours', () => {
      const result = scorer.scoreDebt(mockIssues);

      // 3 + 8 + 4 + 0.5 = 15.5
      expect(result.total_debt_hours).toBe(15.5);
    });

    it('should calculate monthly cost estimate', () => {
      const result = scorer.scoreDebt(mockIssues);

      expect(result.monthly_cost_estimate).toBeGreaterThan(0);
      expect(typeof result.monthly_cost_estimate).toBe('number');
    });

    it('should have reasonable monthly cost based on velocity drag', () => {
      const result = scorer.scoreDebt(mockIssues);

      // Monthly cost should be sum of velocity drags × 2 sprints × $50/hr
      const totalDragPerSprint = result.prioritized_debt.reduce((sum, item) => {
        return sum + parseInt(item.sprint_velocity_drag.split(' ')[0]);
      }, 0);

      const expectedMonthlyCost = totalDragPerSprint * 2 * 50;
      expect(result.monthly_cost_estimate).toBe(expectedMonthlyCost);
    });
  });

  describe('JSON Input/Output', () => {
    it('should accept JSON string with issues array', () => {
      const jsonInput = JSON.stringify({ issues: mockIssues });
      const result = scorer.scoreDebtFromJSON(jsonInput);

      expect(() => JSON.parse(result)).not.toThrow();

      const parsed = JSON.parse(result);
      expect(parsed.prioritized_debt).toBeDefined();
      expect(parsed.total_debt_hours).toBe(15.5);
    });

    it('should accept JSON string with direct issues array', () => {
      const jsonInput = JSON.stringify(mockIssues);
      const result = scorer.scoreDebtFromJSON(jsonInput);

      const parsed = JSON.parse(result);
      expect(parsed.prioritized_debt).toHaveLength(4);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => scorer.scoreDebtFromJSON('invalid json')).toThrow();
    });
  });

  describe('Executive Summary', () => {
    it('should generate executive summary', () => {
      const result = scorer.scoreDebt(mockIssues);
      const summary = scorer.generateExecutiveSummary(result);

      expect(summary).toContain('EXECUTIVE SUMMARY');
      expect(summary).toContain('Total Technical Debt');
      expect(summary).toContain('Monthly Cost Impact');
      expect(summary).toContain('PRIORITY BREAKDOWN');
    });

    it('should include top 3 highest cost items', () => {
      const result = scorer.scoreDebt(mockIssues);
      const summary = scorer.generateExecutiveSummary(result);

      expect(summary).toContain('TOP 3 HIGHEST COST ITEMS');
      expect(summary).toContain(result.prioritized_debt[0].title);
    });
  });

  describe('Standalone Function', () => {
    it('should work with scoreDebtQuick function', () => {
      const result = scoreDebtQuick(mockIssues);

      expect(result.prioritized_debt).toHaveLength(4);
      expect(result.total_debt_hours).toBe(15.5);
      expect(result.monthly_cost_estimate).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty issues array', () => {
      const result = scorer.scoreDebt([]);

      expect(result.prioritized_debt).toHaveLength(0);
      expect(result.total_debt_hours).toBe(0);
      expect(result.monthly_cost_estimate).toBe(0);
    });

    it('should handle single issue', () => {
      const result = scorer.scoreDebt([mockIssues[0]]);

      expect(result.prioritized_debt).toHaveLength(1);
      expect(result.total_debt_hours).toBe(3);
    });

    it('should handle issues without blast_radius', () => {
      const issueWithoutBlastRadius: TechnicalDebtIssue = {
        id: 'no-blast',
        category: 'security',
        file: 'test.ts',
        problem: 'Test',
        impact: 'Test',
        estimated_fix_hours: 2,
        severity: 'high',
        auto_fixable: false,
      };

      const result = scorer.scoreDebt([issueWithoutBlastRadius]);

      // Should estimate blast radius based on category
      expect(result.prioritized_debt[0].dcs_score).toBeGreaterThan(0);
    });
  });
});

// Made with Bob
