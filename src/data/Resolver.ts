import { dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * Resolves a path relative to the src/data directory.
 * This is used to access data files that are part of the package, such as badge templates.
 * This avoids issues with relative paths when the package is installed in different locations or when the current working directory is not the project root.
 * and avoids path vulnerabilities using relative paths from the current working directory.
 * @param segments - The path segments to join.
 * @returns The resolved path.
 */
export function resolveDataPath(...segments: string[]): string {
  // Use import.meta.dirname if available (Node 20.11.0+), otherwise fall back to dirname(fileURLToPath(import.meta.url))
  // This ensures compatibility with Node 14+ while taking advantage of newer features when available
  const __dirname = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
  return join(__dirname, ...segments);
} 