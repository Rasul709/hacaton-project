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
  SalaryAdvanceRequest,
  CertificateRequest,
  CertificateType,
} from '@/types';
import {
  DEMO_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_DEPARTMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_SALARY_ADVANCES,
  INITIAL_CERTIFICATES,
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
  private salaryAdvances: SalaryAdvanceRequest[];
  private certificates: CertificateRequest[];
  private tasks: TaskItem[];
  private notifications: AppNotification[];
  private currentUser: User;

  constructor() {
    this.employees = this.load('jp_mock_employees', INITIAL_EMPLOYEES);
    this.departments = this.load('jp_mock_departments', INITIAL_DEPARTMENTS);
    this.attendance = this.load('jp_mock_attendance', INITIAL_ATTENDANCE);
    this.leaveRequests = this.load('jp_mock_leaves', INITIAL_LEAVE_REQUESTS);
    this.salaryAdvances = this.load('jp_mock_advances', INITIAL_SALARY_ADVANCES);
    this.certificates = this.load('jp_mock_certificates', INITIAL_CERTIFICATES);
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
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    await delay(300);
    const cleanEmail = email.toLowerCase().trim();
    const matchedUser = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === cleanEmail);
    if (!matchedUser || password !== 'password123') {
      throw new Error('Неверный email или пароль демо-аккаунта');
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
    const activeEmployees = this.employees.filter((employee) => employee.status === 'ACTIVE');
    const activeEmployeeIds = new Set(activeEmployees.map((employee) => employee.id));
    const today = getKazakhstanDateString();
    const todayAttendance = this.attendance.filter(
      (record) => record.workDate === today && activeEmployeeIds.has(record.employeeId) && Boolean(record.clockIn),
    );
    const dateRange = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(`${today}T12:00:00Z`);
      date.setUTCDate(date.getUTCDate() - (6 - index));
      return date.toISOString().slice(0, 10);
    });
    const weeklyAttendance = dateRange.map((date) => {
      const records = this.attendance.filter(
        (record) => record.workDate === date && activeEmployeeIds.has(record.employeeId),
      );
      return {
        day: new Date(`${date}T12:00:00Z`).toLocaleDateString('ru-RU', { weekday: 'short', timeZone: 'UTC' }),
        present: records.filter((record) => record.status === 'PRESENT').length,
        late: records.filter((record) => record.status === 'LATE').length,
        absent: records.filter((record) => record.status === 'ABSENT').length,
      };
    });
    const leaveStatuses = (['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => ({
      status,
      count: this.leaveRequests.filter((request) => request.status === status).length,
      color: status === 'PENDING' ? '#F59E0B' : status === 'APPROVED' ? '#16A34A' : '#DC2626',
    }));
    return {
      ...INITIAL_DASHBOARD,
      totalEmployees: this.employees.length,
      activeEmployees: activeEmployees.length,
      departmentsCount: this.departments.length,
      pendingLeavesCount: this.leaveRequests.filter((l) => l.status === 'PENDING').length,
      attendanceTodayCount: todayAttendance.length,
      tasksInProgressCount: this.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      employeesByDepartment: this.departments.map((department) => ({
        department: department.name,
        count: this.employees.filter((employee) => employee.departmentId === department.id).length,
      })),
      weeklyAttendance,
      leaveDistribution: leaveStatuses,
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
    if (this.currentUser.role === 'EMPLOYEE') {
      list = list.filter((request) => request.employeeId === this.currentUser.id);
    } else if (this.currentUser.role === 'DEPARTMENT_HEAD') {
      const managedDepartments = new Set(
        this.departments.filter((department) => department.managerId === this.currentUser.id).map((department) => department.id),
      );
      const teamIds = new Set(this.employees.filter((employee) => managedDepartments.has(employee.departmentId || '')).map((employee) => employee.id));
      list = list.filter((request) => teamIds.has(request.employeeId));
    }
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
    if (!(await this.canReviewLeave(this.leaveRequests[idx]))) throw new Error('Недостаточно прав для этой заявки');
    if (this.leaveRequests[idx].status !== 'PENDING') throw new Error('Решение по заявке уже принято');
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
    if (!(await this.canReviewLeave(this.leaveRequests[idx]))) throw new Error('Недостаточно прав для этой заявки');
    if (this.leaveRequests[idx].status !== 'PENDING') throw new Error('Решение по заявке уже принято');
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
    if (this.leaveRequests[idx].employeeId !== this.currentUser.id || this.leaveRequests[idx].status !== 'PENDING') {
      throw new Error('Можно отменить только свою ожидающую заявку');
    }
    this.leaveRequests[idx] = {
      ...this.leaveRequests[idx],
      status: 'CANCELLED',
    };
    this.save('jp_mock_leaves', this.leaveRequests);
    return this.leaveRequests[idx];
  }

  private async canReviewLeave(request: LeaveRequest): Promise<boolean> {
    if (this.currentUser.role === 'ADMIN' || this.currentUser.role === 'HR_MANAGER') return true;
    if (this.currentUser.role !== 'DEPARTMENT_HEAD') return false;
    const managedDepartmentIds = new Set(
      this.departments.filter((department) => department.managerId === this.currentUser.id).map((department) => department.id),
    );
    const employee = this.employees.find((item) => item.id === request.employeeId);
    return Boolean(employee?.departmentId && managedDepartmentIds.has(employee.departmentId));
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
      category: 'ONBOARDING',
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

  // --- Salary Advances ---
  async getSalaryAdvances(): Promise<SalaryAdvanceRequest[]> {
    await delay();
    return this.salaryAdvances;
  }

  async createSalaryAdvance(data: { amount: number; reason: string; payoutDate?: string }): Promise<SalaryAdvanceRequest> {
    await delay(300);
    const item: SalaryAdvanceRequest = {
      id: `adv-${Date.now()}`,
      employeeId: this.currentUser.id,
      employeeName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      departmentName: this.currentUser.departmentName,
      amount: data.amount,
      payoutDate: data.payoutDate || '15-е число месяца',
      reason: data.reason,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };
    this.salaryAdvances.unshift(item);
    this.save('jp_mock_advances', this.salaryAdvances);
    return item;
  }

  async approveSalaryAdvance(id: string, comment?: string): Promise<SalaryAdvanceRequest> {
    await delay(250);
    const idx = this.salaryAdvances.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Заявка на аванс не найдена');
    this.salaryAdvances[idx] = {
      ...this.salaryAdvances[idx],
      status: 'APPROVED',
      reviewerId: this.currentUser.id,
      reviewerName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      reviewComment: comment || 'Согласовано к выплате 15-го числа',
      reviewedAt: new Date().toISOString(),
    };
    this.save('jp_mock_advances', this.salaryAdvances);
    return this.salaryAdvances[idx];
  }

  async rejectSalaryAdvance(id: string, comment: string): Promise<SalaryAdvanceRequest> {
    await delay(250);
    const idx = this.salaryAdvances.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Заявка на аванс не найдена');
    this.salaryAdvances[idx] = {
      ...this.salaryAdvances[idx],
      status: 'REJECTED',
      reviewerId: this.currentUser.id,
      reviewerName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      reviewComment: comment,
      reviewedAt: new Date().toISOString(),
    };
    this.save('jp_mock_advances', this.salaryAdvances);
    return this.salaryAdvances[idx];
  }

  // --- Certificates ---
  async getCertificates(): Promise<CertificateRequest[]> {
    await delay();
    return this.certificates;
  }

  async createCertificate(data: { certificateType: CertificateType; purpose: string; language?: 'ru' | 'kz' }): Promise<CertificateRequest> {
    await delay(300);
    const item: CertificateRequest = {
      id: `cert-${Date.now()}`,
      employeeId: this.currentUser.id,
      employeeName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      departmentName: this.currentUser.departmentName,
      certificateType: data.certificateType,
      purpose: data.purpose,
      language: data.language || 'ru',
      status: 'READY',
      submittedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      documentUrl: `/api/v1/documents/employee-card/${this.currentUser.id}`,
    };
    this.certificates.unshift(item);
    this.save('jp_mock_certificates', this.certificates);
    return item;
  }

  // Reset to default demo data
  resetDemoData(): void {
    localStorage.removeItem('jp_mock_employees');
    localStorage.removeItem('jp_mock_departments');
    localStorage.removeItem('jp_mock_attendance');
    localStorage.removeItem('jp_mock_leaves');
    localStorage.removeItem('jp_mock_advances');
    localStorage.removeItem('jp_mock_certificates');
    localStorage.removeItem('jp_mock_tasks');
    localStorage.removeItem('jp_mock_notifications');
    localStorage.removeItem('jp_mock_user');
    this.employees = [...INITIAL_EMPLOYEES];
    this.departments = [...INITIAL_DEPARTMENTS];
    this.attendance = [...INITIAL_ATTENDANCE];
    this.leaveRequests = [...INITIAL_LEAVE_REQUESTS];
    this.salaryAdvances = [...INITIAL_SALARY_ADVANCES];
    this.certificates = [...INITIAL_CERTIFICATES];
    this.tasks = [...INITIAL_TASKS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.currentUser = DEMO_USERS.admin;
  }
}


export const mockService = new MockService();
