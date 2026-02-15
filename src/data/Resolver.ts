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
  // Use import.meta.dirname if available (Node 20.11.0+); for older supported Node versions (e.g. 16/18), fall back to dirname(fileURLToPath(import.meta.url))
  // This approach remains compatible with the project's supported Node range (Node 16+ with CI on Node 18) while taking advantage of newer features when available
  const __dirname = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
  return join(__dirname, ...segments);
} 