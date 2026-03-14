import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { fileExists, readFile, writeFileSafe } from '../utils/fs.js';
import { generateClaudeMd } from '../generators/claude-md.js';
import { generateAgents } from '../generators/agents.js';
import { generateSkills } from '../generators/skills.js';
import { generateRules } from '../generators/rules.js';
import { generateMemoryBank } from '../generators/memory-bank.js';
import { generateHooks } from '../generators/hooks.js';
import { generateInfra } from '../generators/infra.js';
import { buildManifest } from '../generators/infra.js';
import type { ForgeManifest } from '../generators/infra.js';
import type { ProjectContext, GeneratorResult, AgentPreset, Language, CommitStyle } from '../types.js';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function contextFromManifest(manifest: ForgeManifest, targetDir: string): ProjectContext {
  return {
    projectName: manifest.projectName || targetDir.split('/').pop() || 'my-project',
    projectDescription: manifest.projectDescription || 'AI-driven project',
    stack: manifest.stack || 'typescript',
    framework: manifest.framework || 'None',
    testFramework: manifest.testFramework || 'vitest',
    testCommand: manifest.testCommand || 'npx vitest run',
    srcDir: manifest.srcDir || 'src/',
    testDir: manifest.testDir || 'tests/',
    team: [],
    milestones: [],
    agentPreset: (manifest.agentPreset as AgentPreset) || 'core',
    language: (manifest.language as Language) || 'ru',
    commitStyle: (manifest.commitStyle as CommitStyle) || 'standard',
    today: today(),
    targetDir,
  };
}

export async function updateCommand(): Promise<void> {
  const targetDir = process.cwd();

  console.log();
  console.log(chalk.bold('  agent-forge update v3.0.0'));
  console.log(chalk.dim('  Updating framework files...'));
  console.log();

  // 1. Check .claude-forge.json exists
  const manifestPath = path.join(targetDir, '.claude-forge.json');
  const manifestExists = await fileExists(manifestPath);

  if (!manifestExists) {
    console.log(chalk.red('  .claude-forge.json not found'));
    console.log(
      chalk.dim('  This project is not initialized. Run `agent-forge init` first.')
    );
    console.log();
    process.exit(1);
  }

  // 2. Read existing manifest
  const manifestRaw = await readFile(manifestPath);
  let existingManifest: ForgeManifest;

  try {
    existingManifest = JSON.parse(manifestRaw);
  } catch {
    console.log(chalk.red('  .claude-forge.json is corrupted. Cannot update.'));
    console.log(
      chalk.dim('  Run `agent-forge init --overwrite` to reinitialize.')
    );
    console.log();
    process.exit(1);
  }

  const previousVersion = existingManifest.version || 'unknown';

  // 3. Build ProjectContext from manifest (no interactive prompts)
  const ctx = contextFromManifest(existingManifest, targetDir);

  const spinner = ora('Updating framework files...').start();

  try {
    const result: GeneratorResult = {
      filesCreated: [],
      filesSkipped: [],
      errors: [],
    };

    // 4. Framework files — overwrite=true
    const frameworkGenerators = [
      generateClaudeMd,
      generateAgents,
      generateSkills,
      generateRules,
      generateHooks,
    ];

    for (const generator of frameworkGenerators) {
      try {
        const partial = await generator(ctx, true);
        result.filesCreated.push(...partial.filesCreated);
        result.filesSkipped.push(...partial.filesSkipped);
        result.errors.push(...partial.errors);
      } catch (err) {
        result.errors.push(`Generator error: ${err}`);
      }
    }

    // 5. User data files — overwrite=false (preserve)
    const userDataGenerators = [
      generateMemoryBank,
      generateInfra,
    ];

    for (const generator of userDataGenerators) {
      try {
        const partial = await generator(ctx, false);
        result.filesCreated.push(...partial.filesCreated);
        result.filesSkipped.push(...partial.filesSkipped);
        result.errors.push(...partial.errors);
      } catch (err) {
        result.errors.push(`Generator error: ${err}`);
      }
    }

    // 6. Update .claude-forge.json manually (always overwrite)
    const updatedManifest = buildManifest(ctx);
    // Preserve original createdAt
    updatedManifest.createdAt = existingManifest.createdAt || updatedManifest.createdAt;
    updatedManifest.updatedAt = today();

    await writeFileSafe(
      manifestPath,
      JSON.stringify(updatedManifest, null, 2) + '\n',
      true
    );

    spinner.succeed(chalk.green('Framework files updated'));

    // 7. Build report
    // Separate newly added files from overwritten files
    const newFiles = result.filesCreated.filter(f => !result.filesSkipped.includes(f));
    const updatedCount = newFiles.length;
    const skippedCount = result.filesSkipped.length;

    console.log();
    if (updatedCount > 0) {
      console.log(
        chalk.green(`  + ${updatedCount} files updated/added`)
      );
    }
    if (skippedCount > 0) {
      console.log(
        chalk.yellow(`  ~ ${skippedCount} files skipped (user data preserved)`)
      );
    }
    if (result.errors.length > 0) {
      console.log(chalk.red(`  ! ${result.errors.length} errors:`));
      for (const err of result.errors) {
        console.log(chalk.red(`    - ${err}`));
      }
    }

    console.log();
    if (previousVersion !== updatedManifest.version) {
      console.log(
        chalk.dim(`  .claude-forge.json updated: ${previousVersion} -> v${updatedManifest.version}`)
      );
    } else {
      console.log(
        chalk.dim(`  .claude-forge.json updated (v${updatedManifest.version})`)
      );
    }
    console.log();
  } catch (err) {
    spinner.fail(chalk.red('Failed to update framework files'));
    console.error(err);
    process.exit(1);
  }
}
