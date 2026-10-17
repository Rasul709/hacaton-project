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
import {
  DEMO_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_DEPARTMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DASHBOARD,
} from './mockData';
import { getKazakhstanDateString } from '@/lib/utils';

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

class MockService {
  private employees: Employee[];
  private departments: Department[];
  private attendance: AttendanceRecord[];
  private leaveRequests: LeaveRequest[];
  private tasks: TaskItem[];
  private notifications: AppNotification[];
  private currentUser: User;

  constructor() {
    this.employees = this.load('jp_mock_employees', INITIAL_EMPLOYEES);
    this.departments = this.load('jp_mock_departments', INITIAL_DEPARTMENTS);
    this.attendance = this.load('jp_mock_attendance', INITIAL_ATTENDANCE);
    this.leaveRequests = this.load('jp_mock_leaves', INITIAL_LEAVE_REQUESTS);
    this.tasks = this.load('jp_mock_tasks', INITIAL_TASKS);
    this.notifications = this.load('jp_mock_notifications', INITIAL_NOTIFICATIONS);
    this.currentUser = this.load('jp_mock_user', DEMO_USERS.admin);
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultValue;
  }

  private save(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  // --- Auth ---
  async login(email: string, _password: string): Promise<{ token: string; user: User }> {
    await delay(300);
    const cleanEmail = email.toLowerCase().trim();
    let matchedUser = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      // fallback matching by role or create demo user
      if (cleanEmail.includes('hr')) matchedUser = DEMO_USERS.hr;
      else if (cleanEmail.includes('manager')) matchedUser = DEMO_USERS.manager;
      else if (cleanEmail.includes('employee')) matchedUser = DEMO_USERS.employee;
      else matchedUser = DEMO_USERS.admin;
    }

    this.currentUser = matchedUser;
    this.save('jp_mock_user', matchedUser);
    return { token: 'mock-jwt-token-janapost-hr', user: matchedUser };
  }

  async logout(): Promise<void> {
    await delay(100);
    localStorage.removeItem('jp_mock_user');
  }

  async getCurrentUser(): Promise<User> {
    await delay(100);
    return this.currentUser;
  }

  async changePassword(_oldPass: string, _newPass: string): Promise<{ success: boolean }> {
    await delay(300);
    return { success: true };
  }

  // --- Dashboard ---
  async getDashboardOverview(): Promise<DashboardOverview> {
    await delay();
    return {
      ...INITIAL_DASHBOARD,
      totalEmployees: this.employees.length,
      activeEmployees: this.employees.filter((e) => e.status === 'ACTIVE').length,
      departmentsCount: this.departments.length,
      pendingLeavesCount: this.leaveRequests.filter((l) => l.status === 'PENDING').length,
      tasksInProgressCount: this.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    };
  }

  // --- Employees ---
  async getEmployees(params?: PaginationParams): Promise<PaginatedResult<Employee>> {
    await delay();
    let list = [...this.employees];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          (e.firstName || '').toLowerCase().includes(q) ||
          (e.lastName || '').toLowerCase().includes(q) ||
          (e.employeeId || '').toLowerCase().includes(q) ||
          (e.email || '').toLowerCase().includes(q) ||
          (e.jobTitle || '').toLowerCase().includes(q)
      );
    }

    if (params?.departmentId && params.departmentId !== 'ALL') {
      list = list.filter((e) => e.departmentId === params.departmentId);
    }

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((e) => e.status === params.status);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total: list.length,
      page,
      limit,
      totalPages: Math.ceil(list.length / limit) || 1,
    };
  }

  async getEmployeeById(id: string): Promise<Employee> {
    await delay();
    const emp = this.employees.find((e) => e.id === id);
    if (!emp) throw new Error('Сотрудник не найден');
    return emp;
  }

  async createEmployee(data: Omit<Employee, 'id' | 'employeeId'>): Promise<Employee> {
    await delay(350);
    const newId = `emp-${Date.now()}`;
    const nextCode = `JP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newEmp: Employee = {
      ...data,
      id: newId,
      employeeId: nextCode,
    };
    this.employees.unshift(newEmp);
    this.save('jp_mock_employees', this.employees);
    return newEmp;
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    await delay(250);
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Сотрудник не найден');
    this.employees[index] = { ...this.employees[index], ...data };
    this.save('jp_mock_employees', this.employees);
    return this.employees[index];
  }

  async setEmployeeStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Employee> {
    return this.updateEmployee(id, { status });
  }

  // --- Departments ---
  async getDepartments(): Promise<Department[]> {
    await delay();
    return this.departments.map((dept) => {
      const activeCount = this.employees.filter(
        (e) => e.departmentId === dept.id && e.status === 'ACTIVE'
      ).length;
      const totalCount = this.employees.filter((e) => e.departmentId === dept.id).length;
      return {
        ...dept,
        activeEmployeesCount: activeCount || dept.activeEmployeesCount,
        employeeCount: totalCount || dept.employeeCount,
      };
    });
  }

  async createDepartment(data: Omit<Department, 'id' | 'employeeCount' | 'activeEmployeesCount'>): Promise<Department> {
    await delay(300);
    const newDept: Department = {
      ...data,
      id: `dept-${Date.now()}`,
      employeeCount: 0,
      activeEmployeesCount: 0,
    };
    this.departments.push(newDept);
    this.save('jp_mock_departments', this.departments);
    return newDept;
  }

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    await delay(200);
    const idx = this.departments.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Департамент не найден');
    this.departments[idx] = { ...this.departments[idx], ...data };
    this.save('jp_mock_departments', this.departments);
    return this.departments[idx];
  }

  // --- Attendance ---
  async getAttendance(params?: { date?: string; departmentId?: string; employeeId?: string }): Promise<AttendanceRecord[]> {
    await delay();
    let records = [...this.attendance];
    if (params?.date) {
      records = records.filter((r) => r.workDate === params.date);
    }
    if (params?.employeeId) {
      records = records.filter((r) => r.employeeId === params.employeeId);
    }
    return records;
  }

  async clockIn(notes?: string): Promise<AttendanceRecord> {
    await delay(250);
    const now = new Date();
    const workDate = getKazakhstanDateString(now);

    const existingIdx = this.attendance.findIndex(
      (a) => a.employeeId === this.currentUser.id && a.workDate === workDate
    );

    if (existingIdx !== -1 && this.attendance[existingIdx].clockIn) {
      return this.attendance[existingIdx];
    }

    const almatyHour = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Almaty', hour: '2-digit', hour12: false }).format(now), 10);
    const almatyMin = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Almaty', minute: '2-digit' }).format(now), 10);
    const isLate = almatyHour > 9 || (almatyHour === 9 && almatyMin > 15);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: this.currentUser.id,
      employeeName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      departmentName: this.currentUser.departmentName,
      workDate,
      clockIn: now.toISOString(),
      status: isLate ? 'LATE' : 'PRESENT',
      notes,
    };

    this.attendance.unshift(newRecord);
    this.save('jp_mock_attendance', this.attendance);
    return newRecord;
  }

  async clockOut(): Promise<AttendanceRecord> {
    await delay(250);
    const now = new Date();
    const workDate = getKazakhstanDateString(now);

    let idx = this.attendance.findIndex(
      (a) => a.employeeId === this.currentUser.id && !a.clockOut
    );

    if (idx === -1) {
      idx = this.attendance.findIndex(
        (a) => a.employeeId === this.currentUser.id && a.workDate === workDate
      );
    }

    if (idx === -1) {
      throw new Error('Сначала необходимо зафиксировать приход (Clock In)');
    }

    const clockInDate = new Date(this.attendance[idx].clockIn || now.toISOString());
    const durationMinutes = Math.max(1, Math.round((now.getTime() - clockInDate.getTime()) / 60000));

    this.attendance[idx] = {
      ...this.attendance[idx],
      clockOut: now.toISOString(),
      durationMinutes,
    };

    this.save('jp_mock_attendance', this.attendance);
    return this.attendance[idx];
  }

  // --- Leave Requests ---
  async getLeaveRequests(params?: { status?: string; employeeId?: string }): Promise<LeaveRequest[]> {
    await delay();
    let list = [...this.leaveRequests];
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((l) => l.status === params.status);
    }
    if (params?.employeeId) {
      list = list.filter((l) => l.employeeId === params.employeeId);
    }
    return list;
  }

  async createLeaveRequest(data: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt' | 'employeeId' | 'employeeName'>): Promise<LeaveRequest> {
    await delay(350);
    const newLeave: LeaveRequest = {
      ...data,
      id: `leave-${Date.now()}`,
      employeeId: this.currentUser.id,
      employeeName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      departmentName: this.currentUser.departmentName,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };
    this.leaveRequests.unshift(newLeave);
    this.save('jp_mock_leaves', this.leaveRequests);
    return newLeave;
  }

  async approveLeaveRequest(id: string, comment?: string): Promise<LeaveRequest> {
    await delay(300);
    const idx = this.leaveRequests.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Заявка на отпуск не найдена');
    this.leaveRequests[idx] = {
      ...this.leaveRequests[idx],
      status: 'APPROVED',
      reviewerId: this.currentUser.id,
      reviewerName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      reviewComment: comment || 'Заявка одобрена',
      reviewedAt: new Date().toISOString(),
    };
    this.save('jp_mock_leaves', this.leaveRequests);
    return this.leaveRequests[idx];
  }

  async rejectLeaveRequest(id: string, comment: string): Promise<LeaveRequest> {
    await delay(300);
    const idx = this.leaveRequests.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Заявка на отпуск не найдена');
    this.leaveRequests[idx] = {
      ...this.leaveRequests[idx],
      status: 'REJECTED',
      reviewerId: this.currentUser.id,
      reviewerName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      reviewComment: comment || 'Заявка отклонена',
      reviewedAt: new Date().toISOString(),
    };
    this.save('jp_mock_leaves', this.leaveRequests);
    return this.leaveRequests[idx];
  }

  async cancelLeaveRequest(id: string): Promise<LeaveRequest> {
    await delay(200);
    const idx = this.leaveRequests.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Заявка не найдена');
    this.leaveRequests[idx] = {
      ...this.leaveRequests[idx],
      status: 'CANCELLED',
    };
    this.save('jp_mock_leaves', this.leaveRequests);
    return this.leaveRequests[idx];
  }

  // --- Tasks ---
  async getTasks(params?: { status?: string; priority?: string }): Promise<TaskItem[]> {
    await delay();
    let list = [...this.tasks];
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((t) => t.status === params.status);
    }
    if (params?.priority && params.priority !== 'ALL') {
      list = list.filter((t) => t.priority === params.priority);
    }
    return list;
  }

  async createTask(data: Omit<TaskItem, 'id' | 'createdAt' | 'createdById' | 'createdByName'>): Promise<TaskItem> {
    await delay(300);
    const newTask: TaskItem = {
      ...data,
      id: `task-${Date.now()}`,
      createdById: this.currentUser.id,
      createdByName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      createdAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    this.save('jp_mock_tasks', this.tasks);
    return newTask;
  }

  async updateTask(id: string, data: Partial<TaskItem>): Promise<TaskItem> {
    await delay(200);
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Задача не найдена');
    this.tasks[idx] = { ...this.tasks[idx], ...data };
    this.save('jp_mock_tasks', this.tasks);
    return this.tasks[idx];
  }

  async updateTaskStatus(id: string, status: TaskItem['status']): Promise<TaskItem> {
    return this.updateTask(id, {
      status,
      completedAt: status === 'DONE' ? new Date().toISOString() : undefined,
    });
  }

  // --- Notifications ---
  async getNotifications(): Promise<AppNotification[]> {
    await delay(150);
    return [...this.notifications];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await delay(100);
    const n = this.notifications.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      this.save('jp_mock_notifications', this.notifications);
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await delay(150);
    this.notifications.forEach((n) => (n.isRead = true));
    this.save('jp_mock_notifications', this.notifications);
  }

  // Reset to default demo data
  resetDemoData(): void {
    localStorage.removeItem('jp_mock_employees');
    localStorage.removeItem('jp_mock_departments');
    localStorage.removeItem('jp_mock_attendance');
    localStorage.removeItem('jp_mock_leaves');
    localStorage.removeItem('jp_mock_tasks');
    localStorage.removeItem('jp_mock_notifications');
    localStorage.removeItem('jp_mock_user');
    this.employees = [...INITIAL_EMPLOYEES];
    this.departments = [...INITIAL_DEPARTMENTS];
    this.attendance = [...INITIAL_ATTENDANCE];
    this.leaveRequests = [...INITIAL_LEAVE_REQUESTS];
    this.tasks = [...INITIAL_TASKS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.currentUser = DEMO_USERS.admin;
  }
}

export const mockService = new MockService();
