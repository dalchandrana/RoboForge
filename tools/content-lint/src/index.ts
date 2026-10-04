import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import {
  validateLessonFrontmatter,
  validateQuiz,
  validatePath,
  validateModule,
  validateComponent,
  validateProject,
  validateKit,
} from '@roboforge/content-schema';

const CONTENT_ROOT = path.resolve(process.cwd(), 'content');

const HAZARD_KEYWORDS = [
  'battery',
  'batteries',
  'mains',
  'solder',
  'soldering',
  'heat',
  'burn',
  'motor',
  'short circuit',
];

interface LintIssue {
  file: string;
  type: 'error' | 'warning';
  message: string;
}

export function lintContentDirectory(rootDir: string): LintIssue[] {
  const issues: LintIssue[] = [];

  if (!fs.existsSync(rootDir)) {
    console.log(`[content:check] No content/ directory found at ${rootDir}`);
    return issues;
  }

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        if (entry.name.endsWith('.mdx')) {
          lintMdx(fullPath);
        } else if (entry.name === 'path.yaml') {
          lintPathYaml(fullPath);
        } else if (entry.name === 'module.yaml') {
          lintModuleYaml(fullPath);
        } else if (entry.name.endsWith('.yaml') && dir.includes('quizzes')) {
          lintQuizYaml(fullPath);
        } else if (entry.name.endsWith('.yaml') && dir.includes('components')) {
          lintComponentYaml(fullPath);
        } else if (entry.name.endsWith('.yaml') && dir.includes('projects')) {
          lintProjectYaml(fullPath);
        } else if (entry.name.endsWith('.yaml') && dir.includes('kits')) {
          lintKitYaml(fullPath);
        }
      }
    }
  }

  function lintMdx(filePath: string) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      issues.push({
        file: filePath,
        type: 'error',
        message: 'Missing YAML frontmatter block',
      });
      return;
    }

    let parsedFm: unknown;
    try {
      parsedFm = yaml.load(frontmatterMatch[1] ?? '');
    } catch (err: unknown) {
      issues.push({
        file: filePath,
        type: 'error',
        message: `Failed to parse YAML frontmatter: ${(err as Error).message}`,
      });
      return;
    }

    try {
      validateLessonFrontmatter(parsedFm);
    } catch (err: unknown) {
      issues.push({
        file: filePath,
        type: 'error',
        message: `Invalid lesson frontmatter: ${(err as Error).message}`,
      });
    }

    const body = raw.slice(frontmatterMatch[0].length);

    // Safety lint
    const lowerBody = body.toLowerCase();
    const hasHazard = HAZARD_KEYWORDS.some(k => lowerBody.includes(k));
    const hasSafetyCallout = /<Callout\s+[^>]*type=["']safety["']/.test(body);

    if (hasHazard && !hasSafetyCallout) {
      issues.push({
        file: filePath,
        type: 'error',
        message:
          'Safety lint failure: Content mentions hardware hazards (batteries, motors, heat, etc.) but lacks a <Callout type="safety"> block.',
      });
    }

    // Sentence length average check
    const sentences = body
      .replace(/<[^>]+>/g, '') // remove jsx
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    if (sentences.length > 0) {
      const totalWords = sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0);
      const avgWords = totalWords / sentences.length;
      if (avgWords > 22) {
        issues.push({
          file: filePath,
          type: 'warning',
          message: `High average sentence length (${avgWords.toFixed(1)} words/sentence). Aim for ≤ 15 words for school path.`,
        });
      }
    }
  }

  function lintPathYaml(filePath: string) {
    try {
      const data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
      validatePath(data);
    } catch (err: unknown) {
      issues.push({
        file: filePath,
        type: 'error',
        message: `Invalid path.yaml: ${(err as Error).message}`,
      });
    }
  }

  function lintModuleYaml(filePath: string) {
    try {
      const data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
      validateModule(data);
    } catch (err: unknown) {
      issues.push({
        file: filePath,
        type: 'error',
        message: `Invalid module.yaml: ${(err as Error).message}`,
      });
    }
  }

  function lintQuizYaml(filePath: string) {
    try {
      const data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
      validateQuiz(data);
    } catch (err: unknown) {
      issues.push({
        file: filePath,
        type: 'error',
        message: `Invalid quiz YAML: ${(err as Error).message}`,
      });
    }
  }

  function lintComponentYaml(filePath: string) {
    try {
      const data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
      validateComponent(data);
    } catch (err: unknown) {
      issues.push({
        file: filePath,
        type: 'error',
        message: `Invalid component YAML: ${(err as Error).message}`,
      });
    }
  }

  function lintProjectYaml(filePath: string) {
    try {
      const data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
      validateProject(data);
    } catch (err: unknown) {
      issues.push({
        file: filePath,
        type: 'error',
        message: `Invalid project YAML: ${(err as Error).message}`,
      });
    }
  }

  function lintKitYaml(filePath: string) {
    try {
      const data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
      validateKit(data);
    } catch (err: unknown) {
      issues.push({
        file: filePath,
        type: 'error',
        message: `Invalid kit YAML: ${(err as Error).message}`,
      });
    }
  }

  walk(rootDir);
  return issues;
}

export function run() {
  console.log(`[content:check] Scanning ${CONTENT_ROOT}...`);
  const issues = lintContentDirectory(CONTENT_ROOT);

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  for (const w of warnings) {
    console.warn(`⚠️  [WARN] ${path.relative(process.cwd(), w.file)}: ${w.message}`);
  }

  for (const e of errors) {
    console.error(`❌ [ERROR] ${path.relative(process.cwd(), e.file)}: ${e.message}`);
  }

  if (errors.length > 0) {
    console.error(`\n[content:check] Failed with ${errors.length} error(s).`);
    process.exit(1);
  }

  console.log(
    `[content:check] All content validated successfully! (${warnings.length} warning(s))`,
  );
}

// Run immediately if executed via CLI
if (process.argv[1]?.endsWith('content-lint/src/index.ts')) {
  run();
}
