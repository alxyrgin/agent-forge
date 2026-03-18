import path from 'path';
import type { ProjectContext, GeneratorResult } from '../types.js';
import { renderTemplate } from '../utils/template.js';
import { writeFileSafe } from '../utils/fs.js';

const RULES = [
  'commit-conventions',
  'development-cycle',
  'testing-standards',
  'shared-resources',
  'context-loading',
  'agent-output-format',
  'quality-gates',
  'rollback-protocol',
  'linear-sync',
];

export async function generateRules(
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

  for (const rule of RULES) {
    try {
      const content = await renderTemplate(`rules/${rule}.md.ejs`, templateData);
      const outputPath = path.join(ctx.targetDir, '.claude/rules', `${rule}.md`);
      const status = await writeFileSafe(outputPath, content, overwrite);

      if (status === 'skipped') {
        result.filesSkipped.push(outputPath);
      } else {
        result.filesCreated.push(outputPath);
      }
    } catch (err) {
      result.errors.push(`Rule ${rule}: ${err}`);
    }
  }

  return result;
}
