import type { ProjectContext, GeneratorResult } from '../types.js';
import { generateMemoryBank } from './memory-bank.js';
import { generateAgents } from './agents.js';
import { generateSkills } from './skills.js';
import { generateRules } from './rules.js';
import { generateClaudeMd } from './claude-md.js';
import { generateInfra } from './infra.js';

export async function generateAll(
  ctx: ProjectContext,
  overwrite: boolean = false
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    filesCreated: [],
    filesSkipped: [],
    errors: [],
  };

  const generators = [
    generateClaudeMd,
    generateAgents,
    generateSkills,
    generateRules,
    generateMemoryBank,
    generateInfra,
  ];

  for (const generator of generators) {
    try {
      const partial = await generator(ctx, overwrite);
      result.filesCreated.push(...partial.filesCreated);
      result.filesSkipped.push(...partial.filesSkipped);
      result.errors.push(...partial.errors);
    } catch (err) {
      result.errors.push(`Generator error: ${err}`);
    }
  }

  return result;
}
