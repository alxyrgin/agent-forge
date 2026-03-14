# Shared Resources — реестр singleton-ресурсов

## Правило

Singleton-ресурсы (подключения к БД, клиенты API, логгеры, кэши) создаются ОДИН раз и переиспользуются. Дублирование singleton — баг.

## Реестр

| Ресурс | Файл | Тип | Описание |
|--------|------|-----|----------|
| _пока ресурсов нет_ | | | |

## Правила создания

1. **Проверь реестр** — возможно, ресурс уже существует
2. **Создай в одном месте** — singleton factory в выделенном файле
3. **Добавь в реестр** — обнови таблицу выше
4. **Не создавай дубликатов** — если ресурс есть, используй существующий

## Паттерн


```typescript
// src/lib/database.ts — singleton
let instance: Database | null = null;

export function getDatabase(): Database {
  if (!instance) {
    instance = new Database(process.env.DATABASE_URL);
  }
  return instance;
}
```


## Антипаттерн

```
// НЕ ДЕЛАЙ ТАК — создание нового подключения в каждом обработчике
function handleRequest() {
  const db = new Database(url); // каждый запрос — новое подключение!
}
```
