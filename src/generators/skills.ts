import path from 'path';
import type { ProjectContext, GeneratorResult } from '../types.js';
import { renderTemplate } from '../utils/template.js';
import { writeFileSafe } from '../utils/fs.js';

const SKILLS = [
  'start-session',
  'end-session',
  'take-task',
  'complete-task',
  'status',
  'plan',
  'review',
];

export async function generateSkills(
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

  for (const skill of SKILLS) {
    try {
      const content = await renderTemplate(
        `skills/core/${skill}/SKILL.md.ejs`,
        templateData
      );
      const outputPath = path.join(ctx.targetDir, `.claude/skills/${skill}`, 'SKILL.md');
      const status = await writeFileSafe(outputPath, content, overwrite);

      if (status === 'skipped') {
        result.filesSkipped.push(outputPath);
      } else {
        result.filesCreated.push(outputPath);
      }
    } catch (err) {
      result.errors.push(`Skill ${skill}: ${err}`);
    }
  }

  return result;
}
