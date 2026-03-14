# agent-forge

AI-driven Development Framework for Claude Code.

Scaffold a complete development infrastructure with Memory Bank, specialized agents, skills, hooks, checkpoint system, and development rules in any project.

## Quick Start

```bash
npx @alxyrgin/agent-forge init
```

This creates a full AI-driven development infrastructure in your project:

- **`.claude/`** — CLAUDE.md (Team Lead instructions), 5-20 agents, 10-21 skills, 8 rules, hooks
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

20 specialized AI agents organized in 4 categories:

| Category | Agents | Count |
|----------|--------|-------|
| Pipeline | analyst, architect, skeptic, developer, tester, inspector, reviewer, planner | 8 |
| Planning | researcher, validator, interviewer, decomposer | 4 |
| Security | auditor, prompter, deployer, scaffolder | 4 |
| Documentation | librarian, writer, gatekeeper, verifier | 4 |

**Preset coverage:**
- **minimal** (5 agents) — analyst, developer, tester, inspector, reviewer
- **core** (8 agents) — full pipeline category
- **full** (20 agents) — all categories

### Skills (Slash Commands)

#### Core skills (all presets) — 10

| Command | Description |
|---------|-------------|
| `/start-session` | Begin work: sync repo, check checkpoint, load context, show progress |
| `/end-session` | Save context, checkpoint, create session log, commit & push |
| `/take-task [id]` | Full development cycle with feature-size routing (S/M/L) |
| `/complete-task [id]` | Verify task, smoke test, update progress, clear checkpoint |
| `/status` | Show project status, deadlines, blockers |
| `/plan [mode]` | Plan/replan/validate tasks from documentation |
| `/review [file]` | Code review for file or task |
| `/code [task]` | Direct code generation for a specific task |
| `/test [target]` | Run or generate tests for a target |
| `/done [id]` | Quick-complete a task with minimal ceremony |

#### Extra skills (full preset only) — 11

| Command | Description |
|---------|-------------|
| `/interview` | Structured discovery interview (3 cycles, completeness >= 85%) |
| `/audit-wave` | Comprehensive pre-milestone audit with GO/NO-GO verdict |
| `/write-report` | Generate non-technical progress report for stakeholders |
| `/dashboard` | Project dashboard: progress, health, tech debt, activity |
| `/skill-master [name]` | Create a new custom skill from template |
| `/decompose [task]` | Break down a task into subtasks |
| `/feature [name]` | Scaffold a new feature end-to-end |
| `/security [target]` | Run security analysis on a target |
| `/spec [feature]` | Generate specification for a feature |
| `/techspec [module]` | Generate technical specification for a module |
| `/prompts [agent]` | Manage and optimize agent prompts |

### Feature-size Routing

Tasks are automatically classified and routed through the appropriate pipeline:

| Size | Criteria | Steps |
|------|----------|-------|
| **S** | 1 file, < 50 lines | checkpoint → code → tester+inspector → quick-review → tech-debt → fixation (6 steps) |
| **M** | 2-5 files, new module | checkpoint → analysis → TDD(RED) → code+tester+inspector → review → tech-debt → fixation (8 steps) |
| **L** | 6+ files, architecture changes | full cycle with architect, skeptic, per-feature loops, inspector, multi-round review (10 steps) |

### Checkpoint System

The checkpoint system (`dev-infra/memory/checkpoint.yml`) enables recovery after session interruptions:

- **Automatic saving** — checkpoint is updated after each pipeline step
- **Recovery on start** — `/start-session` detects active checkpoint and offers to resume
- **Cleanup on completion** — `/complete-task` clears the checkpoint

### Hooks

- **`protect-docs.sh`** — PreToolUse hook that blocks Edit/Write operations in `docs/` directory
- **Stop hook** — Reminds to save checkpoint and run `/end-session` before exiting

### Rules

8 development standards enforced automatically:

| Rule | Purpose |
|------|---------|
| `commit-conventions` | Commit message format and style |
| `development-cycle` | Feature-size routing and pipeline steps |
| `testing-standards` | Test coverage and quality requirements |
| `shared-resources` | Singleton resource registry and patterns |
| `context-loading` | Just-in-time context loading, anti-patterns |
| `agent-output-format` | JSON output standard for all agents |
| `quality-gates` | Verdict-based routing and quality checkpoints |
| `rollback-protocol` | Rollback procedures for failed deployments |

## Configuration

### Agent Presets

| Preset | Agents | Skills | Description |
|--------|--------|--------|-------------|
| **minimal** | 5 | 10 | Essentials + inspector |
| **core** (default) | 8 | 10 | Full development pipeline |
| **full** | 20 | 21 | All categories + extra skills |

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
│   ├── agents/                # 5-20 specialized agents (4 categories)
│   │   ├── pipeline/          # analyst, architect, skeptic, developer,
│   │   │                      # tester, inspector, reviewer, planner
│   │   ├── planning/          # researcher, validator, interviewer, decomposer
│   │   ├── security/          # auditor, prompter, deployer, scaffolder
│   │   └── documentation/     # librarian, writer, gatekeeper, verifier
│   ├── skills/                # 10-21 slash commands
│   │   ├── start-session/SKILL.md
│   │   ├── take-task/SKILL.md
│   │   └── ...
│   └── rules/                 # 8 development standards
│       ├── commit-conventions.md
│       ├── development-cycle.md
│       ├── testing-standards.md
│       ├── shared-resources.md
│       ├── context-loading.md
│       ├── agent-output-format.md
│       ├── quality-gates.md
│       └── rollback-protocol.md
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
