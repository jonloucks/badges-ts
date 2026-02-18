import { createVariant } from "@jonloucks/variants-ts/auxiliary/Convenience";
import { Variant } from "@jonloucks/variants-ts/api/Variant";
import { resolveDataPath } from "../data/Resolver.js";
import { resolve } from "path";

export const KIT_PACKAGE_JSON_PATH: Variant<string> = createVariant<string>({
  name: 'Package JSON Path',
  keys: ['KIT_PACKAGE_JSON_PATH', 'kit.package.json.path'],
  description: 'The file path to the package.json file.',
  fallback: resolve('package.json')
});

export const KIT_COVERAGE_SUMMARY_PATH: Variant<string> = createVariant<string>({
  name: 'Coverage Summary Path',
  keys: ['KIT_COVERAGE_SUMMARY_PATH', 'kit.coverage.summary.path'],
  description: 'The file path to the coverage summary JSON file.',
  fallback: resolve('coverage/coverage-summary.json')
});

export const KIT_COVERAGE_SUMMARY_BADGE_PATH: Variant<string> = createVariant<string>({
  name: 'Coverage Summary Badge Path',
  keys: ['KIT_COVERAGE_SUMMARY_BADGE_PATH', 'kit.coverage.summary.badge.path'],
  description: 'The file path to output the generated coverage summary badge SVG file.',
  fallback: 'coverage-summary.svg'
});

export const KIT_TYPEDOC_BADGE_PATH: Variant<string> = createVariant<string>({
  name: 'Typedoc Badge Path',
  keys: ['KIT_TYPEDOC_BADGE_PATH', 'kit.typedoc.badge.path'],
  description: 'The file path to output the generated typedoc badge SVG file.',
  fallback: 'typedoc-badge.svg'
});

export const KIT_BADGES_FOLDER: Variant<string> = createVariant<string>({
  name: 'Badges Folder',
  keys: ['KIT_BADGES_FOLDER', 'kit.badges.folder'],
  description: 'The folder path to output the generated badge SVG files.',
  fallback: resolve('./')
});

export const KIT_NPM_BADGE_PATH: Variant<string> = createVariant<string>({
  name: 'NPM Badge Path',
  keys: ['KIT_NPM_BADGE_PATH', 'kit.npm.badge.path'],
  description: 'The file path to output the generated npm badge SVG file.',
  fallback: 'npm-badge.svg'
});

export const KIT_TEMPLATE_BADGE_PATH: Variant<string> = createVariant<string>({
  name: 'Template Badge Path',
  keys: ['KIT_TEMPLATE_BADGE_PATH', 'kit.template.badge.path'],
  description: 'The file path to the badge template SVG file.',
  fallback: resolveDataPath('badge-template.svg.dat')
});

export const KIT_RELEASE_NOTES_OUTPUT_FOLDER: Variant<string> = createVariant<string>({
  name: 'Release Notes Output Folder',
  keys: ['KIT_RELEASE_NOTES_OUTPUT_FOLDER', 'kit.release.notes.output.folder'],
  description: 'The folder path to output the generated release notes files.',
  fallback: resolve('notes')
});

export const KIT_RELEASE_NOTES_TEMPLATE_PATH: Variant<string> = createVariant<string>({
  name: 'Release Notes Template Path',
  keys: ['KIT_RELEASE_NOTES_TEMPLATE_PATH', 'kit.release.notes.template.path'],
  description: 'The file path to the release notes template file.',
  fallback: resolve('notes', 'release-notes-template.md')
});

export const KIT_LCOV_REPORT_INDEX_PATH: Variant<string> = createVariant<string>({
  name: 'LCOV Report Index Path',
  keys: ['KIT_LCOV_REPORT_INDEX_PATH', 'kit.lcov.report.index.path'],
  description: 'The file path to the LCOV report index.html file.',
  fallback: resolve('coverage/lcov-report/index.html')
});
