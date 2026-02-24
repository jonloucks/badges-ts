import { Variant } from "@jonloucks/variants-ts/api/Variant";
import { createVariant, ofNumber, ofString } from "@jonloucks/variants-ts/auxiliary/Convenience";
import { resolve } from "node:path";
import { resolveDataPath } from "../data/Resolver.js";
import { Context } from "@jonloucks/badges-ts/api/Types";

/**
 *  Only resolving KIT_PROJECT_FOLDER to an absolute path at the point of initialization allows it to be set to a 
 *  relative path that is resolved from the current working directory instead of the location of the 
 *  executing code. Other path variances should be resolved relative to KIT_PROJECT_FOLDER, 
 *  so they will be resolved correctly as well.
 */
export const KIT_PROJECT_FOLDER: Variant<string> = createVariant<string>({
  name: 'Project Folder',
  keys: ['KIT_PROJECT_FOLDER', 'kit.project.folder'],
  description: 'The folder path of the project.',
  of: ofString(),
  fallback: resolve('./')
});

export const KIT_SOURCE_FOLDER: Variant<string> = createVariant<string>({
  name: 'Source Folder',
  keys: ['KIT_SOURCE_FOLDER', 'kit.source.folder'],
  description: 'The folder path of the source files.',
  of: ofString(),
  fallback: 'src'
});

export const KIT_BADGES_CONFIG_PATH: Variant<string> = createVariant<string>({
  name: 'Config Path',
  keys: ['KIT_BADGES_CONFIG_PATH', 'kit.badges.config.path'],
  description: 'The file path to the configuration file.',
  of: ofString(),
  fallback: 'badges-ts.json'
});

export const KIT_PACKAGE_JSON_PATH: Variant<string> = createVariant<string>({
  name: 'Package JSON Path',
  keys: ['KIT_PACKAGE_JSON_PATH', 'kit.package.json.path'],
  description: 'The file path to the package.json file.',
  of: ofString(),
  fallback: 'package.json'
});

export const KIT_CODE_COVERAGE_PERCENT: Variant<number> = createVariant<number>({
  name: 'Code Coverage Percent',
  keys: ['KIT_CODE_COVERAGE_PERCENT', 'kit.code.coverage.percent'],
  description: 'The code coverage percentage.',
  of: ofNumber(),
  fallback: undefined
});

export const KIT_REQUIRED_CODE_COVERAGE: Variant<number> = createVariant<number>({
  name: 'Code Coverage Gate',
  keys: ['KIT_REQUIRED_CODE_COVERAGE', 'kit.required.code.coverage'],
  description: 'The code coverage gate percentage.',
  of: ofNumber(),
  fallback: 0.0
});

export const KIT_COVERAGE_SUMMARY_BADGE_PATH: Variant<string> = createVariant<string>({
  name: 'Coverage Summary Badge Path',
  keys: ['KIT_COVERAGE_SUMMARY_BADGE_PATH', 'kit.coverage.summary.badge.path'],
  description: 'The file path to output the generated coverage summary badge SVG file.',
  of: ofString(),
  fallback: 'coverage-summary.svg'
});

export const KIT_TYPEDOC_BADGE_PATH: Variant<string> = createVariant<string>({
  name: 'Typedoc Badge Path',
  keys: ['KIT_TYPEDOC_BADGE_PATH', 'kit.typedoc.badge.path'],
  description: 'The file path to output the generated typedoc badge SVG file.',
  of: ofString(),
  fallback: 'typedoc-badge.svg'
});

export const KIT_BADGES_FOLDER: Variant<string> = createVariant<string>({
  name: 'Badges Folder',
  keys: ['KIT_BADGES_FOLDER', 'kit.badges.folder'],
  description: 'The folder path to output the generated badge SVG files.',
  of: ofString(),
  link: KIT_PROJECT_FOLDER
});

export const KIT_NPM_BADGE_PATH: Variant<string> = createVariant<string>({
  name: 'NPM Badge Path',
  keys: ['KIT_NPM_BADGE_PATH', 'kit.npm.badge.path'],
  description: 'The file path to output the generated npm badge SVG file.',
  of: ofString(),
  fallback: 'npm-badge.svg'
});

export const KIT_TEMPLATE_BADGE_PATH: Variant<string> = createVariant<string>({
  name: 'Template Badge Path',
  keys: ['KIT_TEMPLATE_BADGE_PATH', 'kit.template.badge.path'],
  description: 'The file path to the badge template SVG file.',
  of: ofString(),
  fallback: resolveDataPath('badge-template.svg.dat')
});

export const KIT_RELEASE_NOTES_OUTPUT_FOLDER: Variant<string> = createVariant<string>({
  name: 'Release Notes Output Folder',
  keys: ['KIT_RELEASE_NOTES_OUTPUT_FOLDER', 'kit.release.notes.output.folder'],
  description: 'The folder path to output the generated release notes files.',
  of: ofString(),
  fallback: 'notes'
});

export const KIT_RELEASE_NOTES_TEMPLATE_PATH: Variant<string> = createVariant<string>({
  name: 'Release Notes Template Path',
  keys: ['KIT_RELEASE_NOTES_TEMPLATE_PATH', 'kit.release.notes.template.path'],
  description: 'The file path to the release notes template file.',
  of: ofString(),
  fallback: 'release-notes-template.md'
});

export const KIT_COVERAGE_FOLDER: Variant<string> = createVariant<string>({
  name: 'Coverage Folder',
  keys: ['KIT_COVERAGE_FOLDER', 'kit.coverage.folder'],
  description: 'The folder path to output the coverage.',
  of: ofString(),
  fallback: 'coverage'
});

export const KIT_COVERAGE_REPORT_FOLDER: Variant<string> = createVariant<string>({
  name: 'Coverage Report Folder',
  keys: ['KIT_COVERAGE_REPORT_FOLDER', 'kit.coverage.report.folder'],
  description: 'The folder path to output the generated coverage report files.',
  of: ofString(),
  fallback: 'lcov-report'
});

export const KIT_LCOV_REPORT_INDEX_PATH: Variant<string> = createVariant<string>({
  name: 'LCOV Report Index Path',
  keys: ['KIT_LCOV_REPORT_INDEX_PATH', 'kit.lcov.report.index.path'],
  description: 'The file path to the LCOV report index.html file.',
  of: ofString(),
  fallback: 'index.html'
});

export const KIT_COVERAGE_SUMMARY_PATH: Variant<string> = createVariant<string>({
  name: 'Coverage Summary Path',
  keys: ['KIT_COVERAGE_SUMMARY_PATH', 'kit.coverage.summary.path'],
  description: 'The file path to the coverage summary JSON file.',
  of: ofString(),
  fallback: 'coverage-summary.json'
});

export const KIT_LCOV_INFO_PATH: Variant<string> = createVariant<string>({
  name: 'LCOV Info Path',
  keys: ['KIT_LCOV_INFO_PATH', 'kit.lcov.info.path'],
  description: 'The file path to the LCOV info file.',
  of: ofString(),
  fallback: 'lcov.info'
});

export const KIT_VERSION_TS_PATH: Variant<string> = createVariant<string>({
  name: 'Version TS Path',
  keys: ['KIT_VERSION_TS_PATH', 'kit.version.ts.path'],
  description: 'The file path to output the generated version.ts file.',
  of: ofString(),
  fallback: 'version.ts'
});

export const KIT_100_PERCENT_COLOR: Variant<string> = createVariant<string>({
  name: '100% Color',
  keys: ['KIT_100_PERCENT_COLOR', 'kit.100.percent.color'],
  description: 'The color to use for badges that are at 100% complete.',
  of: ofString(),
  fallback: '#4bc124'
});

export const KIT_ABOVE_90_PERCENT_COLOR: Variant<string> = createVariant<string>({
  name: 'Above 90% Color',
  keys: ['KIT_ABOVE_90_PERCENT_COLOR', 'kit.above.90.percent.color'],
  description: 'The color to use for badges that are above 90% complete.',
  of: ofString(),
  fallback: '#377526'
});

export const KIT_ABOVE_80_PERCENT_COLOR: Variant<string> = createVariant<string>({
  name: 'Above 80% Color',
  keys: ['KIT_ABOVE_80_PERCENT_COLOR', 'kit.above.80.percent.color'],
  description: 'The color to use for badges that are above 80% complete.',
  of: ofString(),
  fallback: 'yellowgreen'
});

export const KIT_ABOVE_70_PERCENT_COLOR: Variant<string> = createVariant<string>({
  name: 'Above 70% Color',
  keys: ['KIT_ABOVE_70_PERCENT_COLOR', 'kit.above.70.percent.color'],
  description: 'The color to use for badges that are above 70% complete.',
  of: ofString(),
  fallback: 'yellow'
});

export const KIT_ABOVE_60_PERCENT_COLOR: Variant<string> = createVariant<string>({
  name: 'Above 60% Color',
  keys: ['KIT_ABOVE_60_PERCENT_COLOR', 'kit.above.60.percent.color'],
  description: 'The color to use for badges that are above 60% complete.',
  of: ofString(),
  fallback: 'orange'
});

export const KIT_BELOW_60_PERCENT_COLOR: Variant<string> = createVariant<string>({
  name: 'Below 60% Color',
  keys: ['KIT_BELOW_60_PERCENT_COLOR', 'kit.below.60.percent.color'],
  description: 'The color to use for badges that are below 60% complete.',
  of: ofString(),
  fallback: 'darkred'
});

export const KIT_0_PERCENT_COLOR: Variant<string> = createVariant<string>({
  name: '0% Color',
  keys: ['KIT_0_PERCENT_COLOR', 'kit.0.percent.color'],
  description: 'The color to use for badges that are at 0% complete.',
  of: ofString(),
  fallback: '#ff0000'
});

function resolveVariant(context: Context, ...keys: Variant<string>[]): string {
  const parts: string[] = keys.map(key => context.environment.getVariance(key));
  return resolve(...parts);
}

export function getLcovReportIndexPath(context: Context): string {
  return resolveVariant(context, KIT_PROJECT_FOLDER, KIT_COVERAGE_FOLDER, KIT_COVERAGE_REPORT_FOLDER, KIT_LCOV_REPORT_INDEX_PATH);
}

export function getCoverageSummaryFilePath(context: Context): string {
  return resolveVariant(context, KIT_PROJECT_FOLDER, KIT_COVERAGE_FOLDER, KIT_COVERAGE_SUMMARY_PATH);
}

export function getLcovInfoPath(context: Context): string {
  return resolveVariant(context, KIT_PROJECT_FOLDER, KIT_COVERAGE_FOLDER, KIT_LCOV_INFO_PATH);
}

export function getCoverageReportFolder(context: Context): string {
  return resolveVariant(context, KIT_PROJECT_FOLDER, KIT_COVERAGE_FOLDER, KIT_COVERAGE_REPORT_FOLDER);
}

export function getPackageJsonPath(context: Context): string {
  return resolveVariant(context, KIT_PROJECT_FOLDER, KIT_PACKAGE_JSON_PATH);
}

export function resolveBadgePath(context: Context, ...keys: Variant<string>[]): string {
  return resolveVariant(context, KIT_PROJECT_FOLDER, KIT_BADGES_FOLDER, ...keys);
}

export function getTemplateBadgePath(context: Context): string {
  return resolveVariant(context, KIT_PROJECT_FOLDER, KIT_BADGES_FOLDER, KIT_TEMPLATE_BADGE_PATH);
}

export function getCodeCoverageBadgePath(context: Context): string {
  return resolveBadgePath(context, KIT_COVERAGE_SUMMARY_BADGE_PATH);
}

export function getTypedocBadgePath(context: Context): string {
  return resolveBadgePath(context, KIT_TYPEDOC_BADGE_PATH);
}

export function getNpmBadgePath(context: Context): string {
  return resolveBadgePath(context, KIT_NPM_BADGE_PATH);
}

export function getVersionTsPath(context: Context): string {
  return resolveVariant(context, KIT_PROJECT_FOLDER, KIT_SOURCE_FOLDER, KIT_VERSION_TS_PATH);
}

export function getReleaseNotesOutputFolder(context: Context): string {
  return resolveVariant(context, KIT_PROJECT_FOLDER, KIT_RELEASE_NOTES_OUTPUT_FOLDER);
}

export function getReleaseNotesTemplatePath(context: Context): string {
  return resolveVariant(context, KIT_PROJECT_FOLDER, KIT_RELEASE_NOTES_OUTPUT_FOLDER, KIT_RELEASE_NOTES_TEMPLATE_PATH);
}