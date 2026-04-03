#!/usr/bin/env node
/**
 * CLI entry point for the refactored coding agent.
 * Uses main.ts with AgentSession and new mode modules.
 *
 * Test with: npx tsx src/cli-new.ts [args...]
 */
process.title = "pi";
process.emitWarning = (() => {}) as typeof process.emitWarning;

import { main } from "./main.js";

main(process.argv.slice(2));
