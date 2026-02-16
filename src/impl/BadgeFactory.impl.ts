import { Badge, Config as BadgeConfig, Config as GenerateOptions } from "@jonloucks/badges-ts/api/Badge";
import { BadgeFactory } from "@jonloucks/badges-ts/api/BadgeFactory";
import { presentCheck } from "@jonloucks/badges-ts/auxiliary/Checks";
import { readFile, writeFile } from "fs";

/**
 * Factory for creating badges based on templates and provided data.
 * The factory reads a badge template file, replaces placeholders with actual values, 
 * and writes the generated badge to the specified output path.
 * Placeholders in the template should be in the format {{KEYWORD}} where KEYWORD corresponds to properties in the GenerateOptions.
 * Supported placeholders include:
 * - {{LABEL}}: Placeholder for the badge label.
 * - {{VALUE}}: Placeholder for the badge value.
 * - {{COLOR}}: Placeholder for the badge background color.
 * Usage:
 * ```
 * const badgeFactory = createBadgeFactory();
 * const badge = await badgeFactory.createBadge({
 *   name: "coverage",
 *   templatePath: "./path/to/template.svg",
 *   outputPath: "./path/to/output/badge.svg",
 *   label: "coverage",
 *   value: "95%",
 *   color: "#4bc124"
 * });
 * console.log(`Badge created at ${badge.outputPath}`);
 * ```
 */
export function create(): BadgeFactory {
  return BadgeFactoryImpl.internalCreate();
}

// ---- Implementation details below ----

class BadgeFactoryImpl implements BadgeFactory {

  async createBadge(config: BadgeConfig): Promise<Badge> {
    const templatePath: string = presentCheck(config.templatePath, "Badge template path is required for badge generation.");
    const data: Buffer = await readDataFile(templatePath);
    const generated: string = replaceKeywords(config, data.toString('utf8'));

    if (config.flags.dryRun) {
      config.display.dry(`Skipping writing badge to ${config.outputPath}`);
      config.display.dry(generated);
      return {
        name: config.name,
        outputPath: config.outputPath
      };
    } else {
      return await writeDataFile(config.outputPath, generated).then(() => {
        config.display.info(`Badge ${config.name} generated at ${config.outputPath}`);
        return {
          name: config.name,
          outputPath: config.outputPath
        }
      });
    }
  }

  static internalCreate(): BadgeFactory {
    return new BadgeFactoryImpl();
  }

  private constructor() {
    // Private constructor to enforce use of internalCreate
  }
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
