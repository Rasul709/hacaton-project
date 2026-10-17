# 🗄 База данных проекта Digital HR (Jana Post)

В этой папке собрана вся структура и начальные данные базы данных проекта **Digital HR by Jana Post**.

---

## 📁 Содержимое каталога

1. **`schema.sql`** — Полный DDL-скрипт PostgreSQL:
   - Таблицы: `departments`, `employees`, `attendance_records`, `leave_requests`, `tasks`, `notifications`, `courses`, `employee_course_progress`.
   - Пользовательские перечисления (ENUM): роли, статусы посещаемости, типы отпусков, приоритеты задач.
   - Внешние ключи, уникальные ограничения и индексы для оптимизации выборок.
2. **`prisma/schema.prisma`** — Описание моделей данных для Node.js / TypeScript бэкенда через Prisma ORM.
3. **`seeds.json`** — Экспортированный структурированный набор начальных демонстрационных данных (департаменты, сотрудники, табели, задачи, отпуска).

---

## 🚀 Как развернуть локальную БД

### Вариант 1. PostgreSQL напрямую
```bash
# Создание базы данных
createdb janapost_hr

# Применение схемы и сидов
psql -d janapost_hr -f schema.sql
```

### Вариант 2. Через Prisma (для бэкенда)
```bash
# В директории бэкенда:
npx prisma migrate dev --name init
npx prisma db seed
```
