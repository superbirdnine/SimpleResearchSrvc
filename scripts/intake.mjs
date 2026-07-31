#!/usr/bin/env node
import { captureItem, CLASSIFICATIONS } from "./lib/intake.mjs";

const HELP = `Usage: npm run intake -- --url URL --title TITLE --classification CLASS --topic TOPIC [options]

Required: --url, --title, --classification (${CLASSIFICATIONS.join(" | ")})
Promote also requires --topic.
Options: --capture-date, --recovery-method, --observed, --inference, --uncertainty, --overwrite`;

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) throw new Error(`Unexpected argument: ${arg}`);
    const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (key === "overwrite") values.overwrite = true;
    else {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      values[key] = value;
      index += 1;
    }
  }
  return values;
}

if (process.argv.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = captureItem(args, { overwrite: args.overwrite });
  console.log(JSON.stringify({
    classification: result.classification,
    destination: result.destination,
    taxonomyMatches: result.preflight.matches.map((match) => match.file),
    researchTopics: result.preflight.researchTopics,
  }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
