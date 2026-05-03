import { describe, it, expect } from 'vitest';
import { TriageEngine } from '../src/phase2/triage-engine.js';
import type { TechnicalDebtIssue, DebtAnalysisResult } from '../src/types/index.js';

describe('TriageEngine', () => {
  const triage = new TriageEngine();

  const mockIssue: TechnicalDebtIssue = {
    id: 'test-1',
    category: 'security',
    file: 'src/auth.ts',
    problem: 'SQL injection vulnerability',
    impact: 'Critical security risk',
    estimated_fix_hours: 2,
    severity: 'critical',
    auto_fixable: false,
  };

  const mockAnalysisResult: DebtAnalysisResult = {
    issues: [
      mockIssue,
      {
        id: 'test-2',
        category: 'dead_code',
        file: 'src/utils.ts',
        problem: 'Unused function',
        impact: 'Increases bundle size',
        estimated_fix_hours: 0.5,
        severity: 'low',
        auto_fixable: true,
      },
      {
        id: 'test-3',
        category: 'anti_pattern',
        file: 'src/service.ts',
        problem: 'God object pattern',
        impact: 'Hard to maintain',
        estimated_fix_hours: 4,
        severity: 'high',
        auto_fixable: false,
      },
    ],
    summary: {
      total_issues: 3,
      most_common_issue: 'anti_pattern',
      highest_risk_area: 'Authentication',
      total_estimated_hours: 6.5,
      auto_fixable_count: 1,
    },
    timestamp: new Date().toISOString(),
    repository: 'test/repo',
  };

  describe('calculateBusinessImpact', () => {
    it('should calculate business impact score', () => {
      const score = triage.calculateBusinessImpact(mockIssue, mockAnalysisResult.issues);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(10);
    });

    it('should give higher scores to critical issues', () => {
      const criticalScore = triage.calculateBusinessImpact(mockIssue, mockAnalysisResult.issues);
      const lowSeverityIssue = { ...mockIssue, severity: 'low' as const };
      const lowScore = triage.calculateBusinessImpact(lowSeverityIssue, mockAnalysisResult.issues);
      
      expect(criticalScore).toBeGreaterThan(lowScore);
    });

    it('should consider security issues as high impact', () => {
      const securityIssue = { ...mockIssue, category: 'security' as const };
      const deadCodeIssue = { ...mockIssue, category: 'dead_code' as const };
      
      const securityScore = triage.calculateBusinessImpact(securityIssue, mockAnalysisResult.issues);
      const deadCodeScore = triage.calculateBusinessImpact(deadCodeIssue, mockAnalysisResult.issues);
      
      expect(securityScore).toBeGreaterThan(deadCodeScore);
    });
  });

  describe('rankIssues', () => {
    it('should rank issues by business impact', () => {
      const ranked = triage.rankIssues(mockAnalysisResult);
      
      expect(ranked.issues).toHaveLength(3);
      expect(ranked.issues[0].business_impact_score).toBeDefined();
      
      // Check that issues are sorted by impact (descending)
      for (let i = 0; i < ranked.issues.length - 1; i++) {
        const current = ranked.issues[i].business_impact_score || 0;
        const next = ranked.issues[i + 1].business_impact_score || 0;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('should add scoring metrics to each issue', () => {
      const ranked = triage.rankIssues(mockAnalysisResult);
      
      ranked.issues.forEach((issue) => {
        expect(issue.business_impact_score).toBeDefined();
        expect(issue.blast_radius).toBeDefined();
        expect(issue.security_risk_score).toBeDefined();
        expect(issue.velocity_drag_score).toBeDefined();
      });
    });
  });

  describe('generateRemediationRoadmap', () => {
    it('should generate a complete roadmap', () => {
      const roadmap = triage.generateRemediationRoadmap(mockAnalysisResult);
      
      expect(roadmap.critical_path).toBeDefined();
      expect(roadmap.quick_wins).toBeDefined();
      expect(roadmap.high_risk_items).toBeDefined();
      expect(roadmap.total_estimated_hours).toBe(6.5);
    });

    it('should identify quick wins', () => {
      const roadmap = triage.generateRemediationRoadmap(mockAnalysisResult);
      
      roadmap.quick_wins.forEach((item) => {
        expect(item.estimated_fix_hours).toBeLessThanOrEqual(1);
      });
    });

    it('should prioritize critical path items', () => {
      const roadmap = triage.generateRemediationRoadmap(mockAnalysisResult);
      
      expect(roadmap.critical_path.length).toBeGreaterThan(0);
      expect(roadmap.critical_path.length).toBeLessThanOrEqual(5);
      
      // Check priority ordering
      roadmap.critical_path.forEach((item, index) => {
        expect(item.priority).toBe(index + 1);
      });
    });

    it('should identify high risk items', () => {
      const roadmap = triage.generateRemediationRoadmap(mockAnalysisResult);
      
      roadmap.high_risk_items.forEach((item) => {
        const isCritical = item.severity === 'critical';
        const isSecurity = item.category === 'security';
        expect(isCritical || isSecurity).toBe(true);
      });
    });
  });

  describe('calculateCostSavings', () => {
    it('should calculate cost savings with default hourly rate', () => {
      const savings = triage.calculateCostSavings(mockAnalysisResult);
      
      expect(savings.total_debt_cost).toBe(650); // 6.5 hours * $100
      expect(savings.monthly_velocity_loss).toBeGreaterThan(0);
      expect(savings.annual_savings_potential).toBeGreaterThan(0);
    });

    it('should calculate cost savings with custom hourly rate', () => {
      const savings = triage.calculateCostSavings(mockAnalysisResult, 150);
      
      expect(savings.total_debt_cost).toBe(975); // 6.5 hours * $150
    });

    it('should calculate annual savings based on velocity drag', () => {
      const savings = triage.calculateCostSavings(mockAnalysisResult, 100);
      
      // Annual savings = monthly velocity loss * 12 * hourly rate
      const expectedAnnual = savings.monthly_velocity_loss * 12 * 100;
      expect(savings.annual_savings_potential).toBe(expectedAnnual);
    });
  });
});

// Made with Bob
