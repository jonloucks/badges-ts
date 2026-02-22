/**
 * Best effort generation of code coverage badge from coverage summary JSON file.
 * Reads coverage percentage from JSON file, determines badge color based on thresholds,
 * and generates an SVG badge using a template file with placeholders.
 * 
 *  * Template Placeholders:
 * - {{LABEL}}: Placeholder for the badge label (e.g., "coverage").
 * - {{VALUE}}: Placeholder for the coverage percentage value.
 * - {{COLOR}}: Placeholder for the badge background color.
 */
import { Badge } from "@jonloucks/badges-ts/api/Badge";
import { CONTRACT as BADGE_FACTORY, BadgeFactory } from "@jonloucks/badges-ts/api/BadgeFactory";
import { Project } from "@jonloucks/badges-ts/api/Project";
import {
  KIT_BADGES_FOLDER,
  KIT_CODE_COVERAGE_PERCENT,
  KIT_COVERAGE_SUMMARY_BADGE_PATH,
  KIT_COVERAGE_SUMMARY_PATH,
  KIT_LCOV_INFO_PATH,
  KIT_LCOV_REPORT_INDEX_PATH,
  KIT_NPM_BADGE_PATH,
  KIT_PROJECT_FOLDER,
  KIT_TEMPLATE_BADGE_PATH,
  KIT_TYPEDOC_BADGE_PATH
} from "@jonloucks/badges-ts/api/Variances";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { CONTRACT as DISCOVER_PROJECT } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { CONTRACTS } from "@jonloucks/contracts-ts";
import { isPresent, OptionalType } from "@jonloucks/contracts-ts/api/Types";
import { used } from "@jonloucks/contracts-ts/auxiliary/Checks";
import { readFile } from "fs";
import { resolve } from "path";
import { Internal } from "./Internal.impl.js";

export const COMMAND: Command<Badge[]> = {
  execute: async function (context: Context): Promise<Badge[]> {
    context.display.trace(`Running generate with: ${context.arguments.join(' ')}`);
    return await generateBadges(context).then((badges) => {
      return badges;
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
    used(index);
    if (result.status === 'fulfilled') {
      badges.push(result.value);
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
    outputPath: getNpmBadgePath(context),
    label: "npm",
    value: project.version,
    color: Internal.colorFromPercentComplete(context, 100),
    templatePath: getTemplateBadgePath(context),
    flags: context.flags,
    display: context.display
  });
}

async function discoverProject(context: Context): Promise<Project> {
  return await CONTRACTS.enforce(DISCOVER_PROJECT).discoverProject(context);
};

/**
 * Generates a code coverage summary badge based on the coverage summary JSON file.
 * Reads the coverage percentage, determines the badge color, and generates the SVG badge.
 */
async function generateCodeCoverageBadge(context: Context): Promise<Badge> {
  const percentage: number = await getCodeCoveragePercent(context);
  const badgeFactory: BadgeFactory = CONTRACTS.enforce(BADGE_FACTORY);
  return await badgeFactory.createBadge({
    name: "coverage-summary",
    outputPath: getCodeCoverageBadgePath(context),
    label: "coverage",
    value: Internal.formatPercent(percentage),
    color: Internal.colorFromPercentComplete(context, percentage),
    templatePath: getTemplateBadgePath(context),
    flags: context.flags,
    display: context.display
  });
}

async function getCodeCoveragePercent(context: Context): Promise<number> {
  // various ways to determine the coverage percentage are attempted in parallel 
  // and the first successful result is used; this allows for flexibility in how the 
  // coverage percentage is provided and can accommodate different project setups
  return await Promise.any([
    getCodeCoverageFromEnvironment(context),
    getCodeCoveragePercentFromLcovInfo(context),
    getCodeCoveragePercentFromCoverageSummary(context),
    getCodeCoveragePercentFromLcovReport(context)
  ]);
};

async function getCodeCoverageFromEnvironment(context: Context): Promise<number> {
  return await new Promise<number>((deliver, reject) => {
    const envValue: OptionalType<number> = context.environment.findVariance(KIT_CODE_COVERAGE_PERCENT);
    if (isPresent(envValue)) {
      deliver(envValue);
    } else {
      reject(new Error('Code coverage percentage not found in environment variables'));
    }
  });
}
async function getCodeCoveragePercentFromCoverageSummary(context: Context): Promise<number> {
  return await new Promise<number>((deliver, reject) => {
    const inputPath: string = getCoverageSummaryFilePath(context);
    return readFile(inputPath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          deliver(readPercentageFromCoverageSummary(data));
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  })
};

async function getCodeCoveragePercentFromLcovInfo(context: Context): Promise<number> {
  return await new Promise<number>((deliver, reject) => {
    const inputPath: string = getLcovInfoPath(context);
    return readFile(inputPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          deliver(readPercentageFromLcovInfo(data));
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  })
};

function readPercentageFromLcovInfo(data: string): number {
  let linesFound: number = 0;
  let linesHit: number = 0;
  let functionsFound: number = 0;
  let functionsHit: number = 0;
  let branchesFound: number = 0;
  let branchesHit: number = 0;

  for (const line of data.split(/\r?\n/)) {
    if (line.startsWith('LF:')) {
      linesFound += Number.parseInt(line.slice(3), 10) || 0;
    } else if (line.startsWith('LH:')) {
      linesHit += Number.parseInt(line.slice(3), 10) || 0;
    } else if (line.startsWith('FNF:')) {
      functionsFound += Number.parseInt(line.slice(4), 10) || 0;
    } else if (line.startsWith('FNH:')) {
      functionsHit += Number.parseInt(line.slice(4), 10) || 0;
    } else if (line.startsWith('BRF:')) {
      branchesFound += Number.parseInt(line.slice(4), 10) || 0;
    } else if (line.startsWith('BRH:')) {
      branchesHit += Number.parseInt(line.slice(4), 10) || 0;
    }
  }

  const percentages: number[] = [];
  if (linesFound > 0) {
    percentages.push(Internal.normalizePercent((linesHit / linesFound) * 100));
  }
  if (functionsFound > 0) {
    percentages.push(Internal.normalizePercent((functionsHit / functionsFound) * 100));
  }
  if (branchesFound > 0) {
    percentages.push(Internal.normalizePercent((branchesHit / branchesFound) * 100));
  }

  if (percentages.length > 0) {
    let totalPercent: number = 0;
    for (const percent of percentages) {
      totalPercent += percent;
    }
    return totalPercent / percentages.length;
  }

  throw new Error('Unable to parse coverage percentages from lcov.info');
}

async function getCodeCoveragePercentFromLcovReport(context: Context): Promise<number> {
  return await new Promise<number>((resolve, reject) => {
    const inputPath: string = getLcovReportIndexPath(context);
    return readFile(inputPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          resolve(readPercentageFromLcovReport(data));
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  })
};

function readPercentageFromLcovReport(data: string): number {
  const percentages: Record<string, number> = {};
  const pattern = /<span class="strong">\s*([\d.]+)%\s*<\/span>\s*<span class="quiet">\s*(Branches|Functions|Lines)\s*<\/span>/g;

  for (const match of data.matchAll(pattern)) {
    const label: string = match[2];
    const value: number = Number.parseFloat(match[1]);
    if (Internal.isPercent(value)) {
      percentages[label.toLowerCase()] = Internal.normalizePercent(value);
      if (Object.keys(percentages).length >= 3) {
        break;
      }
    }
  }
  const length: number = Object.keys(percentages).length;
  if (length > 0) {
    let totalPercent: number = 0;
    for (const label of Object.keys(percentages)) {
      totalPercent += percentages[label];
    }
    return totalPercent / length;
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
    outputPath: getTypedocBadgePath(context),
    label: "typedoc",
    value: Internal.formatPercent(100),
    color: Internal.colorFromPercentComplete(context, 100),
    templatePath: getTemplateBadgePath(context),
    flags: context.flags,
    display: context.display
  });
}

function readPercentageFromCoverageSummary(data: Buffer): number {
  const text: string = data.toString('utf8');
  const jsonData = JSON.parse(text);
  return jsonData.total.lines.pct;
}

function getProjectFolder(context: Context): string {
  return context.environment.getVariance(KIT_PROJECT_FOLDER);
}

function getCoverageSummaryFilePath(context: Context): string {
  return resolve(getProjectFolder(context),
    context.environment.getVariance(KIT_COVERAGE_SUMMARY_PATH));
}

function getTemplateBadgePath(context: Context): string {
  return resolve(getProjectFolder(context),
    context.environment.getVariance(KIT_TEMPLATE_BADGE_PATH));
}

function getLcovReportIndexPath(context: Context): string {
  return resolve(getProjectFolder(context),
    context.environment.getVariance(KIT_LCOV_REPORT_INDEX_PATH));
}

function getLcovInfoPath(context: Context): string {
  return resolve(getProjectFolder(context),
    context.environment.getVariance(KIT_LCOV_INFO_PATH));
}

function getBadgesFolder(context: Context): string {
  return resolve(getProjectFolder(context),
    context.environment.getVariance(KIT_BADGES_FOLDER));
}

function getCodeCoverageBadgePath(context: Context): string {
  return resolve(getBadgesFolder(context),
    context.environment.getVariance(KIT_COVERAGE_SUMMARY_BADGE_PATH));
}

function getTypedocBadgePath(context: Context): string {
  return resolve(getBadgesFolder(context),
    context.environment.getVariance(KIT_TYPEDOC_BADGE_PATH));
}

function getNpmBadgePath(context: Context): string {
  return resolve(getBadgesFolder(context),
    context.environment.getVariance(KIT_NPM_BADGE_PATH));
}
