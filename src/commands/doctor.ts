import path from 'path';
import chalk from 'chalk';
import { fileExists, readFile } from '../utils/fs.js';
import type { DoctorCheck } from '../types.js';

export async function doctorCommand(): Promise<void> {
  const targetDir = process.cwd();

  console.log();
  console.log(chalk.bold('  agent-forge doctor'));
  console.log(chalk.dim('  Checking project structure integrity...'));
  console.log();

  // Load manifest
  const manifestPath = path.join(targetDir, '.claude-forge.json');
  const manifestExists = await fileExists(manifestPath);

  if (!manifestExists) {
    console.log(chalk.red('  .claude-forge.json not found'));
    console.log(chalk.dim('  Run `agent-forge init` first to initialize the project.'));
    console.log();
    process.exit(1);
  }

  const manifestRaw = await readFile(manifestPath);
  let manifest: { version: string; expectedFiles: string[]; projectName: string };

  try {
    manifest = JSON.parse(manifestRaw);
  } catch {
    console.log(chalk.red('  .claude-forge.json is corrupted'));
    process.exit(1);
  }

  console.log(chalk.dim(`  Project: ${manifest.projectName}`));
  console.log(chalk.dim(`  Version: ${manifest.version}`));
  console.log();

  const checks: DoctorCheck[] = [];
  let okCount = 0;
  let failCount = 0;

  for (const file of manifest.expectedFiles) {
    const filePath = path.join(targetDir, file);
    const exists = await fileExists(filePath);

    const check: DoctorCheck = {
      name: file,
      path: filePath,
      exists,
      ok: exists,
    };

    if (exists) {
      // Check if file is not empty
      try {
        const content = await readFile(filePath);
        if (content.trim().length === 0) {
          check.ok = false;
          check.message = 'File is empty';
        }
      } catch {
        check.ok = false;
        check.message = 'Cannot read file';
      }
    } else {
      check.message = 'File not found';
    }

    checks.push(check);
    if (check.ok) okCount++;
    else failCount++;
  }

  // Display results grouped by category
  const categories: Record<string, DoctorCheck[]> = {};
  for (const check of checks) {
    const category = check.name.startsWith('.claude/agents')
      ? 'Agents'
      : check.name.startsWith('.claude/skills')
      ? 'Skills'
      : check.name.startsWith('.claude/rules')
      ? 'Rules'
      : check.name.startsWith('.claude/')
      ? 'Claude Config'
      : check.name.startsWith('dev-infra/memory')
      ? 'Memory Bank'
      : check.name.startsWith('dev-infra/')
      ? 'Infrastructure'
      : 'Other';

    if (!categories[category]) categories[category] = [];
    categories[category].push(check);
  }

  for (const [category, items] of Object.entries(categories)) {
    const allOk = items.every(c => c.ok);
    const icon = allOk ? chalk.green('OK') : chalk.red('!!');
    console.log(`  ${icon} ${chalk.bold(category)}`);

    for (const item of items) {
      if (item.ok) {
        console.log(chalk.green(`     + ${item.name}`));
      } else {
        console.log(chalk.red(`     - ${item.name} (${item.message})`));
      }
    }
    console.log();
  }

  // Summary
  console.log(chalk.bold('  Summary'));
  console.log(chalk.green(`    OK: ${okCount}`));
  if (failCount > 0) {
    console.log(chalk.red(`    Missing/broken: ${failCount}`));
    console.log();
    console.log(chalk.dim('  Run `agent-forge init --overwrite` to regenerate missing files.'));
  } else {
    console.log(chalk.green('    All checks passed!'));
  }
  console.log();

  if (failCount > 0) {
    process.exit(1);
  }
}
