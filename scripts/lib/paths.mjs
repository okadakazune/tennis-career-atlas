import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, "..", "..");
export const SCRIPTS_DIR = path.join(ROOT, "scripts");
export const OUT_DIR = path.join(ROOT, "src", "data");
export const RAW_DIR = path.join(ROOT, "data", "raw");

export function resolveFromRoot(relativePath) {
  return path.join(ROOT, relativePath);
}
