import path from 'path';
import type { ProjectContext, GeneratorResult, AgentPreset } from '../types.js';
import { renderTemplate } from '../utils/template.js';
import { writeFileSafe } from '../utils/fs.js';

const CORE_AGENTS = [
  'analyst',
  'architect',
  'developer',
  'tester',
  'reviewer',
  'skeptic',
  'planner',
  'writer',
];

const EXTRA_AGENTS: string[] = [];

const MINIMAL_AGENTS = [
  'analyst',
  'developer',
  'tester',
  'reviewer',
];

function getAgentList(preset: AgentPreset): { name: string; dir: string }[] {
  const agents: { name: string; dir: string }[] = [];

  const coreList = preset === 'minimal' ? MINIMAL_AGENTS : CORE_AGENTS;
  for (const name of coreList) {
    agents.push({ name, dir: 'core' });
  }

  if (preset === 'full') {
    for (const name of EXTRA_AGENTS) {
      agents.push({ name, dir: 'extra' });
    }
  }

  return agents;
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
        `agents/${agent.dir}/${agent.name}.md.ejs`,
        templateData
      );
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
