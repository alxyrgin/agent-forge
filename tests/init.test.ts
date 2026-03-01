import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { generateAll } from '../src/generators/index.js';
import type { ProjectContext } from '../src/types.js';

function createTestContext(targetDir: string): ProjectContext {
  return {
    projectName: 'test-project',
    projectDescription: 'A test project',
    language: 'ru',
    stack: 'typescript',
    framework: 'Express',
    testFramework: 'vitest',
    testCommand: 'npx vitest run',
    srcDir: 'src/',
    testDir: 'tests/',
    team: [
      { name: 'Alice', role: 'developer', email: 'alice@test.com' },
      { name: 'Bob', role: 'tester', email: 'bob@test.com' },
    ],
    milestones: [
      { name: 'MVP', deadline: '2026-06-01', description: 'Minimum viable product' },
    ],
    agentPreset: 'core',
    commitStyle: 'standard',
    today: '2026-03-01',
    targetDir,
  };
}

describe('agent-forge init', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `agent-forge-test-${Date.now()}`);
    await fs.ensureDir(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('generates all expected files for core preset', async () => {
    const ctx = createTestContext(tmpDir);
    const result = await generateAll(ctx);

    expect(result.errors).toHaveLength(0);
    expect(result.filesCreated.length).toBeGreaterThanOrEqual(28);

    // Check key files exist
    expect(await fs.pathExists(path.join(tmpDir, '.claude/CLAUDE.md'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, '.claude/settings.json'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, '.claude-forge.json'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'dev-infra/tasks/tasks.json'))).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'dev-infra/memory/active-context.md'))).toBe(true);
  });

  it('generates correct number of agents for each preset', async () => {
    // Core: 8 agents
    const coreCtx = createTestContext(tmpDir);
    const coreResult = await generateAll(coreCtx);
    const coreAgents = coreResult.filesCreated.filter(f => f.includes('/agents/'));
    expect(coreAgents).toHaveLength(8);

    // Clean up
    await fs.remove(tmpDir);
    await fs.ensureDir(tmpDir);

    // Minimal: 4 agents
    const minCtx = { ...createTestContext(tmpDir), agentPreset: 'minimal' as const };
    const minResult = await generateAll(minCtx);
    const minAgents = minResult.filesCreated.filter(f => f.includes('/agents/'));
    expect(minAgents).toHaveLength(4);

    // Clean up
    await fs.remove(tmpDir);
    await fs.ensureDir(tmpDir);

    // Full: 11 agents
    const fullCtx = { ...createTestContext(tmpDir), agentPreset: 'full' as const };
    const fullResult = await generateAll(fullCtx);
    const fullAgents = fullResult.filesCreated.filter(f => f.includes('/agents/'));
    expect(fullAgents).toHaveLength(11);
  });

  it('generates 7 skills', async () => {
    const ctx = createTestContext(tmpDir);
    const result = await generateAll(ctx);
    const skills = result.filesCreated.filter(f => f.includes('/skills/'));
    expect(skills).toHaveLength(7);
  });

  it('generates 3 rules', async () => {
    const ctx = createTestContext(tmpDir);
    const result = await generateAll(ctx);
    const rules = result.filesCreated.filter(f => f.includes('/rules/'));
    expect(rules).toHaveLength(3);
  });

  it('generates 8 memory bank files', async () => {
    const ctx = createTestContext(tmpDir);
    const result = await generateAll(ctx);
    const memory = result.filesCreated.filter(f => f.includes('/memory/'));
    expect(memory).toHaveLength(8);
  });

  it('injects project name into CLAUDE.md', async () => {
    const ctx = createTestContext(tmpDir);
    await generateAll(ctx);

    const content = await fs.readFile(path.join(tmpDir, '.claude/CLAUDE.md'), 'utf-8');
    expect(content).toContain('test-project');
  });

  it('injects team members into CLAUDE.md', async () => {
    const ctx = createTestContext(tmpDir);
    await generateAll(ctx);

    const content = await fs.readFile(path.join(tmpDir, '.claude/CLAUDE.md'), 'utf-8');
    expect(content).toContain('Alice');
    expect(content).toContain('Bob');
  });

  it('injects test command into templates', async () => {
    const ctx = createTestContext(tmpDir);
    await generateAll(ctx);

    const devCycle = await fs.readFile(
      path.join(tmpDir, '.claude/rules/development-cycle.md'),
      'utf-8'
    );
    expect(devCycle).toContain('npx vitest run');
  });

  it('skips existing files without --overwrite', async () => {
    const ctx = createTestContext(tmpDir);

    // First run
    const result1 = await generateAll(ctx, false);
    expect(result1.filesCreated.length).toBeGreaterThan(0);

    // Second run — should skip
    const result2 = await generateAll(ctx, false);
    expect(result2.filesSkipped.length).toBeGreaterThan(0);
    expect(result2.filesCreated).toHaveLength(0);
  });

  it('overwrites existing files with overwrite=true', async () => {
    const ctx = createTestContext(tmpDir);

    // First run
    await generateAll(ctx, false);

    // Second run with overwrite
    const result2 = await generateAll(ctx, true);
    expect(result2.filesCreated.length).toBeGreaterThan(0);
    expect(result2.filesSkipped).toHaveLength(0);
  });

  it('generates valid tasks.json', async () => {
    const ctx = createTestContext(tmpDir);
    await generateAll(ctx);

    const tasksRaw = await fs.readFile(
      path.join(tmpDir, 'dev-infra/tasks/tasks.json'),
      'utf-8'
    );
    const tasks = JSON.parse(tasksRaw);
    expect(tasks.project).toBe('test-project');
    expect(tasks.tasks).toEqual([]);
  });

  it('generates valid .claude-forge.json manifest', async () => {
    const ctx = createTestContext(tmpDir);
    await generateAll(ctx);

    const raw = await fs.readFile(path.join(tmpDir, '.claude-forge.json'), 'utf-8');
    const manifest = JSON.parse(raw);
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.projectName).toBe('test-project');
    expect(manifest.expectedFiles).toBeInstanceOf(Array);
    expect(manifest.expectedFiles.length).toBeGreaterThanOrEqual(28);
  });

  it('includes milestones in progress.md', async () => {
    const ctx = createTestContext(tmpDir);
    await generateAll(ctx);

    const content = await fs.readFile(
      path.join(tmpDir, 'dev-infra/memory/progress.md'),
      'utf-8'
    );
    expect(content).toContain('MVP');
    expect(content).toContain('2026-06-01');
  });
});
