# 🧠 Digital HR by Jana Post — Antigravity Memory & Workspace Rules

Welcome to the **Digital HR by Jana Post** workspace. This file establishes the operational memory, architectural guidelines, and context rules for Antigravity AI agents working on this project.

---

## 📌 Project Overview
* **Name:** Digital HR by Jana Post (HR-Digital)
* **Goal:** Enterprise HR management & corporate workforce automation platform tailored for Jana Post logistics network and compliant with the Labor Code of the Republic of Kazakhstan (Трудовой кодекс РК).
* **Target Audience:** HR Directors, Department Managers/Team Leads, and Corporate Employees.
* **Repository:** `https://github.com/Rasul709/hacaton-project` (branch `main`).

---

## 🛠 Tech Stack
* **Frontend Core:** React 19, TypeScript (~6.0), Vite (~8.3)
* **Styling & Design System:** Tailwind CSS v4, Inter font, custom Jana Post palette
* **Routing:** React Router v7 with route-level error boundaries (`RouteErrorBoundary`), lazy loading, and role guards (`ProtectedRoute`, `RoleGuard`)
* **Data Fetching & Cache:** TanStack Query v5
* **Forms & Validation:** React Hook Form + Zod
* **Charts & Analytics:** Recharts (AreaChart for weekly attendance, Donut/Pie for leave statuses, BarChart for department headcount)
* **Icons:** Lucide React
* **State & Persistence:** Dual-mode HTTP Client:
  1. **Demo Mode (default in browser):** Powered by `MockService` backed by `localStorage` (`jp_mock_*`) with pre-seeded data.
  2. **Live API Mode:** Standard Bearer token authentication against REST API backend (`VITE_API_URL`).

---

## 🇰🇿 Kazakhstan Context & Business Logic
1. **Timezone:** Strict `Asia/Almaty` / `UTC+5` formatting across all clock-in/out timestamps, leave dates, and audit logs.
2. **Labor Code of RK:**
   * Annual paid leave quota default: **24 calendar days**.
   * Sick leave and unpaid leave tracking.
   * Statutory print forms: Приказ об отпуске (Форма Т-6), Личная карточка сотрудника (Форма Т-2), Табель учета рабочего времени (Форма Т-13).
3. **Currency & Locale:** KZT (₸), Russian and Kazakh language support.

---

## 👥 Role-Based Access Control (RBAC) & Personas
* **HR Director / Super Admin (`admin`):** Айгерим Смагулова (`emp-1`). Full access to all modules, employee CRUD, salary views, department management, leave approvals.
* **Manager / Team Lead (`manager`):** Нурлан Сериков (`emp-3`). Access to department subordinates, attendance logs, task assignments, leave review.
* **Employee (`employee`):** Азамат Ибраев (`emp-2`). Access to Personal Cabinet, Clock In / Clock Out, personal leave requests, assigned tasks, Jana Academy LMS, AI Assistant.

---

## 📂 Project Architecture
```
HR-Digital/
├── database/                   # Database schemas (PostgreSQL SQL DDL, Prisma ORM, Seeds)
│   ├── schema.sql
│   ├── seeds.json
│   └── prisma/schema.prisma
├── docs/                       # Architecture, Memory, API Specification
│   ├── MEMORY.md
│   ├── ARCHITECTURE.md
│   └── API_SPEC.md
├── public/                     # Static assets & standalone HTML artifacts
│   └── digital_hr_core_30.html # Standalone Core 30% MVP presentation
├── src/
│   ├── app/                    # Root App, Providers, React Router v7 config
│   ├── components/layout/      # AppLayout, Topbar (UTC+5), Sidebar, GlobalSearch (Ctrl+K)
│   ├── components/ui/          # Button, Input, Modal, Badge, Card, Toast, RouteErrorBoundary
│   ├── features/
│   │   ├── academy/            # Jana Academy LMS with video/quiz lessons
│   │   ├── ai-assistant/       # RAG HR AI Assistant with floating widget & full chat
│   │   ├── attendance/         # Real-time Clock-In/Clock-Out with GPS/IP simulation
│   │   ├── auth/               # Login page with demo switcher
│   │   ├── dashboard/          # Executive dashboard & personal employee view
│   │   ├── departments/        # Department hierarchy, headcounts, budgets
│   │   ├── employees/          # Directory, filters, employee profile modal, forms
│   │   ├── leave/              # Leave balance quotas (24d), approval workflow, calendar
│   │   ├── notifications/      # Real-time event notifications & mark all as read
│   │   ├── presentation/       # 30-slide pitch presentation mode with timer
│   │   ├── settings/           # Corporate & security preferences
│   │   └── tasks/              # Kanban/List task manager with priorities & deadlines
│   ├── lib/api/                # HTTP client, MockService, seed data
│   └── types/                  # TypeScript interface definitions
├── .env                        # Local environment variables
└── GEMINI.md                   # This memory file
```

---

## 📋 Antigravity Agent Guidelines
* Always maintain documentation integrity and preserve comments.
* Any changes to data models should be reflected in both `src/types/index.ts`, `src/lib/api/mockData.ts`, and `database/`.
* All date/time strings displayed to users must conform to Kazakhstan timezone (`UTC+5`).
* Keep the code compatible with strict TypeScript (`tsconfig.app.json`).
