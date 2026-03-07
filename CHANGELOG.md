# Changelog

## [2.0.0] - 2026-03-07

### Added

**Agents:**
- `skeptic` (core) — reality checker, validates plans against actual codebase (missing files, APIs, modules)
- `completeness-validator` (extra) — forward/backward requirement tracing with gap analysis
- `report-writer` (extra) — non-technical progress reports for stakeholders

**Skills:**
- `/interview` — structured discovery interview (3 cycles, completeness >= 85%)
- `/audit-wave` — comprehensive pre-milestone audit with GO/NO-GO verdict
- `/write-report` — delegate report generation to report-writer agent
- `/dashboard` — project dashboard with progress, health metrics, tech debt
- `/skill-master` — create new custom skills from template

**Rules:**
- `shared-resources` — singleton resource registry with stack-specific patterns
- `context-loading` — just-in-time context loading, anti-patterns for agent delegation

**Hooks:**
- `protect-docs.sh` — PreToolUse hook blocking Edit/Write in `docs/`
- PreToolUse matcher configuration in settings.json
- Stop hook with checkpoint and memory validation

**Checkpoint system:**
- `checkpoint.yml` — recovery checkpoint for interrupted sessions
- Automatic checkpoint updates after each pipeline step
- Recovery prompt on `/start-session` when checkpoint is active
- Checkpoint cleanup on `/complete-task`

**Feature-size routing:**
- S/M/L task classification with different pipelines (4/6/10 steps)
- Skeptic validation for L-tasks
- Smoke verification for L-tasks

**Settings:**
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` env variable enabled by default

### Changed

- Agent presets: minimal=4, core=9 (was 8), full=14 (was 11)
- Skills: core=7 (unchanged), full=12 (was 7)
- Rules: 5 (was 3) for all presets
- Memory files: 9 (was 8) for all presets
- `/start-session` — now reads checkpoint.yml, checks tech-debt triggers
- `/take-task` — checkpoint recovery (step 0), feature-size detection, skeptic for L-tasks
- `/complete-task` — smoke verification, checkpoint cleanup
- `/end-session` — checkpoint save if task is incomplete
- `development-cycle` rule — feature-size routing S/M/L, checkpoint steps
- `tech-debt` memory — expanded format with lifecycle (open/in_progress/resolved)
- CLAUDE.md — feature-size routing table, checkpoint docs, expanded pipeline, expanded file table
- Manifest version: 2.0.0

## [1.0.0] - 2026-03-02

### Added

- Initial release
- CLI with `init` and `doctor` commands
- 8 core agents, 3 extra agents, 4 minimal agents
- 7 skills (slash commands)
- 3 development rules
- 8 Memory Bank files
- EJS template system with stack-specific rendering
- Interactive and non-interactive setup modes
- Agent presets (core/full/minimal)
