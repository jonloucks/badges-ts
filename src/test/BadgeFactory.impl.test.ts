import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { Badge, Config as BadgeConfig } from "@jonloucks/badges-ts/api/Badge";
import { BadgeFactory } from "@jonloucks/badges-ts/api/BadgeFactory";
import { Display, Flags } from "@jonloucks/badges-ts/api/Types";
import { create } from "../impl/BadgeFactory.impl";

describe('BadgeFactory.impl tests', () => {
  let badgeFactory: BadgeFactory;
  let baseDir: string;
  let templatePath: string;
  let outputPath: string;

  const mockDisplay: Display = {
    trace: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    dry: jest.fn()
  };

  const mockFlags: Flags = {
    dryRun: false,
    quiet: false,
    trace: false,
    warn: false,
    verbose: false
  };

  const makeTempDir = (): string => mkdtempSync(join(tmpdir(), 'badge-factory-'));

  const writeTemplate = (path: string, content: string = '<svg>{{LABEL}}-{{VALUE}}-{{COLOR}}</svg>'): void => {
    writeFileSync(path, content, 'utf8');
  };

  beforeEach(() => {
    jest.clearAllMocks();
    badgeFactory = create();
    baseDir = makeTempDir();
    templatePath = join(baseDir, 'template.svg');
    outputPath = join(baseDir, 'output.svg');
  });

  afterEach(() => {
    if (existsSync(baseDir)) {
      rmSync(baseDir, { recursive: true, force: true });
    }
  });

  describe('createBadge', () => {
    it('should create a badge with all placeholders replaced', async () => {
      writeTemplate(templatePath);

      const config: BadgeConfig = {
        name: 'test-badge',
        templatePath,
        outputPath,
        label: 'coverage',
        value: '95%',
        color: '#4bc124',
        flags: mockFlags,
        display: mockDisplay
      };

      const badge: Badge = await badgeFactory.createBadge(config);

      expect(badge.name).toBe('test-badge');
      expect(badge.outputPath).toBe(outputPath);
      expect(existsSync(outputPath)).toBe(true);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toBe('<svg>coverage-95%-#4bc124</svg>');
    });

    it('should handle badges with spaces in label and value', async () => {
      writeTemplate(templatePath);

      const config: BadgeConfig = {
        name: 'npm-badge',
        templatePath,
        outputPath,
        label: '  npm  ',
        value: '1.0.0',
        color: 'blue',
        flags: mockFlags,
        display: mockDisplay
      };

      await badgeFactory.createBadge(config);

      expect(existsSync(outputPath)).toBe(true);
      const content = readFileSync(outputPath, 'utf8');
      expect(content).toBe('<svg>  npm  -1.0.0-blue</svg>');
    });

    it('should preserve unknown placeholders in template', async () => {
      const template = '<svg>{{LABEL}}-{{VALUE}}-{{COLOR}}-{{UNKNOWN}}</svg>';
      writeTemplate(templatePath, template);

      const config: BadgeConfig = {
        name: 'test',
        templatePath,
        outputPath,
        label: 'test',
        value: '100',
        color: 'green',
        flags: mockFlags,
        display: mockDisplay
      };

      await badgeFactory.createBadge(config);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toBe('<svg>test-100-green-{{UNKNOWN}}</svg>');
    });

    it('should handle placeholders with extra whitespace', async () => {
      const template = '<svg>{{ LABEL }}-{{ VALUE }}-{{ COLOR }}</svg>';
      writeTemplate(templatePath, template);

      const config: BadgeConfig = {
        name: 'test',
        templatePath,
        outputPath,
        label: 'coverage',
        value: '85%',
        color: 'yellow',
        flags: mockFlags,
        display: mockDisplay
      };

      await badgeFactory.createBadge(config);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toBe('<svg>coverage-85%-yellow</svg>');
    });

    it('should throw error when template path is undefined', async () => {
      const config: BadgeConfig = {
        name: 'test',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        templatePath: undefined as any,
        outputPath,
        label: 'test',
        value: '100',
        color: 'green',
        flags: mockFlags,
        display: mockDisplay
      };

      await expect(badgeFactory.createBadge(config)).rejects.toThrow(
        'Badge template path is required for badge generation.'
      );
    });

    it('should throw error when template file does not exist', async () => {
      const nonExistentPath = join(baseDir, 'nonexistent.svg');

      const config: BadgeConfig = {
        name: 'test',
        templatePath: nonExistentPath,
        outputPath,
        label: 'test',
        value: '100',
        color: 'green',
        flags: mockFlags,
        display: mockDisplay
      };

      await expect(badgeFactory.createBadge(config)).rejects.toThrow();
    });

    it('should create badge with complex template', async () => {
      const complexTemplate = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20">
  <rect fill="{{COLOR}}" width="120" height="20"/>
  <text x="10" y="15">{{LABEL}}: {{VALUE}}</text>
</svg>`;
      writeTemplate(templatePath, complexTemplate);

      const config: BadgeConfig = {
        name: 'complex',
        templatePath,
        outputPath,
        label: 'build',
        value: 'passing',
        color: 'brightgreen',
        flags: mockFlags,
        display: mockDisplay
      };

      await badgeFactory.createBadge(config);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toContain('fill="brightgreen"');
      expect(content).toContain('build: passing');
    });

    it('should handle numeric values', async () => {
      writeTemplate(templatePath);

      const config: BadgeConfig = {
        name: 'test',
        templatePath,
        outputPath,
        label: 'tests',
        value: '42',
        color: 'blue',
        flags: mockFlags,
        display: mockDisplay
      };

      await badgeFactory.createBadge(config);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toBe('<svg>tests-42-blue</svg>');
    });

    it('should overwrite existing badge file', async () => {
      writeTemplate(templatePath);
      writeFileSync(outputPath, 'old content', 'utf8');

      const config: BadgeConfig = {
        name: 'test',
        templatePath,
        outputPath,
        label: 'new',
        value: 'badge',
        color: 'red',
        flags: mockFlags,
        display: mockDisplay
      };

      await badgeFactory.createBadge(config);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toBe('<svg>new-badge-red</svg>');
      expect(content).not.toContain('old content');
    });

    it('should skip writing badge in dry-run mode', async () => {
      writeTemplate(templatePath);

      const dryFlags: Flags = { ...mockFlags, dryRun: true };
      const config: BadgeConfig = {
        name: 'dry-run',
        templatePath,
        outputPath,
        label: 'dry',
        value: 'run',
        color: 'gray',
        flags: dryFlags,
        display: mockDisplay
      };

      await badgeFactory.createBadge(config);

      expect(existsSync(outputPath)).toBe(false);
      expect(mockDisplay.dry).toHaveBeenCalledWith(`Skipping writing badge to ${outputPath}`);
      expect(mockDisplay.dry).toHaveBeenCalledWith('<svg>dry-run-gray</svg>');
    });

    it('should throw error when output path cannot be written', async () => {
      writeTemplate(templatePath);

      const badOutputPath = join(baseDir, 'missing-dir', 'output.svg');
      const config: BadgeConfig = {
        name: 'write-error',
        templatePath,
        outputPath: badOutputPath,
        label: 'write',
        value: 'fail',
        color: 'red',
        flags: mockFlags,
        display: mockDisplay
      };

      await expect(badgeFactory.createBadge(config)).rejects.toThrow();
    });
  });
});
