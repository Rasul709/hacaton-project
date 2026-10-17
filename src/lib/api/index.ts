import {
  User,
  Employee,
  Department,
  AttendanceRecord,
  LeaveRequest,
  TaskItem,
  AppNotification,
  DashboardOverview,
  PaginationParams,
  PaginatedResult,
} from '@/types';
import { apiRequest, setClientToken } from './client';
import { mockService } from './mockService';

// Determine initial demo mode state:
// 1. From localStorage if user toggled it
// 2. Or from VITE_ENABLE_MOCK environment variable
// 3. Defaults to true for smooth hackathon demonstration if backend isn't running yet!
const DEMO_STORAGE_KEY = 'jp_demo_mode_enabled';

export function isDemoModeEnabled(): boolean {
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  const envVal = import.meta.env.VITE_ENABLE_MOCK;
  if (envVal !== undefined) {
    return envVal === 'true';
  }
  return false; // Default to Live API mode
}

export function setDemoModeEnabled(enabled: boolean): void {
  localStorage.setItem(DEMO_STORAGE_KEY, String(enabled));
  window.location.reload();
}

export const api = {
  // --- Auth ---
  auth: {
    async login(email: string, password: string): Promise<{ token: string; user: User }> {
      if (isDemoModeEnabled()) {
        const res = await mockService.login(email, password);
        setClientToken(res.token);
        return res;
      }
      const res = await apiRequest<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setClientToken(res.token);
      return res;
    },

    async logout(): Promise<void> {
      if (isDemoModeEnabled()) {
        await mockService.logout();
        setClientToken(null);
        return;
      }
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } finally {
        setClientToken(null);
      }
    },

    async getMe(): Promise<User> {
      if (isDemoModeEnabled()) {
        return mockService.getCurrentUser();
      }
      return apiRequest<User>('/auth/me');
    },

    async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean }> {
      if (isDemoModeEnabled()) {
        return mockService.changePassword(oldPassword, newPassword);
      }
      return apiRequest<{ success: boolean }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
    },
  },

  // --- Dashboard ---
  dashboard: {
    async getOverview(): Promise<DashboardOverview> {
      if (isDemoModeEnabled()) {
        return mockService.getDashboardOverview();
      }
      return apiRequest<DashboardOverview>('/dashboard/overview');
    },
  },

  // --- Employees ---
  employees: {
    async getAll(params?: PaginationParams): Promise<PaginatedResult<Employee>> {
      if (isDemoModeEnabled()) {
        return mockService.getEmployees(params);
      }
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.search) query.set('search', params.search);
      if (params?.departmentId) query.set('departmentId', params.departmentId);
      if (params?.status) query.set('status', params.status);
      const qs = query.toString();
      return apiRequest<PaginatedResult<Employee>>(`/employees${qs ? `?${qs}` : ''}`);
    },

    async getById(id: string): Promise<Employee> {
      if (isDemoModeEnabled()) {
        return mockService.getEmployeeById(id);
      }
      return apiRequest<Employee>(`/employees/${id}`);
    },

    async create(data: Omit<Employee, 'id' | 'employeeId'>): Promise<Employee> {
      if (isDemoModeEnabled()) {
        return mockService.createEmployee(data);
      }
      return apiRequest<Employee>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: Partial<Employee>): Promise<Employee> {
      if (isDemoModeEnabled()) {
        return mockService.updateEmployee(id, data);
      }
      return apiRequest<Employee>(`/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    async setStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Employee> {
      if (isDemoModeEnabled()) {
        return mockService.setEmployeeStatus(id, status);
      }
      return apiRequest<Employee>(`/employees/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  // --- Departments ---
  departments: {
    async getAll(): Promise<Department[]> {
      if (isDemoModeEnabled()) {
        return mockService.getDepartments();
      }
      return apiRequest<Department[]>('/departments');
    },

    async create(data: Omit<Department, 'id' | 'employeeCount' | 'activeEmployeesCount'>): Promise<Department> {
      if (isDemoModeEnabled()) {
        return mockService.createDepartment(data);
      }
      return apiRequest<Department>('/departments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: Partial<Department>): Promise<Department> {
      if (isDemoModeEnabled()) {
        return mockService.updateDepartment(id, data);
      }
      return apiRequest<Department>(`/departments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  },

  // --- Attendance ---
  attendance: {
    async getAll(params?: { date?: string; departmentId?: string; employeeId?: string }): Promise<AttendanceRecord[]> {
      if (isDemoModeEnabled()) {
        return mockService.getAttendance(params);
      }
      const query = new URLSearchParams();
      if (params?.date) query.set('date', params.date);
      if (params?.departmentId) query.set('departmentId', params.departmentId);
      if (params?.employeeId) query.set('employeeId', params.employeeId);
      const qs = query.toString();
      return apiRequest<AttendanceRecord[]>(`/attendance${qs ? `?${qs}` : ''}`);
    },

    async clockIn(notes?: string): Promise<AttendanceRecord> {
      if (isDemoModeEnabled()) {
        return mockService.clockIn(notes);
      }
      return apiRequest<AttendanceRecord>('/attendance/clock-in', {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
    },

    async clockOut(): Promise<AttendanceRecord> {
      if (isDemoModeEnabled()) {
        return mockService.clockOut();
      }
      return apiRequest<AttendanceRecord>('/attendance/clock-out', {
        method: 'POST',
      });
    },
  },

  // --- Leave Requests ---
  leave: {
    async getAll(params?: { status?: string; employeeId?: string }): Promise<LeaveRequest[]> {
      if (isDemoModeEnabled()) {
        return mockService.getLeaveRequests(params);
      }
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.employeeId) query.set('employeeId', params.employeeId);
      const qs = query.toString();
      return apiRequest<LeaveRequest[]>(`/leave-requests${qs ? `?${qs}` : ''}`);
    },

    async create(data: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt' | 'employeeId' | 'employeeName'>): Promise<LeaveRequest> {
      if (isDemoModeEnabled()) {
        return mockService.createLeaveRequest(data);
      }
      return apiRequest<LeaveRequest>('/leave-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async approve(id: string, comment?: string): Promise<LeaveRequest> {
      if (isDemoModeEnabled()) {
        return mockService.approveLeaveRequest(id, comment);
      }
      return apiRequest<LeaveRequest>(`/leave-requests/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      });
    },

    async reject(id: string, comment: string): Promise<LeaveRequest> {
      if (isDemoModeEnabled()) {
        return mockService.rejectLeaveRequest(id, comment);
      }
      return apiRequest<LeaveRequest>(`/leave-requests/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      });
    },

    async cancel(id: string): Promise<LeaveRequest> {
      if (isDemoModeEnabled()) {
        return mockService.cancelLeaveRequest(id);
      }
      return apiRequest<LeaveRequest>(`/leave-requests/${id}/cancel`, {
        method: 'POST',
      });
    },
  },

  // --- Tasks ---
  tasks: {
    async getAll(params?: { status?: string; priority?: string }): Promise<TaskItem[]> {
      if (isDemoModeEnabled()) {
        return mockService.getTasks(params);
      }
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.priority) query.set('priority', params.priority);
      const qs = query.toString();
      return apiRequest<TaskItem[]>(`/tasks${qs ? `?${qs}` : ''}`);
    },

    async create(data: Omit<TaskItem, 'id' | 'createdAt' | 'createdById' | 'createdByName'>): Promise<TaskItem> {
      if (isDemoModeEnabled()) {
        return mockService.createTask(data);
      }
      return apiRequest<TaskItem>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: Partial<TaskItem>): Promise<TaskItem> {
      if (isDemoModeEnabled()) {
        return mockService.updateTask(id, data);
      }
      return apiRequest<TaskItem>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    async updateStatus(id: string, status: TaskItem['status']): Promise<TaskItem> {
      if (isDemoModeEnabled()) {
        return mockService.updateTaskStatus(id, status);
      }
      return apiRequest<TaskItem>(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  // --- Notifications ---
  notifications: {
    async getAll(): Promise<AppNotification[]> {
      if (isDemoModeEnabled()) {
        return mockService.getNotifications();
      }
      return apiRequest<AppNotification[]>('/notifications');
    },

    async markAsRead(id: string): Promise<void> {
      if (isDemoModeEnabled()) {
        return mockService.markNotificationAsRead(id);
      }
      return apiRequest(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },

    async markAllAsRead(): Promise<void> {
      if (isDemoModeEnabled()) {
        return mockService.markAllNotificationsAsRead();
      }
      return apiRequest('/notifications/read-all', {
        method: 'PATCH',
      });
    },
  },

  demo: {
    resetData: () => mockService.resetDemoData(),
  },
};
