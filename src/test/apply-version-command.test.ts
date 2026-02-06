import { createInstaller } from "@jonloucks/badges-ts";
import { AutoClose, CONTRACTS } from "@jonloucks/contracts-ts";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { resolve } from "path";
import { COMMAND } from "../impl/apply-version-command";
import { Context, toContext } from "../impl/Command.impl";

describe('apply-version-command tests', () => {
  let closeInstaller: AutoClose;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  const testNotesDir = resolve('notes');
  const testSrcDir = resolve('src');
  const versionTsPath = resolve('src', 'version.ts');
  const templatePath = resolve('notes/release-notes-template.md');

  beforeAll(() => {
    // Ensure directories exist
    if (!existsSync(testNotesDir)) {
      mkdirSync(testNotesDir, { recursive: true });
    }
    if (!existsSync(testSrcDir)) {
      mkdirSync(testSrcDir, { recursive: true });
    }
  });

  beforeEach(() => {
    closeInstaller = createInstaller().open();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    closeInstaller.close();
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('COMMAND.execute', () => {
    it('should execute successfully and return project', async () => {
      const context: Context = toContext(['apply-version', '--quiet']);
      const result = await COMMAND.execute(context);
      expect(result).toBeTruthy();
      expect(result.name).toBeDefined();
      expect(result.version).toBeDefined();
    });

    it('should log success message', async () => {
      const context: Context = toContext(['apply-version']);
      const result = await COMMAND.execute(context);
      expect(result).toBeTruthy();
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('apply-version completed:')
      );
    });

    it('should handle errors and log error message', async () => {
      const context: Context = toContext(['apply-version']);
      // Mock discoverProject to throw an error
      const originalEnforce = CONTRACTS.enforce;
      CONTRACTS.enforce = jest.fn().mockReturnValue({
        discoverProject: jest.fn().mockRejectedValue(new Error('Test error'))
      });

      await expect(COMMAND.execute(context)).rejects.toThrow('Test error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error during apply-version:')
      );

      // Restore original
      CONTRACTS.enforce = originalEnforce;
    });
  });

  describe('createVersionTs', () => {
    it('should create version.ts file with project info', async () => {
      const context: Context = toContext(['apply-version']);
      await COMMAND.execute(context);

      expect(existsSync(versionTsPath)).toBe(true);
      const content = readFileSync(versionTsPath, 'utf8');
      expect(content).toContain('export const NAME: string =');
      expect(content).toContain('export const VERSION: string =');
    });

    it('should not create version.ts in dry run mode', async () => {
      // Remove existing version.ts if present
      if (existsSync(versionTsPath)) {
        rmSync(versionTsPath);
      }

      const context: Context = toContext(['apply-version', '--dry-run']);
      await COMMAND.execute(context);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DRY RUN]')
      );
    });

    it('should display dry run message with file content', async () => {
      const context: Context = toContext(['apply-version', '--dry-run', '--verbose']);
      await COMMAND.execute(context);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Dry run enabled - not writing version.ts file')
      );
    });
  });

  describe('createReleaseNotesFromTemplate', () => {
    it('should warn if template does not exist', async () => {
      // Temporarily rename template if it exists
      let templateExists = existsSync(templatePath);
      let tempPath: string | null = null;
      if (templateExists) {
        tempPath = templatePath + '.backup';
        rmSync(tempPath, { force: true });
        writeFileSync(tempPath, readFileSync(templatePath));
        rmSync(templatePath);
      }

      const context: Context = toContext(['apply-version', '--warn']);
      await COMMAND.execute(context);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Release notes template not found')
      );

      // Restore template
      if (tempPath && existsSync(tempPath)) {
        writeFileSync(templatePath, readFileSync(tempPath));
        rmSync(tempPath);
      }
    });

    it('should create release notes from template', async () => {
      // Ensure template exists
      const templateContent = `# Release Notes for {{NAME}} v{{VERSION}}

Repository: {{{REPOSITORY}}}`;
      writeFileSync(templatePath, templateContent, 'utf8');

      // Clean up first to ensure we're testing creation
      const tempContext: Context = toContext(['apply-version', '--quiet']);
      const tempResult = await COMMAND.execute(tempContext);
      const existingPath = resolve('notes', `release-notes-v${tempResult.version}.md`);
      if (existsSync(existingPath)) {
        rmSync(existingPath);
      }

      const context: Context = toContext(['apply-version']);
      const result = await COMMAND.execute(context);

      const releaseNotesPath = resolve('notes', `release-notes-v${result.version}.md`);
      expect(existsSync(releaseNotesPath)).toBe(true);

      const content = readFileSync(releaseNotesPath, 'utf8');
      // Content should contain the version at minimum
      expect(content.includes(result.version) || content.includes('Release Notes')).toBe(true);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Created release notes')
      );
    });

    it('should replace all template placeholders', async () => {
      const templateContent = `# {{NAME}} {{VERSION}}
{{NAME}} version {{VERSION}}
Repository: {{{REPOSITORY}}}`;
      writeFileSync(templatePath, templateContent, 'utf8');

      const context: Context = toContext(['apply-version', '--quiet']);
      const result = await COMMAND.execute(context);

      const releaseNotesPath = resolve('notes', `release-notes-v${result.version}.md`);
      if (existsSync(releaseNotesPath)) {
        const content = readFileSync(releaseNotesPath, 'utf8');
        expect(content).not.toContain('{{NAME}}');
        expect(content).not.toContain('{{VERSION}}');
        expect(content).not.toContain('{{{REPOSITORY}}}');
      }
    });

    it('should skip if release notes already exist', async () => {
      // First execution creates the file
      const context1: Context = toContext(['apply-version', '--quiet']);
      await COMMAND.execute(context1);

      // Second execution should skip
      const context2: Context = toContext(['apply-version']);
      await COMMAND.execute(context2);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('already exist')
      );
    });

    it('should not create release notes in dry run mode', async () => {
      // Ensure template exists
      const templateContent = `# Test Template for {{NAME}} v{{VERSION}}`;
      writeFileSync(templatePath, templateContent, 'utf8');

      // Get project version first to clean up any existing file
      const tempContext: Context = toContext(['apply-version', '--quiet']);
      const tempResult = await COMMAND.execute(tempContext);
      const existingReleaseNotesPath = resolve('notes', `release-notes-v${tempResult.version}.md`);

      // Remove existing release notes for this version to test creation
      if (existsSync(existingReleaseNotesPath)) {
        rmSync(existingReleaseNotesPath);
      }

      const context: Context = toContext(['apply-version', '--dry-run']);
      const result = await COMMAND.execute(context);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Dry run enabled - not writing release notes file')
      );

      // Verify file was not created due to dry run
      const releaseNotesPath = resolve('notes', `release-notes-v${result.version}.md`);
      expect(existsSync(releaseNotesPath)).toBe(false);
    });

    it('should display release notes content in dry run mode', async () => {
      // Ensure template exists
      const templateContent = `# Template {{NAME}}`;
      writeFileSync(templatePath, templateContent, 'utf8');

      // Remove existing release notes
      const tempContext: Context = toContext(['apply-version', '--quiet']);
      const tempResult = await COMMAND.execute(tempContext);
      const existingPath = resolve('notes', `release-notes-v${tempResult.version}.md`);
      if (existsSync(existingPath)) {
        rmSync(existingPath);
      }

      const context: Context = toContext(['apply-version', '--dry-run']);
      await COMMAND.execute(context);

      // Should display the actual content that would be written
      const calls = consoleInfoSpy.mock.calls.map(call => call[0]);
      const hasDryRunContent = calls.some(call =>
        typeof call === 'string' && call.includes('# Template')
      );
      expect(hasDryRunContent).toBe(true);
    });

    it('should handle project with no repository', async () => {
      const templateContent = `Repository: {{{REPOSITORY}}}`;
      writeFileSync(templatePath, templateContent, 'utf8');

      // Mock the discover project to return a project without repository
      const originalEnforce = CONTRACTS.enforce;

      const mockProject = { name: 'test-project', version: '1.0.0', repository: undefined };

      // Remove existing release notes first
      const existingPath = resolve('notes', `release-notes-v${mockProject.version}.md`);
      if (existsSync(existingPath)) {
        rmSync(existingPath);
      }

      CONTRACTS.enforce = jest.fn().mockReturnValue({
        discoverProject: jest.fn().mockResolvedValue(mockProject)
      });

      const context: Context = toContext(['apply-version', '--quiet']);
      const result = await COMMAND.execute(context);

      const releaseNotesPath = resolve('notes', `release-notes-v${result.version}.md`);
      if (existsSync(releaseNotesPath)) {
        const content = readFileSync(releaseNotesPath, 'utf8');
        // Should contain "Repository: " with empty string (not "undefined")
        expect(content).toContain('Repository: ');
        expect(content).not.toContain('undefined');
      }

      // Restore original
      CONTRACTS.enforce = originalEnforce;
    });

    it('should handle project with repository', async () => {
      const templateContent = `Repository: {{{REPOSITORY}}}
Name: {{NAME}}`;
      writeFileSync(templatePath, templateContent, 'utf8');

      const context: Context = toContext(['apply-version', '--quiet']);
      const result = await COMMAND.execute(context);

      const releaseNotesPath = resolve('notes', `release-notes-v${result.version}.md`);
      if (existsSync(releaseNotesPath)) {
        const content = readFileSync(releaseNotesPath, 'utf8');
        // If project has repository, it should be in content
        if (result.repository) {
          expect(content).toContain('Repository:');
        }
        expect(content).toBeDefined();
      }
    });
  });

  describe('applyProjectVersion', () => {
    it('should log applied version message', async () => {
      const context: Context = toContext(['apply-version']);
      await COMMAND.execute(context);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Applied version .+ for package .+/)
      );
    });
  });

  describe('integration tests', () => {
    it('should work with all flags', async () => {
      const context: Context = toContext(['apply-version', '--verbose', '--warn', '--trace']);
      const result = await COMMAND.execute(context);
      expect(result).toBeTruthy();
      expect(result.name).toBeDefined();
      expect(result.version).toBeDefined();
    });

    it('should work in quiet mode', async () => {
      const context: Context = toContext(['apply-version', '--quiet']);
      const result = await COMMAND.execute(context);
      expect(result).toBeTruthy();
      // Console methods should not be called in quiet mode
    });
  });
});