import { getLcovInfoPath, getCoverageReportFolder } from "@jonloucks/badges-ts/api/Variances";
import { isNotPresent, isPresent } from "@jonloucks/contracts-ts/api/Types";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { Internal } from "./Internal.impl.js";

/**
 * Command implementation for generating a code coverage report based on an lcov info file.
 * Reads the lcov info file, analyzes the coverage data, and generates an HTML report with summary and per-file coverage details.
 * The report includes overall coverage percentages, as well as detailed information for each file, including missed lines, functions, and branches.
 * The generated HTML report is saved to a specified output folder, and the path to the generated report is displayed in the console.
 * The command expects the lcov info file to be in a specific format, with entries for lines, functions, and branches coverage.
 * The command can be executed as part of the CLI tool, and it relies on the context to determine the location of the lcov info file and the output folder for the report.
*/
export const COMMAND: Command<void> = {
  execute: async function (context: Context): Promise<void> {
    context.display.trace(`Running coverage-report with: ${context.arguments.join(' ')}`);
    const analysis: Analysis = analyze(context, getLcovInfoPath(context));
    const html: string = generateHtmlReport(context, analysis);
    const outputFolder: string = getCoverageReportFolder(context);
    Internal.createFoldersIfNotExist(outputFolder);
    const indexHtmlFile = resolve(outputFolder, "index.html");
    writeFileSync(indexHtmlFile, html, "utf8");
    context.display.info(`Coverage report generated: ${indexHtmlFile}`);
  }
};

interface Coverage {
  lines: { found: number; hit: number; percent: number };
  functions: { found: number; hit: number; percent: number };
  branches: { found: number; hit: number; percent: number };
  average: number;
}

interface Branch {
  line: number;
  block: number;
  branch: number;
  taken: number;
}

interface FileCoverage {
  coverage: Coverage;
  folder: string;
  file: string;
  missedLines: number[];
  functionLocations: Map<string, number>;
  missedFunctions: string[];
  missedBranches: Branch[];
}

interface FolderCoverage {
  coverage: Coverage;
  folder: string;
}

interface Analysis {
  totals: Coverage;
  files: FileCoverage[];
  folders: Map<string, FolderCoverage>;
}

const HTML_LINE_BREAK: string = '<br />';

const ENTRY_SEPARATOR: string = '\n';

function analyze(context: Context, fileName: string): Analysis {
  // change to async if we want to read the file asynchronously, but for now we'll keep it simple and synchronous since the file is typically small and this is a CLI tool
  const content: string = readFileSync(fileName, "utf8");

  const analysis: Analysis = {
    totals: newCoverage(),
    files: [],
    folders: new Map<string, FolderCoverage>()
  };

  for (const record of content.split("end_of_record")) {
    if (isEmptyRecord(record)) {
      continue;
    }
    const fileCoverage: FileCoverage = parseRecord(context, record);

    tally(analysis.totals, fileCoverage.coverage);
    tallyFolder(analysis, fileCoverage);
    analysis.files.push(fileCoverage);
  }

  updateAllPercentages(analysis);

  return analysis;
}

function updateAllPercentages(analysis: Analysis): void {
  for (const fileCoverage of analysis.files) {
    updatePercentages(fileCoverage.coverage);
  }
  for (const folderCoverage of analysis.folders.values()) {
    updatePercentages(folderCoverage.coverage);
  }
  updatePercentages(analysis.totals);
}

function updatePercentages(coverage: Coverage): void {
  coverage.lines.percent = percent(coverage.lines.hit, coverage.lines.found);
  coverage.functions.percent = percent(coverage.functions.hit, coverage.functions.found);
  coverage.branches.percent = percent(coverage.branches.hit, coverage.branches.found);
  coverage.average = (coverage.lines.percent + coverage.functions.percent + coverage.branches.percent) / 3;
}

function toNumber(text: string | undefined): number {
  if (isPresent(text)) {
    return Number(text.trim());
  }
  return 0;
}

function percent(part: number, total: number): number {
  return Internal.normalizePercent(total > 0 ? (part / total) * 100 : 100);
}

function tally(update: Coverage, delta: Readonly<Coverage>): void {
  update.lines.found += delta.lines.found;
  update.lines.hit += delta.lines.hit;

  update.functions.found += delta.functions.found;
  update.functions.hit += delta.functions.hit;

  update.branches.found += delta.branches.found;
  update.branches.hit += delta.branches.hit;
}

function tallyFolder(analysis: Analysis, file: Readonly<FileCoverage>): void {
  const folderName: string = file.folder;
  let folderCoverage: FolderCoverage | undefined = analysis.folders.get(folderName);
  if (isNotPresent(folderCoverage)) {
    folderCoverage = {
      folder: folderName,
      coverage: newCoverage()
    }
    analysis.folders.set(folderName, folderCoverage);
  }

  tally(folderCoverage.coverage, file.coverage);
}

function newCoverage(): Coverage {
  return {
    lines: { found: 0, hit: 0, percent: 0 },
    functions: { found: 0, hit: 0, percent: 0 },
    branches: { found: 0, hit: 0, percent: 0 },
    average: 0
  }
}

function isEmptyRecord(record: string): boolean {
  // Avoid trimming records with length greater than 1 since whitespace
  return record.length === 0 || (record.length === 1 && record.trim().length === 0);
}

function parseRecord(context: Context, record: string): FileCoverage {
  const fileCoverage: FileCoverage = initializeFileCoverage();

  for (const entry of record.split(ENTRY_SEPARATOR)) {
    if (entry.length === 0) {
      continue;
    } else if (entry.startsWith('BRDA:')) {
      parse_BRDA(entry, fileCoverage);
    } else if (entry.startsWith('DA:')) {
      parse_DA(entry, fileCoverage);
    } else if (entry.startsWith('FNDA:')) {
      parse_FNDA(entry, fileCoverage);
    } else if (entry.startsWith('SF:')) {
      parse_SF(entry, fileCoverage);
    } else if (entry.startsWith('LF:')) {
      parse_LF(entry, fileCoverage);
    } else if (entry.startsWith('LH:')) {
      parse_LH(entry, fileCoverage);
    } else if (entry.startsWith('FNF:')) {
      parse_FNF(entry, fileCoverage);
    } else if (entry.startsWith('FNH:')) {
      parse_FNH(entry, fileCoverage);
    } else if (entry.startsWith('BRF:')) {
      parse_BRF(entry, fileCoverage);
    } else if (entry.startsWith('BRH:')) {
      parse_BRH(entry, fileCoverage);
    } else if (entry.startsWith('TN:')) {
      // Test name, can be ignored for our purposes since we are only interested in totals and file-level coverage
    } else if (entry.startsWith('FN:')) {
      parse_FN(entry, fileCoverage);
    } else {
      context.display.trace(`Unrecognized entry in lcov info: ${entry}`);
    }
  }

  return fileCoverage;
}

function getFolderCoverage(analysis: Analysis, folder: string): Coverage {
  return analysis.folders.get(folder)!.coverage;
}

// FN:{line number},{function name}
function parse_FN(entry: string, fileCoverage: FileCoverage): void {
  const parts: string[] = entry.split(':')[1].split(',');
  fileCoverage.functionLocations.set(parts[1], toNumber(parts[0]));
}

// BRDA:{line number},{block number},{branch number},{taken}
function parse_BRDA(entry: string, fileCoverage: FileCoverage): void {
  const parts: string[] = entry.split(':')[1].split(',');
  const branch: Branch = {
    line: toNumber(parts[0]),
    block: toNumber(parts[1]),
    branch: toNumber(parts[2]),
    taken: parts[3] === '-' ? 0 : toNumber(parts[3])
  };
  if (branch.taken === 0) {
    fileCoverage.missedBranches.push(branch);
  }
}

//FNDA:{execution count},{function name}
function parse_FNDA(entry: string, fileCoverage: FileCoverage): void {
  const parts: string[] = entry.split(':')[1].split(',');
  const hits: number = toNumber(parts[0]);
  const name: string = parts[1];
  if (hits === 0) {
    fileCoverage.missedFunctions.push(name);
  }
}

// DA:{line number},{execution count}
function parse_DA(entry: string, fileCoverage: FileCoverage): void {
  const parts: string[] = entry.split(':')[1].split(',');
  const lineNumber: number = toNumber(parts[0]);
  const hits: number = toNumber(parts[1]);
  if (hits === 0) {
    fileCoverage.missedLines.push(lineNumber);
  }
}

// SF:/path/to/file.ts
function parse_SF(entry: string, fileCoverage: FileCoverage): void {
  const path: string = entry.substring('SF:'.length);
  if (path.lastIndexOf('/') > -1) {
    fileCoverage.folder = path.substring(0, path.lastIndexOf('/')).trim();
    fileCoverage.file = path.substring(path.lastIndexOf('/') + 1).trim();
  } else {
    fileCoverage.folder = '';
    fileCoverage.file = path.trim();
  }
}

// LF:{number of lines found}
function parse_LF(entry: string, fileCoverage: FileCoverage): void {
  fileCoverage.coverage.lines.found += toNumber(entry.substring("LF:".length));
}

// LH:{number of lines hit}
function parse_LH(entry: string, fileCoverage: FileCoverage): void {
  fileCoverage.coverage.lines.hit += toNumber(entry.substring("LH:".length));
}

// FNF:{number of functions found}
function parse_FNF(entry: string, fileCoverage: FileCoverage): void {
  fileCoverage.coverage.functions.found += toNumber(entry.substring("FNF:".length));
}

// FNH:{number of functions hit}
function parse_FNH(entry: string, fileCoverage: FileCoverage): void {
  fileCoverage.coverage.functions.hit += toNumber(entry.substring("FNH:".length));
}

// BRF:{number of branches found}
function parse_BRF(entry: string, fileCoverage: FileCoverage): void {
  fileCoverage.coverage.branches.found += toNumber(entry.substring("BRF:".length));
}

// BRH:{number of branches hit}
function parse_BRH(entry: string, fileCoverage: FileCoverage): void {
  fileCoverage.coverage.branches.hit += toNumber(entry.substring("BRH:".length));
}

function initializeFileCoverage(): FileCoverage {
  return {
    coverage: newCoverage(),
    folder: '',
    file: '',
    missedLines: [],
    missedFunctions: [],
    missedBranches: [],
    functionLocations: new Map<string, number>()
  };
}

function formatMissingLines(fileCoverage: FileCoverage): string {
  return toRanges(fileCoverage.missedLines.sort((a, b) => a - b));
}

function toRanges(numbers: number[]): string {
  const ranges: string[] = [];
  let rangeStart: number | null = null;
  let previousLine: number | null = null;

  for (const current of numbers) {
    if (rangeStart === null) {
      rangeStart = current;
    } else if (previousLine !== null && current === previousLine + 1) {
      // Continue the range
    } else {
      // End the previous range and start a new one
      if (rangeStart !== null) {
        ranges.push(rangeStart === previousLine ? `${rangeStart}` : `${rangeStart}-${previousLine}`);
      }
      rangeStart = current;
    }
    previousLine = current;
  }

  // Handle the last range if it exists
  if (rangeStart !== null && previousLine !== null) {
    ranges.push(rangeStart === previousLine ? `${rangeStart}` : `${rangeStart}-${previousLine}`);
  }
  return ranges.join(HTML_LINE_BREAK);
}

function generateHtmlReport(context: Context, analysis: Analysis): string {
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
    .tooltip-cell {
      position: relative; /* Needed for absolute positioning of the tooltip content */
      cursor: help; /* Changes cursor to indicate interactivity */
    }
    .tooltip-content {
      display: none; /* Hide the content by default */
      position: absolute; /* Position relative to the parent cell */
      color: blue;
      background-color: #f9f9f9;
      border: 1px solid #ccc;
      padding: 10px;
      z-index: 10; /* Ensure it appears above other elements */
      right: 0;
    /*  left: 100%; *//* Position to the right of the cell */
     /* top: 0; */
      white-space: nowrap; /* Prevents text from wrapping (optional) */
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .tooltip-cell:hover .tooltip-content {
      display: block; /* Show the content on hover */
    }
    .th-sort-asc::after { content: " ▲"; }
    .th-sort-desc::after { content: " ▼"; }
  </style>
</head>
<body>
  <h1>Coverage Report</h1>
  ${generateSummaryTable(context, analysis)}
  ${generateTablePerFile(context, analysis)}
</body>
<script>
document.querySelectorAll('#perFileTable th').forEach((headerCell, index) => {
    headerCell.addEventListener('click', () => {
        const tableElement = headerCell.parentElement.parentElement.parentElement;
        const headerRow = headerCell.parentElement;
        const tableBody = tableElement.querySelector('tbody');
        const rows = Array.from(tableBody.querySelectorAll('tr'));

        // Toggle sort direction
        const isAscending = headerCell.classList.contains('th-sort-asc');
        
        // Remove existing sort classes from all headers
        headerRow.querySelectorAll('th').forEach(th => th.classList.remove('th-sort-asc', 'th-sort-desc'));

        // Sort the rows
        const sortedRows = rows.sort((a, b) => {
            const aText = a.cells[index].textContent.trim();
            const bText = b.cells[index].textContent.trim();
            
            // numeric: true handles both "10" > "2" and alphabetical sorting
            return aText.localeCompare(bText, undefined, { numeric: true }) * (isAscending ? -1 : 1);
        });

        // Re-add rows to the body in new order
        tableBody.append(...sortedRows);

        // Update classes for visual indicators
        headerCell.classList.toggle('th-sort-asc', !isAscending);
        headerCell.classList.toggle('th-sort-desc', isAscending);
    });
});
window.addEventListener('DOMContentLoaded', () => {
    // Target the 1st header (index 0) and click it automatically
    document.querySelectorAll('#perFileTable th')[0].click();
});
</script>
</html>
`;
}

function generatePercentCell(context: Context, percent: number, tooltipContent: string): string {
  return `
    <td class="tooltip-cell" style="color: white; background-color: ${Internal.colorFromPercentComplete(context, percent)}">
      ${Internal.formatPercent(percent)}
      ${generateTooltip(tooltipContent)}
    </td>
  `;
}

function generateLabelCell(context: Context, label: string, percent: number, tooltipContent: string): string {
  return `
    <td class="tooltip-cell" style="color: white; background-color: ${Internal.colorFromPercentComplete(context, percent)}">
      ${label}
      ${generateTooltip(tooltipContent)}
    </td>
  `;
}

function generateTooltip(content: string): string {
  if (content.length === 0) {
    return "";
  }
  return `<span class="tooltip-content">${content}</span>`;
}

function generateSummaryTable(context: Context, analysis: Analysis): string {
  const uniqueFolders: string[] = Array.from(analysis.folders.keys()).sort();

  return `<h2>Summary</h2>
  <table id="summaryTable" width="400px">
    <thead>
      <tr>
        <th>Category</th>
        <th style="width: 120px;">Average</th>
        <th style="width: 120px;">Lines</th>
        <th style="width: 120px;">Functions</th>
        <th style="width: 120px;">Branches</th>
      </tr>
    </thead>
    <tbody>
        ${generateSummaryRow(context, "All Files", analysis.totals)}
        ${uniqueFolders.map(folder => {
    return generateSummaryRow(context, folder, getFolderCoverage(analysis, folder));
  }).join("")}
    </tbody>
  </table>`
}

function generateSummaryRow(context: Context, label: string, coverage: Coverage): string {
  return `
  <tr>
    ${generateLabelCell(context, escapeHtml(label), coverage.average, Internal.formatPercent(coverage.average))}
    ${generatePercentCell(context, coverage.average, "")}
    ${generatePercentCell(context, coverage.lines.percent, "")}
    ${generatePercentCell(context, coverage.functions.percent, "")}
    ${generatePercentCell(context, coverage.branches.percent, "")}
  </tr>`;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateTablePerFile(context: Context, analysis: Analysis): string {
  return `<h2>Coverage Per File</h2>
  <table id="perFileTable">
    <thead>
      <tr>
        <th>File</th>
        <th>Folder</th>
        <th style="width: 120px;">Average</th>
        <th style="width: 120px;">Lines</th>
        <th style="width: 120px;">Functions</th>
        <th style="width: 120px;">Branches</th>
      </tr>
    </thead>
    <tbody>
      ${analysis.files.map(f => generatePerFileRow(context, analysis, f)).join("")}
    </tbody>
  </table>`
}

function generatePerFileRow(context: Context, analysis: Analysis, fileCoverage: FileCoverage): string {
  const byFolder: Coverage = getFolderCoverage(analysis, fileCoverage.folder);
  const byFile: Coverage = fileCoverage.coverage;
  return `
  <tr>
    ${generateLabelCell(context, escapeHtml(fileCoverage.file), byFile.average, Internal.formatPercent(byFile.average))}
    ${generateLabelCell(context, escapeHtml(fileCoverage.folder), byFolder.average, Internal.formatPercent(byFolder.average))}
    ${generatePercentCell(context, byFile.average, "")}
    ${generatePercentCell(context, byFile.lines.percent, formatMissingLines(fileCoverage))}
    ${generatePercentCell(context, byFile.functions.percent, formatMissingFunctions(fileCoverage))}
    ${generatePercentCell(context, byFile.branches.percent, formatMissedBranches(fileCoverage))}
  </tr>`;
}

function formatMissingFunctions(fileCoverage: FileCoverage): string {
  return fileCoverage.missedFunctions.map(name => {
    const location: number | undefined = fileCoverage.functionLocations.get(name);
    const lineInfo: string = isPresent(location) ? ` @ ${location}` : '';
    return `${escapeHtml(name)}${lineInfo}${HTML_LINE_BREAK}`;
  }).join("");
}

function formatMissedBranches(fileCoverage: FileCoverage): string {
  return fileCoverage.missedBranches.map(branch => {
    return `line ${branch.line}, block ${branch.block}, branch ${branch.branch}${HTML_LINE_BREAK}`;
  }).join("");
}