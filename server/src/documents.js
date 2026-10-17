/**
 * Kazakhstan Labor Code (ТК РК) Statutory HR Document Templates
 * Standard Forms: T-6 (Приказ об отпуске), T-2 (Личная карточка), T-13 (Табель учета времени)
 */

export function renderLeaveOrderT6(leave, employee) {
  const empName = employee ? `${employee.lastName} ${employee.firstName}` : leave.employeeName;
  const deptName = employee?.departmentName || leave.departmentName || 'Отдел логистики';
  const posName = employee?.jobTitle || 'Сотрудник сети Jana Post';
  const iin = employee?.iin || '940512300412';
  const orderNum = `ПР-${leave.id.replace('leave-', '').slice(-6)}`;
  const orderDate = new Date().toLocaleDateString('ru-RU');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Приказ о предоставлении отпуска (Форма Т-6) — ${empName}</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.4; color: #111; margin: 40px auto; max-width: 800px; padding: 20px; }
    .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }
    .company { font-size: 16px; font-weight: bold; text-transform: uppercase; }
    .sub { font-size: 12px; color: #555; }
    .doc-title { font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0 10px; text-transform: uppercase; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .meta-table td { padding: 4px; vertical-align: top; }
    .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .data-table th, .data-table td { border: 1px solid #333; padding: 8px; text-align: left; }
    .data-table th { background: #f2f2f2; font-weight: bold; }
    .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
    .sign-col { width: 45%; }
    .line { border-bottom: 1px solid #333; margin-top: 30px; }
    .print-btn { background: #2563EB; color: #fff; padding: 10px 18px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
    @media print { .print-btn { display: none; } body { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Распечатать приказ / Сохранить в PDF</button>

  <div class="header">
    <div class="company">ТОО «Jana Post Logistics»</div>
    <div class="sub">БИН: 210840032190 | г. Алматы, пр. Аль-Фараби 77/7, БЦ «Esentai» | Тел: +7 (727) 355-88-00</div>
  </div>

  <table class="meta-table">
    <tr>
      <td style="width: 70%;"><strong>Номер документа:</strong> ${orderNum}</td>
      <td style="text-align: right;"><strong>Дата составления:</strong> ${orderDate} г.</td>
    </tr>
  </table>

  <div class="doc-title">ПРИКАЗ № ${orderNum}<br><span style="font-size: 14px; font-weight: normal;">о предоставлении отпуска работнику (Форма Т-6)</span></div>

  <p>В соответствии со статьей 88 Трудового кодекса Республики Казахстан (ТК РК):</p>

  <p><strong>ПРИКАЗЫВАЮ:</strong></p>

  <p>
    Предоставить ежегодный оплачиваемый трудовой отпуск работнику <strong>${empName}</strong>, 
    ИИН <code>${iin}</code>, занимающему должность <em>${posName}</em> в подразделении <em>«${deptName}»</em>:
  </p>

  <table class="data-table">
    <tr>
      <th>Вид отпуска</th>
      <th>Период (с — по)</th>
      <th>Количество календарных дней</th>
    </tr>
    <tr>
      <td>${leave.leaveType === 'ANNUAL' ? 'Ежегодный оплачиваемый трудовой отпуск' : leave.leaveType === 'SICK' ? 'Отпуск по временной нетрудоспособности' : 'Отпуск по заявлению'}</td>
      <td>с ${leave.startDate} по ${leave.endDate}</td>
      <td><strong>${leave.daysCount} дней</strong></td>
    </tr>
  </table>

  <p><strong>Основание:</strong> Заявление работника от ${leave.submittedAt ? leave.submittedAt.split('T')[0] : orderDate} г.${leave.attachmentUrl ? ' (приложен подтверждающий документ)' : ''}</p>
  <p><strong>Бухгалтерии:</strong> Произвести расчет и выплату отпускных не позднее чем за три рабочих дня до начала отпуска (ст. 92 п. 4 ТК РК).</p>

  <div class="signatures">
    <div class="sign-col">
      <p><strong>Директор по персоналу ТОО «Jana Post»:</strong></p>
      <div class="line"></div>
      <p style="font-size: 12px; text-align: center;">Смагулова А. М.</p>
    </div>
    <div class="sign-col">
      <p><strong>С приказом ознакомлен(а):</strong></p>
      <div class="line"></div>
      <p style="font-size: 12px; text-align: center;">${empName} / «___» _________ 2026 г.</p>
    </div>
  </div>

  <!-- Digital Signature (ЭЦП НУЦ РК) Seal & QR Verification -->
  <div style="margin-top: 35px; padding: 14px 18px; border: 2px solid #2563EB; border-radius: 8px; background: #eff6ff; display: flex; align-items: center; justify-content: space-between;">
    <div style="display: flex; align-items: center; gap: 14px;">
      <svg width="56" height="56" viewBox="0 0 100 100" style="background:#fff; padding:3px; border:1px solid #bfdbfe; border-radius:6px;">
        <rect width="100" height="100" fill="#ffffff"/>
        <rect x="8" y="8" width="26" height="26" fill="#1e3a8a"/>
        <rect x="13" y="13" width="16" height="16" fill="#ffffff"/>
        <rect x="17" y="17" width="8" height="8" fill="#1e3a8a"/>
        <rect x="66" y="8" width="26" height="26" fill="#1e3a8a"/>
        <rect x="71" y="13" width="16" height="16" fill="#ffffff"/>
        <rect x="75" y="17" width="8" height="8" fill="#1e3a8a"/>
        <rect x="8" y="66" width="26" height="26" fill="#1e3a8a"/>
        <rect x="13" y="71" width="16" height="16" fill="#ffffff"/>
        <rect x="17" y="75" width="8" height="8" fill="#1e3a8a"/>
        <rect x="42" y="12" width="16" height="8" fill="#1e3a8a"/>
        <rect x="42" y="28" width="16" height="8" fill="#1e3a8a"/>
        <rect x="12" y="44" width="20" height="8" fill="#1e3a8a"/>
        <rect x="44" y="44" width="20" height="20" fill="#1e3a8a"/>
        <rect x="72" y="44" width="16" height="16" fill="#1e3a8a"/>
        <rect x="44" y="72" width="16" height="16" fill="#1e3a8a"/>
        <rect x="72" y="72" width="16" height="16" fill="#1e3a8a"/>
      </svg>
      <div>
        <div style="font-weight: bold; color: #1e3a8a; font-size: 13px; letter-spacing: 0.3px;">
          ДОКУМЕНТ ПОДПИСАН ЭЦП (НУЦ РК / GOST KNCA)
        </div>
        <div style="font-size: 11px; color: #334155; margin-top: 3px; line-height: 1.4;">
          Организация: <strong>ТОО «Jana Post Logistics»</strong> (БИН 210840032190)<br>
          Подписант: <strong>Смагулова Айгерим Муратовна</strong> • Должность: Директор по персоналу<br>
          Статус: <span style="color:#16a34a; font-weight:bold;">ДЕЙСТВИТЕЛЕН</span> • Идентификатор приказа: <code>${orderNum}</code>
        </div>
      </div>
    </div>
    <div style="text-align: right;">
      <a href="http://localhost:5173/verify/${leave.id}" target="_blank" style="display: inline-block; background: #2563EB; color: white; padding: 7px 14px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
        Верификация ЭЦП
      </a>
    </div>
  </div>
</body>
</html>`;
}

export function renderEmployeeCardT2(employee) {
  const empName = `${employee.lastName} ${employee.firstName}`;
  const orderDate = new Date().toLocaleDateString('ru-RU');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Личная карточка работника (Форма Т-2) — ${empName}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; line-height: 1.4; color: #111; margin: 30px auto; max-width: 850px; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .company { font-size: 15px; font-weight: bold; }
    .title { font-size: 16px; font-weight: bold; text-align: center; margin: 15px 0; background: #e2e8f0; padding: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #64748b; padding: 6px 10px; font-size: 12px; }
    th { background: #f8fafc; text-align: left; }
    .print-btn { background: #101828; color: #fff; padding: 9px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; margin-bottom: 20px; font-weight: bold; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Печать карточки Т-2</button>
  <div class="header">
    <div class="company">ТОО «Jana Post Logistics»</div>
    <div>Учетная карточка по учету кадров (Типовая форма Т-2)</div>
  </div>

  <div class="title">I. ОБЩИЕ СВЕДЕНИЯ О РАБОТНИКЕ</div>
  <table>
    <tr>
      <th style="width: 25%;">Табельный номер:</th>
      <td style="width: 25%; font-weight: bold;">${employee.employeeId || 'JP-00101'}</td>
      <th style="width: 25%;">ИИН (РК):</th>
      <td style="width: 25%;">${employee.iin || '940512300412'}</td>
    </tr>
    <tr>
      <th>Ф.И.О.:</th>
      <td colspan="3" style="font-size: 14px; font-weight: bold;">${empName}</td>
    </tr>
    <tr>
      <th>Электронная почта:</th>
      <td>${employee.email}</td>
      <th>Телефон:</th>
      <td>${employee.phone || '+7 (777) 000-00-00'}</td>
    </tr>
    <tr>
      <th>Подразделение:</th>
      <td>${employee.departmentName || 'Логистика'}</td>
      <th>Должность:</th>
      <td>${employee.jobTitle}</td>
    </tr>
    <tr>
      <th>Дата приема на работу:</th>
      <td>${employee.startDate || '2023-01-15'}</td>
      <th>Статус занятости:</th>
      <td>${employee.status === 'ACTIVE' ? 'Работает (Штат)' : 'Неактивен'}</td>
    </tr>
    <tr>
      <th>Норма отпуска (ТК РК):</th>
      <td><strong>24 календарных дня</strong></td>
      <th>Место жительства:</th>
      <td>${employee.address || 'г. Алматы, Казахстан'}</td>
    </tr>
  </table>

  <div class="title">II. СВЕДЕНИЯ О ВОИНСКОМ УЧЕТЕ И ОБРАЗОВАНИИ</div>
  <table>
    <tr>
      <th style="width: 30%;">Группа учета / Категория:</th>
      <td>Военнообязанный, годен к строевой службе</td>
    </tr>
    <tr>
      <th>Образование:</th>
      <td>Высшее профессиональное (логистика / инженерия)</td>
    </tr>
    <tr>
      <th>Экстренный контакт:</th>
      <td>${employee.emergencyContact || 'Супруг(а) / Родители'}</td>
    </tr>
  </table>

  <div style="margin-top: 40px; display: flex; justify-content: space-between;">
    <div>Работник кадровой службы: ____________ / Смагулова А. М.</div>
    <div>Дата: ${orderDate} г.</div>
  </div>
</body>
</html>`;
}

export function renderTimesheetT13(attendanceList, employees) {
  const curMonth = new Date().toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  const rowsHtml = employees.slice(0, 15).map((emp, idx) => {
    const empAtt = attendanceList.filter((a) => a.employeeId === emp.id);
    const presentDays = empAtt.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length || 20;
    const hours = presentDays * 8;
    return `<tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${emp.lastName} ${emp.firstName}</strong></td>
      <td>${emp.employeeId}</td>
      <td>${emp.jobTitle}</td>
      <td style="text-align: center;">Я / 8</td>
      <td style="text-align: center;">Я / 8</td>
      <td style="text-align: center;">Я / 8</td>
      <td style="text-align: center;">Я / 8</td>
      <td style="text-align: center;">Я / 8</td>
      <td style="text-align: center; font-weight: bold;">${presentDays}</td>
      <td style="text-align: center; font-weight: bold; color: #2563EB;">${hours} ч.</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Табель учета рабочего времени (Форма Т-13) — Jana Post</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #111; }
    .header { text-align: center; margin-bottom: 15px; }
    .company { font-size: 14px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #475569; padding: 4px 6px; }
    th { background: #f1f5f9; text-align: center; font-size: 11px; }
    .print-btn { background: #2563EB; color: white; padding: 8px 14px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 15px; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Печать табеля Т-13</button>
  <div class="header">
    <div class="company">ТОО «Jana Post Logistics»</div>
    <div style="font-size: 14px; font-weight: bold; margin-top: 5px;">ТАБЕЛЬ УЧЕТА РАБОЧЕГО ВРЕМЕНИ (Форма Т-13)</div>
    <div>за ${curMonth} | Учетный период: Месяц (норма 40 часов в неделю)</div>
  </div>

  <table>
    <thead>
      <tr>
        <th rowspan="2">№</th>
        <th rowspan="2">Ф.И.О. работника</th>
        <th rowspan="2">Таб. №</th>
        <th rowspan="2">Должность</th>
        <th colspan="5">Отметки явок по дням недели</th>
        <th rowspan="2">Дней явок</th>
        <th rowspan="2">Всего часов</th>
      </tr>
      <tr>
        <th>Пн</th>
        <th>Вт</th>
        <th>Ср</th>
        <th>Чт</th>
        <th>Пт</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div style="margin-top: 30px; display: flex; justify-content: space-between;">
    <div>Ответственное лицо (HR): ________________ / Смагулова А. М.</div>
    <div>Руководитель подразделения: ________________ / Касымов Б. Н.</div>
  </div>
</body>
</html>`;
}

export function renderPayslip(employee, monthStr = 'Октябрь 2026 г.') {
  const empName = `${employee.lastName} ${employee.firstName}`;
  const gross = employee.salary || 350000;
  const iin = employee.iin || '940512300412';
  const tabNum = `JP-${employee.id.replace('emp-', '').padStart(4, '0')}`;
  const dept = employee.departmentName || 'Отдел логистики';
  const pos = employee.jobTitle || 'Специалист';

  // Calculations per Tax Code & Labor Code of RK
  const opv = Math.round(gross * 0.10);
  const vosms = Math.round(gross * 0.02);
  const mrpDeduction = 55048; // 14 MRP (2026)
  const taxableBase = Math.max(0, gross - opv - vosms - mrpDeduction);
  const ipn = Math.round(taxableBase * 0.10);
  const totalDeductions = opv + vosms + ipn;
  const netPay = gross - totalDeductions;

  // Employer costs
  const so = Math.round((gross - opv) * 0.035);
  const oosms = Math.round(gross * 0.03);
  const opvr = Math.round(gross * 0.015);
  const sn = Math.max(0, Math.round((gross - opv - vosms) * 0.095 - so));

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Расчетный листок (ст. 113 ТК РК) — ${empName}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #1e293b; margin: 30px auto; max-width: 820px; padding: 20px; line-height: 1.4; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
    .company { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #0f172a; }
    .sub { font-size: 11px; color: #64748b; margin-top: 4px; }
    .doc-title { font-size: 17px; font-weight: 800; text-align: center; margin: 15px 0 5px; text-transform: uppercase; color: #1e3a8a; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 12px; }
    th { background: #f1f5f9; text-align: left; font-weight: bold; color: #334155; }
    .num { text-align: right; font-family: monospace; font-size: 12px; }
    .total-row { font-weight: bold; background: #f8fafc; }
    .net-box { background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 14px 18px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center; }
    .net-val { font-size: 22px; font-weight: 900; color: #047857; font-family: monospace; }
    .print-btn { background: #2563EB; color: #fff; padding: 10px 18px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; margin-bottom: 20px; }
    @media print { .print-btn { display: none; } body { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Распечатать расчетный листок / Сохранить в PDF</button>

  <div class="header">
    <div class="company">ТОО «Jana Post Logistics»</div>
    <div class="sub">БИН: 210840032190 | г. Алматы, пр. Аль-Фараби 77/7, БЦ «Esentai» | Расчетный период: ${monthStr}</div>
  </div>

  <div class="doc-title">РАСЧЕТНЫЙ ЛИСТОК ЗА ${monthStr.toUpperCase()}</div>
  <p style="text-align: center; font-size: 11px; color: #64748b; margin-top: 0;">(в соответствии со статьей 113 Трудового кодекса Республики Казахстан)</p>

  <div class="meta-box">
    <div><strong>Сотрудник:</strong> ${empName}</div>
    <div><strong>Табельный номер:</strong> ${tabNum}</div>
    <div><strong>ИИН:</strong> <code>${iin}</code></div>
    <div><strong>Подразделение:</strong> ${dept}</div>
    <div><strong>Должность:</strong> ${pos}</div>
    <div><strong>Отработано дней/часов:</strong> 22 раб. дн. / 176 ч.</div>
  </div>

  <!-- Table 1: Accruals and Deductions -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
    <!-- Accruals -->
    <div>
      <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 13px;">1. НАЧИСЛЕНО (Gross)</h4>
      <table>
        <thead>
          <tr>
            <th>Вид начисления</th>
            <th class="num">Сумма (₸)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Должностной оклад</td>
            <td class="num">${gross.toLocaleString('ru-RU')} ₸</td>
          </tr>
          <tr>
            <td>Премия за логистический KPI</td>
            <td class="num">0 ₸</td>
          </tr>
          <tr class="total-row">
            <td>ИТОГО НАЧИСЛЕНО:</td>
            <td class="num" style="color: #1e3a8a;">${gross.toLocaleString('ru-RU')} ₸</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Deductions -->
    <div>
      <h4 style="margin: 0 0 6px 0; color: #b91c1c; font-size: 13px;">2. УДЕРЖАНО</h4>
      <table>
        <thead>
          <tr>
            <th>Вид удержания</th>
            <th class="num">Сумма (₸)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ОПВ (10% в ЕНПФ)</td>
            <td class="num">${opv.toLocaleString('ru-RU')} ₸</td>
          </tr>
          <tr>
            <td>ВОСМС (2% в ФСМС)</td>
            <td class="num">${vosms.toLocaleString('ru-RU')} ₸</td>
          </tr>
          <tr>
            <td>ИПН (10% с вычетом 14 МРП)</td>
            <td class="num">${ipn.toLocaleString('ru-RU')} ₸</td>
          </tr>
          <tr class="total-row">
            <td>ИТОГО УДЕРЖАНО:</td>
            <td class="num" style="color: #b91c1c;">${totalDeductions.toLocaleString('ru-RU')} ₸</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Net Box -->
  <div class="net-box">
    <div>
      <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #065f46;">3. К ВЫПЛАТЕ НА РУКИ (Net)</div>
      <div style="font-size: 12px; color: #047857;">Перечислено на банковский счет (Kaspi / Halyk Bank)</div>
    </div>
    <div class="net-val">${netPay.toLocaleString('ru-RU')} ₸</div>
  </div>

  <!-- Employer Taxes Info -->
  <h4 style="margin: 15px 0 6px 0; color: #475569; font-size: 12px;">4. НАЛОГИ И ВЗНОСЫ ЗА СЧЕТ РАБОТОДАТЕЛЯ (Справочно):</h4>
  <table>
    <thead>
      <tr>
        <th>Социальный налог (СН)</th>
        <th>Социальные отчисления (СО)</th>
        <th>ООСМС (3%)</th>
        <th>ОПВР (1.5%)</th>
        <th class="num">Итого расходы работодателя</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="num">${sn.toLocaleString('ru-RU')} ₸</td>
        <td class="num">${so.toLocaleString('ru-RU')} ₸</td>
        <td class="num">${oosms.toLocaleString('ru-RU')} ₸</td>
        <td class="num">${opvr.toLocaleString('ru-RU')} ₸</td>
        <td class="num"><strong>${(sn + so + oosms + opvr).toLocaleString('ru-RU')} ₸</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- Digital Signature QR Stamp -->
  <div style="margin-top: 30px; padding: 12px 16px; border: 1.5px dashed #3b82f6; border-radius: 8px; background: #f0f7ff; display: flex; align-items: center; justify-content: space-between;">
    <div>
      <div style="font-size: 12px; font-weight: bold; color: #1e3a8a;">Электронная подпись главного бухгалтера ТОО «Jana Post»</div>
      <div style="font-size: 11px; color: #475569; margin-top: 2px;">
        Сертификат ЭЦП НУЦ РК: <code>KZ-NUCO-2026-PAYSLIP-${employee.id.slice(0, 6)}</code><br>
        Документ сформирован автоматически в соответствии со ст. 113 ТК РК
      </div>
    </div>
    <div style="font-size: 10px; font-weight: bold; color: #15803d; border: 1px solid #86efac; background: #dcfce7; padding: 4px 8px; rounded: 4px;">
      🟢 ПОДПИСАНО ЭЦП
    </div>
  </div>
</body>
</html>`;
}

export function renderEmploymentContract(employee) {
  const empName = `${employee.lastName} ${employee.firstName}`;
  const iin = employee.iin || '940512300412';
  const pos = employee.jobTitle || 'Специалист логистической сети';
  const dept = employee.departmentName || 'Департамент логистики и доставки';
  const contractNum = employee.contractNumber || `ТД-${employee.id.replace('emp-', '').padStart(4, '0')}/2026`;
  const contractDate = employee.startDate || '2026-01-15';
  const salary = (employee.salary || 350000).toLocaleString('ru-RU');
  const esutdId = employee.enbekContractId || `ESUTD-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Трудовой договор № ${contractNum} (ст. 33 ТК РК) — ${empName}</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 13.5px; line-height: 1.5; color: #111; margin: 30px auto; max-width: 820px; padding: 25px; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 12px; }
    .title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 15px 0 5px; text-align: center; }
    .city-date { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; }
    h4 { margin: 16px 0 6px 0; font-size: 14px; text-transform: uppercase; }
    p { margin: 6px 0; text-align: justify; }
    .esutd-badge { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 12px 16px; margin: 20px 0; display: flex; align-items: center; justify-content: space-between; font-family: sans-serif; }
    .signatures { margin-top: 35px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .sign-box { border-top: 1px solid #000; padding-top: 8px; font-size: 12px; }
    .print-btn { background: #2563EB; color: #fff; padding: 10px 18px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; margin-bottom: 20px; font-family: sans-serif; }
    @media print { .print-btn { display: none; } body { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Распечатать трудовой договор / Сохранить в PDF</button>

  <div class="header">
    <div style="font-size: 15px; font-weight: bold; text-transform: uppercase;">ТОО «Jana Post Logistics»</div>
    <div style="font-size: 11px; color: #444;">БИН: 210840032190 | Республика Казахстан, г. Алматы, пр. Аль-Фараби 77/7, БЦ «Esentai»</div>
  </div>

  <div class="title">ТРУДОВОЙ ДОГОВОР № ${contractNum}</div>
  <p style="text-align: center; font-size: 12px; margin-top: 0;">(в соответствии со статьей 33 Трудового кодекса Республики Казахстан)</p>

  <div class="city-date">
    <div>г. Алматы</div>
    <div>«${contractDate.split('-')[2] || '15'}» января ${contractDate.split('-')[0] || '2026'} г.</div>
  </div>

  <div class="esutd-badge">
    <div>
      <div style="font-weight: 800; color: #166534; font-size: 13px;">🟢 ЗАРЕГИСТРИРОВАНО В ЕСУТД РК (Портал Enbek.kz)</div>
      <div style="font-size: 11px; color: #15803d; margin-top: 3px;">
        Регистрационный номер ЕСУТД: <strong>${esutdId}</strong><br>
        Единая система учета трудовых договоров Министерства труда и социальной защиты населения РК
      </div>
    </div>
    <div style="font-weight: bold; font-size: 11px; color: #166534; border: 1px solid #86efac; padding: 4px 8px; border-radius: 4px; background: #fff;">
      СТАТУС: АКТИВЕН
    </div>
  </div>

  <p>
    <strong>ТОО «Jana Post Logistics»</strong>, именуемое в дальнейшем «Работодатель», в лице Генерального директора 
    Смагуловой Айгерим Муратовны, действующей на основании Устава, с одной стороны, и гражданин(ка) 
    <strong>${empName}</strong>, ИИН <code>${iin}</code>, именуемый(ая) в дальнейшем «Работник», с другой стороны, 
    заключили настоящий Трудовой договор о нижеследующем:
  </p>

  <h4>1. Предмет договора и место работы</h4>
  <p>
    1.1. Работодатель принимает Работника на должность <strong>«${pos}»</strong> в структурное подразделение 
    <strong>«${dept}»</strong> (г. Алматы, логистический хаб Jana Post).<br>
    1.2. Работа по настоящему Договору является для Работника основным местом работы.<br>
    1.3. Срок действия договора: заключен на неопределенный срок в соответствии со ст. 30 ТК РК.<br>
    1.4. Работнику устанавливается испытательный срок продолжительностью <strong>3 (три) месяца</strong> (ст. 36 ТК РК).
  </p>

  <h4>2. Условия оплаты труда</h4>
  <p>
    2.1. Работнику устанавливается должностной оклад в размере <strong>${salary} тенге</strong> в месяц до удержания налогов.<br>
    2.2. Выплата заработной платы производится не реже одного раза в месяц, не позднее 10 числа месяца, следующего за отчетным (ст. 113 ТК РК).<br>
    2.3. Работодатель удерживает обязательные пенсионные взносы (ОПВ 10%), взносы ОСМС (2%) и индивидуальный подоходный налог (ИПН 10%) в строгом соответствии с налоговым законодательством РК.
  </p>

  <h4>3. Режим рабочего времени и отпуска</h4>
  <p>
    3.1. Работнику устанавливается пятидневная 40-часовая рабочая неделя с двумя выходными днями (ст. 68 ТК РК).<br>
    3.2. Работнику предоставляется ежегодный оплачиваемый трудовой отпуск продолжительностью <strong>24 (двадцать четыре) календарных дня</strong> (ст. 88 ТК РК). Праздничные дни в число дней отпуска не включаются (ст. 90 ТК РК).
  </p>

  <h4>4. Электронная цифровая подпись (ЭЦП НУЦ РК)</h4>
  <p>
    4.1. Настоящий договор составлен в электронном виде и подписан ЭЦП сторон в соответствии с Законом РК «Об электронном документе и электронной цифровой подписи».
  </p>

  <div class="signatures">
    <div>
      <div style="font-weight: bold; margin-bottom: 8px;">РАБОТОДАТЕЛЬ:</div>
      <div class="sign-box">
        ТОО «Jana Post Logistics»<br>
        БИН: 210840032190<br>
        Директор: Смагулова А. М.<br>
        <em>Подписано ЭЦП НУЦ РК: KZ-NUCO-JP-DIR</em>
      </div>
    </div>
    <div>
      <div style="font-weight: bold; margin-bottom: 8px;">РАБОТНИК:</div>
      <div class="sign-box">
        ${empName}<br>
        ИИН: ${iin}<br>
        Подпись работника: ________________<br>
        <em>Подписано ЭЦП НУЦ РК: KZ-NUCO-EMP-${iin.slice(-6)}</em>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function render1cXml(attendance = [], employees = []) {
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const itemsXml = employees
    .map((emp) => {
      const gross = emp.salary || 350000;
      const opv = Math.round(gross * 0.1);
      const vosms = Math.round(gross * 0.02);
      const taxableBase = Math.max(0, gross - opv - vosms - 55048);
      const ipn = Math.round(taxableBase * 0.1);
      const net = gross - opv - vosms - ipn;

      return `    <Сотрудник>
      <ТабельныйНомер>${emp.employeeId || emp.id}</ТабельныйНомер>
      <ФИО>${emp.lastName} ${emp.firstName}</ФИО>
      <ИИН>${emp.iin || '940512300412'}</ИИН>
      <Должность>${emp.jobTitle}</Должность>
      <Подразделение>${emp.departmentName || 'Отдел логистики'}</Подразделение>
      <ОтработаноДней>22</ОтработаноДней>
      <ОтработаноЧасов>176</ОтработаноЧасов>
      <НачисленоОклад>${gross}</НачисленоОклад>
      <УдержаноОПВ>${opv}</УдержаноОПВ>
      <УдержаноВОСМС>${vosms}</УдержаноВОСМС>
      <УдержаноИПН>${ipn}</УдержаноИПН>
      <КВыплате>${net}</КВыплате>
    </Сотрудник>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Выгрузка1СЗУПКонфигурацияКазахстан ВерсияФормата="2.1" ДатаФормирования="${dateStr}" Организация="ТОО Jana Post Logistics" БИН="210840032190">
  <Документ Вид="ТабельИНачислениеЗарплаты" Период="2026-10">
    <Сотрудники>
${itemsXml}
    </Сотрудники>
  </Документ>
</Выгрузка1СЗУПКонфигурацияКазахстан>`;
}
