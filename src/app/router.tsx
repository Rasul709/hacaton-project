import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RouteErrorBoundary } from '@/components/ui/RouteErrorBoundary';

// Lazy loading all pages for optimal code splitting & instant initial load
const LoginPage = React.lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = React.lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const EmployeesPage = React.lazy(() =>
  import('@/features/employees/EmployeesPage').then((m) => ({ default: m.EmployeesPage }))
);
const DepartmentsPage = React.lazy(() =>
  import('@/features/departments/DepartmentsPage').then((m) => ({ default: m.DepartmentsPage }))
);
const AttendancePage = React.lazy(() =>
  import('@/features/attendance/AttendancePage').then((m) => ({ default: m.AttendancePage }))
);
const LeavePage = React.lazy(() =>
  import('@/features/leave/LeavePage').then((m) => ({ default: m.LeavePage }))
);
const TasksPage = React.lazy(() =>
  import('@/features/tasks/TasksPage').then((m) => ({ default: m.TasksPage }))
);
const NotificationsPage = React.lazy(() =>
  import('@/features/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const SettingsPage = React.lazy(() =>
  import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const AcademyPage = React.lazy(() =>
  import('@/features/academy/AcademyPage').then((m) => ({ default: m.AcademyPage }))
);
const AiAssistantPage = React.lazy(() =>
  import('@/features/ai-assistant/AiAssistantPage').then((m) => ({ default: m.AiAssistantPage }))
);

const PageLoader: React.FC = () => (
  <div className="space-y-6 animate-pulse p-1 text-left">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-7 w-56 bg-slate-200 rounded-xl" />
        <div className="h-4 w-80 bg-slate-100 rounded-lg" />
      </div>
      <div className="h-9 w-32 bg-slate-200 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
      ))}
    </div>
    <div className="h-80 bg-white rounded-2xl border border-slate-200" />
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    errorElement: <RouteErrorBoundary />,
    element: withSuspense(LoginPage),
  },
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: withSuspense(DashboardPage),
          },
          {
            path: 'employees',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD']} />,
            children: [{ index: true, element: withSuspense(EmployeesPage) }],
          },
          {
            path: 'departments',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD']} />,
            children: [{ index: true, element: withSuspense(DepartmentsPage) }],
          },
          {
            path: 'attendance',
            element: withSuspense(AttendancePage),
          },
          {
            path: 'leave',
            element: withSuspense(LeavePage),
          },
          {
            path: 'tasks',
            element: withSuspense(TasksPage),
          },
          {
            path: 'notifications',
            element: withSuspense(NotificationsPage),
          },
          {
            path: 'settings',
            element: withSuspense(SettingsPage),
          },
          {
            path: 'academy',
            element: withSuspense(AcademyPage),
          },
          {
            path: 'ai-assistant',
            element: withSuspense(AiAssistantPage),
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
