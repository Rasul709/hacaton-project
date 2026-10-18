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
  role?: UserRole;
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
  salary?: number;
  iin?: string;
  contractNumber?: string;
  enbekStatus?: 'REGISTERED' | 'PENDING' | 'NOT_REGISTERED';
  enbekContractId?: string;
  enbekSyncDate?: string;
  kpi?: {
    onTimeDeliveryRate?: number;
    averageDeliveryMinutes?: number;
    csatRating?: number;
    completedOrders?: number;
  };
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

// 1. Pure Leave Requests (Трудовые отпуска по ТК РК)
export type LeaveType =
  | 'ANNUAL'
  | 'SICK'
  | 'UNPAID'
  | 'MATERNITY'
  | 'STUDY';

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
  attachmentUrl?: string;
  attachmentName?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewComment?: string;
  reviewedAt?: string;
}

// 2. NEW Dedicated Domain Entity: Salary Advance (Межрасчетный аванс по заработной плате)
export type SalaryAdvanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface SalaryAdvanceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  amount: number;
  payoutDate: string;
  reason: string;
  status: SalaryAdvanceStatus;
  submittedAt: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewComment?: string;
  reviewedAt?: string;
}

// 3. NEW Dedicated Domain Entity: HR Certificates (Кадровые справки)
export type CertificateType =
  | 'WORK_CONFIRMATION'
  | 'INCOME_CONFIRMATION_6M'
  | 'INCOME_CONFIRMATION_12M'
  | 'FORM_T2';

export type CertificateStatus = 'PENDING' | 'READY' | 'REJECTED';

export interface CertificateRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  certificateType: CertificateType;
  purpose: string;
  language: 'ru' | 'kz';
  status: CertificateStatus;
  submittedAt: string;
  completedAt?: string;
  documentUrl?: string;
  notes?: string;
}


export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type HRWorkflowCategory = 'ONBOARDING' | 'OFFBOARDING' | 'COMPLIANCE' | 'GENERAL';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category?: HRWorkflowCategory;
  targetEmployeeName?: string;
  targetEmployeeId?: string;
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

export type NotificationType = 'LEAVE' | 'TASK' | 'ATTENDANCE' | 'ACADEMY' | 'SYSTEM';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Jana Academy LMS Types
export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
  content: string; // Markdown or text
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  estimatedMinutes: number;
  lessonsCount: number;
  lessons: CourseLesson[];
  quiz: QuizQuestion[];
  isMandatory: boolean;
  badgeName: string;
  progressPercent: number;
  isCompleted: boolean;
  score?: number;
}

// AI HR Assistant Types
export interface KnowledgeSource {
  title: string;
  document: string;
  section: string;
  confidence: number;
}

export interface AiModelInfo {
  id: string;
  name: string;
  speed: string;
  bestFor: string;
}

export interface AiProviderInfo {
  name: string;
  endpoint: string;
  defaultModel: string;
  supportedModels: AiModelInfo[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: KnowledgeSource[];
  isOutOfScope?: boolean;
  modelUsed?: string;
  latencyMs?: number;
  isAiGenerated?: boolean;
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
