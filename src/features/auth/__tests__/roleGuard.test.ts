import { describe, it, expect } from 'vitest';
import { UserRole } from '@/types';

type Permission =
  | 'view_all_salaries'
  | 'approve_leave'
  | 'manage_departments'
  | 'clock_in_out'
  | 'view_lms_courses'
  | 'manage_tasks';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'view_all_salaries',
    'approve_leave',
    'manage_departments',
    'clock_in_out',
    'view_lms_courses',
    'manage_tasks',
  ],
  HR_MANAGER: [
    'approve_leave',
    'manage_departments',
    'clock_in_out',
    'view_lms_courses',
    'manage_tasks',
  ],
  DEPARTMENT_HEAD: [
    'approve_leave',
    'clock_in_out',
    'view_lms_courses',
    'manage_tasks',
  ],
  EMPLOYEE: [
    'clock_in_out',
    'view_lms_courses',
  ],
};

function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

describe('Role-Based Access Control (RBAC) Security Matrix', () => {
  it('ADMIN has full administrative permissions including salary view & departments', () => {
    expect(hasPermission('ADMIN', 'view_all_salaries')).toBe(true);
    expect(hasPermission('ADMIN', 'manage_departments')).toBe(true);
    expect(hasPermission('ADMIN', 'approve_leave')).toBe(true);
  });

  it('DEPARTMENT_HEAD can approve leave and manage tasks, but cannot view company salaries', () => {
    expect(hasPermission('DEPARTMENT_HEAD', 'approve_leave')).toBe(true);
    expect(hasPermission('DEPARTMENT_HEAD', 'manage_tasks')).toBe(true);
    expect(hasPermission('DEPARTMENT_HEAD', 'view_all_salaries')).toBe(false);
  });

  it('EMPLOYEE can clock in and view courses, but cannot approve leave or manage departments', () => {
    expect(hasPermission('EMPLOYEE', 'clock_in_out')).toBe(true);
    expect(hasPermission('EMPLOYEE', 'view_lms_courses')).toBe(true);
    expect(hasPermission('EMPLOYEE', 'approve_leave')).toBe(false);
    expect(hasPermission('EMPLOYEE', 'manage_departments')).toBe(false);
  });
});
