export interface TeamMember {
  name: string;
  role: string;
  email: string;
}

export interface Milestone {
  name: string;
  deadline: string;
  description?: string;
}

export type AgentPreset = 'core' | 'full' | 'minimal';
export type Language = 'ru' | 'en';
export type CommitStyle = 'standard' | 'conventional';

export interface ProjectContext {
  projectName: string;
  projectDescription: string;
  language: Language;
  stack: string;
  framework: string;
  testFramework: string;
  testCommand: string;
  srcDir: string;
  testDir: string;
  team: TeamMember[];
  milestones: Milestone[];
  agentPreset: AgentPreset;
  commitStyle: CommitStyle;
  today: string;
  targetDir: string;
}

export interface GeneratorResult {
  filesCreated: string[];
  filesSkipped: string[];
  errors: string[];
}

export interface DoctorCheck {
  name: string;
  path: string;
  exists: boolean;
  ok: boolean;
  message?: string;
}
