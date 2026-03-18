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

  // linear-mapping.json
  try {
    const content = await renderTemplate('config/linear-mapping.json.ejs', templateData);
    const outputPath = path.join(ctx.targetDir, 'dev-infra/config/linear-mapping.json');
    const status = await writeFileSafe(outputPath, content, overwrite);

    if (status === 'skipped') {
      result.filesSkipped.push(outputPath);
    } else {
      result.filesCreated.push(outputPath);
    }
  } catch (err) {
    result.errors.push(`linear-mapping.json: ${err}`);
  }

  // Create empty directories with .gitkeep
  const dirs = [
    'dev-infra/sessions',
    'dev-infra/tests/acceptance',
    'dev-infra/tests/pmi',
    'dev-infra/tests/results',
    'dev-infra/config',
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
    const manifest = buildManifest(ctx);

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

export interface ForgeManifest {
  version: string;
  createdAt: string;
  updatedAt: string;
  projectName: string;
  projectDescription: string;
  agentPreset: string;
  language: string;
  stack: string;
  framework: string;
  testFramework: string;
  testCommand: string;
  srcDir: string;
  testDir: string;
  commitStyle: string;
  expectedFiles: string[];
}

export function buildManifest(ctx: ProjectContext): ForgeManifest {
  return {
    version: '3.2.0',
    createdAt: ctx.today,
    updatedAt: ctx.today,
    projectName: ctx.projectName,
    projectDescription: ctx.projectDescription,
    language: ctx.language,
    agentPreset: ctx.agentPreset,
    stack: ctx.stack,
    framework: ctx.framework,
    testFramework: ctx.testFramework,
    testCommand: ctx.testCommand,
    srcDir: ctx.srcDir,
    testDir: ctx.testDir,
    commitStyle: ctx.commitStyle,
    expectedFiles: getExpectedFiles(ctx),
  };
}

export function getExpectedFiles(ctx: ProjectContext): string[] {
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
    'dev-infra/memory/checkpoint.yml',
    'dev-infra/config/linear-mapping.json',
  ];

  // Hooks
  files.push('.claude/hooks/protect-docs.sh');

  // Rules (8 total)
  files.push(
    '.claude/rules/commit-conventions.md',
    '.claude/rules/development-cycle.md',
    '.claude/rules/testing-standards.md',
    '.claude/rules/shared-resources.md',
    '.claude/rules/context-loading.md',
    '.claude/rules/agent-output-format.md',
    '.claude/rules/quality-gates.md',
    '.claude/rules/rollback-protocol.md',
    '.claude/rules/linear-sync.md',
  );

  // Skills (10 core + 11 extra for full)
  const coreSkills = [
    'start-session', 'end-session', 'take-task',
    'complete-task', 'status', 'plan', 'review',
    'code', 'test', 'done',
  ];
  const extraSkills = [
    'interview', 'audit-wave', 'write-report', 'dashboard', 'skill-master',
    'decompose', 'feature', 'security', 'spec', 'techspec', 'prompts', 'sync-linear',
  ];
  const skills = ctx.agentPreset === 'full'
    ? [...coreSkills, ...extraSkills]
    : coreSkills;
  for (const skill of skills) {
    files.push(`.claude/skills/${skill}/SKILL.md`);
  }

  // Agents depend on preset
  const pipelineAgents = [
    'analyst', 'architect', 'skeptic', 'developer',
    'tester', 'inspector', 'reviewer', 'planner',
  ];
  const planningAgents = ['researcher', 'validator', 'interviewer', 'decomposer'];
  const securityAgents = ['auditor', 'prompter', 'deployer', 'scaffolder'];
  const documentationAgents = ['librarian', 'writer', 'gatekeeper', 'verifier'];

  const minimalAgents = ['analyst', 'developer', 'tester', 'reviewer', 'inspector'];

  const coreAgents = [...pipelineAgents];
  const fullAgents = [
    ...pipelineAgents,
    ...planningAgents,
    ...securityAgents,
    ...documentationAgents,
  ];

  const agents = ctx.agentPreset === 'minimal'
    ? minimalAgents
    : ctx.agentPreset === 'full'
    ? fullAgents
    : coreAgents;

  for (const agent of agents) {
    files.push(`.claude/agents/${agent}.md`);
  }

  return files;
}
