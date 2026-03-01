import path from 'path';
import type { ProjectContext, GeneratorResult } from '../types.js';
import { renderTemplate } from '../utils/template.js';
import { writeFileSafe } from '../utils/fs.js';

export async function generateClaudeMd(
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

  // CLAUDE.md
  try {
    const content = await renderTemplate('root/CLAUDE.md.ejs', templateData);
    const outputPath = path.join(ctx.targetDir, '.claude/CLAUDE.md');
    const status = await writeFileSafe(outputPath, content, overwrite);

    if (status === 'skipped') {
      result.filesSkipped.push(outputPath);
    } else {
      result.filesCreated.push(outputPath);
    }
  } catch (err) {
    result.errors.push(`CLAUDE.md: ${err}`);
  }

  // settings.json
  try {
    const content = await renderTemplate('root/settings.json.ejs', templateData);
    const outputPath = path.join(ctx.targetDir, '.claude/settings.json');
    const status = await writeFileSafe(outputPath, content, overwrite);

    if (status === 'skipped') {
      result.filesSkipped.push(outputPath);
    } else {
      result.filesCreated.push(outputPath);
    }
  } catch (err) {
    result.errors.push(`settings.json: ${err}`);
  }

  return result;
}
