import path from 'path';
import type { ProjectContext, GeneratorResult } from '../types.js';
import { renderTemplate } from '../utils/template.js';
import { writeFileSafe } from '../utils/fs.js';

const MEMORY_FILES = [
  'active-context.md',
  'progress.md',
  'project-brief.md',
  'decisions.md',
  'tech-stack.md',
  'tech-debt.md',
  'patterns.md',
  'troubleshooting.md',
  'checkpoint.yml',
];

export async function generateMemoryBank(
  ctx: ProjectContext,
  overwrite: boolean
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    filesCreated: [],
    filesSkipped: [],
    errors: [],
  };

  const templateData = {
    ...ctx,
    defaultBranch: 'main',
  };

  for (const file of MEMORY_FILES) {
    try {
      const content = await renderTemplate(`memory/${file}.ejs`, templateData);
      const outputPath = path.join(ctx.targetDir, 'dev-infra/memory', file);
      const status = await writeFileSafe(outputPath, content, overwrite);

      if (status === 'skipped') {
        result.filesSkipped.push(outputPath);
      } else {
        result.filesCreated.push(outputPath);
      }
    } catch (err) {
      result.errors.push(`Memory ${file}: ${err}`);
    }
  }

  return result;
}
