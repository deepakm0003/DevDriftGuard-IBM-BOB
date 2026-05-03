/**
 * Example: PR Description Generator
 * 
 * Demonstrates how to generate professional GitHub PR descriptions
 * in a standardized format for technical debt fixes.
 */

import { PRDescriptionGenerator } from '../src/utils/pr-description-generator.js';

console.log('📝 PR Description Generator Examples\n');
console.log('═'.repeat(80));

const generator = new PRDescriptionGenerator();

// Example 1: Security Fix
console.log('\n🔒 Example 1: Security Vulnerability Fix\n');

const securityPR = generator.generateDescription({
  issue_title: 'SQL injection vulnerability in login endpoint',
  explanation: 'Replaced string concatenation with parameterized queries using prepared statements. All user inputs are now properly sanitized and validated before database operations.',
  tests_added: true,
  files_changed: [
    'src/auth/login.ts',
    'src/auth/login.test.ts',
    'src/database/query-builder.ts',
  ],
  estimated_hours_saved: 8,
  risk_level: 'High',
  risk_justification: 'Critical security fix affecting authentication. Requires thorough security review and penetration testing.',
});

console.log(securityPR);
console.log('\n' + '═'.repeat(80));

// Example 2: Dead Code Removal
console.log('\n🗑️  Example 2: Dead Code Removal\n');

const deadCodePR = generator.generateDescription({
  issue_title: 'Unused function calculateDeprecatedTotal',
  explanation: 'Removed the unused calculateDeprecatedTotal function that was deprecated 6 months ago. No references found in the codebase.',
  tests_added: false,
  files_changed: [
    'src/utils/calculator.ts',
  ],
  estimated_hours_saved: 1,
  risk_level: 'Low',
  risk_justification: 'Simple removal of unused code. No impact on existing functionality.',
});

console.log(deadCodePR);
console.log('\n' + '═'.repeat(80));

// Example 3: Refactoring God Object
console.log('\n🏗️  Example 3: Architectural Refactoring\n');

const refactoringPR = generator.generateDescription({
  issue_title: 'God object with 45 methods across 8 modules',
  explanation: 'Split UserService into focused services: UserAuthService, UserProfileService, UserNotificationService, and UserAnalyticsService. Each service now has a single responsibility and clear boundaries.',
  tests_added: true,
  files_changed: [
    'src/services/UserService.ts',
    'src/services/UserAuthService.ts',
    'src/services/UserProfileService.ts',
    'src/services/UserNotificationService.ts',
    'src/services/UserAnalyticsService.ts',
    'src/services/__tests__/UserAuthService.test.ts',
    'src/services/__tests__/UserProfileService.test.ts',
    'src/services/__tests__/UserNotificationService.test.ts',
    'src/services/__tests__/UserAnalyticsService.test.ts',
  ],
  estimated_hours_saved: 6,
  risk_level: 'Medium',
  risk_justification: 'Significant architectural change affecting multiple modules. Well-tested with comprehensive unit tests for each new service.',
});

console.log(refactoringPR);
console.log('\n' + '═'.repeat(80));

// Example 4: Adding Missing Tests
console.log('\n🧪 Example 4: Adding Missing Test Coverage\n');

const testsPR = generator.generateDescription({
  issue_title: 'No unit tests for payment processing logic',
  explanation: 'Added comprehensive unit tests for all payment processing functions including success cases, error handling, and edge cases. Test coverage increased from 0% to 95% for the payment module.',
  tests_added: true,
  files_changed: [
    'src/payment/processor.test.ts',
    'src/payment/validator.test.ts',
  ],
  estimated_hours_saved: 4,
  risk_level: 'Low',
  risk_justification: 'Only test files added. No changes to production code. Reduces risk of future bugs.',
});

console.log(testsPR);
console.log('\n' + '═'.repeat(80));

// Example 5: Dependency Update
console.log('\n📦 Example 5: Dependency Update\n');

const dependencyPR = generator.generateDescription({
  issue_title: 'lodash@4.17.15 has known vulnerabilities',
  explanation: 'Updated lodash from 4.17.15 to 4.17.21 to address CVE-2021-23337 and other security vulnerabilities. Verified all existing functionality works with the new version.',
  tests_added: false,
  files_changed: [
    'package.json',
    'package-lock.json',
  ],
  estimated_hours_saved: 2,
  risk_level: 'Low',
  risk_justification: 'Patch version update with backward compatibility. All existing tests pass.',
});

console.log(dependencyPR);
console.log('\n' + '═'.repeat(80));

// Example 6: Tight Coupling Fix
console.log('\n🔗 Example 6: Decoupling Components\n');

const couplingPR = generator.generateDescription({
  issue_title: 'Direct database calls in React component',
  explanation: 'Introduced a data access layer between the Dashboard component and the database. Created a DashboardService that handles all data fetching, allowing the component to focus on presentation logic.',
  tests_added: true,
  files_changed: [
    'src/components/Dashboard.tsx',
    'src/services/DashboardService.ts',
    'src/services/__tests__/DashboardService.test.ts',
    'src/components/__tests__/Dashboard.test.tsx',
  ],
  estimated_hours_saved: 5,
  risk_level: 'Medium',
  risk_justification: 'Architectural improvement affecting component structure. Comprehensive tests ensure no regressions.',
});

console.log(couplingPR);
console.log('\n' + '═'.repeat(80));

console.log('\n✨ PR descriptions generated!\n');
console.log('💡 Tip: Copy these descriptions directly into your GitHub PRs for consistent, professional documentation.\n');

// Made with Bob
