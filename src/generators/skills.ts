import path from 'path';
import type { ProjectContext, GeneratorResult, AgentPreset } from '../types.js';
import { renderTemplate } from '../utils/template.js';
import { writeFileSafe } from '../utils/fs.js';

const CORE_SKILLS = [
  'start-session',
  'end-session',
  'take-task',
  'complete-task',
  'status',
  'plan',
  'review',
  'code',
  'test',
  'done',
];

const EXTRA_SKILLS = [
  'interview',
  'audit-wave',
  'write-report',
  'dashboard',
  'skill-master',
  'decompose',
  'feature',
  'security',
  'spec',
  'techspec',
  'prompts',
  'sync-linear',
];

function getSkillList(preset: AgentPreset): { name: string; dir: string }[] {
  const skills: { name: string; dir: string }[] = [];

  for (const name of CORE_SKILLS) {
    skills.push({ name, dir: 'core' });
  }

  if (preset === 'full') {
    for (const name of EXTRA_SKILLS) {
      skills.push({ name, dir: 'extra' });
    }
  }

  return skills;
}

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

  const skills = getSkillList(ctx.agentPreset);

  for (const skill of skills) {
    try {
      const content = await renderTemplate(
        `skills/${skill.dir}/${skill.name}/SKILL.md.ejs`,
        templateData
      );
      const outputPath = path.join(ctx.targetDir, `.claude/skills/${skill.name}`, 'SKILL.md');
      const status = await writeFileSafe(outputPath, content, overwrite);

      if (status === 'skipped') {
        result.filesSkipped.push(outputPath);
      } else {
        result.filesCreated.push(outputPath);
      }
    } catch (err) {
      result.errors.push(`Skill ${skill.name}: ${err}`);
    }
  }

  return result;
}
