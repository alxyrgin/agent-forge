# agent-forge

AI-driven Development Framework for Claude Code.

Scaffold a complete development infrastructure with Memory Bank, specialized agents, skills, hooks, checkpoint system, and development rules in any project.

## Quick Start

```bash
npx @alxyrgin/agent-forge init
```

This creates a full AI-driven development infrastructure in your project:

- **`.claude/`** — CLAUDE.md (Team Lead instructions), 4-8 agents, 7-12 skills, 5 rules, hooks
- **`dev-infra/memory/`** — 9 Memory Bank files for persistent context (incl. checkpoint)
- **`dev-infra/tasks/`** — Task tracking system (tasks.json)
- **`dev-infra/sessions/`** — Session logs
- **`dev-infra/tests/`** — Test structure (acceptance, PMI, results)

## How It Works

### Memory Bank

9 markdown files that persist context across sessions:

| File | Purpose |
|------|---------|
| `active-context.md` | Current session state, what's done, next steps |
| `progress.md` | Milestone progress, task statuses |
| `project-brief.md` | Project overview, team, stack |
| `decisions.md` | Architectural Decision Records (ADR) |
| `tech-stack.md` | Technology stack details |
| `tech-debt.md` | Technical debt registry with lifecycle tracking |
| `patterns.md` | Code patterns and conventions |
| `troubleshooting.md` | Problem solutions log |
| `checkpoint.yml` | Recovery checkpoint for interrupted sessions |

### Agents

Specialized AI agents, each with a specific role:

#### Core agents (all presets except minimal)

| Agent | Role |
|-------|------|
| `analyst` | Requirement analysis from docs |
| `architect` | Module architecture design |
| `developer` | Code implementation |
| `tester` | Testing — unit, integration, acceptance, smoke (parametric `level`) |
| `reviewer` | Code review with iterations, escalation, plan review, security audit |
| `skeptic` | Reality checker — validates plans against actual codebase |
| `planner` | Task planning, replanning, validation, completeness tracing |
| `writer` | Documentation and stakeholder reports (parametric `mode`) |

**Minimal preset** includes only: `analyst`, `developer`, `tester`, `reviewer`

### Skills (Slash Commands)

#### Core skills (all presets)

| Command | Description |
|---------|-------------|
| `/start-session` | Begin work: sync repo, check checkpoint, load context, show progress |
| `/end-session` | Save context, checkpoint, create session log, commit & push |
| `/take-task [id]` | Full development cycle with feature-size routing (S/M/L) |
| `/complete-task [id]` | Verify task, smoke test, update progress, clear checkpoint |
| `/status` | Show project status, deadlines, blockers |
| `/plan [mode]` | Plan/replan/validate tasks from documentation |
| `/review [file]` | Code review for file or task |

#### Extra skills (full preset only)

| Command | Description |
|---------|-------------|
| `/interview` | Structured discovery interview (3 cycles, completeness >= 85%) |
| `/audit-wave` | Comprehensive pre-milestone audit with GO/NO-GO verdict |
| `/write-report` | Generate non-technical progress report for stakeholders |
| `/dashboard` | Project dashboard: progress, health, tech debt, activity |
| `/skill-master [name]` | Create a new custom skill from template |

### Feature-size Routing

Tasks are automatically classified and routed through the appropriate pipeline:

| Size | Criteria | Steps |
|------|----------|-------|
| **S** | 1 file, < 50 lines | developer → tester → tech-debt → fixation (4 steps) |
| **M** | 2-5 files, new module | analyst → developer → tester → reviewer → tech-debt → fixation (6 steps) |
| **L** | 6+ files, architecture changes | analyst → architect+reviewer(parallel) → skeptic → developer↔tester(cycles) → reviewer → tech-debt → fixation (7 steps) |

### Checkpoint System

The checkpoint system (`dev-infra/memory/checkpoint.yml`) enables recovery after session interruptions:

- **Automatic saving** — checkpoint is updated after each pipeline step
- **Recovery on start** — `/start-session` detects active checkpoint and offers to resume
- **Cleanup on completion** — `/complete-task` clears the checkpoint

### Hooks

- **`protect-docs.sh`** — PreToolUse hook that blocks Edit/Write operations in `docs/` directory
- **Stop hook** — Reminds to save checkpoint and run `/end-session` before exiting

### Rules

5 development standards enforced automatically:

| Rule | Purpose |
|------|---------|
| `commit-conventions` | Commit message format and style |
| `development-cycle` | Feature-size routing and pipeline steps |
| `testing-standards` | Test coverage and quality requirements |
| `shared-resources` | Singleton resource registry and patterns |
| `context-loading` | Just-in-time context loading, anti-patterns |

## Configuration

### Agent Presets

- **Core** (default, 8 agents) — full set with parametric agents (tester, reviewer, writer, planner)
- **Full** (8 agents + extra skills) — same agents as core, adds 5 extra skills (interview, audit-wave, write-report, dashboard, skill-master)
- **Minimal** (4 agents) — analyst, developer, tester, reviewer

### Interactive Setup

```bash
npx @alxyrgin/agent-forge init
```

Prompts for:
- Project name and description
- Technology stack (Python/TypeScript/Go/Rust)
- Framework and test framework
- Team members (names, roles, emails)
- Milestones (optional)
- Agent preset (core/full/minimal)
- Commit style (standard/conventional)

### Non-interactive

```bash
npx @alxyrgin/agent-forge init --yes  # Use defaults
```

## Commands

### `agent-forge init`

Initialize AI-driven development infrastructure.

Options:
- `--yes, -y` — skip prompts, use defaults
- `--overwrite` — overwrite existing files

### `agent-forge doctor`

Check integrity of the generated structure.

Verifies all expected files exist and are not empty.

## Generated Structure

```
your-project/
├── .claude/
│   ├── CLAUDE.md              # Team Lead instructions
│   ├── settings.json          # Claude Code hooks & env
│   ├── hooks/
│   │   └── protect-docs.sh    # PreToolUse hook
│   ├── agents/                # 4-8 specialized agents
│   │   ├── analyst.md
│   │   ├── architect.md
│   │   ├── skeptic.md
│   │   ├── developer.md
│   │   ├── tester.md
│   │   ├── reviewer.md
│   │   ├── planner.md
│   │   └── writer.md
│   ├── skills/                # 7-12 slash commands
│   │   ├── start-session/SKILL.md
│   │   ├── take-task/SKILL.md
│   │   └── ...
│   └── rules/                 # 5 development standards
│       ├── commit-conventions.md
│       ├── development-cycle.md
│       ├── testing-standards.md
│       ├── shared-resources.md
│       └── context-loading.md
├── dev-infra/
│   ├── memory/                # 9 Memory Bank files
│   │   ├── active-context.md
│   │   ├── progress.md
│   │   ├── checkpoint.yml
│   │   └── ...
│   ├── tasks/
│   │   └── tasks.json         # Task tracking
│   ├── sessions/              # Session logs
│   └── tests/                 # Test structure
│       ├── acceptance/
│       ├── pmi/
│       └── results/
└── .claude-forge.json         # Manifest for doctor
```

## License

MIT
