import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { EmployeesPage } from '@/features/employees/EmployeesPage';
import { DepartmentsPage } from '@/features/departments/DepartmentsPage';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { LeavePage } from '@/features/leave/LeavePage';
import { TasksPage } from '@/features/tasks/TasksPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'employees',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD']} />,
            children: [{ index: true, element: <EmployeesPage /> }],
          },
          {
            path: 'departments',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD']} />,
            children: [{ index: true, element: <DepartmentsPage /> }],
          },
          {
            path: 'attendance',
            element: <AttendancePage />,
          },
          {
            path: 'leave',
            element: <LeavePage />,
          },
          {
            path: 'tasks',
            element: <TasksPage />,
          },
          {
            path: 'notifications',
            element: <NotificationsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
