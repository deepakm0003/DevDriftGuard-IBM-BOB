#!/usr/bin/env node

/**
 * CLI tool for simple issue ranking
 * 
 * Usage:
 *   node simple-ranker-cli.js <issues.json>
 *   echo '{"issues":[...]}' | node simple-ranker-cli.js
 */

import { readFileSync } from 'fs';
import { SimpleRanker } from './simple-ranker.js';

function main() {
  const args = process.argv.slice(2);

  let inputJSON: string;

  if (args.length > 0) {
    // Read from file
    const filePath = args[0];
    try {
      inputJSON = readFileSync(filePath, 'utf-8');
    } catch (error: any) {
      console.error(`Error reading file: ${error.message}`);
      process.exit(1);
    }
  } else {
    // Read from stdin
    console.error('Usage: simple-ranker-cli <issues.json>');
    console.error('Or pipe JSON to stdin: echo \'{"issues":[...]}\' | simple-ranker-cli');
    process.exit(1);
  }

  try {
    const ranker = new SimpleRanker();
    const result = ranker.rankFromJSON(inputJSON);
    console.log(result);
  } catch (error: any) {
    console.error(`Error ranking issues: ${error.message}`);
    process.exit(1);
  }
}

main();

// Made with Bob
