# agent-forge

AI-driven Development Framework for Claude Code.

Scaffold a complete development infrastructure with Memory Bank, specialized agents, skills, and development rules in any project.

## Quick Start

```bash
npx agent-forge init
```

This creates a full AI-driven development infrastructure in your project:

- **`.claude/`** — CLAUDE.md (Team Lead instructions), 8 agents, 7 skills, 3 rules
- **`dev-infra/memory/`** — 8 Memory Bank files for persistent context
- **`dev-infra/tasks/`** — Task tracking system (tasks.json)
- **`dev-infra/sessions/`** — Session logs
- **`dev-infra/tests/`** — Test structure (acceptance, PMI, results)

## How It Works

### Memory Bank

8 markdown files that persist context across sessions:

| File | Purpose |
|------|---------|
| `active-context.md` | Current session state, what's done, next steps |
| `progress.md` | Milestone progress, task statuses |
| `project-brief.md` | Project overview, team, stack |
| `decisions.md` | Architectural Decision Records (ADR) |
| `tech-stack.md` | Technology stack details |
| `tech-debt.md` | Technical debt registry |
| `patterns.md` | Code patterns and conventions |
| `troubleshooting.md` | Problem solutions log |

### Agents

Specialized AI agents, each with a specific role:

| Agent | Role |
|-------|------|
| `analyst` | Requirement analysis from docs |
| `architect` | Module architecture design |
| `developer` | Code implementation |
| `unit-tester` | Unit test writing and running |
| `reviewer` | Code quality review |
| `security-auditor` | Security and access control audit |
| `doc-writer` | Documentation generation |
| `progress-tracker` | Memory bank and task updates |

**Full preset** adds: `planner`, `integration-tester`, `acceptance-tester`

**Minimal preset** includes only: `analyst`, `developer`, `unit-tester`, `reviewer`

### Skills (Slash Commands)

| Command | Description |
|---------|-------------|
| `/start-session` | Begin work: sync repo, load context, show progress |
| `/end-session` | Save context, create session log, commit & push |
| `/take-task [id]` | Full development cycle: analysis -> code -> test -> review |
| `/complete-task [id]` | Verify task completion, update progress |
| `/status` | Show project status, deadlines, blockers |
| `/plan [mode]` | Plan/replan/validate tasks from documentation |
| `/review [file]` | Code review for file or task |

### Development Cycle

When you run `/take-task`, the system automatically orchestrates:

```
[1] ANALYSIS    — analyst reads docs, finds requirements
[2] DISCOVERY   — clarifying questions if unclear
[3] PLAN        — architect designs module structure
[4] CODE        — developer writes code
[5] TESTS       — unit-tester writes tests (>=80% coverage)
[6] REVIEW      — reviewer checks quality and security
[7] FIXATION    — update tasks, progress, propose commit
[8] TECH-DEBT   — record any deviations
```

## Configuration

### Agent Presets

- **Core** (default, 8 agents) — balanced set for most projects
- **Full** (11 agents) — adds planner, integration tester, acceptance tester
- **Minimal** (4 agents) — analyst, developer, unit-tester, reviewer

### Interactive Setup

```bash
npx agent-forge init
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
npx agent-forge init --yes  # Use defaults
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
│   ├── settings.json          # Claude Code hooks
│   ├── agents/                # 4-11 specialized agents
│   │   ├── analyst.md
│   │   ├── architect.md
│   │   ├── developer.md
│   │   └── ...
│   ├── skills/                # 7 slash commands
│   │   ├── start-session/SKILL.md
│   │   ├── take-task/SKILL.md
│   │   └── ...
│   └── rules/                 # 3 development standards
│       ├── commit-conventions.md
│       ├── development-cycle.md
│       └── testing-standards.md
├── dev-infra/
│   ├── memory/                # 8 Memory Bank files
│   │   ├── active-context.md
│   │   ├── progress.md
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
