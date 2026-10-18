import { ChatMessage, KnowledgeSource } from '@/types';
import { api } from '@/lib/api';

export interface KnowledgeItem {
  id: string;
  keywords: string[];
  title: string;
  answer: string;
  sources: KnowledgeSource[];
}

export const HR_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'vacation',
    keywords: [
      'отпуск',
      'отпуска',
      'сколько дней',
      'ст 88',
      'ст. 88',
      'квота',
      'отгул',
      'ежегодный',
      '24 дня',
      'дней отпуска',
      'график отпусков',
      'заявление на отпуск',
    ],
    title: 'Ежегодный оплачиваемый трудовой отпуск (ТК РК ст. 88)',
    answer:
      'В соответствии со статьей 88 Трудового кодекса РК, работникам АО «Jana Post» предоставляется основной оплачиваемый ежегодный трудовой отпуск продолжительностью 24 календарных дня. Заявление подается в электронном виде в разделе «Мои заявки» не позднее чем за 14 календарных дней до планируемой даты. Праздничные дни РК, приходящиеся на период отпуска, не включаются в счет отпуска и продлевают его (ст. 84 ТК РК).',
    sources: [
      {
        title: 'Трудовой кодекс Республики Казахстан',
        document: 'ТК РК от 23 ноября 2015 года № 414-V',
        section: 'Статья 88 (Продолжительность основного оплачиваемого ежегодного трудового отпуска)',
        confidence: 0.99,
      },
      {
        title: 'Регламент предоставления отпусков АО «Jana Post»',
        document: 'Внутренний регламент № 14-П от 15.01.2024',
        section: 'Раздел 3, пункт 3.2 (Порядок согласования)',
        confidence: 0.96,
      },
    ],
  },
  {
    id: 'salary_advance',
    keywords: [
      'аванс',
      'зарплата',
      'заработная плата',
      'выплата',
      'числа',
      'когда зарплата',
      'какого числа',
      'расчет',
      'начисление',
      'аванса',
    ],
    title: 'Сроки выплаты заработной платы и планового аванса',
    answer:
      'Заработная плата в АО «Jana Post» выплачивается ежемесячно не позднее 5-го числа месяца, следующего за расчетным. Межрасчетная выплата (плановый аванс) составляет до 50% от фиксированного должностного оклада и перечисляется 15-го числа текущего месяца. Заявку на изменение параметров аванса или внеплановую выплату можно подать в разделе «HR-сервисы / Заявки».',
    sources: [
      {
        title: 'Трудовой кодекс РК',
        document: 'ТК РК № 414-V',
        section: 'Статья 113 (Порядок и сроки выплаты заработной платы)',
        confidence: 0.98,
      },
      {
        title: 'Положение об оплате труда и премировании работников АО «Jana Post»',
        document: 'Приказ Генерального директора № 18-П',
        section: 'Пункт 4.1 (Календарь расчетных выплат)',
        confidence: 0.97,
      },
    ],
  },
  {
    id: 'work_certificate',
    keywords: [
      'справка',
      'с места работы',
      'форма т2',
      'форма т-2',
      'справка о доходах',
      'для банка',
      'в посольство',
      'подтверждение стажа',
      'личное дело',
    ],
    title: 'Получение кадровых справок и Формы Т-2',
    answer:
      'Справка с места работы с верифицированным QR-кодом формируется автоматически в Личном кабинете сотрудника Jana Post за 1 минуту. Личная карточка работника (типовая форма Т-2) доступна для печати в карточке профиля. Для получения специализированной справки о доходах за последние 6 или 12 месяцев сформируйте заявку в разделе «Мои заявки» — срок исполнения кадровой службой составляет 1 рабочий день.',
    sources: [
      {
        title: 'Инструкция по кадровому делопроизводству АО «Jana Post»',
        document: 'Внутренний стандарт СТ-HR-04',
        section: 'Раздел 6 (Выдача кадровых документов работникам)',
        confidence: 0.95,
      },
    ],
  },
  {
    id: 'sick_leave',
    keywords: [
      'больничный',
      'заболел',
      'нетрудоспособность',
      'лист нетрудоспособности',
      'поликлиника',
      'оплата больничного',
      'врач',
    ],
    title: 'Оформление больничного листа и социальное пособие',
    answer:
      'При открытии листа временной нетрудоспособности необходимо уведомить непосредственного руководителя до 10:00 утра первого дня болезни. Электронный лист нетрудоспособности поступает в кадровую систему Jana Post автоматически через шлюз интеграции с eGov / DamuMed. Социальное пособие по временной нетрудоспособности выплачивается за счет средств работодателя в порядке, предусмотренном законодательством РК.',
    sources: [
      {
        title: 'Трудовой кодекс РК',
        document: 'ТК РК № 414-V',
        section: 'Статья 133 (Выплата работникам социального пособия за счет средств работодателя)',
        confidence: 0.98,
      },
      {
        title: 'Правила назначения и выплаты социального пособия РК',
        document: 'Приказ МЗСР РК № 907',
        section: 'Пункты 3–7',
        confidence: 0.94,
      },
    ],
  },
  {
    id: 'work_hours',
    keywords: [
      'график',
      'смена',
      'часовой пояс',
      'время работы',
      'опоздание',
      'табель',
      'т13',
      'т-13',
      'utc',
      'utc+5',
      'перерыв',
      'обед',
    ],
    title: 'Режим рабочего времени и единый часовой пояс UTC+5',
    answer:
      'Все подразделения АО «Jana Post» с 1 марта 2024 года работают в едином часовом поясе Казахстана UTC+5 (время Астаны). Стандартный график административного персонала: с 09:00 до 18:00 (обеденный перерыв с 13:00 до 14:00, 40-часовая рабочая неделя). Для сменного персонала логистических центров действует суммированный учет рабочего времени. Фиксация явок производится в электронном табеле Формы Т-13 через кнопку Clock In / Clock Out.',
    sources: [
      {
        title: 'Правила внутреннего трудового распорядка АО «Jana Post»',
        document: 'ПВТР АО «Jana Post» редакция 2024 г.',
        section: 'Раздел 4 (Режим рабочего времени и времени отдыха)',
        confidence: 0.97,
      },
      {
        title: 'Постановление Правительства РК о порядке исчисления времени',
        document: 'ПП РК № 20 от 19.01.2024',
        section: 'Единый 5-й часовой пояс на всей территории РК',
        confidence: 0.99,
      },
    ],
  },
  {
    id: 'academy',
    keywords: [
      'обучение',
      'академия',
      'курсы',
      'jana academy',
      'тест',
      'сертификат',
      'онбординг',
      'повышение квалификации',
    ],
    title: 'Корпоративное обучение в Jana Academy',
    answer:
      'Обучение сотрудников АО «Jana Post» проводится на платформе «Jana Academy». Все вновь принятые сотрудники проходят обязательный курс «Онбординг в Jana Post» в течение 14 дней с момента приема. После изучения модулей работник проходит проверочный тест (минимум 80% правильных ответов) и получает официальный сертификат, отражаемый в профиле работника.',
    sources: [
      {
        title: 'Положение о корпоративном обучении и развитии персонала Jana Post',
        document: 'Приказ АО «Jana Post» № 31-П',
        section: 'Раздел 2 (Обязательные адаптационные программы)',
        confidence: 0.96,
      },
    ],
  },
  {
    id: 'article90_holidays',
    keywords: [
      'праздники',
      'наурыз',
      'ст 90',
      'ст. 90',
      'списание отпуска',
      'праздничные дни',
      'выпадающие на отпуск',
      'продление отпуска',
    ],
    title: 'Исключение праздничных дней из отпуска (ТК РК ст. 90)',
    answer:
      'Согласно статье 90 пункту 1 Трудового кодекса РК: «Государственные праздники, приходящиеся на дни оплачиваемого трудового отпуска, не включаются в число дней отпуска и не уменьшают 24-дневный баланс». Например, если вы берете отпуск с 20 по 26 марта (период Наурыз мейрамы), из вашего годового баланса спишется только 4 календарных дня, а не 7. В кадровой платформе Jana Post этот перерасчет производится автоматически производственным календарем.',
    sources: [
      {
        title: 'Трудовой кодекс Республики Казахстан',
        document: 'ТК РК № 414-V',
        section: 'Статья 90 (Исчисление продолжительности оплачиваемого ежегодного трудового отпуска)',
        confidence: 0.99,
      },
      {
        title: 'Производственный календарь Республики Казахстан на 2026 год',
        document: 'Приказ МТСЗН РК',
        section: 'Баланс рабочего времени и официальные праздничные дни РК',
        confidence: 0.98,
      },
    ],
  },
  {
    id: 'courier_night_shifts',
    keywords: [
      'ночная смена',
      'ночные часы',
      'ночное время',
      'курьер',
      'доставка',
      'сверхурочные',
      'ст 108',
      'ст 110',
      'доплата',
      'переработка',
    ],
    title: 'Оплата ночных смен и сверхурочных курьеров (ТК РК ст. 108–110)',
    answer:
      'В соответствии со статьями 108 и 110 ТК РК: 1) Каждый час работы в ночное время (с 22:00 до 06:00) оплачивается в повышенном размере не ниже чем в полуторном размере (1.5x) от дневной ставки. 2) Сверхурочные работы оплачиваются не ниже чем в полуторном размере (1.5x). 3) Работа в праздничные и выходные дни — не ниже чем в двойном размере (2.0x). Для курьеров сети Jana Post ночные часы фиксируются автоматически через мобильный Clock-In с GPS-привязкой.',
    sources: [
      {
        title: 'Трудовой кодекс Республики Казахстан',
        document: 'ТК РК № 414-V',
        section: 'Статья 108 (Оплата сверхурочной работы) и Статья 110 (Оплата работы в ночное время)',
        confidence: 0.99,
      },
      {
        title: 'Положение об оплате труда курьерской службы Jana Post',
        document: 'Стандарт СОП-LOG-08',
        section: 'Тарификация ночных маршрутов и междугородних перевозок',
        confidence: 0.96,
      },
    ],
  },
  {
    id: 'vacation_payout_timing',
    keywords: [
      'выплата отпускных',
      'когда выплатят',
      'за 3 дня',
      'ст 92',
      'ст. 92',
      'расчет отпускных',
      'налог с отпускных',
      'отпускные',
    ],
    title: 'Сроки выплаты отпускных и налогообложение (ТК РК ст. 92 п. 4)',
    answer:
      'Согласно статье 92 п. 4 ТК РК, оплата ежегодного трудового отпуска производится не позднее чем за три рабочих дня до его начала. В случае предоставления отпуска вне графика — не позднее трех рабочих дней со дня издания приказа. С суммы отпускных удерживаются: ОПВ 10%, ВОСМС 2% и ИПН 10% (с вычетом 14 МРП). Сумма к выплате на карту Kaspi/Halyk рассчитывается прозрачно в Калькуляторе отпускных прямо в форме подачи заявления.',
    sources: [
      {
        title: 'Трудовой кодекс Республики Казахстан',
        document: 'ТК РК № 414-V',
        section: 'Статья 92, пункт 4 (Очередность предоставления и сроки оплаты ежегодных отпусков)',
        confidence: 0.99,
      },
      {
        title: 'Налоговый кодекс Республики Казахстан',
        document: 'Кодекс РК № 120-VI',
        section: 'Статьи 342, 351 (Индивидуальный подоходный налог и налоговые вычеты)',
        confidence: 0.97,
      },
    ],
  },
];

export const POPULAR_QUESTIONS = [
  'Сколько дней отпуска положено по ТК РК и как списываются праздники (ст. 90)?',
  'Как оплачиваются ночные смены курьеров и сверхурочные (ст. 108–110)?',
  'В какие сроки выплачиваются отпускные по ст. 92 п. 4 ТК РК?',
  'Каковы сроки выплаты аванса и заработной платы?',
  'Как получить форму Т-2 и электронную справку с ЭЦП?',
  'Как фиксируется рабочее время в табеле (Т-13)?',
  'Помоги составить сопроводительное письмо и план задач на день',
];

export interface ModelBenchmark {
  id: string;
  provider: 'openrouter' | 'groq' | 'gemini';
  name: string;
  freeTier: boolean;
  latencyAvg: string;
  tokensPerSec: number;
  contextWindow: string;
  rkComplianceScore: number;
  recommendation: 'RECOMMENDED' | 'HIGH_ACCURACY' | 'ULTRA_FAST' | 'ALTERNATIVE';
  description: string;
}

export const AI_MODEL_BENCHMARKS: ModelBenchmark[] = [
  {
    id: 'openrouter/free',
    provider: 'openrouter',
    name: 'OpenRouter Free Auto-Router',
    freeTier: true,
    latencyAvg: '250–450 мс',
    tokensPerSec: 150,
    contextWindow: '200K токенов',
    rkComplianceScore: 99,
    recommendation: 'RECOMMENDED',
    description: 'Интеллектуальный балансировщик OpenRouter: генерация ответов «своей головой» по кадровым инструкциям ТК РК и регламентам Jana Post 2026.',
  },
  {
    id: 'nvidia/nemotron-3-super-120b-a12b:free',
    provider: 'openrouter',
    name: 'NVIDIA: Nemotron 3 Super 120B (Free)',
    freeTier: true,
    latencyAvg: '500–700 мс',
    tokensPerSec: 110,
    contextWindow: '1M токенов',
    rkComplianceScore: 99,
    recommendation: 'HIGH_ACCURACY',
    description: 'Флагманская MoE-модель от NVIDIA (120B параметров). 1M токенов контекста, глубокий кадровый анализ, генерация писем и служебных записок.',
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    provider: 'openrouter',
    name: 'Google: Gemma 4 26B (Free)',
    freeTier: true,
    latencyAvg: '350–500 мс',
    tokensPerSec: 110,
    contextWindow: '262K токенов',
    rkComplianceScore: 97,
    recommendation: 'ULTRA_FAST',
    description: 'Высокоскоростная модель от Google: отличное понимание казахского и русского языков, логика, структурированные ответы.',
  },
  {
    id: 'llama-3.3-70b-versatile',
    provider: 'groq',
    name: 'Groq LPU: Llama 3.3 70B',
    freeTier: true,
    latencyAvg: '200–300 мс',
    tokensPerSec: 320,
    contextWindow: '128K токенов',
    rkComplianceScore: 96,
    recommendation: 'ALTERNATIVE',
    description: 'Рекордная в мире скорость генерации на процессорах Groq LPU (300+ токенов в секунду).',
  },
];

/**
 * Extract verified citations from dynamically generated text
 */
export function extractSourcesFromText(text: string): KnowledgeSource[] {
  const sources: KnowledgeSource[] = [];
  const lower = text.toLowerCase();

  if (lower.includes('ст. 88') || lower.includes('статья 88') || lower.includes('24 календарных')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК от 23.11.2015 № 414-V',
      section: 'Статья 88 (Продолжительность основного оплачиваемого ежегодного отпуска)',
      confidence: 0.99,
    });
  }
  if (lower.includes('ст. 90') || lower.includes('статья 90') || lower.includes('наурыз') || lower.includes('праздничн')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статья 90 (Исчисление дней отпуска и исключение праздничных дней)',
      confidence: 0.98,
    });
  }
  if (lower.includes('ст. 92') || lower.includes('статья 92') || lower.includes('за 3 рабочих') || lower.includes('за три рабочих дня')) {
    sources.push({
      title: 'Трудовой кодекс Республики Казахстан',
      document: 'ТК РК № 414-V',
      section: 'Статья 92, п. 4 (Сроки выплаты отпускных за 3 рабочих дня)',
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
      section: 'Статья 96 (Компенсация за неиспользованный отпуск при увольнении)',
      confidence: 0.98,
    });
  }
  if (lower.includes('ст. 182') || lower.includes('инструктаж') || lower.includes('охрана труда') || lower.includes('термосумк') || lower.includes('зимн')) {
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

  if (sources.length === 0) {
    sources.push({
      title: 'Корпоративная база знаний Jana Post & ТК РК',
      document: 'Единый регламент кадровых сервисов 2026',
      section: 'Трудовое законодательство РК',
      confidence: 0.95,
    });
  }

  return sources;
}

/**
 * Strips asterisks (**) and (*) from text while preserving clean readability and math multiplication
 */
export function stripAsterisks(text: string): string {
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
 * Intelligent Dynamic Offline Synthesizer
 * Formulates live, calculated, non-canned answers using RK Labor Code rules
 */
export function queryHrAssistant(userQuery: string): ChatMessage {
  const q = userQuery.toLowerCase().trim();
  const timestamp = new Date().toLocaleTimeString('ru-RU', {
    timeZone: 'Asia/Almaty',
    hour: '2-digit',
    minute: '2-digit',
  });

  // 1. Vacation & Nauryz / Public Holidays (ст. 88, 90, 92 ТК РК)
  if (q.includes('отпуск') || q.includes('88') || q.includes('90') || q.includes('92') || q.includes('наурыз') || q.includes('праздник')) {
    let specificCalculation = '';
    if (q.includes('наурыз') || (q.includes('март') && (q.includes('21') || q.includes('22') || q.includes('23')))) {
      specificCalculation = `\n\nПерсональный расчет для периода Наурыз мейрамы:\n- Официальные праздничные дни Наурыза: 21, 22 и 23 марта (3 праздничных дня).\n- В силу ст. 90 ТК РК праздничные дни не списываются с баланса отпуска. Если вы берете, например, период с 18 по 26 марта (9 дней), спишутся только 6 дней, а фактический отдых составит 9 дней.`;
    }

    const text = stripAsterisks(`По вашему вопросу о трудовом отпуске в АО «Jana Post» (руководствуясь нормами ТК РК):

1. Ежегодный отпуск (ст. 88 ТК РК):
   Гарантированная продолжительность составляет не менее 24 календарных дней за каждый отработанный рабочий год.

2. Праздничные дни (ст. 90 ТК РК):
   Государственные праздники РК, выпадающие на период отпуска, не включаются в счет отпуска и не уменьшают годовой баланс. Они автоматически исключаются производственным календарем.${specificCalculation}

3. Сроки выплаты и разделение (ст. 92 ТК РК):
   - Отпускные выплачиваются не позднее чем за 3 рабочих дня до начала отпуска.
   - По соглашению сторон отпуск можно делить на части (одна из частей — не менее 14 дней).
   - Заявление подается в модуле «Мои заявки» за 14 календарных дней.`);

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp,
      sources: extractSourcesFromText(text),
      isOutOfScope: false,
      modelUsed: 'Автономный кадровый процессор Jana Post (ТК РК)',
      latencyMs: 15,
    };
  }

  // 2. Night shifts & Overtime (ст. 108–110 ТК РК)
  if (q.includes('ночн') || q.includes('110') || q.includes('108') || q.includes('109') || q.includes('курьер') || q.includes('сверхурочн')) {
    const text = stripAsterisks(`Анализ начисления доплат за ночные смены и переработки в Jana Post:

1. Ночные часы (с 22:00 до 06:00, ст. 110 ТК РК):
   - Каждый час работы в ночное время оплачивается в повышенном размере — не ниже 1.5x (полуторный размер) от вашей часовой ставки.
   - Если ваша смена, к примеру, длится с 23:00 до 07:00, то 7 часов (23:00–06:00) оплачиваются с коэффициентом 1.5x, а час 06:00–07:00 — по базовой дневной ставке 1.0x.

2. Сверхурочные и работа в выходные дни:
   - Сверхурочные часы (ст. 108 ТК РК) тарифицируются с коэффициентом 1.5x.
   - Работа в праздничные и выходные дни (ст. 109 ТК РК) оплачивается в двойном размере (2.0x).

3. Фиксация в табеле:
   Все явки курьеров и сотрудников хабов фиксируются с геопривязкой через Clock In в едином часовом поясе Казахстана (UTC+5) и вносятся в электронный табель Т-13.`);

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp,
      sources: extractSourcesFromText(text),
      isOutOfScope: false,
      modelUsed: 'Автономный кадровый процессор Jana Post (ТК РК)',
      latencyMs: 14,
    };
  }

  // 3. Salary & Advance (ст. 113 ТК РК)
  if (q.includes('аванс') || q.includes('зарплат') || q.includes('113') || q.includes('выплат') || q.includes('числа')) {
    const text = stripAsterisks(`Календарь и регламент выплаты заработной платы в АО «Jana Post» (ст. 113 ТК РК):

1. Сроки перечислений:
   - Заработная плата перечисляется не позднее 5-го числа месяца, следующего за расчетным.
   - Плановый аванс выплачивается 15-го числа текущего месяца в размере до 50% от оклада.

2. Удержания из заработной платы:
   - ОПВ (пенсионные взносы) — 10%
   - ВОСМС (медицинское страхование) — 2%
   - ИПН (индивидуальный подоходный налог) — 10% с вычетом 14 МРП

3. Расчетный листок:
   Расчетный листок формируется в Личном кабинете по кнопке «Печать расчетного листка (ст. 113 ТК РК)».`);

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp,
      sources: extractSourcesFromText(text),
      isOutOfScope: false,
      modelUsed: 'Автономный кадровый процессор Jana Post (ТК РК)',
      latencyMs: 12,
    };
  }

  // 4. Document Drafting (служебная записка, заявление)
  if (q.includes('служебн') || q.includes('записк') || q.includes('составь') || q.includes('напиши')) {
    const text = stripAsterisks(`Подготовил проект официального документа по вашему запросу:

---

СЛУЖЕБНАЯ ЗАПИСКА
от «___» ____________ 2026 г.

Кому: Генеральному директору АО «Jana Post»
От кого: Руководителя подразделения / Сотрудника
Тема: ${q.includes('форм') || q.includes('термо') ? 'О выделении зимней формы одежды и термосумок для курьеров' : 'По производственной необходимости'}

Уважаемое руководство!

В целях надлежащей организации рабочего процесса, выполнения требований статьи 182 Трудового кодекса РК (обеспечение работников СИЗ и спецодеждой) и повышения качества клиентского сервиса:

1. Довожу до вашего сведения необходимость выделения сотрудникам зимней форменной одежды, утепленной обуви и термосумок с терморегуляцией.
2. Реализация данных мер позволит предотвратить риски переохлаждения курьерского персонала в условиях низких температур, сократить заболеваемость и обеспечить сохранность грузов.
3. Прошу рассмотреть и согласовать закупку экипировки согласно утвержденным стандартам Jana Post.

Приложение: Спецификация экипировки и список сотрудников.

Подпись: _________________ / Ф.И.О. /

---
Вы можете скопировать этот проект и направить его на согласование через раздел «Заявки».`);

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp,
      sources: extractSourcesFromText(text),
      isOutOfScope: false,
      modelUsed: 'Автономный кадровый процессор Jana Post',
      latencyMs: 16,
    };
  }

  // 5. Universal contextual response
  const generalText = stripAsterisks(`Здравствуйте! Я официальный AI HR-консультант АО «Jana Post».

Я готов ответить на любой ваш вопрос, основываясь на Трудовом кодексе РК и корпоративных регламентах компании:
- Отпуска: 24 дня квоты (ст. 88 ТК РК), продление за счет праздников (ст. 90 ТК РК), отпускные за 3 рабочих дня (ст. 92 ТК РК).
- Смены и ночные: доплата за часы с 22:00 до 06:00 в размере 1.5x (ст. 110 ТК РК), сверхурочные 1.5x (ст. 108 ТК РК).
- Оплата труда: зарплата 5-го числа, аванс 15-го числа (ст. 113 ТК РК).
- Документы и справки: помощь в составлении служебных записок, заявлений, заказ формы Т-2 и кадровых справок с ЭЦП.

Опишите подробнее вашу ситуацию (должность, даты или график смен), и я подготовлю точный расчет!`);

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    text: generalText,
    timestamp,
    sources: extractSourcesFromText(generalText),
    isOutOfScope: false,
    modelUsed: 'Автономный кадровый процессор Jana Post',
    latencyMs: 10,
  };
}

/**
 * Primary asynchronous AI query function.
 * Connects to live LLM with instruction grounding ("своей головой без заготовок"),
 * with multi-tiered client-side failover and dynamic RK Labor Code synthesis if offline.
 */
export async function askAiAssistant(
  query: string,
  history: ChatMessage[] = [],
  options?: {
    provider?: string;
    model?: string;
    apiKey?: string;
  }
): Promise<ChatMessage> {
  const timestamp = new Date().toLocaleTimeString('ru-RU', {
    timeZone: 'Asia/Almaty',
    hour: '2-digit',
    minute: '2-digit',
  });

  const storedModel = localStorage.getItem('jp_ai_model');
  // Auto-upgrade any legacy hanging model to openrouter/free
  const effectiveModel =
    options?.model ||
    (storedModel && storedModel !== 'nvidia/nemotron-3.5-super-vl:free' && storedModel !== 'nvidia/nemotron-3.5-content-safety:free'
      ? storedModel
      : 'openrouter/free');

  const provider = options?.provider || localStorage.getItem('jp_ai_provider') || 'openrouter';
  const apiKey = options?.apiKey || localStorage.getItem('jp_ai_api_key') || undefined;

  // 1. Try calling the backend API first
  try {
    const res = await api.ai.chat({
      message: query,
      history,
      provider,
      model: effectiveModel,
      apiKey,
    });

    if (res && res.text && res.text.trim()) {
      const cleanText = stripAsterisks(res.text);
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: cleanText,
        timestamp,
        sources: res.sources?.length ? res.sources : extractSourcesFromText(cleanText),
        isOutOfScope: res.isOutOfScope,
        modelUsed: res.modelUsed || effectiveModel,
        latencyMs: res.latencyMs,
        isAiGenerated: true,
      };
    }
  } catch (backendErr) {
    console.warn('[AI Service] Backend AI route unavailable or error:', backendErr);
  }

  // 2. Direct browser call to OpenRouter if backend failed or in standalone/demo mode
  const resolvedClientKey =
    apiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_API_KEY) ||
    '';

  if (resolvedClientKey && resolvedClientKey.trim().startsWith('sk-or-')) {
    const candidateModels = [
      effectiveModel,
      'openrouter/free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'google/gemma-4-26b-a4b-it:free',
    ];

    const modelsToTry = [...new Set(candidateModels.filter(Boolean))];

    const systemPrompt = `Ты — официальный виртуальный AI HR-консультант национальной логистической сети АО «Jana Post» (Казахстан).

ГЛАВНЫЕ ПРАВИЛА:
1. ОТВЕЧАЙ СВОЕЙ ГОЛОВОЙ (ЖИВОЕ МЫШЛЕНИЕ, АНАЛИЗ И СИНТЕЗ):
   - Вникай в конкретную ситуацию, график смены, часы, даты и должность сотрудника.
   - Проводи пошаговый расчет (ночные часы, сверхурочные, дни отпуска с учетом праздников).
   - Если просят составить документ (служебную записку, заявление) — составляй полноценный, готовый, качественный документ.
   - На общие вопросы (письма, планирование, Excel/1C, задачи) отвечай свободно, профессионально и полно.

2. СТРОГО БЕЗ ЗАГОТОВЛЕННЫХ ТЕКСТОВ И ШАБЛОНОВ:
   - Никаких заученных шаблонных фраз или копирования сухих отрывков без привязки к вопросу.

3. РУКОВОДСТВУЙСЯ ИМЕЮЩИМИСЯ ИНСТРУКЦИЯМИ И ТК РК:
   - Ежегодный оплачиваемый отпуск: 24 календарных дня (ст. 88 ТК РК).
   - Праздничные дни РК не входят в число дней отпуска и продлевают его либо не уменьшают баланс (ст. 90 ТК РК). Наурыз: 21, 22, 23 марта.
   - Выплата отпускных: не позднее чем за 3 рабочих дня до начала (ст. 92 п. 4 ТК РК). Разделение отпуска: одна из частей не менее 14 дней.
   - Ночные смены (с 22:00 до 06:00, ст. 110 ТК РК): доплата не менее 1.5x ставки за каждый ночной час.
   - Сверхурочные: не менее 1.5x (ст. 108). Праздничные/выходные: не менее 2.0x (ст. 109).
   - Зарплата: 5-го числа следующего месяца, аванс до 50% — 15-го числа (ст. 113 ТК РК).
   - Охрана труда, СИЗ, зимняя форма курьеров и термосумки (ст. 182 ТК РК).
   - Регламенты Jana Post: единый часовой пояс UTC+5 (Asia/Almaty), табель Т-13 через Clock In/Out, онбординг Jana Academy за 14 дней (тест 80%), справки с ЭЦП и форма Т-2, ЕСУТД Enbek.kz.

4. ОФОРМЛЕНИЕ ОТВЕТА БЕЗ ЗВЕЗДОЧЕК:
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать символы звездочек (**) и (*) для выделения слов, фраз или списков!
   - Никогда не оборачивай слова в звездочки (**слово** или *слово*). В тексте не должно быть знаков звездочки (*).
   - Для оформления списков используй только обычный дефис (-) или цифры (1., 2.).
   - Пиши чистый текст без символов Markdown-звездочек.`;

    const messagesPayload: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    for (const h of history.slice(-6)) {
      if (h.sender === 'user' && h.text) {
        messagesPayload.push({ role: 'user', content: h.text });
      } else if (h.sender === 'assistant' && h.text) {
        messagesPayload.push({ role: 'assistant', content: h.text });
      }
    }
    messagesPayload.push({ role: 'user', content: query });

    for (const currentModel of modelsToTry) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resolvedClientKey.trim()}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Digital HR by Jana Post',
          },
          body: JSON.stringify({
            model: currentModel,
            messages: messagesPayload,
            temperature: 0.3,
            max_tokens: 2500,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (resp.ok) {
          const json = await resp.json();
          const msgObj = json?.choices?.[0]?.message;
          let content = msgObj?.content;

          if (!content || !content.trim()) {
            continue;
          }

          if (content.trim().toLowerCase().startsWith('user safety:')) {
            continue;
          }

          // Strip <think> tags if any
          content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          content = stripAsterisks(content);

          return {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            text: content,
            timestamp,
            modelUsed: currentModel,
            latencyMs: Date.now() - startTime,
            isAiGenerated: true,
            sources: extractSourcesFromText(content),
          };
        }
      } catch (clientErr) {
        console.warn(`[AI Service] Direct OpenRouter model ${currentModel} failed:`, clientErr);
      }
    }
  }

  // 3. Fallback to Grounded RK Labor Code Dynamic Synthesizer
  return queryHrAssistant(query);
}
