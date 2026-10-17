# 📡 Спецификация REST API — Digital HR by Jana Post

Базовый URL: `https://api.janapost.kz/api/v1` (или `http://localhost:3000/api/v1`)

---

## 🔐 1. Аутентификация (`/auth`)
* `POST /auth/login` — Вход в систему (email, password) -> возвращает JWT token и объект `user`.
* `POST /auth/logout` — Завершение сессии.
* `GET /auth/me` — Получение данных текущего авторизованного пользователя.

## 👥 2. Сотрудники (`/employees`)
* `GET /employees` — Список сотрудников с фильтрацией по отделу, статусу, поисковому запросу и пагинацией.
* `GET /employees/:id` — Полная карточка сотрудника (включая историю отпусков и контакты).
* `POST /employees` — Добавление нового сотрудника (роли: `admin`, `manager`).
* `PUT /employees/:id` — Обновление данных сотрудника.
* `DELETE /employees/:id` — Деактивация (архивирование) сотрудника.

## 🏢 3. Департаменты (`/departments`)
* `GET /departments` — Список отделов с количеством сотрудников и руководителем.
* `POST /departments` — Создание нового департамента.
* `PUT /departments/:id` — Изменение параметров отдела.

## ⏱ 4. Посещаемость (`/attendance`)
* `GET /attendance` — Выборка записей табеля за диапазон дат.
* `POST /attendance/clock-in` — Фиксация прихода на смену с текущей меткой времени UTC+5 и координатами/IP.
* `POST /attendance/clock-out` — Фиксация ухода со смены и расчет отработанных часов.
* `GET /attendance/export` — Выгрузка табеля Формы Т-13 в CSV/Excel.

## 🏖 5. Отпуска и отгулы (`/leave`)
* `GET /leave/requests` — Список заявлений (для руководителя/HR или текущего сотрудника).
* `POST /leave/requests` — Подача нового заявления (тип, даты, основание).
* `PUT /leave/requests/:id/approve` — Согласование заявления руководителем.
* `PUT /leave/requests/:id/reject` — Отклонение с указанием причины.
* `GET /leave/balance/:employeeId` — Остаток неиспользованных дней отпуска (из 24 дней).

## 📋 6. Задачи (`/tasks`)
* `GET /tasks` — Список задач с фильтрацией по статусу и исполнителю.
* `POST /tasks` — Создание задачи.
* `PATCH /tasks/:id/status` — Быстрая смена статуса (TODO, IN_PROGRESS, DONE).

## 🎓 7. Jana Academy LMS (`/academy`)
* `GET /academy/courses` — Каталог учебных курсов.
* `GET /academy/courses/:id` — Материалы уроков и вопросы тестирования.
* `POST /academy/courses/:id/complete` — Фиксация прохождения и начисление баллов.
