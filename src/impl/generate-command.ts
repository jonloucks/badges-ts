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
  KIT_COVERAGE_SUMMARY_BADGE_PATH,
  KIT_NPM_BADGE_PATH,
  KIT_PROJECT_FOLDER,
  KIT_TEMPLATE_BADGE_PATH,
  KIT_TYPEDOC_BADGE_PATH
} from "@jonloucks/badges-ts/api/Variances";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { CONTRACT as DISCOVER_PROJECT } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { CONTRACT as DISCOVER_COVERAGE } from "@jonloucks/badges-ts/auxiliary/DiscoverCoverage";
import { CONTRACTS } from "@jonloucks/contracts-ts";
import { Coverage } from "@jonloucks/badges-ts/api/Coverage";
import { used } from "@jonloucks/contracts-ts/auxiliary/Checks";
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

async function discoverCoverage(context: Context): Promise<Coverage> {
  return await CONTRACTS.enforce(DISCOVER_COVERAGE).discoverCoverage(context);
}

/**
 * Generates a code coverage summary badge based on the coverage summary JSON file.
 * Reads the coverage percentage, determines the badge color, and generates the SVG badge.
 */
async function generateCodeCoverageBadge(context: Context): Promise<Badge> {
  const coverage: Coverage = await discoverCoverage(context);
  const badgeFactory: BadgeFactory = CONTRACTS.enforce(BADGE_FACTORY);
  return await badgeFactory.createBadge({
    name: "coverage-summary",
    outputPath: getCodeCoverageBadgePath(context),
    label: "coverage",
    value: Internal.formatPercent(coverage.percentage),
    color: Internal.colorFromPercentComplete(context, coverage.percentage),
    templatePath: getTemplateBadgePath(context),
    flags: context.flags,
    display: context.display
  });
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


function getProjectFolder(context: Context): string {
  return context.environment.getVariance(KIT_PROJECT_FOLDER);
}

function getTemplateBadgePath(context: Context): string {
  return resolve(getProjectFolder(context),
    context.environment.getVariance(KIT_TEMPLATE_BADGE_PATH));
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
