import { Project } from "@jonloucks/badges-ts/api/Project";
import { fileDoesNotExist } from "@jonloucks/badges-ts/auxiliary/Checks";
import { CONTRACT as DISCOVER_PROJECT, DiscoverProject } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { CONTRACTS } from "@jonloucks/contracts-ts";
import { Command, Context } from "@jonloucks/badges-ts/auxiliary/Command";

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { KIT_PROJECT_FOLDER, KIT_RELEASE_NOTES_OUTPUT_FOLDER, KIT_RELEASE_NOTES_TEMPLATE_PATH, KIT_VERSION_TS_PATH } from "@jonloucks/badges-ts/api/Variances";

const COMMAND_NAME: string = 'apply-version';

export const COMMAND: Command<Project> = {
  execute: async function (context: Context): Promise<Project> {

    return applyVersion(context).then((project) => {
      context.display.info(`${COMMAND_NAME} completed: ${project.name} v${project.version}`);
      return project;
    })
      .catch((error: Error) => {
        context.display.error(`Error during ${COMMAND_NAME}: ${error.message}`);
        throw error;
      });
  }
};

async function applyVersion(context: Context): Promise<Project> {
  const discoverProject: DiscoverProject = CONTRACTS.enforce(DISCOVER_PROJECT);
  return await discoverProject.discoverProject(context)
    .then((project: Project) => {
      applyProjectVersion(context, project);
      return project;
    });
}

function applyProjectVersion(context: Context, project: Project): void {
  createVersionTs(context, project);
  createReleaseNotesFromTemplate(context, project);
  context.display.info(`Applied version ${project.version} for package ${project.name}`);
}

function createReleaseNotesFromTemplate(context: Context, project: Project): void {
  const templatePath: string = getReleaseNotesTemplatePath(context);
  const outputPath: string = resolve(getReleaseNotesOutputFolder(context), `release-notes-v${project.version}.md`);
  if (fileDoesNotExist(templatePath)) {
    const message = `Release notes template not found at ${templatePath}`;
    context.display.warn(message);
    return;
  }
  if (fileDoesNotExist(outputPath)) {
    const templateContent: string = readFileSync(templatePath, 'utf8');
    const releaseNotesContent: string = templateContent
      .replace(/{{\s*NAME\s*}}/g, project.name)
      .replace(/{{\s*VERSION\s*}}/g, project.version)
      .replace(/{{\s*REPOSITORY\s*}}/g, project.repository ?? "");
    if (context.flags.dryRun) {
      context.display.dry("Dry run enabled - not writing release notes file");
      context.display.dry(releaseNotesContent);
      return;
    }
    writeFileSync(outputPath, releaseNotesContent, 'utf8');
    context.display.info(`Created release notes at ${outputPath}`);
  } else {
    context.display.info(`Release notes for version ${project.version} already exist at ${outputPath}`);
  }
}

function createVersionTs(context: Context, project: Project): void {

  const text: string = `// generated file - do not edit
export const NAME: string = ${JSON.stringify(project.name)};
export const VERSION: string = ${JSON.stringify(project.version)};`;

  if (context.flags.dryRun) {
    context.display.dry("Dry run enabled - not writing version.ts file");
    context.display.dry(text);
    return;
  }

  writeFileSync(getVersionTsPath(context), text, 'utf8');
}

function getProjectFolder(context: Context): string {
  return context.environment.getVariance(KIT_PROJECT_FOLDER);
}

function getVersionTsPath(context: Context): string {
  return resolve(getProjectFolder(context), 
    context.environment.getVariance(KIT_VERSION_TS_PATH));
}

function getReleaseNotesOutputFolder(context: Context): string {
  return resolve(getProjectFolder(context), 
    context.environment.getVariance(KIT_RELEASE_NOTES_OUTPUT_FOLDER));
}

function getReleaseNotesTemplatePath(context: Context): string {
  return resolve(getProjectFolder(context), 
    context.environment.getVariance(KIT_RELEASE_NOTES_TEMPLATE_PATH));
}
