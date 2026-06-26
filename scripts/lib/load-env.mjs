import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./paths.mjs";

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const eq = trimmed.indexOf("=");
  if (eq <= 0) return null;

  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

/**
 * Load env vars from .env.local (and optional .env) into process.env without overwriting
 * values already set in the shell.
 */
export function loadEnvFiles() {
  for (const filename of [".env.local", ".env"]) {
    const filePath = path.join(ROOT, filename);
    if (!existsSync(filePath)) continue;

    const text = readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;
      if (process.env[parsed.key] == null || process.env[parsed.key] === "") {
        process.env[parsed.key] = parsed.value;
      }
    }
  }
}
