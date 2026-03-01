import chalk from 'chalk';
import ora from 'ora';
import { promptProjectSetup, getDefaultContext } from '../prompts/project-setup.js';
import { generateAll } from '../generators/index.js';

interface InitOptions {
  yes?: boolean;
  overwrite?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const targetDir = process.cwd();

  console.log();
  console.log(chalk.bold('  agent-forge v1.0.0'));
  console.log(chalk.dim('  AI-driven Development Framework for Claude Code'));
  console.log();

  let ctx;
  if (options.yes) {
    ctx = getDefaultContext(targetDir);
    console.log(chalk.dim('  Using default configuration (--yes)'));
    console.log();
  } else {
    ctx = await promptProjectSetup(targetDir);
    console.log();
  }

  const spinner = ora('Creating project structure...').start();

  try {
    const result = await generateAll(ctx, options.overwrite ?? false);

    spinner.succeed(
      chalk.green(`${result.filesCreated.length} files created`)
    );

    if (result.filesSkipped.length > 0) {
      console.log(
        chalk.yellow(`  ${result.filesSkipped.length} files skipped (already exist)`)
      );
    }

    if (result.errors.length > 0) {
      console.log(chalk.red(`  ${result.errors.length} errors:`));
      for (const err of result.errors) {
        console.log(chalk.red(`    - ${err}`));
      }
    }

    console.log();
    console.log(chalk.bold('  Next steps:'));
    console.log(chalk.dim('  1. Open Claude Code in this directory'));
    console.log(chalk.dim('  2. /start-session — begin your first session'));
    console.log(chalk.dim('  3. /plan init — create tasks from your documentation'));
    console.log();
  } catch (err) {
    spinner.fail(chalk.red('Failed to create project structure'));
    console.error(err);
    process.exit(1);
  }
}
