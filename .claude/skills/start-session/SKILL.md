---
name: start-session
description: Начало рабочей сессии. Загружает контекст проекта, проверяет checkpoint, показывает прогресс и рекомендует задачу.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Glob, Grep, Bash
---

# Начало рабочей сессии

Выполни ВСЕ шаги автоматически, без ожидания подтверждения:

## 1. Синхронизировать с удалённым репозиторием

```bash
git fetch origin
```

Проверь, есть ли новые коммиты:
```bash
git log HEAD..origin/main --oneline
```

Если есть новые коммиты — подтяни:
```bash
git pull origin main
```

## 2. Загрузить контекст

Прочитай параллельно:
- `dev-infra/memory/active-context.md`
- `dev-infra/memory/progress.md`
- `dev-infra/memory/checkpoint.yml`
- `dev-infra/tasks/tasks.json`

## 3. Проверить checkpoint

Если `checkpoint.yml` содержит `active: true`:

```
Обнаружена незавершённая задача:
- Задача: [task_title]
- Шаг: [current_step]/[total_steps] — [step_name]
- Feature-size: [feature_size]
- Последнее обновление: [last_updated]

Восстановить работу с шага [current_step]?
```

Если пользователь согласен — запусти `/take-task` с восстановлением.

## 4. Проверить tech-debt триггеры

Прочитай `dev-infra/memory/tech-debt.md`. Если есть записи со статусом `open`, проверь триггеры замены — если условия выполнены, подсвети:
```
Tech-debt TD-NNN «созрел» — триггер [описание] выполнен. Рекомендую взять в работу.
```

## 5. Показать сводку

Выведи компактно:
- **Milestone:** какой milestone, процент выполнения
- **Дедлайн:** дата, сколько дней осталось
- **Прогресс:** задач done / in_progress / todo
- **Блокеры:** если есть — подсветить
- **Tech-debt:** количество open записей

## 6. Показать незавершённые задачи

Из tasks.json покажи задачи со статусом `in_progress`.
Если таких нет — покажи `todo` с приоритетом critical/high.

## 7. Рекомендовать задачу

Выбери ОДНУ задачу и объясни почему:
- Приоритет (critical первые)
- Зависимости выполнены?
- Дедлайн (что ближе?)

## 8. Ожидать решения

Дождись ответа. Если согласен — запусти `/take-task` для этой задачи.
