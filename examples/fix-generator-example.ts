/**
 * Example: Fix Generator for Technical Debt Issues
 * 
 * This demonstrates how to use the FixGenerator to create
 * structured fixes for specific technical debt issues.
 */

import { FixGenerator } from '../src/utils/fix-generator.js';

// Example: Fixing a dead code issue
const deadCodeExample = {
  category: 'dead_code',
  file: 'src/utils/calculator.ts',
  problem: 'Unused function calculateDeprecatedTotal',
  lines: '45-52',
  fileContent: `
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  subtract(a: number, b: number): number {
    return a - b;
  }

  multiply(a: number, b: number): number {
    return a * b;
  }

  // This function is never used anywhere
  calculateDeprecatedTotal(items: number[]): number {
    let total = 0;
    for (const item of items) {
      total += item;
    }
    return total;
  }

  divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }
}
`.trim(),
};

// Example: Fixing a security issue
const securityExample = {
  category: 'security',
  file: 'src/auth/login.ts',
  problem: 'SQL injection vulnerability in login endpoint',
  lines: '23-28',
  fileContent: `
import { db } from '../database';

export async function loginUser(username: string, password: string) {
  // VULNERABLE: Direct string concatenation in SQL query
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  const result = await db.query(query);
  
  if (result.rows.length > 0) {
    return { success: true, user: result.rows[0] };
  }
  
  return { success: false, message: 'Invalid credentials' };
}
`.trim(),
};

// Example: Fixing an anti-pattern
const antiPatternExample = {
  category: 'anti_pattern',
  file: 'src/services/UserService.ts',
  problem: 'God object with too many responsibilities',
  lines: '1-150',
  fileContent: `
export class UserService {
  // User CRUD
  createUser(data: any) { /* ... */ }
  updateUser(id: string, data: any) { /* ... */ }
  deleteUser(id: string) { /* ... */ }
  getUser(id: string) { /* ... */ }
  
  // Authentication
  login(username: string, password: string) { /* ... */ }
  logout(userId: string) { /* ... */ }
  resetPassword(email: string) { /* ... */ }
  
  // Email
  sendWelcomeEmail(userId: string) { /* ... */ }
  sendPasswordResetEmail(email: string) { /* ... */ }
  
  // Notifications
  sendNotification(userId: string, message: string) { /* ... */ }
  
  // Analytics
  trackUserActivity(userId: string, action: string) { /* ... */ }
  generateUserReport(userId: string) { /* ... */ }
  
  // Payment
  processPayment(userId: string, amount: number) { /* ... */ }
  refundPayment(transactionId: string) { /* ... */ }
}
`.trim(),
};

async function demonstrateFixGeneration() {
  console.log('🔧 Fix Generator Examples\n');
  console.log('═'.repeat(70));

  const generator = new FixGenerator();

  // Example 1: Dead Code
  console.log('\n📝 Example 1: Fixing Dead Code\n');
  console.log(`Issue: ${deadCodeExample.problem}`);
  console.log(`File: ${deadCodeExample.file}`);
  console.log(`Category: ${deadCodeExample.category}\n`);

  try {
    const fix1 = await generator.generateFix(deadCodeExample);
    console.log(generator.formatOutput(fix1));
  } catch (error: any) {
    console.error('Error generating fix:', error.message);
  }

  console.log('\n' + '═'.repeat(70));

  // Example 2: Security Issue
  console.log('\n📝 Example 2: Fixing Security Vulnerability\n');
  console.log(`Issue: ${securityExample.problem}`);
  console.log(`File: ${securityExample.file}`);
  console.log(`Category: ${securityExample.category}\n`);

  try {
    const fix2 = await generator.generateFix(securityExample);
    console.log(generator.formatOutput(fix2));
  } catch (error: any) {
    console.error('Error generating fix:', error.message);
  }

  console.log('\n' + '═'.repeat(70));

  // Example 3: Anti-Pattern
  console.log('\n📝 Example 3: Refactoring Anti-Pattern\n');
  console.log(`Issue: ${antiPatternExample.problem}`);
  console.log(`File: ${antiPatternExample.file}`);
  console.log(`Category: ${antiPatternExample.category}\n`);

  try {
    const fix3 = await generator.generateFix(antiPatternExample);
    console.log(generator.formatOutput(fix3));
  } catch (error: any) {
    console.error('Error generating fix:', error.message);
  }

  console.log('\n✨ Fix generation complete!\n');
}

// Run the examples
demonstrateFixGeneration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Made with Bob
