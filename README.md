# 🚀 Digital HR by Jana Post — Frontend (Hackathon Edition)

> **Премиум-интерфейс платформы управления персоналом и кадровыми процессами компании Jana Post.**  
> Разработано в рамках хакатона в строгом соответствии с архитектурным и визуальным стандартом **Master Prompt**.

---

## 📌 О проекте

**Digital HR by Jana Post** — это корпоративная SaaS-платформа для управления штатом сотрудников, организационной структурой отделов, учетом рабочего времени (Clock In / Clock Out в часовом поясе Казахстана UTC+5), согласованием отпусков и трекингом внутренних задач.

Фронтенд спроектирован для бесшовной интеграции с REST API на **Node.js, Express, TypeScript, PostgreSQL и Prisma**.

---

## 🛠 Технологический стек

- **Ядро:** React 19, TypeScript, Vite
- **Стилизация & Дизайн-система:** Tailwind CSS v4, Inter font, корпоративная палитра Jana Post
- **Маршрутизация:** React Router v7 с защищенными маршрутами (`ProtectedRoute`, `RoleGuard`)
- **Управление серверным состоянием:** TanStack Query v5 (инвалидация кеша, быстрые мутации)
- **Формы и валидация:** React Hook Form + Zod
- **Аналитика & Графики:** Recharts (AreaChart посещаемости, Donut диаграмма отпусков, BarChart численности по отделам)
- **Иконки:** Lucide React
- **Клиент API:** Типизированный HTTP-клиент с обработкой статусов (401, 403, 404, 409, 422, 500) и автономный **Demo Mode**

---

## 🎨 Дизайн-система и палитра Jana Post

- **Deep navy (Header & Brand):** `#101828`
- **Dark sidebar:** `#111827`
- **Primary corporate blue:** `#2563EB`
- **Light blue:** `#EFF6FF`
- **Фоновый оттенок (Canvas):** `#F5F7FB`
- **Карточки:** `#FFFFFF` с мягкими тенями и скруглением 16–24px
- **Успех:** `#16A34A` | **Предупреждение:** `#F59E0B` | **Ошибка:** `#DC2626`

---

## 📂 Структура проекта

```
digital-hr-frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx             # Корневой компонент
│   │   ├── router.tsx          # Конфигурация роутинга и guard'ов
│   │   └── providers.tsx       # QueryClient & AuthProvider
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx   # Адаптивный каркас приложения
│   │   │   ├── Sidebar.tsx     # Коллапсируемый сайдбар с ролевой навигацией
│   │   │   ├── Topbar.tsx      # Верхняя панель: часы UTC+5, Demo-свитчер, уведомления
│   │   │   ├── GlobalSearchModal.tsx # Глобальный поиск (Cmd+K / Ctrl+K)
│   │   │   └── ProtectedRoute.tsx    # Защищенные маршруты
│   │   └── ui/                 # Атомарные UI компоненты (Button, Input, Badge, Modal, MetricCard)
│   ├── features/
│   │   ├── auth/               # Страница входа + демо-пресеты ролей
│   │   ├── dashboard/          # Главный дашборд с метриками и графиками
│   │   ├── employees/          # Реестр сотрудников, личные дела, формы
│   │   ├── departments/        # Департаменты и оргструктура
│   │   ├── attendance/         # Электронный табель и виджет Clock-In / Clock-Out
│   │   ├── leave/              # Заявления на отпуск и модалка согласования
│   │   ├── tasks/              # Канбан-доска и таблица задач
│   │   ├── notifications/      # Центр уведомлений
│   │   └── settings/           # Профиль, смена пароля, диагностика API
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts       # HTTP клиент Fetch API
│   │   │   ├── mockData.ts     # Реалистичные казахстанские данные Jana Post
│   │   │   ├── mockService.ts  # Интерактивный persistent in-memory бэкенд
│   │   │   └── index.ts        # Единый фасад API с переключателем Demo/Live
│   │   └── utils/              # Хелперы времени Казахстана, дат и классов
│   ├── types/                  # Полная TypeScript типизация доменной модели
│   ├── index.css               # Tailwind токены
│   └── main.tsx
├── .env.example
├── .env
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Быстрый запуск

### 1. Установка зависимостей
```bash
cd digital-hr-frontend
npm install
```

### 2. Запуск локального сервера разработки
```bash
npm run dev
```
Приложение откроется по адресу `http://localhost:5173`.

### 3. Сборка для production
```bash
npm run build
```

---

## 🔑 Учетные записи для быстрой демонстрации (Жюри хакатона)

На экране входа (`/login`) добавлены кнопки **быстрого заполнения в 1 клик**:

| Роль | Email | Пароль | Имя | Доступ |
| :--- | :--- | :--- | :--- | :--- |
| **HR Директор (Admin)** | `admin@janapost.kz` | `password123` | Айгерим Смагулова | Полный доступ ко всем модулям |
| **HR Менеджер** | `hr@janapost.kz` | `password123` | Зарина Ибраева | Кадры, отпуска, посещаемость |
| **Руководитель отдела** | `manager@janapost.kz` | `password123` | Бауыржан Касымов | Управление своим отделом и согласование |
| **Сотрудник** | `employee@janapost.kz` | `password123` | Адиль Омаров | Личный табель, подача заявлений, свои задачи |

---

## 🌐 Интеграция с бэкендом (Node.js / Express)

Базовый URL настраивается через переменную окружения в файле `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENABLE_MOCK=false
```

### Переключение режимов в реальном времени:
В шапке приложения (Topbar) и в разделе **Настройки** (`/settings`) есть интерактивный бейдж **[Режим: ДЕМО / LIVE API]**:
- Позволяет в 1 клик переключиться на реальный сервер без перезапуска сборки.
- Доступна кнопка **«Проверить пинг бэкенда»** для моментальной диагностики соединения с Express-сервером напарника.

### Поддерживаемые эндпоинты бэкенда:
- **Auth:** `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`
- **Employees:** `GET /employees`, `POST /employees`, `GET /employees/:id`, `PATCH /employees/:id`, `PATCH /employees/:id/status`
- **Departments:** `GET /departments`, `POST /departments`, `GET /departments/:id`, `PATCH /departments/:id`
- **Attendance:** `POST /attendance/clock-in`, `POST /attendance/clock-out`, `GET /attendance`
- **Leave:** `POST /leave-requests`, `GET /leave-requests`, `POST /leave-requests/:id/approve`, `POST /leave-requests/:id/reject`, `POST /leave-requests/:id/cancel`
- **Tasks:** `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`, `PATCH /tasks/:id/status`
- **Dashboard:** `GET /dashboard/overview`
- **Notifications:** `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`

---

## 🏆 Матрица готовности функционала

| Модуль | Статус фронтенда | Поддержка Demo | Готовность к API бэкенда |
| :--- | :---: | :---: | :---: |
| **Аутентификация & Сессия** | ✅ Готово | ✅ Да | ✅ Готово к `Bearer` / JWT |
| **HR Dashboard (Метрики + Recharts)** | ✅ Готово | ✅ Да | ✅ Готово к `/dashboard/overview` |
| **Штат сотрудников (Таблица + CRUD)** | ✅ Готово | ✅ Да (мутации сохраняются) | ✅ Готово к `/employees` |
| **Личное дело сотрудника** | ✅ Готово | ✅ Да | ✅ Готово к `/employees/:id` |
| **Департаменты (Оргструктура)** | ✅ Готово | ✅ Да | ✅ Готово к `/departments` |
| **Учет времени (Clock In / Out, таймер)** | ✅ Готово | ✅ Да (Live Timer UTC+5) | ✅ Готово к `/attendance` |
| **Отпуска (Подача + Согласование)** | ✅ Готово | ✅ Да | ✅ Готово к `/leave-requests` |
| **Задачи (Канбан-доска + Список)** | ✅ Готово | ✅ Да (смена статусов) | ✅ Готово к `/tasks` |
| **Центр уведомлений** | ✅ Готово | ✅ Да | ✅ Готово к `/notifications` |
| **Глобальный поиск (Cmd+K / Ctrl+K)** | ✅ Готово | ✅ Да | ✅ Клиентский + API |
| **Jana Academy (LMS + Тесты)** | ✅ Готово | ✅ Да | ✅ Готово к `/academy` |
| **AI HR-Ассистент (RAG по ТК РК)** | ✅ Готово | ✅ Да | ✅ Готово к `/ai` |

---

## 🚀 Команды для запуска и тестирования

### 1. Локальный запуск (Фронтенд)
```bash
npm install
npm run dev
# Открыть в браузере: http://localhost:5173
```

### 2. Запуск Live REST API бэкенда
```bash
npm run server
# Сервер запустится на http://localhost:3000/api/v1
# Проверка здоровья: http://localhost:3000/api/v1/health
```

### 3. Автоматизированные тесты (Vitest)
```bash
npm run test
# Запуск 13 юнит-тестов (квоты ТК РК 24 дня, часовой пояс UTC+5, RBAC матрицы)
```

### 4. Проверка качества кода (Linter)
```bash
npm run lint
# 0 ошибок, 0 предупреждений
```

### 5. Запуск в Docker Compose (1-Click Run)
```bash
docker compose up --build
# Поднимает Nginx (порт 80) + Node API (порт 3000)
```

