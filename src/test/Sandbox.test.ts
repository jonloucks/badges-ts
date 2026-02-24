import { isNotPresent, isPresent } from "@jonloucks/badges-ts/api/Types";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { AutoClose, inlineAutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { Open } from "@jonloucks/contracts-ts/api/Open";
import { createIdempotent } from "@jonloucks/contracts-ts/auxiliary/Convenience";
import { Idempotent } from "@jonloucks/contracts-ts/auxiliary/Idempotent";
import { Environment } from "@jonloucks/variants-ts/api/Environment";
import { createEnvironment, createMapSource, createProcessSource } from "@jonloucks/variants-ts/auxiliary/Convenience";
import { existsSync, mkdtempSync, rmSync } from "fs";
import { ok } from "node:assert";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it, mock, Mock } from "node:test";
import { tmpdir } from "os";
import { presentCheck } from "@jonloucks/contracts-ts/auxiliary/Checks";
import { toContext as realToContext } from "../impl/Command.impl.js";
import { fileURLToPath } from "node:url";

describe('Sandbox Tests', () => {
  it('should run a place holder test', () => {
    ok(true, 'Place holder test should pass');
  });
});

export type MockLog = Mock<(message: string) => void>;

export type LogName = 'info' | 'warn' | 'error' | 'trace' | 'dry';

export interface Sandbox extends Open {

  toContext(args: string[]): Context;

  get environment(): Environment;

  setVariance(key: string, value: string): void;

  get folder(): string;

  getLog(name: LogName): MockLog;
}

export function create(): Sandbox {
  return SandboxImpl.privateCreate();
}

// ---- Implementation details below ----

class SandboxImpl implements Sandbox {

  open(): AutoClose {
    return this.#idempotent.open();
  }

  get folder(): string {
    return presentCheck(this.#folder, "Open the context to access the temporary folder");
  }

  get environment(): Environment {
    return this.#environment;
  }

  toContext(args: string[]): Context {
    const context: Context = realToContext(args);

    context.display.error = this.getLog('error');
    context.display.info = this.getLog('info');
    context.display.warn = this.getLog('warn');
    context.display.trace = this.getLog('trace');
    context.display.dry = this.getLog('dry');
    context.environment = this.#environment;

    return context;
  };

  setVariance(key: string, value: string): void {
    this.#environmentMap.set(key, value);
  }

  getLog(name: LogName): MockLog {
    let log: MockLog | undefined = this.#logLookup.get(name);
    if (isNotPresent(log)) {
      log = mock.fn<(message: string) => void>();
      this.#logLookup.set(name, log);
    }
    return log;
  }

  static privateCreate(): Sandbox {
    return new SandboxImpl();
  }

  #open(): AutoClose {
    SandboxImpl.#iteration++;
    this.#folder = mkdtempSync(resolve(tmpdir(), 'badges-ts-test-'));
    // set environment variable for the project folder so that the command implementation
    //  can find the config file and other files within the sandbox
    process.env.KIT_PROJECT_FOLDER = this.#folder;
    this.setVariance('KIT_PROJECT_FOLDER', this.#folder);

    // since loading config file happens early in the command execution, 
    // we'll deploy the config file on the first iteration to test that it can be loaded properly, 
    // and then on subsequent iterations we'll skip deploying the config file to test that the environment
    // can be set through other means as well
    if (SandboxImpl.#iteration % 2 == 1) {
      this.#deployConfigFile();
    }
    this.#deployPackageJson();
    this.#deploySourceFiles();
    this.#deploySummary();
    this.#deployCoverageSummary();
    this.#deployLcovReport();
    this.#deployReleaseNotes();

    return inlineAutoClose(() => this.#close());
  }

  #close(): void {
    if (isPresent(this.#folder) && existsSync(this.#folder!)) {
      rmSync(this.#folder!, { recursive: true, force: true });
    }
    delete process.env.KIT_PROJECT_FOLDER;
  }

  #deployPackageJson(): void {
    const packageJson = {
      name: "@test/my-package",
      version: "1.2.3",
      repository: {
        url: "git+https://github.com/test/my-package.git"
      }
    };
    const packageJsonPath = resolve(this.#folder!, 'package.json');
    writeFileSync(packageJsonPath, JSON.stringify(packageJson), 'utf8');
    this.setVariance('KIT_PROJECT_PACKAGE_JSON_PATH', packageJsonPath);
  }

  #deployReleaseNotes(): void {
    const templatePath: string = resolve(this.#folder!, 'release-notes-template.md');
    writeFileSync(templatePath, '# {{NAME}} v{{VERSION}}', 'utf8');
    this.setVariance('KIT_RELEASE_NOTES_OUTPUT_FOLDER', this.#folder!);
    this.setVariance('KIT_RELEASE_NOTES_TEMPLATE_PATH', templatePath);
  }
  
  #deploySummary(): void {
    mkdirSync(resolve(this.#folder!, 'coverage'));
    // lcov.info
        const fromFile: string = resolveDataPath("lcov.info.dat");
    const toFile: string = resolve(this.#folder!, "coverage", "lcov.info");
    copyFileSync(fromFile, toFile);
    this.setVariance('KIT_LCOV_INFO_PATH', toFile);
  }

  #deployCoverageSummary(): void {
    const summarySummaryPath: string = resolve(this.#folder!, 'coverage-summary.json');
    const coverageJsonText = '{"total": {"lines":{"total":695,"covered":687,"skipped":0,"pct":98.84},"statements":{"total":713,"covered":704,"skipped":0,"pct":98.73},"functions":{"total":219,"covered":213,"skipped":0,"pct":97.26},"branches":{"total":170,"covered":163,"skipped":0,"pct":95.88},"branchesTrue":{"total":0,"covered":0,"skipped":0,"pct":100}}}';
    writeFileSync(summarySummaryPath, coverageJsonText, 'utf8');
    this.setVariance('KIT_COVERAGE_SUMMARY_PATH', summarySummaryPath);
  }

  #deploySourceFiles(): void {
    mkdirSync(resolve(this.#folder!, 'src'));
  }

  #deployLcovReport(): void {
    const fromFile: string = resolveDataPath("lcov.report.dat");
    const toFile: string = resolve(this.#folder!, "lcov.report.dat");
    copyFileSync(fromFile, toFile);
    this.setVariance('KIT_LCOV_REPORT_INDEX_PATH', toFile);
  }

  #deployConfigFile(): void {
    const content = JSON.stringify({
      "kit.above.80.percent.color": "blue"
    });
    const configFilePath: string = resolve(this.#folder!, 'config.json');
    writeFileSync(configFilePath, content, 'utf8');
    this.setVariance('KIT_BADGES_CONFIG_PATH', configFilePath);
  }

  private constructor() {
    this.#idempotent = createIdempotent({
      open: () => this.#open()
    });
    this.#environment = createEnvironment({
      sources: [
        createMapSource(this.#environmentMap),
        createProcessSource()
      ]
    });
  }

  #folder: string | undefined;
  readonly #environment: Environment;
  readonly #environmentMap: Map<string, string> = new Map<string, string>();
  readonly #logLookup: Map<LogName, MockLog> = new Map<LogName, MockLog>();
  readonly #idempotent: Idempotent;
  static #iteration: number = 0;
}

/**
 * Resolves a path relative to the src/data directory.
 * This is used to access data files that are part of the package, such as badge templates.
 * This avoids issues with relative paths when the package is installed in different locations or when the current working directory is not the project root.
 * and avoids path vulnerabilities using relative paths from the current working directory.
 * @param segments - The path segments to join.
 * @returns The resolved path.
 */
function resolveDataPath(...segments: string[]): string {
  // reducing complexity using least common denominator approach; 
  // the path is resolved relative to the src/data directory, which is a known location within the package
  return resolve(dirname(fileURLToPath(import.meta.url)), ...segments);
} 
