import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import {
  validateLessonFrontmatter,
  validatePath,
  validateModule,
  validateQuiz,
  validateComponent,
  validateProject,
  validateKit,
  type LessonFrontmatter,
  type Path as PathType,
  type Module as ModuleType,
  type Quiz as QuizType,
  type Component as ComponentType,
  type Project as ProjectType,
  type Kit as KitType,
} from '@roboforge/content-schema';

export interface BundledLesson {
  frontmatter: LessonFrontmatter;
  rawMarkdown: string;
  quiz?: QuizType;
}

export interface ContentBundle {
  builtAt: string;
  paths: Record<string, PathType>;
  modules: Record<string, ModuleType>;
  lessons: Record<string, BundledLesson>;
  components: Record<string, ComponentType>;
  projects: Record<string, ProjectType>;
  kits: Record<string, KitType>;
}

export function buildContentBundle(contentDir: string): ContentBundle {
  const bundle: ContentBundle = {
    builtAt: new Date().toISOString(),
    paths: {},
    modules: {},
    lessons: {},
    components: {},
    projects: {},
    kits: {},
  };

  if (!fs.existsSync(contentDir)) {
    return bundle;
  }

  // Read paths
  const pathsDir = path.join(contentDir, 'paths');
  if (fs.existsSync(pathsDir)) {
    for (const pathFolder of fs.readdirSync(pathsDir)) {
      const pFolder = path.join(pathsDir, pathFolder);
      if (!fs.statSync(pFolder).isDirectory()) continue;

      const pathYamlFile = path.join(pFolder, 'path.yaml');
      if (fs.existsSync(pathYamlFile)) {
        const parsed = validatePath(yaml.load(fs.readFileSync(pathYamlFile, 'utf-8')));
        bundle.paths[parsed.id] = parsed;
      }

      // Read modules in path
      for (const modFolder of fs.readdirSync(pFolder)) {
        const mFolder = path.join(pFolder, modFolder);
        if (!fs.statSync(mFolder).isDirectory()) continue;

        const modYamlFile = path.join(mFolder, 'module.yaml');
        if (fs.existsSync(modYamlFile)) {
          const parsedMod = validateModule(yaml.load(fs.readFileSync(modYamlFile, 'utf-8')));
          bundle.modules[parsedMod.id] = parsedMod;
        }

        // Read quizzes
        const quizzesDir = path.join(mFolder, 'quizzes');
        const quizzesMap = new Map<string, QuizType>();
        if (fs.existsSync(quizzesDir)) {
          for (const qFile of fs.readdirSync(quizzesDir)) {
            if (qFile.endsWith('.yaml')) {
              const qData = validateQuiz(
                yaml.load(fs.readFileSync(path.join(quizzesDir, qFile), 'utf-8')),
              );
              quizzesMap.set(qData.id, qData);
            }
          }
        }

        // Read lessons
        for (const file of fs.readdirSync(mFolder)) {
          if (file.endsWith('.mdx')) {
            const raw = fs.readFileSync(path.join(mFolder, file), 'utf-8');
            const match = raw.match(/^---\n([\s\S]*?)\n---/);
            if (match && match[1]) {
              const fm = validateLessonFrontmatter(yaml.load(match[1]));
              const body = raw.slice(match[0].length).trim();

              // Check if matching quiz exists
              const expectedQuizId = `q-${fm.id}`;
              const quiz = quizzesMap.get(expectedQuizId);

              bundle.lessons[fm.id] = {
                frontmatter: fm,
                rawMarkdown: body,
                quiz,
              };
            }
          }
        }
      }
    }
  }

  // Read components
  const componentsDir = path.join(contentDir, 'components');
  if (fs.existsSync(componentsDir)) {
    for (const compFile of fs.readdirSync(componentsDir)) {
      if (compFile.endsWith('.yaml')) {
        const compData = validateComponent(
          yaml.load(fs.readFileSync(path.join(componentsDir, compFile), 'utf-8')),
        );
        bundle.components[compData.id] = compData;
      }
    }
  }

  // Read projects
  const projectsDir = path.join(contentDir, 'projects');
  if (fs.existsSync(projectsDir)) {
    for (const projFile of fs.readdirSync(projectsDir)) {
      if (projFile.endsWith('.yaml')) {
        const projData = validateProject(
          yaml.load(fs.readFileSync(path.join(projectsDir, projFile), 'utf-8')),
        );
        bundle.projects[projData.id] = projData;
      }
    }
  }

  // Read kits
  const kitsDir = path.join(contentDir, 'kits');
  if (fs.existsSync(kitsDir)) {
    for (const kitFile of fs.readdirSync(kitsDir)) {
      if (kitFile.endsWith('.yaml')) {
        const kitData = validateKit(
          yaml.load(fs.readFileSync(path.join(kitsDir, kitFile), 'utf-8')),
        );
        bundle.kits[kitData.id] = kitData;
      }
    }
  }

  return bundle;
}

export function run() {
  const contentDir = path.resolve(process.cwd(), 'content');
  const targetDir = path.resolve(process.cwd(), 'apps/desktop/src');
  const targetFile = path.join(targetDir, 'content-bundle.json');

  console.log(`[content:build] Building content bundle from ${contentDir}...`);
  const bundle = buildContentBundle(contentDir);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetFile, JSON.stringify(bundle, null, 2), 'utf-8');
  console.log(
    `[content:build] Bundle written to ${targetFile} (${Object.keys(bundle.lessons).length} lessons)`,
  );
}

if (process.argv[1]?.endsWith('content-build/src/index.ts')) {
  run();
}
