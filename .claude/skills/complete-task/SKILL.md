---
name: complete-task
description: Завершить задачу. Проверяет тесты, smoke verification, обновляет прогресс, очищает checkpoint.
user-invocable: true
disable-model-invocation: false
argument-hint: "[task-id]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Завершить задачу

Аргумент: `$ARGUMENTS` — ID задачи (опционально).

## 1. Определить задачу
- Из аргумента или найти in_progress задачу в tasks.json

## 2. Smoke verification
- Запусти полный набор тестов: `npx vitest run`
- Если тесты падают — **не завершай задачу**, сообщи пользователю

## 3. Проверить готовность
- **Тесты написаны?** Ищи тесты в `tests/`
- **Тесты проходят?** Результат из шага 2
- **Критерии приёмки?** Проверь выполнение

## 4. Проверить технический долг
- Mock-данные вместо реальных?
- Упрощённая логика?
- Workaround?

Если да — добавь запись в `dev-infra/memory/tech-debt.md`.

## 5. Обновить систему

Team Lead обновляет самостоятельно (мелкая правка):
- `dev-infra/tasks/tasks.json` — статус задачи → `done`, updated → сегодня
- `dev-infra/memory/progress.md` — процент выполнения milestone
- `dev-infra/memory/active-context.md` — что сделано, что дальше

## 6. Очистить checkpoint

Обнови `dev-infra/memory/checkpoint.yml`:
```yaml
active: false
```

## 7. Предложить следующую задачу
- По приоритету и зависимостям

## 8. Предложить коммит
