#!/bin/bash
# protect-docs.sh — блокирует Edit/Write в docs/
# Вызывается через PreToolUse hook в settings.json

# Читаем JSON из stdin
INPUT=$(cat)

# Извлекаем путь файла из tool_input
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Проверяем, находится ли файл в docs/
case "$FILE_PATH" in
  docs/*|*/docs/*)
    echo "BLOCKED: редактирование файлов в docs/ запрещено без явного запроса пользователя."
    echo "Если нужно изменить документацию, попросите пользователя подтвердить."
    exit 2
    ;;
  *)
    exit 0
    ;;
esac
