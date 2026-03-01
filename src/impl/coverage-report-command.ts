import { getLcovInfoPath, getCoverageReportFolder } from "@jonloucks/badges-ts/api/Variances";
import { isPresent } from "@jonloucks/contracts-ts/api/Types";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { Internal } from "./Internal.impl.js";
import { used } from "@jonloucks/contracts-ts/auxiliary/Checks";

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
}

interface FileCoverage {
  coverage: Coverage;
  folder: string;
  file: string;
  missedBranchesHtml: string;
  missedLinesHtml: string;
  missedFunctionsHtml: string;
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

function toNumber(text: string | undefined): number {
  if (isPresent(text)) {
    return Number(text.trim());
  }
  return 0;
}

function percent(part: number, total: number): number {
  return Internal.normalizePercent(total > 0 ? (part / total) * 100 : 100);
}

function analyze(context: Context, lcovPath: string): Analysis {
  // change to async if we want to read the file asynchronously, but for now we'll keep it simple and synchronous since the file is typically small and this is a CLI tool
  const content: string = readFileSync(lcovPath, "utf8");

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
    analysis.files.push(fileCoverage);
  }

  calculatePercentages(analysis.totals);

  updateFolderCoverages(analysis);

  return analysis;
}

function updateFolderCoverages(analysis: Analysis): void {
  for (const file of analysis.files) {  
    const existingFolderCoverage: FolderCoverage | undefined = analysis.folders.get(file.folder);
    if (isPresent(existingFolderCoverage)) {
      tally(existingFolderCoverage.coverage, file.coverage);
    } else {
      analysis.folders.set(file.folder, {
        folder: file.folder,
        coverage: { ...file.coverage }
      });
    }
  }
};

function tally(totals: Coverage, fileCoverage: Coverage): void {
  totals.lines.found += fileCoverage.lines.found;
  totals.lines.hit += fileCoverage.lines.hit;
  totals.functions.found += fileCoverage.functions.found;
  totals.functions.hit += fileCoverage.functions.hit;
  totals.branches.found += fileCoverage.branches.found;
  totals.branches.hit += fileCoverage.branches.hit;
}

function calculatePercentages(totals: Coverage): void {
  totals.lines.percent = percent(totals.lines.hit, totals.lines.found);
  totals.functions.percent = percent(totals.functions.hit, totals.functions.found);
  totals.branches.percent = percent(totals.branches.hit, totals.branches.found);
}

function newCoverage(): Coverage {
  return {
    lines: { found: 0, hit: 0, percent: 0 },
    functions: { found: 0, hit: 0, percent: 0 },
    branches: { found: 0, hit: 0, percent: 0 }
  }
}

function isEmptyRecord(record: string): boolean {
  return record.length === 0 || (record.length === 1 && record[0] === '\n');
}

function parseRecord(context: Context,record: string): FileCoverage {
  const fileCoverage: FileCoverage = initializeFileCoverage();
  const nameToLineMap: Record<string, number> = {};
  const missedLines: number[] = [];

  for (const entry of record.split(ENTRY_SEPARATOR)) {
    if (entry.length === 0) {
      continue;
    } else if (entry.startsWith('BRDA:')) {
      parse_BRDA(entry, fileCoverage);
    } else if (entry.startsWith('DA:')) {
      parse_DA(entry, fileCoverage, missedLines);
    } else if (entry.startsWith('FNDA:')) {
      parse_FNDA(entry, fileCoverage, nameToLineMap);
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
      parse_FN(entry, fileCoverage, nameToLineMap);
    } else {
      context.display.warn(`Unrecognized entry in lcov info: ${entry}`);
    }
  }

  calculatePercentages(fileCoverage.coverage);

  fileCoverage.missedLinesHtml = toRanges(missedLines);

  return fileCoverage;
}

// FN:{line number},{function name}
function parse_FN(entry: string, fileCoverage: FileCoverage, nameToLineMap: Record<string, number>): void {
  used(fileCoverage);
  const parts: string[] = entry.split(':')[1].split(',');
  nameToLineMap[parts[1]] = toNumber(parts[0]);
}

// BRDA:{line number},{block number},{branch number},{taken}
function parse_BRDA(entry: string, fileCoverage: FileCoverage): void {
  const parts: string[] = entry.split(':')[1].split(',');
  const hits: string = parts[3];
  if (hits === '0' || hits === '-') {
    fileCoverage.missedBranchesHtml += `line ${Number(parts[0])}, block ${Number(parts[1])}${HTML_LINE_BREAK}`;
  }
}

//FNDA:{execution count},{function name}
function parse_FNDA(entry: string, fileCoverage: FileCoverage, nameToLineMap: Record<string, number>): void {
  const parts: string[] = entry.split(':')[1].split(',');
  const hits: number = toNumber(parts[0]);
  const name: string = parts[1];
  if (hits === 0) {
    fileCoverage.missedFunctionsHtml += `${escapeHtml(name)} @ ${nameToLineMap[name] ?? 'UNKNOWN LINE'}${HTML_LINE_BREAK}`;
  }
}

// DA:{line number},{execution count}
function parse_DA(entry: string, fileCoverage: FileCoverage, missedLines: number[]): void {
  used(fileCoverage);
  const parts: string[] = entry.split(':')[1].split(',');
  const lineNumber: number = toNumber(parts[0]);
  const hits: number = toNumber(parts[1]);
  if (hits === 0) {
    missedLines.push(lineNumber);
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
    file: 'unknown',
    missedLinesHtml: '',
    missedFunctionsHtml: '',
    missedBranchesHtml: ''
  };
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
  const uniqueFolders = Array.from(new Set(analysis.files.map(f => f.folder))).sort();

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
    return generateSummaryRow(context, folder, calculateFolderCoverage(analysis.files, folder));
  }).join("")}
    </tbody>
  </table>`
}

function generateSummaryRow(context: Context, label: string, coverage: Coverage): string {
  const averagePercent: number = average(coverage);
  return `
  <tr>
    ${generateLabelCell(context, escapeHtml(label), averagePercent, Internal.formatPercent(averagePercent))}
    ${generatePercentCell(context, averagePercent, "")}
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

function calculateFolderCoverage(files: FileCoverage[], folder: string): Coverage {
  const folderCoverage: Coverage = newCoverage();
  files
    .filter(f => f.folder === folder)
    .forEach(f => tally(folderCoverage, f.coverage));

  calculatePercentages(folderCoverage);
  return folderCoverage;
}

function average(coverage: Coverage): number {
  const totalPercent: number = coverage.lines.percent + coverage.functions.percent + coverage.branches.percent;
  return totalPercent / 3;
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
  const folderCoverage: Coverage = analysis.folders.get(fileCoverage.folder)?.coverage ?? newCoverage();
  const averagePercent: number = average(fileCoverage.coverage);
  return `
  <tr>
    ${generateLabelCell(context, escapeHtml(fileCoverage.file), averagePercent, Internal.formatPercent(averagePercent))}
    ${generateLabelCell(context, escapeHtml(fileCoverage.folder), average(folderCoverage), Internal.formatPercent(average(folderCoverage)))}
    ${generatePercentCell(context, averagePercent, "")}
    ${generatePercentCell(context, fileCoverage.coverage.lines.percent, fileCoverage.missedLinesHtml)}
    ${generatePercentCell(context, fileCoverage.coverage.functions.percent, fileCoverage.missedFunctionsHtml)}
    ${generatePercentCell(context, fileCoverage.coverage.branches.percent, fileCoverage.missedBranchesHtml)}
  </tr>`;
}

