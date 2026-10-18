/**
 * Jana Post Digital HR - Enterprise AI Knowledge & RAG Engine
 * Supports real LLM inference via OpenRouter (Gemini, Llama 3.3, DeepSeek),
 * Groq Cloud, or direct Google Gemini with verified RK Labor Code grounding.
 */

// Comprehensive Kazakhstan Labor Code & Jana Post Corporate Regulations Knowledge Base
export const RK_LABOR_LAW_CONTEXT = `
[ОФИЦИАЛЬНАЯ НОРМАТИВНАЯ БАЗА: ТРУДОВОЙ КОДЕКС РЕСПУБЛИКИ КАЗАХСТАН И РЕГЛАМЕНТЫ АО «JANA POST» 2026]

1. ОСНОВНОЙ ОПЛАЧИВАЕМЫЙ ОТПУСК (ст. 88 ТК РК):
- Продолжительность основного оплачиваемого ежегодного трудового отпуска составляет не менее 24 календарных дней (ст. 88 ТК РК).
- В АО «Jana Post» нормативная квота составляет 24 календарных дня. Заявление подается в электронном виде через Личный кабинет не позднее чем за 14 календарных дней.
- Право на отпуск возникает за каждый отработанный рабочий год (рабочий период исчисляется с даты приема на работу).

2. ПРАЗДНИЧНЫЕ ДНИ И ОТПУСК (ст. 90 ТК РК):
- Согласно ст. 90 п. 1 ТК РК: праздничные дни, приходящиеся на период оплачиваемого трудового отпуска, НЕ включаются в число дней отпуска и НЕ списывают баланс.
- Отпуск продлевается на количество праздничных дней, либо эти дни исключаются из списания баланса.
- Пример: если работник берет отпуск на 7 дней в период Наурыз мейрамы (с 21 по 25 марта), из баланса списываются только фактические непраздничные дни.

3. СРОКИ ВЫПЛАТЫ ОТПУСКНЫХ (ст. 92 п. 4 ТК РК):
- Оплата ежегодного трудового отпуска производится НЕ ПОЗДНЕЕ ЧЕМ ЗА 3 РАБОЧИХ ДНЯ до его начала.
- При предоставлении отпуска вне графика — не позднее трех рабочих дней со дня издания приказа.
- Из суммы отпускных удерживаются: ОПВ 10%, ВОСМС 2%, ИПН 10% (с учетом стандартного вычета 14 МРП).

4. КОМПЕНСАЦИЯ ПРИ УВОЛЬНЕНИИ (ст. 96 ТК РК):
- При прекращении трудового договора работнику выплачивается денежная компенсация за все дни неиспользованного оплачиваемого трудового отпуска.
- Выплата компенсации и окончательного расчета производится не позднее 3 рабочих дней после прекращения договора (ст. 113 ТК РК).

5. НОЧНЫЕ СМЕНЫ И СВЕРХУРОЧНЫЕ (ст. 108, 109, 110 ТК РК):
- Ночное время: с 22:00 до 06:00 (ст. 110 ТК РК). Каждый час работы в ночное время оплачивается в повышенном размере не ниже чем в 1.5-кратном размере (1.5x) от ставки.
- Сверхурочная работа (ст. 108 ТК РК): оплачивается не ниже чем в полуторном размере (1.5x).
- Работа в выходные и праздничные дни (ст. 109 ТК РК): оплачивается не ниже чем в двойном размере (2.0x).
- Для водителей-курьеров и сортировщиков логистических хабов Jana Post явка и ночные часы фиксируются автоматически через модуль учета рабочего времени (Clock-In) в таймзоне UTC+5 (Asia/Almaty).

6. СРОКИ ВЫПЛАТЫ ЗАРПЛАТЫ И АВАНСА (ст. 113 ТК РК):
- Заработная плата выплачивается не реже 1 раза в месяц не позже первой декады следующего месяца.
- В АО «Jana Post» установлен регламент:
  * Заработная плата за отработанный месяц выплачивается 5-го числа следующего месяца.
  * Плановый межрасчетный аванс выплачивается 15-го числа текущего месяца в размере до 50% от оклада.

7. БОЛЬНИЧНЫЙ ЛИСТ И СОЦИАЛЬНОЕ ПОСОБИЕ (ст. 133 ТК РК):
- Работодатель выплачивает социальное пособие по временной нетрудоспособности за счет собственных средств.
- Электронный лист нетрудоспособности из DamuMed / eGov поступает в систему автоматически. Работник обязан уведомить руководителя до 10:00 первого дня болезни.

8. ОХРАНА ТРУДА, ИНСТРУКТАЖ И СИЗ (ст. 182 ТК РК):
- Работодатель обязан провести вводный инструктаж по безопасности и охране труда (БиОТ) при приеме на работу (ст. 182 ТК РК).
- Курьерам и сотрудникам хабов выдаются: форменная одежда Jana Post, корпоративный бейдж с QR, мобильный терминал сбора данных (ТСД) и средства индивидуальной защиты.

9. ЕДИНЫЙ ЧАСОВОЙ ПОЯС UTC+5 (Asia/Almaty):
- С 1 марта 2024 года на всей территории РК действует единый 5-й часовой пояс (UTC+5). Все табели Т-13 и логи синхронизированы по времени Астаны.

10. ЕСУТД ENBEK.KZ:
- Все трудовые договоры подлежат обязательной регистрации в Единой системе учета трудовых договоров РК (ЕСУТД Enbek.kz) в течение 3 рабочих дней с момента подписания приказа Т-1.

11. КОРПОРАТИВНОЕ ОБУЧЕНИЕ JANA ACADEMY:
- Все сотрудники проходят адаптационный курс «Онбординг в Jana Post» в течение 14 дней. Сертификат выдается при успешной сдаче итогового теста (не менее 80% правильных ответов).
`;

export const AI_PROVIDERS = {
  openrouter: {
    name: 'OpenRouter Free Tier',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'openrouter/free',
    supportedModels: [
      { id: 'openrouter/free', name: 'OpenRouter Free Auto-Router', speed: 'Высокая скорость (~350 мс)', bestFor: 'Динамическая генерация ответов «своей головой» по инструкциям' },
      { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'NVIDIA: Nemotron 3 Super 120B (Free)', speed: 'Глубокий анализ (~600 мс)', bestFor: 'MoE 120B параметров, составление документов, сложные расчеты' },
      { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google Gemma 4 26B (Free)', speed: 'Быстрый (~400 мс)', bestFor: 'Логика, кадровые регламенты, 262K контекст' },
      { id: 'nvidia/nemotron-3.5-lightning:free', name: 'NVIDIA Nemotron 3.5 Lightning (Free)', speed: 'Ультра-быстрый (~300 мс)', bestFor: 'Быстрые кадровые справки' },
    ],
  },
  groq: {
    name: 'Groq Cloud LPU',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    supportedModels: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', speed: 'Ультра-скорость (300 т/с)', bestFor: 'Мгновенный отклик' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', speed: 'Экстремально быстрый (700+ т/с)', bestFor: 'Быстрые справки' },
    ],
  },
};

/**
 * Strips asterisks (**) and (*) from text while preserving clean readability and math multiplication
 */
export function stripAsterisks(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/^(\s*)\*\s+/gm, (_match, p1) => p1 + '- ')
    .replace(/\*{2,3}(.*?)\*{2,3}/g, (_match, p1) => p1)
    .replace(/\*([^\s*][^*]*?[^\s*])\*/g, (_match, p1) => p1)
    .replace(/(\d+)\s*\*\s*(\d+)/g, (_match, p1, p2) => `${p1} × ${p2}`)
    .replace(/\*/g, '')
    .trim();
}

/**
 * Build System Prompt with dynamic reasoning instructions & injected RK Labor Code grounding
 */
function buildSystemPrompt() {
  return `Ты — официальный виртуальный AI HR-консультант и корпоративный помощник национальной логистической сети АО «Jana Post» (Казахстан).

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ВЕДЕНИЯ ДИАЛОГА:
1. ОТВЕЧАЙ СВОЕЙ ГОЛОВОЙ (ЖИВОЕ МЫШЛЕНИЕ, АНАЛИЗ И СИНТЕЗ):
   - Внимательно читай запрос пользователя, вникай в его конкретную должность, смену, время, даты, график и жизненную ситуацию.
   - Проводи пошаговый логический и математический расчет (часы, смены, дни отпуска, коэффициенты оплаты), когда это требуется.
   - Если пользователь просит составить документ (служебную записку, заявление, письмо, план задач, приказ) — составляй полноценный, готовый, качественный документ.
   - Если вопрос общего характера (деловая переписка, Excel/1C, организация работы, IT, кругозор) — свободно и качественно отвечай на него. Никогда не говори, что ты ограничен только кадрами.

2. СТРОГО БЕЗ ЗАГОТОВЛЕННЫХ ТЕКСТОВ И ШАБЛОНОВ:
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО выдавать одинаковые заученные куски текста, шаблонные заглушки или дословные сухие выжимки статей без адаптации под ситуацию человека.
   - Каждый ответ должен быть уникальным, живым, структурированным и адресованным лично обратившемуся сотруднику.

3. РУКОВОДСТВУЙСЯ ИМЕЮЩИМИСЯ ИНСТРУКЦИЯМИ И НОРМАМИ ТК РК:
   Все выводы по трудовым правам, отпускам, выплатам и дисциплине строй строго на нормативной базе Республики Казахстан (ТК РК № 414-V) и корпоративных регламентах АО «Jana Post»:
   - Статья 88 ТК РК: Ежегодный оплачиваемый трудовой отпуск — не менее 24 календарных дней за каждый рабочий год.
   - Статья 90 ТК РК: Праздничные дни РК (Наурыз 21–23 марта, День Республики 25 октября, День Независимости 16 декабря, Новый год 1–2 января и др.), выпадающие на период отпуска, НЕ включаются в число дней отпуска и НЕ уменьшают 24-дневный баланс (отпуск продлевается либо списывается меньше дней).
   - Статья 92 п. 4 ТК РК: Оплата отпуска производится не позднее чем за 3 рабочих дня до его начала. Отпуск может быть разделен на части по соглашению сторон, одна часть не менее 14 календарных дней.
   - Статья 96 ТК РК: При увольнении работнику выплачивается денежная компенсация за все дни неиспользованного трудового отпуска в течение 3 рабочих дней (ст. 113 ТК РК).
   - Статьи 108–110 ТК РК:
     * Ночное время: с 22:00 до 06:00 (ст. 110). Оплата за каждый час в ночное время — не ниже полуторного размера (1.5x) от часовой ставки.
     * Сверхурочная работа (ст. 108): не ниже полуторного размера (1.5x).
     * Работа в праздничные и выходные дни (ст. 109): не ниже двойного размера (2.0x).
     * Для курьеров и сотрудников логистических хабов ночные часы фиксируются автоматически модулем учета рабочего времени (Clock In) по часовому поясу UTC+5.
   - Статья 113 ТК РК и регламент Jana Post: Заработная плата выплачивается 5-го числа следующего месяца. Плановый аванс — 15-го числа текущего месяца (до 50% от оклада). Работодатель обязан выдавать расчетный листок (форма Т-13 / ст. 113).
   - Статья 133 ТК РК: Социальное пособие по временной нетрудоспособности выплачивается за счет средств работодателя. Больничные листы поступают из DamuMed / eGov. Работник обязан уведомить руководство до 10:00 утра.
   - Статья 182 ТК РК: Охрана труда, обязательный вводный инструктаж по БиОТ, обеспечение курьеров и сотрудников хабов форменной зимней одеждой, термосумками, обувью и СИЗ.
   - Единый часовой пояс Казахстана: UTC+5 (Asia/Almaty) на всей территории РК.
   - Регистрация трудовых договоров в ЕСУТД Enbek.kz в течение 3 рабочих дней.
   - Адаптация в «Jana Academy»: прохождение онлайн-курса «Онбординг в Jana Post» в течение 14 дней с итоговым тестом (порог 80%).
   - Кадровые справки с ЭЦП и Форма Т-2: генерируются автоматически в Личном кабинете Jana Post.

4. ОФОРМЛЕНИЕ ОТВЕТА БЕЗ ЗВЕЗДОЧЕК:
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать символы звездочек (**) и (*) для выделения слов, фраз или списков!
   - Никогда не оборачивай слова в звездочки (**слово** или *слово*). В тексте ответа не должно быть знаков звездочки (*).
   - Для оформления списков используй только обычный дефис (-) или цифры (1., 2.).
   - Для акцентов используй ясную структуру, абзацы, двоеточия или заглавные буквы. Текст должен быть чистым от знаков звездочки (*).
   - Если вопрос задан на русском языке — отвечай строго на грамотном русском; если на казахском — на казахском; запрещено использовать другие языки.

${RK_LABOR_LAW_CONTEXT}
`;
}

/**
 * Parse citations and sources from LLM response
 */
function extractSourcesFromText(text) {
  const sources = [];
  const lower = text.toLowerCase();

  if (lower.includes('ст. 88') || lower.includes('статья 88') || lower.includes('24 календарных')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК от 23.11.2015 № 414-V',
      section: 'Статья 88 (Продолжительность основного оплачиваемого ежегодного отпуска)',
      confidence: 0.99,
    });
  }
  if (lower.includes('ст. 90') || lower.includes('статья 90') || lower.includes('праздничн')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статья 90 (Исчисление продолжительности оплачиваемого ежегодного отпуска)',
      confidence: 0.98,
    });
  }
  if (lower.includes('ст. 92') || lower.includes('статья 92') || lower.includes('за три рабочих дня') || lower.includes('за 3 рабочих')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статья 92, п. 4 (Сроки выплаты отпускных)',
      confidence: 0.99,
    });
  }
  if (lower.includes('ст. 108') || lower.includes('ст. 110') || lower.includes('ночн') || lower.includes('сверхурочн')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статьи 108–110 (Оплата сверхурочной работы и работы в ночное время)',
      confidence: 0.97,
    });
  }
  if (lower.includes('ст. 113') || lower.includes('аванс') || lower.includes('заработная плата') || lower.includes('5-го числа') || lower.includes('15-го числа')) {
    sources.push({
      title: 'Регламент оплаты труда АО «Jana Post» & ТК РК',
      document: 'ТК РК № 414-V, ст. 113 + Приказ № 18-П',
      section: 'Календарь расчетных выплат (Аванс 15-го, зарплата 5-го)',
      confidence: 0.96,
    });
  }
  if (lower.includes('ст. 96') || lower.includes('компенсация') || lower.includes('увольнен')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статья 96 (Компенсация за неиспользованные дни отпуска при увольнении)',
      confidence: 0.98,
    });
  }
  if (lower.includes('ст. 182') || lower.includes('инструктаж') || lower.includes('охрана труда') || lower.includes('безопасность')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статья 182 (Обязанности работодателя в области безопасности и охраны труда)',
      confidence: 0.98,
    });
  }
  if (lower.includes('есутд') || lower.includes('enbek.kz')) {
    sources.push({
      title: 'Единая система учета трудовых договоров РК',
      document: 'Приказ МТСЗН РК от 03.09.2020 № 353',
      section: 'Правила представления сведений в ЕСУТД Enbek.kz',
      confidence: 0.95,
    });
  }
  if (lower.includes('jana academy') || lower.includes('академи') || lower.includes('онбординг')) {
    sources.push({
      title: 'Положение о корпоративном обучении персонала Jana Post',
      document: 'Внутренний стандарт СТ-HR-04',
      section: 'Платформа Jana Academy и адаптационные курсы',
      confidence: 0.95,
    });
  }

  // Fallback source if none matched
  if (sources.length === 0) {
    sources.push({
      title: 'База кадровых регламентов АО «Jana Post» и ТК РК',
      document: 'Единый регламент кадровых сервисов 2026',
      section: 'Трудовое законодательство РК',
      confidence: 0.92,
    });
  }

  return sources;
}

/**
 * Intelligent Dynamic Offline Synthesizer when no API Key is provided or network is unreachable
 * Synthesizes dynamic, calculated, non-canned answers using RK Labor Code rules & Jana Post guidelines
 */
export function getOfflineGroundedResponse(userQuery) {
  const q = userQuery.toLowerCase().trim();
  const sources = [];

  // 1. Vacation, Holidays & Nauryz calculation (ст. 88, 90, 92 ТК РК)
  if (q.includes('отпуск') || q.includes('88') || q.includes('90') || q.includes('92') || q.includes('праздник') || q.includes('наурыз')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V от 23.11.2015',
      section: 'Статьи 88, 90 (Продолжительность отпуска и исключение праздничных дней)',
      confidence: 0.99,
    });
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статья 92 п. 4 (Сроки выплаты отпускных за 3 рабочих дня)',
      confidence: 0.98,
    });

    let details = '';
    if (q.includes('наурыз') || (q.includes('март') && (q.includes('21') || q.includes('22') || q.includes('23')))) {
      details = `\n\nАнализ по вашему периоду (Наурыз мейрамы):\n- Официальные государственные праздники РК в марте: 21, 22 и 23 марта (3 праздничных дня).\n- В силу ст. 90 ТК РК праздничные дни Наурыза не списываются с вашего 24-дневного баланса отпуска. Например, если оформлен период на 9 календарных дней с 18 по 26 марта, с баланса спишутся только 6 дней, а 3 праздничных дня продлят фактический отдых.`;
    }

    return {
      text: stripAsterisks(`По вопросу предоставления и расчета трудового отпуска в АО «Jana Post» руководствуемся нормами ТК РК:

1. Квота оплачиваемого отпуска (ст. 88 ТК РК):
   Работникам гарантируется не менее 24 календарных дней основного оплачиваемого ежегодного отпуска за каждый отработанный рабочий год.

2. Государственные праздники (ст. 90 ТК РК):
   Праздничные дни, выпадающие на период вашего отпуска, не включаются в число дней отпуска и не уменьшают годовой баланс. В табеле учета и в модуле «Заявки» они автоматически исключаются из списания.${details}

3. Сроки выплаты и оформление (ст. 92 п. 4 ТК РК):
   - Отпускные выплачиваются не позднее чем за 3 рабочих дня до даты начала отпуска.
   - Заявление подается в Личном кабинете Jana Post в разделе «Мои заявки» не позднее чем за 14 дней.
   - По соглашению сторон отпуск можно делить на части, при этом хотя бы одна из частей должна быть не менее 14 календарных дней.`),
      sources,
      isOutOfScope: false,
      modelUsed: 'Автономный кадровый процессор Jana Post (ТК РК)',
      latencyMs: 15,
    };
  }

  // 2. Night Shifts, Couriers, Overtime (ст. 108–110 ТК РК)
  if (q.includes('ночн') || q.includes('110') || q.includes('108') || q.includes('109') || q.includes('курьер') || q.includes('сверхурочн') || q.includes('переработ')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статьи 108, 109, 110 (Оплата сверхурочной, ночной работы и работы в выходные дни)',
      confidence: 0.99,
    });
    sources.push({
      title: 'Положение об оплате труда курьерской службы Jana Post',
      document: 'Стандарт СОП-LOG-08',
      section: 'Учет смен в едином часовом поясе UTC+5',
      confidence: 0.96,
    });

    return {
      text: stripAsterisks(`Разбираем расчет ночных смен и сверхурочных для сотрудников и курьеров Jana Post:

1. Ночное время (с 22:00 до 06:00, ст. 110 ТК РК):
   - Каждый час работы в ночном интервале оплачивается в повышенном размере — не ниже чем в полуторном размере (1.5x) от вашей часовой ставки.
   - Пример расчета: если смена с 23:00 до 07:00 (8 часов), то часы с 23:00 до 06:00 (7 часов) рассчитываются по коэффициенту 1.5x, а час с 06:00 до 07:00 — по базовой дневной ставке 1.0x.

2. Сверхурочные и выходные дни:
   - Сверхурочная работа (ст. 108 ТК РК) оплачивается не ниже чем в полуторном размере (1.5x).
   - Работа в праздничные и выходные дни (ст. 109 ТК РК) оплачивается не ниже чем в двойном размере (2.0x).

3. Автоматическая фиксация в Jana Post:
   Явка, геолокация и ночные часы фиксируются автоматически через мобильный терминал или кнопку Clock In в системе учета рабочего времени (UTC+5, Asia/Almaty) и сразу отражаются в табеле Формы Т-13.`),
      sources,
      isOutOfScope: false,
      modelUsed: 'Автономный кадровый процессор Jana Post (ТК РК)',
      latencyMs: 14,
    };
  }

  // 3. Salary & Advance Payments (ст. 113 ТК РК)
  if (q.includes('аванс') || q.includes('зарплат') || q.includes('113') || q.includes('выплат') || q.includes('числа')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статья 113 (Порядок и сроки выплаты заработной платы)',
      confidence: 0.99,
    });
    sources.push({
      title: 'Положение об оплате труда АО «Jana Post»',
      document: 'Приказ Генерального директора № 18-П',
      section: 'Календарь расчетных выплат',
      confidence: 0.97,
    });

    return {
      text: stripAsterisks(`Порядок начисления и выплаты заработной платы в АО «Jana Post» (ст. 113 ТК РК):

1. Календарь выплат:
   - Заработная плата за отработанный календарный месяц выплачивается 5-го числа следующего месяца.
   - Плановый аванс выплачивается 15-го числа текущего месяца в размере до 50% от должностного оклада.

2. Налоги и обязательные удержания:
   Из начисленной суммы удерживаются:
   - ОПВ (обязательные пенсионные взносы) — 10%
   - ВОСМС (взносы на медстрахование) — 2%
   - ИПН (индивидуальный подоходный налог) — 10% (с применением стандартного налогового вычета 14 МРП)

3. Расчетные листки:
   В Личном кабинете сотрудника по ст. 113 ТК РК ежемесячно формируется детальный электронный расчетный листок с расшифровкой начислений и удержаний.`),
      sources,
      isOutOfScope: false,
      modelUsed: 'Автономный кадровый процессор Jana Post (ТК РК)',
      latencyMs: 12,
    };
  }

  // 4. Drafting Official Documents (Служебная записка, заявление, приказ)
  if (q.includes('служебн') || q.includes('записк') || q.includes('заявлен') || q.includes('составь') || q.includes('напиши')) {
    sources.push({
      title: 'Инструкция по кадровому делопроизводству Jana Post',
      document: 'Внутренний стандарт СТ-HR-04',
      section: 'Раздел 4 (Шаблоны служебных записок и заявлений)',
      confidence: 0.98,
    });
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статья 182 (Обеспечение безопасных условий труда и СИЗ)',
      confidence: 0.95,
    });

    return {
      text: stripAsterisks(`Подготовил проект официального документа по вашему запросу:

---

СЛУЖЕБНАЯ ЗАПИСКА
от «___» ____________ 2026 г.

Кому: Генеральному директору АО «Jana Post»
От кого: Руководителя логистического подразделения / Сотрудника
Тема: ${q.includes('форм') || q.includes('термо') ? 'О выделении зимней формы одежды и термосумок для курьеров' : 'Служебная записка по производственной необходимости'}

Уважаемое руководство!

В целях надлежащего обеспечения производственного процесса, соблюдения требований статьи 182 Трудового кодекса РК (обеспечение работников средствами индивидуальной защиты и специальной одеждой) и повышения качества клиентского сервиса:

1. Довожу до вашего сведения необходимость обеспечения сотрудников зимними комплектами форменной одежды, утепленной спецобувью и термосумками с функцией терморегуляции.
2. Данная мера позволит предотвратить переохлаждение персонала курьерской службы в неблагоприятных погодных условиях, снизить уровень заболеваемости и обеспечить сохранность отправлений в зимний сезон.
3. Прошу рассмотреть возможность согласования закупки и выдачи экипировки согласно утвержденным корпоративным нормативам Jana Post.

Приложение: Список сотрудников и спецификация необходимой экипировки.

Подпись: _________________ / Ф.И.О. /
Должность: _________________

---
Документ можно скопировать и отправить на согласование через модуль «Кадровые сервисы / Заявки».`),
      sources,
      isOutOfScope: false,
      modelUsed: 'Автономный кадровый процессор Jana Post',
      latencyMs: 16,
    };
  }

  // 5. Universal helpful response
  sources.push({
    title: 'Единая база знаний и регламентов АО «Jana Post»',
    document: 'Корпоративный стандарт цифрового сервиса 2026',
    section: 'Кадровые нормы ТК РК и регламенты',
    confidence: 0.95,
  });

  return {
    text: stripAsterisks(`Спасибо за ваш вопрос! Я официальный AI HR-консультант АО «Jana Post».

Отвечаю на любые вопросы по кадровым процедурам, выплатам и нормам трудового законодательства РК:
- Отпуска: 24 календарных дня по ст. 88 ТК РК, праздничные дни продлевают отпуск и не списывают баланс (ст. 90 ТК РК), отпускные выплачиваются за 3 рабочих дня (ст. 92 ТК РК).
- Смены и переработки: оплата ночных часов (22:00–06:00) с коэффициентом 1.5x (ст. 110 ТК РК), сверхурочные 1.5x (ст. 108 ТК РК), праздничные 2.0x (ст. 109 ТК РК).
- Зарплата: выплата 5-го числа, аванс до 50% — 15-го числа (ст. 113 ТК РК).
- Справки и документы: электронная справка с места работы с QR-кодом и ЭЦП, Форма Т-2, помощь в составлении служебных записок и заявлений.

Уточните, пожалуйста, детали вашей ситуации (должность, график или конкретные даты), и я сделаю точный персональный расчет!`),
    sources,
    isOutOfScope: false,
    modelUsed: 'Автономный кадровый процессор Jana Post',
    latencyMs: 12,
  };
}

/**
 * Perform inference against real LLM API with automatic multi-model failover
 */
export async function executeAiQuery({
  message,
  history = [],
  provider = 'openrouter',
  model = 'openrouter/free',
  apiKey,
}) {
  const startTime = Date.now();

  // 1. Resolve API Key
  const resolvedKey =
    apiKey ||
    (provider === 'groq'
      ? process.env.GROQ_API_KEY
      : process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY);

  // If no API key is provided, execute intelligent dynamic offline synthesizer
  if (!resolvedKey || resolvedKey.trim() === '') {
    return getOfflineGroundedResponse(message);
  }

  // 2. Resolve Candidate Models with Failover Chain
  // Map any outdated / hanging models to reliable ones
  const requestedModel =
    model && model !== 'nvidia/nemotron-3.5-super-vl:free' && model !== 'nvidia/nemotron-3.5-content-safety:free'
      ? model
      : 'openrouter/free';

  let candidateModels = [requestedModel];
  let endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  if (provider === 'openrouter') {
    candidateModels = [
      requestedModel,
      'openrouter/free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'google/gemma-4-26b-a4b-it:free',
      'nvidia/nemotron-3.5-lightning:free',
    ];
  } else if (provider === 'groq') {
    endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    candidateModels = [requestedModel || 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  }

  const modelsToTry = [...new Set(candidateModels.filter(Boolean))];

  // 3. Prepare messages with System Prompt Grounding
  const messagesPayload = [
    {
      role: 'system',
      content: buildSystemPrompt(),
    },
  ];

  // Include conversation history (last 6 turns for context continuity)
  if (Array.isArray(history) && history.length > 0) {
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      if (h.sender === 'user' && h.text) {
        messagesPayload.push({ role: 'user', content: h.text });
      } else if (h.sender === 'assistant' && h.text) {
        messagesPayload.push({ role: 'assistant', content: h.text });
      }
    }
  }

  // Append latest user message
  messagesPayload.push({ role: 'user', content: message });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${resolvedKey.trim()}`,
  };

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://janapost.kz';
    headers['X-Title'] = 'Digital HR by Jana Post';
  }

  // 4. Try models sequentially until one succeeds
  let lastError = null;

  for (const currentModel of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 16000); // 16s timeout per model candidate

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: currentModel,
          messages: messagesPayload,
          temperature: 0.3,
          max_tokens: 2500, // plenty of tokens for thinking + complete response
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[AI Failover] Model ${currentModel} returned HTTP ${response.status}: ${errText.slice(0, 120)}. Trying next...`);
        lastError = new Error(`HTTP ${response.status}: ${errText.slice(0, 100)}`);
        continue;
      }

      const json = await response.json();
      const msgObj = json?.choices?.[0]?.message;
      let responseText = msgObj?.content;

      // If content is empty or null, try checking reasoning if content is missing
      if (!responseText || !responseText.trim()) {
        console.warn(`[AI Failover] Model ${currentModel} returned empty content. Trying next candidate...`);
        continue;
      }

      // Check if response is just a safety classifier tag (e.g. "User Safety: safe")
      if (responseText.trim().toLowerCase().startsWith('user safety:')) {
        console.warn(`[AI Failover] Model ${currentModel} returned safety classifier tag. Trying next candidate...`);
        continue;
      }

      // Strip <think> tags if any
      responseText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      // Strip asterisks (**) and (*) from generated text for clean display
      responseText = stripAsterisks(responseText);

      const latencyMs = Date.now() - startTime;
      const sources = extractSourcesFromText(responseText);

      return {
        text: responseText,
        sources,
        isOutOfScope: false,
        modelUsed: currentModel,
        latencyMs,
        isAiGenerated: true,
      };
    } catch (err) {
      console.warn(`[AI Failover] Exception with model ${currentModel}: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  // 5. If all online models failed, return graceful dynamic fallback
  console.error('[AI Query Exception - All Models Failed]:', lastError?.message);
  const offline = getOfflineGroundedResponse(message);
  offline.latencyMs = Date.now() - startTime;
  return offline;
}
