import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_PASSWORD_HASH } from './security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedsPath = path.resolve(__dirname, '../../database/seeds.json');
export const dataPath = path.resolve(__dirname, '../../database/data.json');

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

const DEFAULT_EMPLOYEE_ROLES = {
  'emp-1': 'ADMIN',
  'emp-2': 'DEPARTMENT_HEAD',
  'emp-3': 'DEPARTMENT_HEAD',
  'emp-4': 'DEPARTMENT_HEAD',
  'emp-5': 'DEPARTMENT_HEAD',
  'emp-6': 'EMPLOYEE',
  'emp-7': 'HR_MANAGER',
  'emp-8': 'EMPLOYEE',
};

const DEFAULT_EMPLOYEE_IINS = {
  'emp-1': '920415450123',
  'emp-2': '880620350412',
  'emp-3': '900812350789',
  'emp-4': '931105450654',
  'emp-5': '890325350321',
  'emp-6': '950718350987',
  'emp-7': '960924450543',
  'emp-8': '910214350210',
};

const INITIAL_COURSES = [
  {
    id: 'course-1',
    title: 'Онбординг в Jana Post: корпоративные стандарты и ценности',
    category: 'Адаптация новых сотрудников',
    description: 'Базовый ознакомительный курс об истории, логистической инфраструктуре, культуре и ключевых сервисах АО «Jana Post». Обязателен к прохождению в первые 14 дней работы.',
    estimatedMinutes: 25,
    lessonsCount: 3,
    isMandatory: true,
    badgeName: 'Амбассадор Jana Post',
    lessons: [
      {
        id: 'c1-l1',
        title: 'Урок 1. Миссия и масштабы АО «Jana Post»',
        durationMinutes: 7,
        content: 'АО «Jana Post» — ведущий национальный логистический оператор Казахстана. SLA 98%+ и надежность доставки.',
      },
      {
        id: 'c1-l2',
        title: 'Урок 2. Единый часовой пояс UTC+5 и электронный табель (Т-13)',
        durationMinutes: 8,
        content: 'С 1 марта 2024 года в РК единый 5-й часовой пояс (UTC+5). Обязательная отметка Clock In / Clock Out в табеле Т-13.',
      },
      {
        id: 'c1-l3',
        title: 'Урок 3. Информационная безопасность и этика',
        durationMinutes: 10,
        content: 'Соблюдение Закона РК о персональных данных № 94-V и корпоративных стандартов информационной безопасности.',
      },
    ],
    quiz: [
      {
        id: 'c1-q1',
        question: 'В каком едином часовом поясе функционируют подразделения Jana Post в Казахстане?',
        explanation: 'С 1 марта 2024 года на всей территории РК действует единый часовой пояс UTC+5.',
        options: [
          { id: 'opt-1', text: 'UTC+6 (время Алматы)', isCorrect: false },
          { id: 'opt-2', text: 'UTC+5 (единое время Казахстана)', isCorrect: true },
          { id: 'opt-3', text: 'UTC+4', isCorrect: false },
        ],
      },
      {
        id: 'c1-q2',
        question: 'Каким образом фиксируется приход и уход с рабочей смены?',
        explanation: 'Фиксация смены производится через кнопки Clock In / Clock Out в электронном табеле Т-13.',
        options: [
          { id: 'opt-4', text: 'Записью в бумажном журнале на вахте', isCorrect: false },
          { id: 'opt-5', text: 'Кнопками Clock In / Clock Out в электронном табеле Т-13', isCorrect: true },
          { id: 'opt-6', text: 'Сообщением в мессенджер руководителю', isCorrect: false },
        ],
      },
      {
        id: 'c1-q3',
        question: 'Какого числа выплачивается плановый аванс по заработной плате в Jana Post?',
        explanation: 'Плановый аванс начисляется 15-го числа каждого расчетного месяца.',
        options: [
          { id: 'opt-7', text: '1-го числа', isCorrect: false },
          { id: 'opt-8', text: '15-го числа текущего месяца', isCorrect: true },
          { id: 'opt-9', text: 'В последний рабочий день', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    title: 'Трудовые права и безопасность: ТК РК и кадровые сервисы',
    category: 'Правовая грамотность и ТК РК',
    description: 'Практическое руководство по нормам Трудового кодекса РК: гарантия 24 календарных дней отпуска (ст. 88), социальные пособия и электронные заявления.',
    estimatedMinutes: 20,
    lessonsCount: 3,
    isMandatory: false,
    badgeName: 'Знаток ТК РК',
    lessons: [
      {
        id: 'c2-l1',
        title: 'Урок 1. Гарантия 24 дней отпуска по ст. 88 ТК РК',
        durationMinutes: 7,
        content: 'Основной оплачиваемый ежегодный трудовой отпуск работникам предоставляется продолжительностью не менее двадцати четырех календарных дней (ст. 88 ТК РК). Праздничные дни не включаются в дни отпуска (ст. 84 ТК РК).',
      },
      {
        id: 'c2-l2',
        title: 'Урок 2. Выплата заработной платы и аванса (ст. 113 ТК РК)',
        durationMinutes: 6,
        content: 'Статья 113 ТК РК обязывает выплачивать зарплату не позже первой декады следующего месяца, а плановый аванс — 15-го числа.',
      },
      {
        id: 'c2-l3',
        title: 'Урок 3. Электронный больничный лист и интеграция с eGov',
        durationMinutes: 7,
        content: 'Лист временной нетрудоспособности поступает в кадровую службу через шлюз eGov/DamuMed.',
      },
    ],
    quiz: [
      {
        id: 'c2-q1',
        question: 'Какова минимальная базовая продолжительность ежегодного отпуска по ст. 88 ТК РК?',
        explanation: 'Статья 88 ТК РК устанавливает минимум 24 календарных дня.',
        options: [
          { id: 'opt-21', text: '14 календарных дней', isCorrect: false },
          { id: 'opt-22', text: '21 календарный день', isCorrect: false },
          { id: 'opt-23', text: '24 календарных дня', isCorrect: true },
        ],
      },
      {
        id: 'c2-q2',
        question: 'Включаются ли праздничные дни РК в число дней ежегодного оплачиваемого отпуска?',
        explanation: 'Согласно ст. 84 ТК РК, праздничные дни не включаются в дни отпуска и продлевают его.',
        options: [
          { id: 'opt-24', text: 'Да, включаются и сгорают', isCorrect: false },
          { id: 'opt-25', text: 'Нет, не включаются и продлевают отпуск', isCorrect: true },
          { id: 'opt-26', text: 'На усмотрение бухгалтерии', isCorrect: false },
        ],
      },
      {
        id: 'c2-q3',
        question: 'Какая минимальная длительность одной из частей отпуска при его дроблении?',
        explanation: 'По ТК РК одна из частей отпуска должна быть не менее 14 календарных дней.',
        options: [
          { id: 'opt-27', text: 'Не менее 14 календарных дней', isCorrect: true },
          { id: 'opt-28', text: 'Не менее 7 дней', isCorrect: false },
          { id: 'opt-29', text: 'Ограничений нет', isCorrect: false },
        ],
      },
    ],
  },
];

export async function initDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ [Prisma ORM] Connected successfully to SQL database via Prisma Client');

    // Check if initial seeding is needed
    const deptCount = await prisma.department.count();
    if (deptCount === 0) {
      console.log('🌱 [Prisma ORM] Seeding initial data from seeds.json into SQL tables...');

      let seedData = null;
      if (fs.existsSync(seedsPath)) {
        seedData = JSON.parse(fs.readFileSync(seedsPath, 'utf-8'));
      } else if (fs.existsSync(dataPath)) {
        seedData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      }

      if (seedData) {
        // 1. Departments
        if (seedData.departments?.length) {
          for (const d of seedData.departments) {
            await prisma.department.upsert({
              where: { id: d.id },
              update: {},
              create: {
                id: d.id,
                name: d.name,
                code: d.code,
                description: d.description || '',
                managerId: d.managerId || null,
                managerName: d.managerName || null,
              },
            });
          }
        }

        // 2. Employees with explicit stored DB roles
        if (seedData.employees?.length) {
          for (const e of seedData.employees) {
            const assignedRole = e.role || DEFAULT_EMPLOYEE_ROLES[e.id] || 'EMPLOYEE';
            await prisma.employee.upsert({
              where: { id: e.id },
              update: {},
              create: {
                id: e.id,
                employeeId: e.employeeId,
                firstName: e.firstName,
                lastName: e.lastName,
                email: e.email,
                passwordHash: e.passwordHash || DEFAULT_PASSWORD_HASH,
                role: assignedRole,
                status: e.status || 'ACTIVE',
                jobTitle: e.jobTitle,
                departmentId: e.departmentId || null,
                departmentName: e.departmentName || null,
                managerId: e.managerId || null,
                managerName: e.managerName || null,
                startDate: e.startDate || new Date().toISOString().split('T')[0],
                phone: e.phone || null,
                avatarUrl: e.avatarUrl || null,
                address: e.address || null,
                emergencyContact: e.emergencyContact || null,
                salary: e.salary || (assignedRole === 'ADMIN' ? 950000 : assignedRole === 'DEPARTMENT_HEAD' ? 750000 : 380000),
                iin: e.iin || DEFAULT_EMPLOYEE_IINS[e.id] || '940512300412',
                contractNumber: e.contractNumber || `KZ-JP-${e.employeeId}`,
                enbekStatus: e.enbekStatus || 'REGISTERED',
                enbekContractId: e.enbekContractId || `KZ-ESUTD-2026-180540-${String(e.employeeId || e.id).replace(/\D/g, '').padStart(5, '0')}`,
                vacationDaysTotal: 24,
                vacationDaysUsed: 0,
              },
            });
          }
        }

        // 3. Attendance
        if (seedData.attendance?.length) {
          for (const a of seedData.attendance) {
            await prisma.attendanceRecord.upsert({
              where: {
                employeeId_workDate: {
                  employeeId: a.employeeId,
                  workDate: a.workDate,
                },
              },
              update: {},
              create: {
                id: a.id,
                employeeId: a.employeeId,
                employeeName: a.employeeName,
                departmentName: a.departmentName || null,
                workDate: a.workDate,
                clockIn: a.clockIn || null,
                clockOut: a.clockOut || null,
                durationMinutes: a.durationMinutes || 480,
                status: a.status || 'PRESENT',
                notes: a.notes || null,
              },
            });
          }
        }

        // 4. Leave Requests (pure leaves)
        if (seedData.leaveRequests?.length) {
          for (const lr of seedData.leaveRequests) {
            if (lr.leaveType === 'SALARY_ADVANCE') {
              await prisma.salaryAdvanceRequest.create({
                data: {
                  id: lr.id,
                  employeeId: lr.employeeId,
                  employeeName: lr.employeeName,
                  departmentName: lr.departmentName || null,
                  amount: lr.amount || 150000,
                  payoutDate: '2026-10-15',
                  reason: lr.reason || 'Плановый межрасчетный аванс',
                  status: lr.status === 'APPROVED' ? 'APPROVED' : lr.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
                  submittedAt: lr.submittedAt || new Date().toISOString(),
                  reviewerId: lr.reviewerId || null,
                  reviewerName: lr.reviewerName || null,
                  reviewComment: lr.reviewComment || null,
                  reviewedAt: lr.reviewedAt || null,
                },
              });
            } else if (lr.leaveType === 'WORK_CERTIFICATE') {
              await prisma.certificateRequest.create({
                data: {
                  id: lr.id,
                  employeeId: lr.employeeId,
                  employeeName: lr.employeeName,
                  departmentName: lr.departmentName || null,
                  certificateType: 'WORK_CONFIRMATION',
                  purpose: lr.reason || 'По месту требования (Банк)',
                  language: 'ru',
                  status: lr.status === 'APPROVED' ? 'READY' : 'PENDING',
                  submittedAt: lr.submittedAt || new Date().toISOString(),
                  completedAt: lr.reviewedAt || null,
                  notes: lr.reviewComment || null,
                },
              });
            } else {
              await prisma.leaveRequest.create({
                data: {
                  id: lr.id,
                  employeeId: lr.employeeId,
                  employeeName: lr.employeeName,
                  departmentName: lr.departmentName || null,
                  leaveType: lr.leaveType || 'ANNUAL',
                  startDate: lr.startDate,
                  endDate: lr.endDate,
                  daysCount: lr.daysCount,
                  reason: lr.reason || '',
                  status: lr.status || 'PENDING',
                  submittedAt: lr.submittedAt || new Date().toISOString(),
                  attachmentUrl: lr.attachmentUrl || null,
                  attachmentName: lr.attachmentName || null,
                  reviewerId: lr.reviewerId || null,
                  reviewerName: lr.reviewerName || null,
                  reviewComment: lr.reviewComment || null,
                  reviewedAt: lr.reviewedAt || null,
                },
              });
            }
          }
        }

        // 5. Tasks
        if (seedData.tasks?.length) {
          for (const t of seedData.tasks) {
            await prisma.taskItem.create({
              data: {
                id: t.id,
                title: t.title,
                description: t.description || null,
                status: t.status || 'TODO',
                priority: t.priority || 'MEDIUM',
                category: t.category || 'ONBOARDING',
                targetEmployeeName: t.targetEmployeeName || null,
                assignedToId: t.assignedToId,
                assignedToName: t.assignedToName,
                createdById: t.createdById,
                createdByName: t.createdByName,
                dueDate: t.dueDate,
                createdAt: t.createdAt || new Date().toISOString(),
                completedAt: t.completedAt || null,
              },
            });
          }
        }

        // 6. Notifications
        if (seedData.notifications?.length) {
          for (const n of seedData.notifications) {
            await prisma.appNotification.create({
              data: {
                id: n.id,
                userId: n.userId || null,
                title: n.title,
                message: n.message,
                type: n.type || 'SYSTEM',
                isRead: !!n.isRead,
                createdAt: n.createdAt || new Date().toISOString(),
                link: n.link || null,
              },
            });
          }
        }
        console.log('✅ [Prisma ORM] Core organizational tables seeded from JSON.');
      }
    }

    // 7. Seed Academy Courses & Quizzes into DB if not present
    for (const c of INITIAL_COURSES) {
      await prisma.course.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          title: c.title,
          category: c.category,
          description: c.description,
          estimatedMinutes: c.estimatedMinutes,
          lessonsCount: c.lessonsCount,
          isMandatory: c.isMandatory,
          badgeName: c.badgeName,
          lessonsJson: JSON.stringify(c.lessons),
          quizJson: JSON.stringify(c.quiz),
        },
      });
    }

    // 8. Seed sample Salary Advances if empty
    const advancesCount = await prisma.salaryAdvanceRequest.count();
    if (advancesCount === 0) {
      await prisma.salaryAdvanceRequest.createMany({
        data: [
          {
            id: 'adv-seed-1',
            employeeId: 'emp-2',
            employeeName: 'Азамат Ибраев',
            departmentName: 'Курьерская служба и экспресс-доставка',
            amount: 150000,
            payoutDate: '2026-10-15',
            reason: 'Плановый межрасчетный аванс на карту Kaspi Gold',
            status: 'APPROVED',
            submittedAt: '2026-10-02T10:00:00.000Z',
            reviewerId: 'emp-1',
            reviewerName: 'Айгерим Смагулова',
            reviewComment: 'Согласовано к выплате 15-го числа',
            reviewedAt: '2026-10-02T14:30:00.000Z',
          },
          {
            id: 'adv-seed-2',
            employeeId: 'emp-3',
            employeeName: 'Нурлан Сериков',
            departmentName: 'Отдел информационных технологий',
            amount: 200000,
            payoutDate: '2026-10-15',
            reason: 'Аванс в связи с семейными обстоятельствами',
            status: 'PENDING',
            submittedAt: '2026-10-10T09:15:00.000Z',
          },
        ],
      });
    }

    // 9. Seed sample Certificates if empty
    const certsCount = await prisma.certificateRequest.count();
    if (certsCount === 0) {
      await prisma.certificateRequest.createMany({
        data: [
          {
            id: 'cert-seed-1',
            employeeId: 'emp-2',
            employeeName: 'Азамат Ибраев',
            departmentName: 'Курьерская служба и экспресс-доставка',
            certificateType: 'WORK_CONFIRMATION',
            purpose: 'По месту требования (АО Kaspi Bank для автокредитования)',
            language: 'ru',
            status: 'READY',
            submittedAt: '2026-10-05T11:00:00.000Z',
            completedAt: '2026-10-05T11:05:00.000Z',
            documentUrl: '/api/v1/documents/timesheet',
          },
          {
            id: 'cert-seed-2',
            employeeId: 'emp-3',
            employeeName: 'Нурлан Сериков',
            departmentName: 'Отдел информационных технологий',
            certificateType: 'INCOME_CONFIRMATION_6M',
            purpose: 'АО Halyk Bank (ипотечный заем)',
            language: 'ru',
            status: 'READY',
            submittedAt: '2026-10-08T16:20:00.000Z',
            completedAt: '2026-10-08T16:22:00.000Z',
            documentUrl: '/api/v1/documents/timesheet',
          },
        ],
      });
    }

    console.log('✅ [Prisma ORM] Database seeded successfully with normalized relational records.');
  } catch (err) {
    console.error('❌ [Prisma ORM] Failed to initialize database:', err);
    throw err;
  }
}
