import path from 'path';
import type { ProjectContext, GeneratorResult } from '../types.js';
import { renderTemplate } from '../utils/template.js';
import { writeFileSafe, fileExists, readFile } from '../utils/fs.js';
import { mergeSections } from '../utils/merge.js';

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

  // CLAUDE.md (with sectional merge on update)
  try {
    const content = await renderTemplate('root/CLAUDE.md.ejs', templateData);
    const outputPath = path.join(ctx.targetDir, '.claude/CLAUDE.md');

    const exists = await fileExists(outputPath);

    if (exists && overwrite) {
      // Sectional merge: update framework sections, preserve user sections
      const existingContent = await readFile(outputPath);
      const merged = mergeSections(existingContent, content);
      await writeFileSafe(outputPath, merged, true);
      result.filesCreated.push(outputPath);
    } else {
      // Normal: create or skip
      const status = await writeFileSafe(outputPath, content, overwrite);
      if (status === 'skipped') {
        result.filesSkipped.push(outputPath);
      } else {
        result.filesCreated.push(outputPath);
      }
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
