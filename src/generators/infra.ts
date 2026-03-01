import path from 'path';
import type { ProjectContext, GeneratorResult } from '../types.js';
import { renderTemplate } from '../utils/template.js';
import { writeFileSafe, ensureDir } from '../utils/fs.js';

export async function generateInfra(
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

  // tasks.json
  try {
    const content = await renderTemplate('tasks/tasks.json.ejs', templateData);
    const outputPath = path.join(ctx.targetDir, 'dev-infra/tasks/tasks.json');
    const status = await writeFileSafe(outputPath, content, overwrite);

    if (status === 'skipped') {
      result.filesSkipped.push(outputPath);
    } else {
      result.filesCreated.push(outputPath);
    }
  } catch (err) {
    result.errors.push(`tasks.json: ${err}`);
  }

  // Create empty directories with .gitkeep
  const dirs = [
    'dev-infra/sessions',
    'dev-infra/tests/acceptance',
    'dev-infra/tests/pmi',
    'dev-infra/tests/results',
  ];

  for (const dir of dirs) {
    try {
      const dirPath = path.join(ctx.targetDir, dir);
      await ensureDir(dirPath);
      const gitkeepPath = path.join(dirPath, '.gitkeep');
      const status = await writeFileSafe(gitkeepPath, '', overwrite);

      if (status === 'skipped') {
        result.filesSkipped.push(gitkeepPath);
      } else {
        result.filesCreated.push(gitkeepPath);
      }
    } catch (err) {
      result.errors.push(`Dir ${dir}: ${err}`);
    }
  }

  // .claude-forge.json — manifest for doctor command
  try {
    const manifest = {
      version: '1.0.0',
      createdAt: ctx.today,
      projectName: ctx.projectName,
      agentPreset: ctx.agentPreset,
      language: ctx.language,
      expectedFiles: getExpectedFiles(ctx),
    };
    const outputPath = path.join(ctx.targetDir, '.claude-forge.json');
    const status = await writeFileSafe(
      outputPath,
      JSON.stringify(manifest, null, 2) + '\n',
      overwrite
    );

    if (status === 'skipped') {
      result.filesSkipped.push(outputPath);
    } else {
      result.filesCreated.push(outputPath);
    }
  } catch (err) {
    result.errors.push(`.claude-forge.json: ${err}`);
  }

  return result;
}

function getExpectedFiles(ctx: ProjectContext): string[] {
  const files = [
    '.claude/CLAUDE.md',
    '.claude/settings.json',
    '.claude-forge.json',
    'dev-infra/tasks/tasks.json',
    'dev-infra/memory/active-context.md',
    'dev-infra/memory/progress.md',
    'dev-infra/memory/project-brief.md',
    'dev-infra/memory/decisions.md',
    'dev-infra/memory/tech-stack.md',
    'dev-infra/memory/tech-debt.md',
    'dev-infra/memory/patterns.md',
    'dev-infra/memory/troubleshooting.md',
  ];

  // Rules
  files.push(
    '.claude/rules/commit-conventions.md',
    '.claude/rules/development-cycle.md',
    '.claude/rules/testing-standards.md',
  );

  // Skills
  const skills = [
    'start-session', 'end-session', 'take-task',
    'complete-task', 'status', 'plan', 'review',
  ];
  for (const skill of skills) {
    files.push(`.claude/skills/${skill}/SKILL.md`);
  }

  // Agents depend on preset
  const coreAgents = [
    'analyst', 'architect', 'developer', 'unit-tester',
    'reviewer', 'security-auditor', 'doc-writer', 'progress-tracker',
  ];
  const minimalAgents = ['analyst', 'developer', 'unit-tester', 'reviewer'];
  const extraAgents = ['planner', 'integration-tester', 'acceptance-tester'];

  const agents = ctx.agentPreset === 'minimal'
    ? minimalAgents
    : ctx.agentPreset === 'full'
    ? [...coreAgents, ...extraAgents]
    : coreAgents;

  for (const agent of agents) {
    files.push(`.claude/agents/${agent}.md`);
  }

  return files;
}
