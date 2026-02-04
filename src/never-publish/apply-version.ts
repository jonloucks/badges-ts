import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { isNotPresent } from "../api/Types";
import { PackageJson } from "../auxiliary/PackageJson";

export function applyVersion(): void {
  console.log("Applying version from package.json...");
  try {
    const parsedJson: unknown = JSON.parse(readFileSync('package.json', 'utf8'));
    const packageJson: PackageJson = parsedJson as PackageJson;
    if (isNonEmptyString(packageJson.name) && isNonEmptyString(packageJson.version)) {
      const name: string = packageJson.name.trim();
      const version: string = packageJson.version.trim();
      const repository: string = normalizeRepository(packageJson.repository?.url);
      createVersionTs(name, version);
      createReleaseNotesFromTemplate(name, version, repository);
      console.log(`Applied version ${version} for package ${name}`);
    } else {
      throw new Error("Invalid name or version in package.json");
    }
  } catch (error) {
    console.error("Error applying version:", error);
    throw new Error(`Failed to apply version: ${(error as Error).message}`);
  }
}

function normalizeRepository(repository?: string): string {
  if (isNotPresent(repository)) {
    return "N/A";
  }
  repository = repository.trim();
  if (repository.endsWith('.git')) {
    repository = repository.slice(0, -4);
  }
  if (repository.startsWith('git+')) {
    repository = repository.slice(4);
  }
  return repository.trim();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function fileDoesNotExist(path: string): boolean {
  return !existsSync(path);
}

function createReleaseNotesFromTemplate(name: string, version: string, repository: string): void {
  const templatePath: string = resolve('notes/release-notes-template.md');
  const outputPath: string = resolve('notes', `release-notes-v${version}.md`);
  if (fileDoesNotExist(templatePath)) {
    const message = `Release notes template not found at ${templatePath}`;
    console.error(message);
    throw new Error(message);
  }
  if (fileDoesNotExist(outputPath)) {
    const templateContent: string = readFileSync(templatePath, 'utf8');
    const releaseNotesContent: string = templateContent
      .replace(/{{\s*NAME\s*}}/g, name)
      .replace(/{{\s*VERSION\s*}}/g, version)
      .replace(/{{\s*REPOSITORY\s*}}/g, repository);
    writeFileSync(outputPath, releaseNotesContent, 'utf8');
    console.log(`Created release notes at ${outputPath}`);
  } else {
    console.log(`Release notes for version ${version} already exist at ${outputPath}`);
  }
}

function createVersionTs(name: string, version: string): void {
  writeFileSync(resolve('src', 'version.ts'),
    `// generated file - do not edit
export const NAME: string = ${JSON.stringify(name)};
export const VERSION: string = ${JSON.stringify(version)};`, 'utf8');
}

applyVersion();


