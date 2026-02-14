/**
 * Best effort generation of code coverage badge from coverage summary JSON file.
 * Reads coverage percentage from JSON file, determines badge color based on thresholds,
 * and generates an SVG badge using a template file with placeholders.
 * 
 * Environment Variables:
 * - KIT_TEMPLATE_BADGE_PATH: Input path to the SVG badge template file. Default: is packaged with the library
 * - KIT_COVERAGE_SUMMARY_PATH: Input path coverage summary JSON file. Default: './coverage/coverage-summary.json'
 * - KIT_COVERAGE_SUMMARY_BADGE_PATH: Output path for the generated coverage badge SVG file. Default: './coverage-summary.svg'
 * - KIT_TYPEDOC_BADGE_PATH: Output path for the generated typedoc badge SVG file. Default: './typedoc-badge.svg'
 * - KIT_NPM_BADGE_PATH: Output path for the generated npm badge SVG file. Default: './npm-badge.svg'

 *  * Template Placeholders:
 * - {{LABEL}}: Placeholder for the badge label (e.g., "coverage").
 * - {{VALUE}}: Placeholder for the coverage percentage value.
 * - {{COLOR}}: Placeholder for the badge background color.
 * Usage:   
 * ```
 * npm run badges
 * ```
 */
import { Badge } from "@jonloucks/badges-ts/api/Badge";
import { isPresent } from "@jonloucks/contracts-ts/api/Types";
import { CONTRACT as BADGE_FACTORY, BadgeFactory } from "@jonloucks/badges-ts/api/BadgeFactory";
import { Project } from "@jonloucks/badges-ts/api/Project";
import { used } from "@jonloucks/badges-ts/auxiliary/Checks";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { CONTRACT as DISCOVER_PROJECT } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { CONTRACTS } from "@jonloucks/contracts-ts";
import { readFile } from "fs";
import { join } from "path";
import { resolveDataPath } from "../data/Resolver.js";
import { Internal, SUCCESS_COLOR } from "./Internal.impl.js";

export const COMMAND: Command<Badge[]> = {
  execute: async function (context: Context): Promise<Badge[]> {

    context.display.trace(`Running generate with: ${context.arguments.join(' ')}`);
    return await generateBadges(context).then((badges) => {
      return badges;
    })
      .catch((error: Error) => {
        context.display.error(`Error during badge generation: ${error.message}`);
        throw error;
      })
      .finally(() => {
        context.display.trace(`Completed generate command`);
      });
  }
};

async function generateBadges(context: Context): Promise<Badge[]> {
  const results = await Promise.allSettled([
    generateNpmBadge(context),
    generateCodeCoverageBadge(context),
    generateTypedocBadge(context)
  ]);

  const badges: Badge[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      badges.push(result.value);
    } else {
      const badgeNames = ['npm', 'coverage summary', 'typedoc'];
      context.display.warn(`Unable to generate ${badgeNames[index]} badge`);
    }
  });

  return badges;
}

/**
 * Generates an npm version badge based on the current package version.
 * Reads the version from the VERSION constant, determines the badge color,
 * and generates the SVG badge.
 */
async function generateNpmBadge(context: Context): Promise<Badge> {
  const badgeFactory: BadgeFactory = CONTRACTS.enforce(BADGE_FACTORY);
  const project: Project = await discoverProject(context);
  return await badgeFactory.createBadge({
    name: "npm",
    outputPath: getNpmBadgePath(),
    label: "  npm  ",
    value: project.version,
    color: SUCCESS_COLOR,
    templatePath: getTemplateBadgePath(),
    flags: context.flags,
    display: context.display
  });
}

async function discoverProject(context: Context): Promise<Project> {
  used(context); // accept and mark context as used to keep the API flexible/consistent for future parameters; this does not affect logging or tracing
  return CONTRACTS.enforce(DISCOVER_PROJECT).discoverProject();
};

/**
 * Generates a code coverage summary badge based on the coverage summary JSON file.
 * Reads the coverage percentage, determines the badge color, and generates the SVG badge.
 */
async function generateCodeCoverageBadge(context: Context): Promise<Badge> {
  const percentage: number = await getCodeCoveragePercent();
  const badgeFactory: BadgeFactory = CONTRACTS.enforce(BADGE_FACTORY);
  return await badgeFactory.createBadge({
    name: "coverage-summary",
    outputPath: getCodeCoverageBadgePath(),
    label: "coverage",
    value: percentage + "%",
    color: Internal.colorFromPercentComplete(percentage),
    templatePath: getTemplateBadgePath(),
    flags: context.flags,
    display: context.display
  });
}

async function getCodeCoveragePercent(): Promise<number> {
  // various ways to determine the coverage percentage are attempted in parallel 
  // and the first successful result is used; this allows for flexibility in how the 
  // coverage percentage is provided and can accommodate different project setups
  return Promise.any([
    getCodeCoveragePercentFromCoverageSummary(),
    getCodeCoveragePercentFromLcovReport()
  ]);
};

async function getCodeCoveragePercentFromCoverageSummary(): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const inputPath: string = getCoverageSummaryFilePath();
    readFile(inputPath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const percentage: number = readPercentageFromCoverageSummary(data);
          resolve(percentage);
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  })
};

async function getCodeCoveragePercentFromLcovReport(): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const inputPath: string = Internal.getEnvPathOrDefault('KIT_LCOV_REPORT_INDEX_PATH', './coverage/lcov-report/index.html');
    readFile(inputPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const percentage: number = readPercentageFromLcovReport(data);
          resolve(percentage);
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  })
};

function readPercentageFromLcovReport(data: string): number {
  const percentages: Record<string, number> = {};
  const pattern = /<span class="strong">\s*([\d.]+)%\s*<\/span>\s*<span class="quiet">\s*(Statements|Branches|Functions|Lines)\s*<\/span>/g;

  for (const match of data.matchAll(pattern)) {
    const label = match[2];
    const value = Number.parseFloat(match[1]);
    if (!Number.isNaN(value)) {
      percentages[label] = value;
    }
  }

  if (isPresent(percentages.Lines)) {
    return percentages.Lines;
  }
  if (isPresent(percentages.Statements)) {
    return percentages.Statements;
  }

  throw new Error('Unable to parse coverage percentages from lcov report index.html');
}

/**
 * Generates a TypeDoc documentation badge with a fixed value of 100%.
 * The badge indicates that the documentation is complete.
 */
async function generateTypedocBadge(context: Context): Promise<Badge> {
  const badgeFactory: BadgeFactory = CONTRACTS.enforce(BADGE_FACTORY);
  return await badgeFactory.createBadge({
    name: "typedoc",
    outputPath: getTypedocBadgePath(),
    label: " typedoc ",
    value: "100%",
    color: SUCCESS_COLOR,
    templatePath: getTemplateBadgePath(),
    flags: context.flags,
    display: context.display
  });
}

function readPercentageFromCoverageSummary(data: Buffer): number {
  const text: string = data.toString('utf8');
  const jsonData = JSON.parse(text);
  return jsonData.total.lines.pct;
}

function getCoverageSummaryFilePath(): string {
  return Internal.getEnvPathOrDefault('KIT_COVERAGE_SUMMARY_PATH',
    './coverage/coverage-summary.json');
}

function getTemplateBadgePath(): string {
  const theDefault: string = resolveDataPath('badge-template.svg.dat');
  return Internal.getEnvPathOrDefault('KIT_TEMPLATE_BADGE_PATH', theDefault);
}

function getBadgesFolder(): string {
  return Internal.getEnvPathOrDefault('KIT_BADGES_FOLDER', './');
}

function getCodeCoverageBadgePath(): string {
  return Internal.getEnvPathOrDefault('KIT_COVERAGE_SUMMARY_BADGE_PATH',
    join(getBadgesFolder(), 'coverage-summary.svg'));
}

function getTypedocBadgePath(): string {
  return Internal.getEnvPathOrDefault('KIT_TYPEDOC_BADGE_PATH',
    join(getBadgesFolder(), 'typedoc-badge.svg'));
}

function getNpmBadgePath(): string {
  return Internal.getEnvPathOrDefault('KIT_NPM_BADGE_PATH',
    join(getBadgesFolder(), 'npm-badge.svg'));
}

