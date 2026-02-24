import { KIT_COVERAGE_FOLDER, KIT_COVERAGE_REPORT_FOLDER, KIT_LCOV_INFO_PATH, KIT_PROJECT_FOLDER, resolveVariant } from "@jonloucks/badges-ts/api/Variances";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { Internal } from "./Internal.impl.js";

export const COMMAND: Command<void> = {
  execute: async function (context: Context): Promise<void> {
    context.display.trace(`Running discover with: ${context.arguments.join(' ')}`);
    const lcovPath: string = getLcovInfoPath(context);
    const { totals, files } = parseLcovInfo(lcovPath);
    const html: string = generateHtmlReport(totals, files);
    const outputFolder: string = getCoverageReportFolder(context);
    Internal.createFoldersIfNotExist(outputFolder);
    const indexHtmlFile = resolve(outputFolder, "index.html");
    writeFileSync(indexHtmlFile, html, "utf8");
    console.log(`Coverage report generated: ${indexHtmlFile}`);
  }
};

interface CoverageCategory {
  lines: { found: number; hit: number };
  functions: { found: number; hit: number };
  branches: { found: number; hit: number };
}

interface FileCoverage {
  file: string;
  lines: number;
  functions: number;
  branches: number;
}

function getLcovInfoPath(context: Context): string {
  return resolveVariant(context.environment, KIT_PROJECT_FOLDER, KIT_COVERAGE_FOLDER, KIT_LCOV_INFO_PATH);
};

function getCoverageReportFolder(context: Context): string {
  return resolveVariant(context.environment, KIT_PROJECT_FOLDER, KIT_COVERAGE_FOLDER, KIT_COVERAGE_REPORT_FOLDER);
}

function matchNumber(matches: string | undefined): number {
  return +(matches ?? 0);
}

function percent(part: number, total: number): number {
  return Internal.normalizePercent(total > 0 ? (part / total) * 100 : 100);
}

function parseLcovInfo(lcovPath: string): { totals: CoverageCategory; files: FileCoverage[] } {
  const content: string = readFileSync(lcovPath, "utf8");
  const records: string[] = content.split("end_of_record");
  let totals: CoverageCategory = {
    lines: { found: 0, hit: 0 },
    functions: { found: 0, hit: 0 },
    branches: { found: 0, hit: 0 },
  };
  const files: FileCoverage[] = [];

  for (const rec of records) {
    if (!rec.trim()) continue;
    const fileMatch: RegExpMatchArray | null = rec.match(/SF:(.+)/);
    const file: string = fileMatch ? fileMatch[1].trim() : "unknown";
    const lf: number = matchNumber(rec.match(/LF:(\d+)/)?.[1]);
    const lh: number = matchNumber(rec.match(/LH:(\d+)/)?.[1]);
    const fnf: number = matchNumber(rec.match(/FNF:(\d+)/)?.[1]);
    const fnh: number = matchNumber(rec.match(/FNH:(\d+)/)?.[1]);
    const brf: number = matchNumber(rec.match(/BRF:(\d+)/)?.[1]);
    const brh: number = matchNumber(rec.match(/BRH:(\d+)/)?.[1]);

    totals.lines.found += lf;
    totals.lines.hit += lh;
    totals.functions.found += fnf;
    totals.functions.hit += fnh;
    totals.branches.found += brf;
    totals.branches.hit += brh;

    files.push({
      file,
      lines: percent(lh, lf),
      functions: percent(fnh, fnf),
      branches: percent(brh, brf),
    });
  }
  return { totals, files };
}

function generateHtmlReport(totals: CoverageCategory, files: FileCoverage[]): string {
  const totalLinesPct = percent(totals.lines.hit, totals.lines.found);
  const totalFuncsPct = percent(totals.functions.hit, totals.functions.found);
  const totalBranchesPct = percent(totals.branches.hit, totals.branches.found);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Coverage Report</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2em; }
    table { border-collapse: collapse; width: 100%; margin-top: 1em; }
    th, td { border: 1px solid #ddd; padding: 0.5em; text-align: left; }
    th { background: #f4f4f4; }
    .pct { font-weight: bold; }
  </style>
</head>
<body>
  <h1>Coverage Report</h1>
  <h2>Totals</h2>
  <ul>
    <li>Lines: <span class="pct">${Internal.formatPercent(totalLinesPct)}</span></li>
    <li>Functions: <span class="pct">${Internal.formatPercent(totalFuncsPct)}</span></li>
    <li>Branches: <span class="pct">${Internal.formatPercent(totalBranchesPct)}</span></li>
  </ul>
  <h2>Per File</h2>
  <table>
    <thead>
      <tr>
        <th>File</th>
        <th>Lines %</th>
        <th>Functions %</th>
        <th>Branches %</th>
      </tr>
    </thead>
    <tbody>
      ${files.map(f => `
        <tr>
          <td>${f.file}</td>
          <td>${Internal.formatPercent(f.lines)}</td>
          <td>${Internal.formatPercent(f.functions)}</td>
          <td>${Internal.formatPercent(f.branches)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
</body>
</html>
`;
}

