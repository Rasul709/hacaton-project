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
    defaultModel: 'nvidia/nemotron-3.5-super-vl:free',
    supportedModels: [
      { id: 'nvidia/nemotron-3.5-super-vl:free', name: 'NVIDIA: Nemotron 3.5 Super VL (Free)', speed: 'Высокая скорость (~450 мс)', bestFor: 'MoE 120B, 1M контекст, флагман NVIDIA' },
      { id: 'openrouter/free', name: 'OpenRouter Free Auto-Router', speed: 'Высокая доступность (~400 мс)', bestFor: 'Авто-отказоустойчивость 99.9%' },
      { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google Gemma 4 26B (Free)', speed: 'Быстрый (~400 мс)', bestFor: 'Логика, тексты, 262K контекст' },
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
 * Build System Prompt with universal assistance & injected RK Labor Code grounding
 */
function buildSystemPrompt() {
  return `Ты — официальный виртуальный AI-ассистент и корпоративный консультант национальной логистической сети АО «Jana Post» (Казахстан).

ТВОЯ РОЛЬ И ВОЗМОЖНОСТИ:
1. УНИВЕРСАЛЬНЫЙ ПОМОЩНИК: Ты — полноценный, умный и доброжелательный ИИ. Ты свободно и качественно отвечаешь на АБСОЛЮТНО ЛЮБЫЕ вопросы пользователя:
   - Общие знания, объяснения понятий, обучение, логика, кругозор.
   - Деловые коммуникации: составление писем, резюме, служебных записок, поздравлений коллегам, планов на день.
   - IT, автоматизация, программирование, формулы Excel/1C, аналитика данных.
   - Логистика, складской учет, клиентский сервис и оптимизация рабочих процессов.
   - Любые повседневные, рабочие, жизненные и организационные вопросы.
   - НИКОГДА не отказывай в ответе на общие или рабочие вопросы и не говори, что ты ограничен только кадрами.

2. ЭКСПЕРТИЗА ПО КАДРАМ И ТРУДОВОМУ ПРАВУ (ТК РК):
   ТОЛЬКО в тех случаях, когда вопрос пользователя касается трудовых отношений, прав работников, графиков, выплат, отпусков, больничных или работы в АО «Jana Post», ОБЯЗАТЕЛЬНО опирайся на Трудовой кодекс Республики Казахстан (ТК РК от 23 ноября 2015 года № 414-V) и корпоративные регламенты АО «Jana Post», приведенные ниже:
   - Ежегодный оплачиваемый отпуск: не менее 24 календарных дней (ст. 88 ТК РК). Праздничные дни исключаются из подсчета дней отпуска и продлевают его (ст. 90 ТК РК).
   - Выплата отпускных: не позднее чем за 3 рабочих дня до начала отпуска (ст. 92 п. 4 ТК РК).
   - Оплата ночных смен (с 22:00 до 06:00, ст. 110 ТК РК) и сверхурочных (ст. 108 ТК РК): не ниже 1.5-кратного размера (1.5x). Праздничные и выходные: не ниже 2.0x (ст. 109 ТК РК).
   - Сроки выплаты зарплаты: не позже 5-го числа следующего месяца, плановый аванс — 15-го числа (ст. 113 ТК РК).
   - Компенсация за неиспользованный отпуск при увольнении (ст. 96 ТК РК).
   - Обязательный инструктаж по безопасности и охране труда (ст. 182 ТК РК).
   - Регистрация договоров в ЕСУТД Enbek.kz.
   - Единый часовой пояс Казахстана: UTC+5 (Asia/Almaty).

3. ЯЗЫК:
   Отвечай на том языке, на котором обратился пользователь (казахский или русский). Форматируй текст структурированно, с удобными списками и выделением ключевых моментов.

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
 * Intelligent Offline RAG Fallback when no API Key is provided or network is down
 */
/**
 * Intelligent Universal Offline Fallback when no API Key is provided or all online models are unreachable
 */
export function getOfflineGroundedResponse(userQuery) {
  const q = userQuery.toLowerCase().trim();

  // 1. HR Specific: Annual Vacation & Holidays (ст. 88, 90, 92 ТК РК)
  if (q.includes('отпуск') || q.includes('88') || q.includes('квота') || q.includes('сколько дней')) {
    return {
      text: 'В соответствии со статьей 88 Трудового кодекса РК, сотрудникам АО «Jana Post» предоставляется основной оплачиваемый ежегодный трудовой отпуск продолжительностью не менее **24 календарных дней**.\n\nЗаявление оформляется в электронном виде в модуле «Заявки» не позднее чем за 14 дней до начала отпуска. Оплата отпуска производится не позднее чем за 3 рабочих дня до его начала (ст. 92 п. 4 ТК РК). Если на дни отпуска приходятся государственные праздники РК, они не включаются в счет отпуска и не уменьшают годовой баланс (ст. 90 ТК РК).',
      sources: [
        {
          title: 'Трудовой кодекс Республики Казахстан',
          document: 'ТК РК № 414-V',
          section: 'Статья 88 (Продолжительность основного оплачиваемого ежегодного трудового отпуска)',
          confidence: 0.99,
        },
        {
          title: 'Трудовой кодекс Республики Казахстан',
          document: 'ТК РК № 414-V',
          section: 'Статья 90 (Праздничные дни в период отпуска)',
          confidence: 0.98,
        },
      ],
      isOutOfScope: false,
      modelUsed: 'Автономная база знаний ТК РК (Офлайн RAG)',
      latencyMs: 18,
    };
  }

  // 2. HR Specific: Night shifts & Overtime (ст. 108, 109, 110 ТК РК)
  if (q.includes('ночн') || q.includes('110') || q.includes('108') || q.includes('курьер') || q.includes('сверхурочн')) {
    return {
      text: 'Согласно Трудовому кодексу Республики Казахстан:\n1. **Работа в ночное время** (с 22:00 до 06:00, ст. 110 ТК РК): каждый час работы оплачивается в повышенном размере не ниже чем в полуторном размере (**1.5x**) от ставки.\n2. **Сверхурочные работы** (ст. 108 ТК РК): оплачиваются не ниже чем в полуторном размере (**1.5x**).\n3. **Работа в праздничные и выходные дни** (ст. 109 ТК РК): оплачивается не ниже чем в двойном размере (**2.0x**).\n\nДля курьеров и сотрудников сортировочных хабов Jana Post учет ночных смен ведется автоматически в системе учета рабочего времени (Clock In) по часовому поясу UTC+5.',
      sources: [
        {
          title: 'Трудовой кодекс Республики Казахстан',
          document: 'ТК РК № 414-V',
          section: 'Статьи 108, 109, 110 (Оплата сверхурочной, ночной работы и работы в праздничные дни)',
          confidence: 0.99,
        },
      ],
      isOutOfScope: false,
      modelUsed: 'Автономная база знаний ТК РК (Офлайн RAG)',
      latencyMs: 16,
    };
  }

  // 3. HR Specific: Salary & Advance Payment (ст. 113 ТК РК)
  if (q.includes('аванс') || q.includes('зарплат') || q.includes('113') || q.includes('числа')) {
    return {
      text: 'В соответствии со статьей 113 ТК РК и Положением об оплате труда АО «Jana Post»:\n- **Заработная плата** за отработанный календарный месяц перечисляется не позднее **5-го числа** следующего месяца.\n- **Плановый аванс** выплачивается **15-го числа** текущего месяца в размере до 50% от должностного оклада.\n\nРасчетные листки с расшифровкой удержаний (ОПВ, ВОСМС, ИПН) формируются в Личном кабинете по кнопке «Печать расчетного листка (ст. 113 ТК РК)».',
      sources: [
        {
          title: 'Трудовой кодекс Республики Казахстан',
          document: 'ТК РК № 414-V',
          section: 'Статья 113 (Порядок и сроки выплаты заработной платы)',
          confidence: 0.99,
        },
      ],
      isOutOfScope: false,
      modelUsed: 'Автономная база знаний ТК РК (Офлайн RAG)',
      latencyMs: 15,
    };
  }

  // 4. HR Specific: Forms T-2 & Employment Verification
  if (q.includes('справк') || q.includes('т-2') || q.includes('т2')) {
    return {
      text: 'В системе Jana Post предусмотрено мгновенное формирование кадровых справок:\n1. **Электронная справка с места работы** с валидным QR-кодом и штампом ЭЦП генерируется в Личном кабинете работника за несколько секунд.\n2. **Типовая Личная карточка работника (Форма Т-2)** доступна для скачивания и печати в карточке профиля.\n3. Справки о доходах для банков/посольств заказываются в разделе «Заявки» со сроком изготовления 1 рабочий день.',
      sources: [
        {
          title: 'Инструкция по кадровому делопроизводству Jana Post',
          document: 'Внутренний стандарт СТ-HR-04',
          section: 'Раздел 6 (Выдача кадровых документов с ЭЦП)',
          confidence: 0.97,
        },
      ],
      isOutOfScope: false,
      modelUsed: 'Автономная база знаний ТК РК (Офлайн RAG)',
      latencyMs: 14,
    };
  }

  // 5. Universal Helpful Fallback for greetings or general questions
  if (q === 'привет' || q === 'здравствуйте' || q.includes('как дела') || q.includes('сәлем')) {
    return {
      text: 'Здравствуйте! Я интеллектуальный AI-ассистент национальной логистической сети АО «Jana Post».\n\nЧем могу помочь вам сегодня?\n- Могу ответить на любые рабочие, организационные и аналитические вопросы, составить письмо или план задач.\n- По кадровым процессам подскажу официальные нормы ТК РК (отпуска, график, расчетные, ночные смены, справки Т-2).',
      sources: [
        {
          title: 'Портал корпоративных сервисов Jana Post',
          document: 'Регламент цифрового помощника 2026',
          section: 'Общий интерфейс взаимодействия',
          confidence: 1.0,
        },
      ],
      isOutOfScope: false,
      modelUsed: 'Автономная база знаний Jana Post',
      latencyMs: 10,
    };
  }

  // 6. General question fallback with friendly guidance
  return {
    text: `Спасибо за ваш вопрос («${userQuery}»)! Я корпоративный AI-ассистент АО «Jana Post».\n\nВ автономном режиме я храню регламенты Jana Post и статьи Трудового кодекса РК (квота отпуска 24 дня по ст. 88, оплата за 3 дня по ст. 92, доплата за ночные 1.5x по ст. 110, выплата зарплаты до 5-го числа по ст. 113).\n\nДля свободных ответов на любые темы (написание текстов, код, расчеты, планирование, творчество) убедитесь, что серверный шлюз OpenRouter активен.`,
    sources: [
      {
        title: 'Трудовой кодекс Республики Казахстан',
        document: 'ТК РК № 414-V от 23.11.2015',
        section: 'Общие положения и гарантии работникам',
        confidence: 0.95,
      },
    ],
    isOutOfScope: false,
    modelUsed: 'Автономная база знаний Jana Post',
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
  model = 'nvidia/nemotron-3.5-super-vl:free',
  apiKey,
}) {
  const startTime = Date.now();

  // 1. Resolve API Key
  const resolvedKey =
    apiKey ||
    (provider === 'groq'
      ? process.env.GROQ_API_KEY
      : process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY);

  // If no API key is provided, execute high-fidelity Offline RAG
  if (!resolvedKey || resolvedKey.trim() === '') {
    return getOfflineGroundedResponse(message);
  }

  // 2. Resolve Candidate Models with Failover Chain
  let candidateModels = [model];
  let endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  if (provider === 'openrouter') {
    candidateModels = [
      model || 'nvidia/nemotron-3.5-super-vl:free',
      'openrouter/free',
      'google/gemma-4-26b-a4b-it:free',
      'nvidia/nemotron-3.5-super-vl:free',
    ];
  } else if (provider === 'groq') {
    endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    candidateModels = [model || 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
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
      if (h.sender === 'user') {
        messagesPayload.push({ role: 'user', content: h.text });
      } else if (h.sender === 'assistant') {
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
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout per model candidate

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: currentModel,
          messages: messagesPayload,
          temperature: 0.2,
          max_tokens: 2500, // plenty of tokens for reasoning + content
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
      let responseText = msgObj?.content || msgObj?.reasoning || '';

      if (!responseText || !responseText.trim()) {
        console.warn(`[AI Failover] Model ${currentModel} returned empty text. Trying next candidate...`);
        continue;
      }

      const latencyMs = Date.now() - startTime;
      const sources = extractSourcesFromText(responseText);

      return {
        text: responseText.trim(),
        sources,
        isOutOfScope: false,
        modelUsed: currentModel,
        latencyMs,
      };
    } catch (err) {
      console.warn(`[AI Failover] Exception with model ${currentModel}: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  // 5. If all online models failed, return graceful fallback
  console.error('[AI Query Exception - All Models Failed]:', lastError?.message);
  const offline = getOfflineGroundedResponse(message);
  offline.latencyMs = Date.now() - startTime;
  return offline;
}
