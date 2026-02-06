/**
 * Best effort generation of code coverage badge from coverage summary JSON file.
 * Reads coverage percentage from JSON file, determines badge color based on thresholds,
 * and generates an SVG badge using a template file with placeholders.
 * 
 * Environment Variables:
 * - KIT_TEMPLATE_BADGE_PATH: Input path to the SVG badge template file. Default: './src/data/badge-template.svg.dat'
 * - KIT_COVERAGE_SUMMARY_PATH: Input path coverage summary JSON file. Default: './coverage/coverage-summary.json'
 * - KIT_COVERAGE_SUMMARY_BADGE_PATH: Output path for the generated coverage badge SVG file. Default: './.tmp/badges/coverage-summary.svg'     
 * - KIT_TYPEDOC_BADGE_PATH: Output path for the generated typedoc badge SVG file. Default: './.tmp/badges/typedoc.svg'     
 * - KIT_NPM_BADGE_PATH: Output path for the generated npm badge SVG file. Default: './.tmp/badges/npm.svg'     

 *  * Template Placeholders:
 * - {{LABEL}}: Placeholder for the badge label (e.g., "coverage").
 * - {{VALUE}}: Placeholder for the coverage percentage value.
 * - {{COLOR}}: Placeholder for the badge background color.
 * Usage:   
 * ```
 * npm run badges
 * ```
 */
import { Badge, Config as GenerateOptions } from "@jonloucks/badges-ts/api/Badge";
import { used } from "@jonloucks/badges-ts/auxiliary/Checks";
import { mkdir, readFile, writeFile } from "fs";
import { join } from "path";
import { VERSION } from "../version";
import { Command, Context } from "./Command.impl";
import { Internal } from "./Internal.impl";

export const COMMAND: Command<Badge[]> = {
  execute: async function (context: Context): Promise<Badge[]> {

    context.display.trace(`Running generate-badges with: ${context.arguments.join(' ')}`);
    return await generateBadges(context).then((badges) => {
      return badges;
    })
      .catch((error: Error) => {
        context.display.error(`Error during badge generation: ${error.message}`);
        throw error;
      })
      .finally(() => {
        context.display.trace(`Completed generate-badges command`);
      });
  }
};

/**
 * Interface for badge generator.
 */
interface Generator {
  /**
   * Generates a badge based on the provided options.
   * @param options - The options for badge generation.
   */
  generate(context: Context, options: GenerateOptions): Promise<Badge>;
}

const SUCCESS_COLOR: string = '#4bc124';

// TODO: the must be a better default that does not need to create directories
const OUTPUT_FOLDER: string = join(__dirname, "../../", ".tmp", "badges");

async function createFolder(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    mkdir(path, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

createFolder(OUTPUT_FOLDER).catch((thrown: unknown) => {
  used(thrown);
  console.log("Unable to create output folder for badges");
});

const generator: Generator = new class implements Generator {
  async generate(context: Context, options: GenerateOptions): Promise<Badge> {
    const templatePath: string = options.templatePath ? options.templatePath : getTemplateBadgePath();
    const data: Buffer = await readDataFile(templatePath);
    const generated: string = replaceKeywords(options, data.toString('utf8'));

    return await writeDataFile(options.outputPath, generated).then(() => {
      context.display.info(`Generated badge ${options.name} value ${options.value} at ${options.outputPath}`);
      return {
        name: options.name,
        outputPath: options.outputPath
      }
    });
  }
}();

async function generateBadges(context: Context): Promise<Badge[]> {

  const results = await Promise.allSettled([
    generateNpmBadge(context),
    generateCoverageSummaryBadge(context),
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
  return await generator.generate(context, {
    name: "npm",
    outputPath: getNpmBadgePath(),
    label: "  npm  ",
    value: VERSION,
    color: SUCCESS_COLOR
  });
}

/**
 * Generates a code coverage summary badge based on the coverage summary JSON file.
 * Reads the coverage percentage, determines the badge color, and generates the SVG badge.
 */
async function generateCoverageSummaryBadge(context: Context): Promise<Badge> {
  const inputPath: string = getCoverageSummaryFilePath();
  const data: Buffer = await readDataFile(inputPath);
  const percentage: number = readPercentageFromCoverageSummary(data);
  return await generator.generate(context, {
    name: "coverage-summary",
    outputPath: getCoverageSummaryBadgePath(),
    label: "coverage",
    value: percentage + "%",
    color: determineBackgroundColor(percentage)
  });
}

/**
 * Generates a TypeDoc documentation badge with a fixed value of 100%.
 * The badge indicates that the documentation is complete.
 */
async function generateTypedocBadge(context: Context): Promise<Badge> {
  return await generator.generate(context, {
    name: "typedoc",
    outputPath: getTypedocBadgePath(),
    label: " typedoc ",
    value: "100%",
    color: SUCCESS_COLOR
  });
}

async function readDataFile(filePath: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function writeDataFile(filePath: string, data: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    writeFile(filePath, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function replaceKeywords(options: GenerateOptions, template: string): string {
  const replacements = {
    LABEL: options.label,
    VALUE: options.value,
    COLOR: options.color
  };
  // Use a regex with a replacement function to dynamically insert values
  const generatedContent: string = template.replace(/{{(.*?)}}/g, (match, key: string) => {
    const trimmedKey = key.trim() as keyof typeof replacements;
    // trim whitespace and look up the key in the data object
    return replacements[trimmedKey] !== undefined ? String(replacements[trimmedKey]) : match;
  })
  return generatedContent;
}

function readPercentageFromCoverageSummary(data: Buffer): number {
  const text: string = data.toString('utf8');
  const jsonData = JSON.parse(text);
  return jsonData.total.lines.pct;
}

function getCoverageSummaryFilePath(): string {
  return Internal.getEnvPathOrDefault('KIT_COVERAGE_SUMMARY_PATH', './coverage/coverage-summary.json');
}

function getTemplateBadgePath(): string {
  return Internal.getEnvPathOrDefault('KIT_TEMPLATE_BADGE_PATH', './src/data/badge-template.svg.dat');
}

function getCoverageSummaryBadgePath(): string {
  return Internal.getEnvPathOrDefault('KIT_COVERAGE_SUMMARY_BADGE_PATH', join(OUTPUT_FOLDER, 'coverage-summary.svg'));
}

function getTypedocBadgePath(): string {
  return Internal.getEnvPathOrDefault('KIT_TYPEDOC_BADGE_PATH', join(OUTPUT_FOLDER, 'typedoc-badge.svg'));
}

function getNpmBadgePath(): string {
  return Internal.getEnvPathOrDefault('KIT_NPM_BADGE_PATH', join(OUTPUT_FOLDER, 'npm-badge.svg'));
}

function determineBackgroundColor(percent: number): string {
  if (percent >= 95) {
    return SUCCESS_COLOR;
  } else if (percent >= 75) {
    return 'yellowgreen';
  } else if (percent >= 60) {
    return 'yellow';
  } else if (percent >= 40) {
    return 'orange';
  } else {
    return 'red';
  }
}


