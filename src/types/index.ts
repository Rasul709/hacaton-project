export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';

export interface User {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  jobTitle: string;
  avatarUrl?: string;
  phone?: string;
}

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  departmentId: string;
  departmentName: string;
  managerId?: string;
  managerName?: string;
  status: EmploymentStatus;
  startDate: string;
  avatarUrl?: string;
  address?: string;
  emergencyContact?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  managerId?: string;
  managerName?: string;
  employeeCount: number;
  activeEmployeesCount: number;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  workDate: string; // YYYY-MM-DD
  clockIn?: string; // ISO string
  clockOut?: string; // ISO string
  durationMinutes?: number;
  status: AttendanceStatus;
  notes?: string;
}

export type LeaveType = 'ANNUAL' | 'SICK' | 'UNPAID' | 'MATERNITY' | 'STUDY';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewComment?: string;
  reviewedAt?: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId: string;
  assignedToName: string;
  createdById: string;
  createdByName: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

export type NotificationType = 'LEAVE' | 'TASK' | 'ATTENDANCE' | 'SYSTEM';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface DashboardOverview {
  totalEmployees: number;
  activeEmployees: number;
  departmentsCount: number;
  pendingLeavesCount: number;
  attendanceTodayCount: number;
  tasksInProgressCount: number;
  employeesByDepartment: {
    department: string;
    count: number;
  }[];
  weeklyAttendance: {
    day: string;
    present: number;
    late: number;
    absent: number;
  }[];
  leaveDistribution: {
    status: LeaveStatus;
    count: number;
    color: string;
  }[];
  tasksByPriority: {
    priority: TaskPriority;
    count: number;
  }[];
  recentActivity: {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    type: 'leave' | 'attendance' | 'employee' | 'task';
  }[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
