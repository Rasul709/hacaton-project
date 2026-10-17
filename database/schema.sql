-- ====================================================================
-- Digital HR by Jana Post - PostgreSQL Database Schema
-- Compatible with PostgreSQL 14+, Supabase, Cloud SQL
-- ====================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE employee_role AS ENUM ('admin', 'manager', 'employee');
CREATE TYPE employee_status AS ENUM ('active', 'on_leave', 'probation', 'terminated');
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'remote', 'half_day');
CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'unpaid', 'maternity', 'study');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'completed');
CREATE TYPE notification_type AS ENUM ('leave', 'task', 'attendance', 'system', 'announcement');

-- 1. DEPARTMENTS
CREATE TABLE departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    description TEXT,
    manager_id VARCHAR(64),
    manager_name VARCHAR(255),
    budget NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. EMPLOYEES
CREATE TABLE employees (
    id VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32),
    avatar_url TEXT,
    role employee_role NOT NULL DEFAULT 'employee',
    status employee_status NOT NULL DEFAULT 'active',
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
    position VARCHAR(128) NOT NULL,
    hire_date DATE NOT NULL,
    salary NUMERIC(12, 2) DEFAULT 0.00,
    password_hash VARCHAR(255) NOT NULL DEFAULT '', -- bcrypt hash
    iin VARCHAR(12), -- ИИН РК (12 цифр)
    location VARCHAR(128) DEFAULT 'Алматы, Казахстан',
    vacation_days_total INT DEFAULT 24, -- Трудовой Кодекс РК: 24 календарных дня
    vacation_days_used INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Foreign key for department manager
ALTER TABLE departments 
ADD CONSTRAINT fk_dept_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 3. ATTENDANCE RECORDS (Учет рабочего времени)
CREATE TABLE attendance_records (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    status attendance_status NOT NULL DEFAULT 'present',
    work_hours NUMERIC(4, 2) DEFAULT 0.00,
    overtime_hours NUMERIC(4, 2) DEFAULT 0.00,
    notes TEXT,
    location_in VARCHAR(255),
    location_out VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_emp_date UNIQUE(employee_id, date)
);

-- 4. LEAVE REQUESTS (Заявки на отпуск / отгулы)
CREATE TABLE leave_requests (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type leave_type NOT NULL DEFAULT 'annual',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL,
    reason TEXT NOT NULL,
    status leave_status NOT NULL DEFAULT 'pending',
    reviewed_by VARCHAR(64) REFERENCES employees(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TASKS (Корпоративные задачи)
CREATE TABLE tasks (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority task_priority NOT NULL DEFAULT 'medium',
    assignee_id VARCHAR(64) REFERENCES employees(id) ON DELETE SET NULL,
    creator_id VARCHAR(64) REFERENCES employees(id) ON DELETE SET NULL,
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
    due_date DATE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. NOTIFICATIONS (Уведомления)
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. JANA ACADEMY (LMS Courses & Quizzes)
CREATE TABLE courses (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    duration_minutes INT DEFAULT 45,
    points INT DEFAULT 100,
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee_course_progress (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress_percent INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    score INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_emp_course UNIQUE(employee_id, course_id)
);

-- INDEXES
CREATE INDEX idx_emp_dept ON employees(department_id);
CREATE INDEX idx_emp_role ON employees(role);
CREATE INDEX idx_att_date ON attendance_records(date);
CREATE INDEX idx_att_emp ON attendance_records(employee_id);
CREATE INDEX idx_leave_emp ON leave_requests(employee_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read);

-- 8. AUDIT LOGS (Журнал аудита обращений к персональным данным, Закон РК № 94-V)
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64),
    user_email VARCHAR(255),
    user_role VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    ip_address VARCHAR(64),
    user_agent TEXT,
    status VARCHAR(32) DEFAULT 'SUCCESS',
    details JSONB,
    prev_hash VARCHAR(64),
    hash VARCHAR(64) NOT NULL
);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
