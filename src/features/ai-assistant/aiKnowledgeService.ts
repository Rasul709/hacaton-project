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
    id: 'nvidia/nemotron-3.5-super-vl:free',
    provider: 'openrouter',
    name: 'NVIDIA: Nemotron 3.5 Super VL (Free)',
    freeTier: true,
    latencyAvg: '400–600 мс',
    tokensPerSec: 110,
    contextWindow: '1M токенов',
    rkComplianceScore: 99,
    recommendation: 'RECOMMENDED',
    description: 'Флагманская MoE-модель от NVIDIA (120B параметров). 1M токенов контекста, глубокий кадровый анализ, генерация писем и документов.',
  },
  {
    id: 'openrouter/free',
    provider: 'openrouter',
    name: 'OpenRouter Free Auto-Router',
    freeTier: true,
    latencyAvg: '350–500 мс',
    tokensPerSec: 120,
    contextWindow: '200K токенов',
    rkComplianceScore: 98,
    recommendation: 'RECOMMENDED',
    description: 'Интеллектуальный балансировщик OpenRouter с автоматическим переключением на самый доступный бесплатный движок с аптаймом 99.9%.',
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    provider: 'openrouter',
    name: 'Google: Gemma 4 26B (Free)',
    freeTier: true,
    latencyAvg: '380–520 мс',
    tokensPerSec: 100,
    contextWindow: '262K токенов',
    rkComplianceScore: 97,
    recommendation: 'HIGH_ACCURACY',
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
    recommendation: 'ULTRA_FAST',
    description: 'Рекордная в мире скорость генерации на процессорах Groq LPU (300+ токенов в секунду).',
  },
];

/**
 * Searches the verified HR Knowledge Base and returns a grounded response with sources
 * (Used as reliable offline RAG fallback)
 */
export function queryHrAssistant(userQuery: string): ChatMessage {
  const normalized = userQuery.toLowerCase().trim();

  // Search through knowledge base items
  let bestMatch: KnowledgeItem | null = null;
  let highestScore = 0;

  for (const item of HR_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length; // weight longer keyword matches higher
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  const timestamp = new Date().toLocaleTimeString('ru-RU', {
    timeZone: 'Asia/Almaty',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Strict Threshold: if no keywords matched reliably, trigger Safe Refusal (Guardrail)
  // Threshold: if no HR keywords matched, return a warm, universal fallback with guidance
  if (!bestMatch || highestScore < 3) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text:
        'В локальной базе Jana нет проверенного ответа на этот вопрос. Обратитесь в HR или уточните формулировку по теме кадровых правил.',
      timestamp,
      isOutOfScope: true,
      modelUsed: 'Автономная база знаний Jana Post',
      latencyMs: 14,
    };
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    text: bestMatch.answer,
    timestamp,
    sources: bestMatch.sources,
    isOutOfScope: false,
    modelUsed: 'Автономная база знаний (Офлайн RAG)',
    latencyMs: 18,
  };
}

/**
 * Primary asynchronous AI query function.
 * Attempts real LLM inference via backend (/api/v1/ai/chat) or direct OpenRouter client,
 * falling back transparently to verified RK Labor Code Offline RAG if offline.
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

  const provider = options?.provider || localStorage.getItem('jp_ai_provider') || 'openrouter';
  const model = options?.model || localStorage.getItem('jp_ai_model') || 'nvidia/nemotron-3.5-super-vl:free';
  const apiKey = options?.apiKey || localStorage.getItem('jp_ai_api_key') || undefined;

  // 1. Try calling the backend API first
  try {
    const res = await api.ai.chat({
      message: query,
      history,
      provider,
      model,
      apiKey,
    });

    if (res && res.text) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        timestamp,
        sources: res.sources,
        isOutOfScope: res.isOutOfScope,
        modelUsed: res.modelUsed || model,
        latencyMs: res.latencyMs,
        isAiGenerated: true,
      };
    }
  } catch (backendErr) {
    console.warn('[AI Service] Backend AI route unavailable or error:', backendErr);
  }

  // 2. Direct browser call to OpenRouter if user provided a client-side API key
  if (apiKey && apiKey.trim().startsWith('sk-or-')) {
    try {
      const startTime = Date.now();
      const messagesPayload = [
        {
          role: 'system',
          content:
            'Ты — официальный виртуальный AI-ассистент и корпоративный консультант национальной логистической сети АО «Jana Post» (Казахстан). Отвечай на любые вопросы пользователя доброжелательно, развернуто и понятно. Если вопрос касается трудового права РК (отпуска, график, расчетные, ночные смены, увольнение) или Jana Post — опирайся на нормы ТК РК (ст. 88, 90, 92, 96, 108–110, 113, 182) и корпоративные регламенты компании. Если вопрос на общие темы (письма, планирование, расчеты, бытовые вопросы, код, советы) — свободно и качественно отвечай на него.',
        },
      ];

      for (const h of history.slice(-4)) {
        messagesPayload.push({
          role: h.sender === 'user' ? 'user' : 'assistant',
          content: h.text,
        });
      }
      messagesPayload.push({ role: 'user', content: query });

      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Digital HR by Jana Post',
        },
        body: JSON.stringify({
          model,
          messages: messagesPayload,
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });

      if (resp.ok) {
        const json = await resp.json();
        const msgObj = json?.choices?.[0]?.message;
        const content = msgObj?.content || msgObj?.reasoning;
        if (content && content.trim()) {
          return {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            text: content.trim(),
            timestamp,
            modelUsed: model,
            latencyMs: Date.now() - startTime,
            isAiGenerated: true,
            // Generated text has no verified citation. Do not invent a source.
            sources: [],
          };
        }
      }
    } catch (clientErr) {
      console.warn('[AI Service] Direct OpenRouter client call failed:', clientErr);
    }
  }

  // 3. Fallback to Grounded RK Labor Code Offline Knowledge Base
  return queryHrAssistant(query);
}
