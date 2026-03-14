import inquirer from 'inquirer';
import type { ProjectContext, TeamMember, Milestone, AgentPreset, Language, CommitStyle } from '../types.js';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

const STACK_CHOICES = [
  { name: 'Python', value: 'python' },
  { name: 'TypeScript / Node.js', value: 'typescript' },
  { name: 'Go', value: 'go' },
  { name: 'Rust', value: 'rust' },
  { name: 'Other', value: 'other' },
];

const FRAMEWORK_MAP: Record<string, string[]> = {
  python: ['FastAPI', 'Django', 'Flask', 'None'],
  typescript: ['Next.js', 'Express', 'Fastify', 'None'],
  go: ['Gin', 'Echo', 'Chi', 'None'],
  rust: ['Actix', 'Axum', 'Rocket', 'None'],
  other: ['None'],
};

const TEST_MAP: Record<string, { framework: string; command: string }> = {
  python: { framework: 'pytest', command: 'pytest' },
  typescript: { framework: 'vitest', command: 'npx vitest run' },
  go: { framework: 'go test', command: 'go test ./...' },
  rust: { framework: 'cargo test', command: 'cargo test' },
  other: { framework: 'custom', command: 'echo "no tests configured"' },
};

export async function promptProjectSetup(targetDir: string): Promise<ProjectContext> {
  const base = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: targetDir.split('/').pop(),
    },
    {
      type: 'input',
      name: 'projectDescription',
      message: 'Project description:',
      default: 'AI-driven project',
    },
    {
      type: 'list',
      name: 'stack',
      message: 'Technology stack:',
      choices: STACK_CHOICES,
    },
  ]);

  const frameworks = FRAMEWORK_MAP[base.stack] || ['None'];
  const frameworkAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Framework:',
      choices: frameworks,
    },
  ]);

  const testDefaults = TEST_MAP[base.stack] || TEST_MAP.other;
  const dirs = await inquirer.prompt([
    {
      type: 'input',
      name: 'testFramework',
      message: 'Test framework:',
      default: testDefaults.framework,
    },
    {
      type: 'input',
      name: 'testCommand',
      message: 'Test command:',
      default: testDefaults.command,
    },
    {
      type: 'input',
      name: 'srcDir',
      message: 'Source directory:',
      default: 'src/',
    },
    {
      type: 'input',
      name: 'testDir',
      message: 'Test directory:',
      default: base.stack === 'python' ? 'src/tests/' : 'tests/',
    },
  ]);

  // Team members
  const team: TeamMember[] = [];
  let addMore = true;
  let first = true;
  while (addMore) {
    const member = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: first ? 'Team member name:' : 'Next team member name (leave empty to stop):',
        default: first ? undefined : '',
      },
    ]);

    if (!member.name) break;

    const details = await inquirer.prompt([
      {
        type: 'input',
        name: 'role',
        message: `${member.name}'s role:`,
        default: 'developer',
      },
      {
        type: 'input',
        name: 'email',
        message: `${member.name}'s email:`,
      },
    ]);

    team.push({ name: member.name, role: details.role, email: details.email });
    first = false;

    if (team.length >= 10) break;
    const cont = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addMore',
        message: 'Add another team member?',
        default: false,
      },
    ]);
    addMore = cont.addMore;
  }

  // Milestones
  const milestones: Milestone[] = [];
  const addMilestones = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'add',
      message: 'Add milestones?',
      default: false,
    },
  ]);

  if (addMilestones.add) {
    let addMoreMs = true;
    while (addMoreMs) {
      const ms = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Milestone name:',
        },
        {
          type: 'input',
          name: 'deadline',
          message: 'Deadline (YYYY-MM-DD):',
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description (optional):',
          default: '',
        },
      ]);
      milestones.push({
        name: ms.name,
        deadline: ms.deadline,
        description: ms.description || undefined,
      });

      const cont = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addMore',
          message: 'Add another milestone?',
          default: false,
        },
      ]);
      addMoreMs = cont.addMore;
    }
  }

  const config = await inquirer.prompt([
    {
      type: 'list',
      name: 'agentPreset',
      message: 'Agent preset:',
      choices: [
        { name: 'Core (8 agents — development pipeline)', value: 'core' },
        { name: 'Full (20 agents — all categories + extra skills)', value: 'full' },
        { name: 'Minimal (5 agents — essentials + inspector)', value: 'minimal' },
      ],
    },
    {
      type: 'list',
      name: 'language',
      message: 'Instructions language:',
      choices: [
        { name: 'Russian', value: 'ru' },
        { name: 'English', value: 'en' },
      ],
    },
    {
      type: 'list',
      name: 'commitStyle',
      message: 'Commit style:',
      choices: [
        { name: 'Standard (type(scope): description)', value: 'standard' },
        { name: 'Conventional Commits', value: 'conventional' },
      ],
    },
  ]);

  return {
    projectName: base.projectName,
    projectDescription: base.projectDescription,
    stack: base.stack,
    framework: frameworkAnswer.framework,
    testFramework: dirs.testFramework,
    testCommand: dirs.testCommand,
    srcDir: dirs.srcDir,
    testDir: dirs.testDir,
    team,
    milestones,
    agentPreset: config.agentPreset as AgentPreset,
    language: config.language as Language,
    commitStyle: config.commitStyle as CommitStyle,
    today: today(),
    targetDir,
  };
}

export function getDefaultContext(targetDir: string): ProjectContext {
  return {
    projectName: targetDir.split('/').pop() || 'my-project',
    projectDescription: 'AI-driven project',
    stack: 'typescript',
    framework: 'None',
    testFramework: 'vitest',
    testCommand: 'npx vitest run',
    srcDir: 'src/',
    testDir: 'tests/',
    team: [{ name: 'Developer', role: 'developer', email: '' }],
    milestones: [],
    agentPreset: 'core',
    language: 'en',
    commitStyle: 'standard',
    today: today(),
    targetDir,
  };
}
