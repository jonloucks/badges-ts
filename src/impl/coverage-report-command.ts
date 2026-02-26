import { getLcovInfoPath, getCoverageReportFolder } from "@jonloucks/badges-ts/api/Variances";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { Internal } from "./Internal.impl.js";

export const COMMAND: Command<void> = {
  execute: async function (context: Context): Promise<void> {
    context.display.trace(`Running discover with: ${context.arguments.join(' ')}`);
    const lcovPath: string = getLcovInfoPath(context);
    const { totals, files } = parseLcovInfo(lcovPath);
    const html: string = generateHtmlReport(context, totals, files);
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
  folder: string;
  file: string;
  lines: number;
  functions: number;
  branches: number;
  missedBranches: string;
  missedLines: string;
  missedFunctions: string;
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
    if (rec.length === 0 || (rec.length === 1 && rec[0] === '\n')) {
      continue;
    }
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

    let folder: string;
    let fileName: string;

    if (file.lastIndexOf('/') > -1) {
      folder = file.substring(0, file.lastIndexOf('/'));
      fileName = file.substring(file.lastIndexOf('/') + 1);
    } else {
      folder = '';
      fileName = file;
    }

    files.push({
      folder: folder,
      file: fileName,
      lines: percent(lh, lf),
      functions: percent(fnh, fnf),
      branches: percent(brh, brf),
      missedLines: lh !== lf ? parseMissedLines(rec) : '',
      missedFunctions: fnh !== fnf ? parseMissedFunctions(rec) : '',
      missedBranches: brh !== brf ? parseMissedBranches(rec) : ''
    });
  }
  return { totals, files };
}

function parseMissedLines(rec: string): string {
  const missedLines: number[] = rec.split('\n')
    .filter(line => line.startsWith('DA:') && line.endsWith(',0'))
    .map(line => Number(line.split(':')[1].split(',')[0]));
  return toRanges(missedLines);
}

function toRanges(lines: number[]): string {
  const ranges: string[] = [];
  let rangeStart: number | null = null;
  let previousLine: number | null = null;

  for (const line of lines) {
    if (rangeStart === null) {
      rangeStart = line;
    } else if (previousLine !== null && line === previousLine + 1) {
      // Continue the range
    } else {
      // End the previous range and start a new one
      if (rangeStart !== null) {
        ranges.push(rangeStart === previousLine ? `${rangeStart}` : `${rangeStart}-${previousLine}`);
      }
      rangeStart = line;
    }
    previousLine = line;
  }

  // Handle the last range if it exists
  if (rangeStart !== null && previousLine !== null) {
    ranges.push(rangeStart === previousLine ? `${rangeStart}` : `${rangeStart}-${previousLine}`);
  }
  return ranges.join('</br>');
}

//FN:26,anonymous_7
//FNDA:0,anonymous_7 <-- MISSED FUNCTION
function parseMissedFunctions(rec: string): string {
  const nameToLineMap: Record<string, string> = {};
  rec.split('\n').forEach(line => {
    if (line.startsWith('FN:')) {
      const parts = line.split(':')[1].split(',');
      const lineNum = parts[0];
      const funcName = parts[1];
      nameToLineMap[funcName] = lineNum;
    }
  });
  function lineForFunction(funcName: string): string {
    return funcName + " @ " + (nameToLineMap[funcName] ?? '?');
  }
  const fnNotFound: string = 'FNDA:0,';
  return rec.split('\n')
    .filter(line => line.startsWith(fnNotFound))
    .map(line => lineForFunction(line.substring(fnNotFound.length).trim()))
    .join('</br>');
}

function parseMissedBranches(rec: string): string {
  const missedBranches: number[] = rec.split('\n')
    .filter(line => line.startsWith('BRDA:') && (line.endsWith(',0') || line.endsWith(',-')))
    .map(line => Number(line.split(':')[1].split(',')[0]));
  return toRanges(missedBranches);
}

function generateHtmlReport(context: Context, totals: CoverageCategory, files: FileCoverage[]): string {
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
      top: 0;
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
  ${generateSummaryTable(context, totals, files)}
  ${generateTablePerFile(context, files)}
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

function generateCell(context: Context, percent: number, tooltipContent: string): string {
  return `
    <td class="tooltip-cell" style="color: white; background-color: ${Internal.colorFromPercentComplete(context, percent)}">
      ${Internal.formatPercent(percent)}
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

function generateSummaryTable(context: Context, totals: CoverageCategory, files: FileCoverage[]): string {
  const uniqueFolders = Array.from(new Set(files.map(f => f.folder))).sort();

  return `<h2>Summary</h2>
  <table id="summaryTable" width="400px">
    <thead>
      <tr>
        <th>Category</th>
        <th style="width: 120px;">Lines</th>
        <th style="width: 120px;">Functions</th>
        <th style="width: 120px;">Branches</th>
      </tr>
    </thead>
    <tbody>
        <tr>
         <td>All Files</td>
          ${generateCell(context, percent(totals.lines.hit, totals.lines.found), "")}
          ${generateCell(context, percent(totals.functions.hit, totals.functions.found), "")}
          ${generateCell(context, percent(totals.branches.hit, totals.branches.found), "")}
        </tr>
              ${uniqueFolders.map(folder => {
    const folderCov = folderCoverage(files, folder);
    return `
        <tr>
          <td>${folder}</td>
          ${generateCell(context, folderCov.lines, "")}
          ${generateCell(context, folderCov.functions, "")}
          ${generateCell(context, folderCov.branches, "")}
        </tr>
      `}).join("")}
    </tbody>
  </table>`
}

function folderCoverage(files: FileCoverage[], folder: string): { lines: number; functions: number; branches: number } {
  const folderFiles = files.filter(f => f.folder === folder);
  const totalLines = folderFiles.reduce((sum, f) => sum + f.lines, 0);
  const totalFunctions = folderFiles.reduce((sum, f) => sum + f.functions, 0);
  const totalBranches = folderFiles.reduce((sum, f) => sum + f.branches, 0);
  return { lines: totalLines / folderFiles.length, functions: totalFunctions / folderFiles.length, branches: totalBranches / folderFiles.length };
}

function generateTablePerFile(context: Context, files: FileCoverage[]) {
  return `<h2>Coverage Per File</h2>
  <table id="perFileTable">
    <thead>
      <tr>
        <th>File</th>
        <th>Folder</th>
        <th style="width: 120px;">Lines</th>
        <th style="width: 120px;">Functions</th>
        <th style="width: 120px;">Branches</th>
      </tr>
    </thead>
    <tbody>
      ${files.map(f => `
        <tr>
          <td>${f.file}</td>
          <td>${f.folder}</td>
          ${generateCell(context, f.lines, f.missedLines)}
          ${generateCell(context, f.functions, f.missedFunctions)}
          ${generateCell(context, f.branches, f.missedBranches)}
        </tr>
      `).join("")}
    </tbody>
  </table>`
}

