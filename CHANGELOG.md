# Changelog

## [3.0.0] — 2026-03-14

### Breaking Changes
- Структура шаблонов агентов: `templates/agents/core/` → `templates/agents/pipeline/`
- `writer` перемещён из pipeline в documentation
- Пайплайны изменены: S(4→6), M(6→8), L(7→10)
- Пресеты изменены: minimal(4→5), core(8), full(8→20)

### Added
- 12 новых агентов: inspector, researcher, validator, interviewer, decomposer, auditor, prompter, deployer, scaffolder, librarian, gatekeeper, verifier
- 4 категории агентов: pipeline(8), planning(4), security(4), documentation(4)
- 3 новых правила: agent-output-format, quality-gates, rollback-protocol
- 9 новых скиллов: code, test, done (core); decompose, feature, security, spec, techspec, prompts (extra)
- Quality Gates система с verdict-маршрутизацией
- JSON Output стандарт для всех агентов
- TDD(RED) фаза для M/L задач
- Inspector обязателен после tester
- Per-feature loop для L-задач
- Rollback protocol

### Changed
- Все pipeline-агенты обновлены: JSON output, verdicts, TDD awareness
- take-task: полная переработка пайплайнов
- start-session: tech-debt trigger check
- development-cycle: S(6)/M(8)/L(10) шагов
- CLAUDE.md: conditional rendering по preset, quality gates, 8 ключевых правил

## [2.1.0] - 2026-03-11

### Changed

**Agents — консолидация (14 → 8+):**
- `unit-tester` → **`tester`** с параметром `level` (unit/integration/acceptance/smoke)
- `doc-writer` + `report-writer` → **`writer`** с параметром `mode` (docs/report)
- `planner` промоутнут из extra в **core** с новым режимом `completeness`
- `reviewer` усилен: 3 раунда ревью, эскалация, режим `plan_review`, встроенная проверка безопасности (заменяет `security-auditor`)
- `skeptic` переведён на модель opus (было sonnet)
- Удалены: `security-auditor`, `progress-tracker`, `integration-tester`, `acceptance-tester`, `completeness-validator`, `report-writer`

**Пресеты:**
- minimal: 4 агента (analyst, developer, tester, reviewer)
- core: 8 агентов (+ architect, skeptic, planner, writer)
- full: 8 агентов (= core)

**Feature-size routing — оптимизация пайплайнов:**
- S-задачи: убран analyst (контекст очевиден) → developer → tester → tech-debt → фиксация (4 шага)
- M-задачи: убран architect → analyst → developer → tester → reviewer → tech-debt → фиксация (6 шагов)
- L-задачи: параллельность architect+reviewer(plan_review), per-feature циклы developer↔tester, reviewer до 3 раундов (7 шагов)
- Tech-debt обязателен для ВСЕХ размеров (S/M/L)

**Reviewer — усиление:**
- Максимум 3 раунда ревью (не бесконечный цикл)
- Категоризация: CRITICAL / HIGH / MEDIUM / LOW
- Эскалация после 3 раундов с нерешёнными CRITICAL → Team Lead
- Режим plan_review для параллельной проверки плана architect'а
- Встроенная проверка безопасности (заменяет security-auditor)

**Context Loading — усиление:**
- Матрица контекста по агентам (что загрузить / что НЕ загружать)
- Forward/backward tracing (требования ↔ код ↔ тесты)
- Scope creep detection

**Skills:**
- `/take-task` — новая логика пайплайнов (S/M/L)
- `/complete-task` — tech-debt обязателен, progress-tracker заменён на прямое обновление Team Lead
- `/audit-wave` — использует planner(completeness), reviewer(security), tester(acceptance)
- `/write-report` — использует writer(report) вместо report-writer
- `/review` — reviewer с фокусом на безопасность вместо security-auditor

### Removed
- Агенты: `security-auditor`, `progress-tracker`, `unit-tester`, `doc-writer`, `integration-tester`, `acceptance-tester`, `completeness-validator`, `report-writer`

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
