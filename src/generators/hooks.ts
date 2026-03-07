import path from 'path';
import type { ProjectContext, GeneratorResult } from '../types.js';
import { renderTemplate } from '../utils/template.js';
import { writeFileSafe, makeExecutable } from '../utils/fs.js';

export async function generateHooks(
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

  try {
    const content = await renderTemplate('hooks/protect-docs.sh.ejs', templateData);
    const outputPath = path.join(ctx.targetDir, '.claude/hooks/protect-docs.sh');
    const status = await writeFileSafe(outputPath, content, overwrite);

    if (status === 'skipped') {
      result.filesSkipped.push(outputPath);
    } else {
      result.filesCreated.push(outputPath);
      await makeExecutable(outputPath);
    }
  } catch (err) {
    result.errors.push(`Hook protect-docs.sh: ${err}`);
  }

  return result;
}
