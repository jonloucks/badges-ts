import { Coverage } from "@jonloucks/badges-ts/api/Coverage";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { DiscoverCoverage } from "@jonloucks/badges-ts/auxiliary/DiscoverCoverage";
import { Contracts } from "@jonloucks/contracts-ts/api/Contracts";
import { isPresent, OptionalType } from "@jonloucks/contracts-ts/api/Types";
import {
  KIT_CODE_COVERAGE_PERCENT,
  KIT_COVERAGE_SUMMARY_PATH,
  KIT_LCOV_INFO_PATH,
  KIT_LCOV_REPORT_INDEX_PATH,
  KIT_PROJECT_FOLDER
} from "@jonloucks/badges-ts/api/Variances";
import { readFile } from "fs";
import { Internal } from "./Internal.impl.js";
import { resolve } from "path";

/**
 * Configuration for creating a DiscoverCoverage instance
 */
export interface Config {
  contracts: Contracts;
}

/**
 * Factory function to create a DiscoverCoverage instance
 * @param config the configuration for creating the DiscoverCoverage instance
 * @returns a DiscoverCoverage instance
 */
export function create(config: Config): DiscoverCoverage {
  return DiscoverCoverageImpl.internalCreate(config);
}

// ---- Implementation details below ----

class DiscoverCoverageImpl implements DiscoverCoverage {

  async discoverCoverage(context: Context): Promise<Coverage> {
    // For now, we can return a default coverage value or throw an error
    // various ways to determine the coverage percentage are attempted in parallel 
    // and the first successful result is used; this allows for flexibility in how the 
    // coverage percentage is provided and can accommodate different project setups
    return await Promise.any([
      getCodeCoverageFromEnvironment(context),
      getCodeCoveragePercentFromLcovInfo(context),
      getCodeCoveragePercentFromCoverageSummary(context),
      getCodeCoveragePercentFromLcovReport(context)
       // Future implementation will go here
    ]);
  }

  static internalCreate(config: Config): DiscoverCoverage {
    return new DiscoverCoverageImpl(config);
  }

  private constructor(config: Config) {
    this.#contracts = config.contracts;
  }

  #contracts: Contracts;
}

async function getCodeCoverageFromEnvironment(context: Context): Promise<Coverage> {
  return await new Promise<Coverage>((deliver, reject) => {
    const envValue: OptionalType<number> = context.environment.findVariance(KIT_CODE_COVERAGE_PERCENT);
    if (isPresent(envValue)) {
      deliver({ percentage: envValue });
    } else {
      reject(new Error('Code coverage percentage not found in environment variables'));
    }
  });
}
async function getCodeCoveragePercentFromCoverageSummary(context: Context): Promise<Coverage> {
  return await new Promise<Coverage>((deliver, reject) => {
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

async function getCodeCoveragePercentFromLcovInfo(context: Context): Promise<Coverage> {
  return await new Promise<Coverage>((deliver, reject) => {
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

function readPercentageFromLcovInfo(data: string): Coverage {
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
    return { percentage: totalPercent / percentages.length };
  }

  throw new Error('Unable to parse coverage percentages from lcov.info');
}

async function getCodeCoveragePercentFromLcovReport(context: Context): Promise<Coverage> {
  return await new Promise<Coverage>((resolve, reject) => {
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

function readPercentageFromLcovReport(data: string): Coverage {
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
    return { percentage: totalPercent / length };
  }

  throw new Error('Unable to parse coverage percentages from lcov report index.html');
}

function readPercentageFromCoverageSummary(data: Buffer): Coverage {
  const text: string = data.toString('utf8');
  const jsonData = JSON.parse(text);
  return { percentage: jsonData.total.lines.pct };
}

function getProjectFolder(context: Context): string {
  return context.environment.getVariance(KIT_PROJECT_FOLDER);
}

function getCoverageSummaryFilePath(context: Context): string {
  return resolve(getProjectFolder(context),
    context.environment.getVariance(KIT_COVERAGE_SUMMARY_PATH));
}

function getLcovReportIndexPath(context: Context): string {
  return resolve(getProjectFolder(context),
    context.environment.getVariance(KIT_LCOV_REPORT_INDEX_PATH));
}

function getLcovInfoPath(context: Context): string {
  return resolve(getProjectFolder(context),
    context.environment.getVariance(KIT_LCOV_INFO_PATH));
}