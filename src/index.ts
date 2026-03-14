import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { doctorCommand } from './commands/doctor.js';
import { updateCommand } from './commands/update.js';

const program = new Command();

program
  .name('agent-forge')
  .description('AI-driven Development Framework for Claude Code')
  .version('3.0.0');

program
  .command('init')
  .description('Initialize AI-driven development infrastructure in the current project')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--overwrite', 'Overwrite existing files')
  .action(initCommand);

program
  .command('doctor')
  .description('Check integrity of the generated structure')
  .action(doctorCommand);

program
  .command('update')
  .description('Update framework files to the latest version (preserves user data)')
  .action(updateCommand);

program.parse();
