import path from 'path';
import type { ProjectContext, GeneratorResult, AgentPreset } from '../types.js';
import { renderTemplate } from '../utils/template.js';
import { writeFileSafe } from '../utils/fs.js';

// --- Agent categories ---

const PIPELINE_AGENTS = [
  'analyst',
  'architect',
  'skeptic',
  'developer',
  'tester',
  'inspector',
  'reviewer',
  'planner',
];

const PLANNING_AGENTS = [
  'researcher',
  'validator',
  'interviewer',
  'decomposer',
];

const SECURITY_AGENTS = [
  'auditor',
  'prompter',
  'deployer',
  'scaffolder',
];

const DOCUMENTATION_AGENTS = [
  'librarian',
  'writer',
  'gatekeeper',
  'verifier',
];

// --- Presets ---

const MINIMAL_AGENTS = [
  'analyst',
  'developer',
  'tester',
  'reviewer',
  'inspector',
];

const CORE_AGENTS = [...PIPELINE_AGENTS];

const FULL_AGENTS = [
  ...PIPELINE_AGENTS,
  ...PLANNING_AGENTS,
  ...SECURITY_AGENTS,
  ...DOCUMENTATION_AGENTS,
];

// --- Helpers ---

const CATEGORY_MAP: Record<string, string> = {};

for (const name of PIPELINE_AGENTS) {
  CATEGORY_MAP[name] = 'pipeline';
}
for (const name of PLANNING_AGENTS) {
  CATEGORY_MAP[name] = 'planning';
}
for (const name of SECURITY_AGENTS) {
  CATEGORY_MAP[name] = 'security';
}
for (const name of DOCUMENTATION_AGENTS) {
  CATEGORY_MAP[name] = 'documentation';
}

/**
 * Returns the template subdirectory for a given agent name.
 * Templates live at templates/agents/[category]/[name].md.ejs
 */
export function getAgentCategory(name: string): string {
  return CATEGORY_MAP[name] || 'pipeline';
}

/**
 * Returns the list of agents for the given preset.
 */
export function getAgentList(preset: AgentPreset): { name: string; category: string }[] {
  let names: string[];

  switch (preset) {
    case 'minimal':
      names = MINIMAL_AGENTS;
      break;
    case 'full':
      names = FULL_AGENTS;
      break;
    case 'core':
    default:
      names = CORE_AGENTS;
      break;
  }

  return names.map((name) => ({
    name,
    category: getAgentCategory(name),
  }));
}

export async function generateAgents(
  ctx: ProjectContext,
  overwrite: boolean
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    filesCreated: [],
    filesSkipped: [],
    errors: [],
  };

  const agents = getAgentList(ctx.agentPreset);
  const templateData = {
    ...ctx,
    defaultBranch: 'main',
  };

  for (const agent of agents) {
    try {
      const content = await renderTemplate(
        `agents/${agent.category}/${agent.name}.md.ejs`,
        templateData
      );
      // Output is always flat: .claude/agents/[name].md
      const outputPath = path.join(ctx.targetDir, '.claude/agents', `${agent.name}.md`);
      const status = await writeFileSafe(outputPath, content, overwrite);

      if (status === 'skipped') {
        result.filesSkipped.push(outputPath);
      } else {
        result.filesCreated.push(outputPath);
      }
    } catch (err) {
      result.errors.push(`Agent ${agent.name}: ${err}`);
    }
  }

  return result;
}
