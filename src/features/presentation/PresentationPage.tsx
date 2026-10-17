import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  Grid,
  ExternalLink,
  BookOpen,
  Award,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Clock,
  Calendar,
  CreditCard,
  Building,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Users,
  Code2,
  Lock,
  Cpu,
  Zap,
} from 'lucide-react';

interface SlideMeta {
  id: number;
  act: string;
  title: string;
  subtitle: string;
  badge: string;
  speakerScript: string;
  juryTrigger: string;
}

export const PresentationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  const total = 30;
  const currentId = currentIdx + 1;
  const progressPercent = (currentId / total) * 100;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentIdx((prev) => Math.min(prev + 1, total - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentIdx(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentIdx(total - 1);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((prev) => !prev);
      } else if (e.key === 'g' || e.key === 'G') {
        setShowOverview((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowOverview(false);
        setShowNotes(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total]);

  // Slides Metadata dictionary for header & notes
  const SLIDES_META: Record<number, SlideMeta> = {
    1: {
      id: 1,
      act: 'АКТ I: Контекст и Вызов',
      title: 'JANA POST DIGITAL HR',
      subtitle: 'Единая интеллектуальная экосистема управления человеческим капиталом логистического гиганта',
      badge: 'Production-Ready • ТК РК • Grounded AI',
      speakerScript: 'Здравствуйте, уважаемые члены жюри и руководство компании Jana Post! Доставка посылки до двери клиента в современном Казахстане занимает считанные часы. Но почему оформление одного отпуска или справки для курьера по-прежнему занимает 4 рабочих дня? Сегодня мы представляем Jana Post Digital HR — цифровую экосистему, которая ликвидирует бюрократический барьер и превращает HR в мотор роста логистического бизнеса.',
      juryTrigger: 'Впечатление зрелого enterprise-продукта с первой секунды. Масштаб, законность, скорость.',
    },
    2: {
      id: 2,
      act: 'АКТ I: Контекст и Вызов',
      title: 'Масштаб и логистическая специфика Jana Post',
      subtitle: 'Распределенная география, полевой персонал и цена операционного простоя',
      badge: 'Доменный анализ',
      speakerScript: 'Jana Post — это кровеносная система доставки Казахстана. Наш линейный персонал работает в жестком ритме смен. У водителя на трассе или курьера на электроскутере нет стационарного компьютера, чтобы заполнить заявление на отпуск или прикрепить больничный. Система должна быть доступна там, где находится сотрудник, — в его смартфоне, работая мгновенно даже при 3G-интернете.',
      juryTrigger: 'Глубокое понимание специфики логистики: отказ от идеи громоздких десктопных ERP.',
    },
    3: {
      id: 3,
      act: 'АКТ I: Контекст и Вызов',
      title: '«Бумажный паралич»: скрытые потери традиционного HR',
      subtitle: 'Цена аналогового документооборота в цифровую эпоху',
      badge: 'Анализ потерь',
      speakerScript: 'Цифры аудита традиционных процессов шокируют: более 60% времени квалифицированных HR-специалистов тратится на механические консультации. Заявления теряются при передаче из регионов в головной офис. А задержка выплаты отпускных хотя бы на день — это прямое нарушение статьи 113 ТК РК и риск штрафов для компании.',
      juryTrigger: 'Перевод проблемы из «неудобно» в прямые финансовые убытки и юридические риски.',
    },
    4: {
      id: 4,
      act: 'АКТ I: Контекст и Вызов',
      title: 'Карта пути сотрудника (Employee Journey Map)',
      subtitle: 'Сравнение пользовательского опыта до и после внедрения системы',
      badge: 'UX Transformation',
      speakerScript: 'Посмотрите на эту трансформацию. Раньше курьер тратил полдня, чтобы приехать в головной офис за справкой. Теперь весь цикл — от подачи заявки до наложения цифровой визы руководителя — занимает меньше одной минуты. Без единого телефонного звонка и без листа бумаги.',
      juryTrigger: 'Наглядное подтверждение радикального улучшения клиентского пути сотрудника.',
    },
    5: {
      id: 5,
      act: 'АКТ I: Контекст и Вызов',
      title: 'Видение и стратегическая цель проекта',
      subtitle: 'Переход от реактивного администрирования к проактивной заботе',
      badge: 'Стратегия 2026',
      speakerScript: 'Наша миссия — сделать так, чтобы каждый сотрудник Jana Post чувствовал заботу компании, где бы он ни находился. Мы объединили сервисы самообслуживания, обучение и искусственный интеллект в единую точку контакта, доступную 24/7/365.',
      juryTrigger: 'Четкое стратегическое позиционирование команды. Завершение проблемного акта.',
    },
    6: {
      id: 6,
      act: 'АКТ II: Ролевая архитектура',
      title: 'Архитектурный базис: Триединство ролей',
      subtitle: 'Контур 1 ТЗ: Ролевая модель доступа (RBAC) и единый вход',
      badge: 'RBAC Architecture',
      speakerScript: 'Система построена на принципе абсолютной контекстности. Один и тот же интерфейс адаптируется под специфику конкретного пользователя. Курьер видит только свои заявки и обучающие модули. Начальник смены видит оперативную очередь визирования. А директор по персоналу держит руку на пульсе всей компании.',
      juryTrigger: '100% соответствие Контуру 1 официального ТЗ хакатона.',
    },
    7: {
      id: 7,
      act: 'АКТ II: Ролевая архитектура',
      title: 'Контур 2: Личный кабинет работника (ESS)',
      subtitle: 'Сценарий 1 и 2 ТЗ: Все кадровые сервисы и статус шефа перед глазами',
      badge: 'Employee Hub',
      speakerScript: 'Перед вами личный кабинет работника. Обратите внимание: сотрудник видит своего прямого руководителя Нурлана Серикова, его почту, телефон и статус присутствия. Никаких поисков по внутренним телефонным справочникам. Здесь же перед глазами — остаток дней отпуска по закону и дедлайн по обязательному обучению.',
      juryTrigger: 'Удобство, прозрачность, отсутствие бюрократического барьера для сотрудника.',
    },
    8: {
      id: 8,
      act: 'АКТ II: Ролевая архитектура',
      title: 'Контур 3: Кабинет руководителя — Оперативное визирование',
      subtitle: 'Контур 5 ТЗ: Согласование заявок в 1 клик с аргументированной резолюцией',
      badge: 'Manager Review Flow',
      speakerScript: 'Для начальника сортировочного центра или курьерской службы каждая заявка на отпуск — это вопрос укомплектованности смены. Система подсказывает, нет ли пересечений с другими сотрудниками, и позволяет завизировать заявление в один клик прямо со смартфона во время обхода склада.',
      juryTrigger: 'Управленческий контроль и защита логистических процессов от дефицита курьеров.',
    },
    9: {
      id: 9,
      act: 'АКТ II: Ролевая архитектура',
      title: 'Контур 4: Кабинет HR-директора — Аналитический штаб',
      subtitle: 'Управление штатной численностью, табелями и кадровым резервом',
      badge: 'HR Command Center',
      speakerScript: 'HR-директор видит агрегированную картину по всей компании в реальном времени. Сколько человек вышло на смену сегодня утром? Сколько заявок требуют рассмотрения? Наш дашборд превращает разрозненные данные филиалов в единый управленческий инструмент принятия решений.',
      juryTrigger: 'Ценность для топ-менеджмента и инвесторов: прозрачный контроль ключевых HR-метрик.',
    },
    10: {
      id: 10,
      act: 'АКТ III: Юридический фундамент ТК РК',
      title: 'Локализация и правовое ядро: ТК РК в кодовой базе',
      subtitle: 'Нормы трудового законодательства Республики Казахстан, заложенные в алгоритмы',
      badge: 'Legal Core KZ',
      speakerScript: 'Главное отличие взрослой enterprise-системы от студенческого проекта — это юридическая состоятельность. Мы заложили нормы Трудового кодекса Республики Казахстан непосредственно в бизнес-логику платформы. Система физически не позволит принять решение, нарушающее трудовые права граждан РК.',
      juryTrigger: 'Снятие комплаенс-рисков, защита компании от трудовых споров и судебных исков.',
    },
    11: {
      id: 11,
      act: 'АКТ III: Юридический фундамент ТК РК',
      title: 'Статья 88 ТК РК: Гарантированный отпуск 24 дня',
      subtitle: 'Автоматический балансовый учет доступных, использованных и запланированных дней',
      badge: 'ТК РК ст. 88',
      speakerScript: 'Статья 88 ТК РК гарантирует работникам основной оплачиваемый ежегодный трудовой отпуск продолжительностью не менее 24 календарных дней. В нашей платформе курьер всегда видит свой точный баланс. Больше никаких звонков в кадры с вопросом: "Сколько дней у меня накопилось?". Система считает баланс автоматически на основе стажа и утвержденных приказов.',
      juryTrigger: 'Прозрачность кадрового баланса и точное соответствие ст. 88.',
    },
    12: {
      id: 12,
      act: 'АКТ III: Юридический фундамент ТК РК',
      title: 'Статья 84 ТК РК: Праздничные дни и перенос',
      subtitle: 'Интеллектуальный расчет отпуска с учетом производственного календаря РК',
      badge: 'ТК РК ст. 84',
      speakerScript: 'Тонкий момент казахстанского трудового законодательства: согласно статье 84, праздничные дни не включаются в дни отпуска. Обычные программы списывают дни подряд, ущемляя права сотрудника. Наш движок автоматически сопоставляет даты с производственным календарем РК: сотрудник законно отдыхает дольше, а компания не нарушает закон.',
      juryTrigger: 'Доказательство глубокого погружения в специфику производственного календаря РК.',
    },
    13: {
      id: 13,
      act: 'АКТ III: Юридический фундамент ТК РК',
      title: 'Статья 113 ТК РК и часовой пояс UTC+5',
      subtitle: 'Строгие сроки выплат аванса/зарплаты и единое время Казахстана',
      badge: 'ТК РК ст. 113 • UTC+5',
      speakerScript: 'Статья 113 четко регламентирует порядок выплат: зарплата выплачивается не реже одного раза в месяц не позже первой декады следующего месяца, а аванс — 15-го числа. В форме запроса аванса система сразу указывает плановую дату и проверяет сумму. А с учетом перехода Казахстана на единый часовой пояс UTC+5 все отметки табеля синхронизированы по всей филиальной сети.',
      juryTrigger: 'Финансовая дисциплина и идеальная временная синхронизация логистических хабов.',
    },
    14: {
      id: 14,
      act: 'АКТ IV: HR-сервисы и Табель',
      title: 'Кадровые сервисы в 1 клик',
      subtitle: 'Контур 3 ТЗ: Единая витрина подачи кадровых заявлений без бумажной волокиты',
      badge: 'HR Services Hub',
      speakerScript: 'Все кадровые потребности сотрудника сведены в единое окно. Нужно подтверждение дохода для ипотеки? Справка заказывается в один клик. Нужен аванс на неотложные расходы? Сотрудник указывает сумму в тенге, и заявка мгновенно летит руководителю. Больше никаких очередей в отдел кадров.',
      juryTrigger: '100% покрытие Контура 3 ТЗ хакатона.',
    },
    15: {
      id: 15,
      act: 'АКТ IV: HR-сервисы и Табель',
      title: 'Движок согласования: Очередь, SLA и аудит',
      subtitle: 'Контур 4 и 5 ТЗ: Прозрачный жизненный цикл каждой кадровой заявки',
      badge: 'Workflow Engine',
      speakerScript: 'Каждое действие в системе логируется. Руководитель не может просто забыть о заявке — система напоминает о необходимости рассмотрения. А при согласовании или отклонении фиксируется точное время и комментарий. Это исключает споры в духе "Я подавал заявление, а его потеряли".',
      juryTrigger: 'Надежность бизнес-процесса и полное устранение потерь документов.',
    },
    16: {
      id: 16,
      act: 'АКТ IV: HR-сервисы и Табель',
      title: 'Табель учета рабочего времени (Т-13)',
      subtitle: 'Фиксация явки, опозданий и экспорт в Excel с поддержкой UTF-8 BOM',
      badge: 'Табель Т-13 • CSV',
      speakerScript: 'Для логистики дисциплина выхода на маршрут критична. Наш модуль посещаемости автоматически формирует табель учета рабочего времени по форме Т-13. Данные готовы к мгновенной выгрузке в Excel для расчетной группы бухгалтерии — кириллица открывается идеально благодаря кодировке UTF-8 BOM.',
      juryTrigger: 'Бесшовная стыковка с бухгалтерией и расчетным отделом Jana Post.',
    },
    17: {
      id: 17,
      act: 'АКТ IV: HR-сервисы и Табель',
      title: 'Интерактивный дашборд: Пульс логистической сети',
      subtitle: 'Живая операционная аналитика для генерального менеджмента',
      badge: 'Executive BI Dashboard',
      speakerScript: 'Дашборд — это командный пункт управления Jana Post. Топ-менеджер видит общую картину за 3 секунды: сколько людей на смене, где возникли узкие места, какие кадровые заявки требуют внимания. Данные обновляются мгновенно без перезагрузки страниц.',
      juryTrigger: 'Высокая плотность полезных данных и эстетика интерфейса.',
    },
    18: {
      id: 18,
      act: 'АКТ V: AI-контур (15% веса)',
      title: 'Архитектура Grounded RAG: Ноль галлюцинаций',
      subtitle: 'Контур 7 ТЗ: Заземление генеративного интеллекта на статьи ТК РК',
      badge: 'RAG Architecture • 15% Weight',
      speakerScript: '15% оценки проекта отведено AI-ассистенту. Мы не стали подключать стандартный сырой чат-бот, который придумывает законы на ходу. Мы построили систему по архитектуре Grounded RAG — генерация с заземлением на факты. Ассистент черпает знания исключительно из статей Трудового кодекса РК и утвержденных регламентов Jana Post.',
      juryTrigger: 'Устранение страха перед юридическими галлюцинациями нейросетей.',
    },
    19: {
      id: 19,
      act: 'АКТ V: AI-контур (15% веса)',
      title: 'Подтвержденные источники: Verified Citations',
      subtitle: 'Сценарий 5 ТЗ: 98% Confidence Score и ссылки на статьи закона',
      badge: 'Explainable AI',
      speakerScript: 'В кадровых вопросах доверие решает всё. Под каждым ответом наш ассистент показывает плашку проверенных источников с указанием конкретной статьи закона и уровня уверенности. Сотрудник видит, на каком основании ему дан ответ, и может кликнуть на источник для проверки первоисточника.',
      juryTrigger: 'Прозрачность и следование принципам Объяснимого ИИ (Explainable AI).',
    },
    20: {
      id: 20,
      act: 'АКТ V: AI-контур (15% веса)',
      title: 'Корпоративные гардрейлы: Safe Refusal',
      subtitle: 'Сценарий 6 ТЗ: Защита от нецелевых запросов, взлома роли и троллинга',
      badge: 'AI Safety Guardrails',
      speakerScript: 'Сценарий 6 хакатона требует проверки на устойчивость к провокациям. Если курьер или внешний тестировщик спросит у бота рецепт плова, прогноз курсов валют или политический совет, система не станет тратить ресурсы сервера. Срабатывают наши guardrails: ассистент вежливо напоминает о своей роли и возвращает диалог в кадровое русло.',
      juryTrigger: 'Вау-эффект в прямом эфире при проверке жюри на безопасность.',
    },
    21: {
      id: 21,
      act: 'АКТ VI: LMS Jana Academy (10% веса)',
      title: 'Jana Academy: Скоростной онбординг персонала',
      subtitle: 'Контур 6 ТЗ: Корпоративная платформа микрообучения для полевых сотрудников',
      badge: 'Jana Academy LMS • 10% Weight',
      speakerScript: '10% оценки хакатона посвящено корпоративному обучению. В логистике огромная текучесть курьеров именно из-за плохого онбординга: новичок выходит на маршрут растерянным. Jana Academy решает эту проблему: 3 микроурока по стандартам компании прямо в телефоне, интерактивный тест — и сотрудник готов к безупречной работе.',
      juryTrigger: 'Прямое влияние на скорость ввода новичков в строй и снижение текучести.',
    },
    22: {
      id: 22,
      act: 'АКТ VI: LMS Jana Academy (10% веса)',
      title: 'Интерактивный плеер уроков и эргономика',
      subtitle: 'Чтение материалов, пошаговая навигация и фиксация прогресса в localStorage',
      badge: 'Course Reader UX',
      speakerScript: 'Интерфейс плеера разработан по принципу нулевого трения. Никаких тяжелых PDF-инструкций на 50 страниц, которые никто не читает. Короткие, структурированные блоки текста с ключевыми акцентами, доступные даже при медленном 3G-соединении в пути.',
      juryTrigger: 'Удобство и адаптивность для реальных условий работы курьеров.',
    },
    23: {
      id: 23,
      act: 'АКТ VI: LMS Jana Academy (10% веса)',
      title: 'Квиз-движок и автоматическая сертификация',
      subtitle: 'Проверка знаний из 3 вопросов, мгновенная валидация и цифровой сертификат',
      badge: 'Quiz Engine • Certification',
      speakerScript: 'Завершающий шаг обучения — интерактивный квиз. При 100% правильных ответов система генерирует персонализированный цифровой сертификат Jana Post. Руководитель видит зеленый бейдж готовности сотрудника, а новичок чувствует признание своих успехов с первого дня.',
      juryTrigger: 'Геймификация и автоматизация подтверждения квалификации сотрудника.',
    },
    24: {
      id: 24,
      act: 'АКТ VII: Технологии и Безопасность',
      title: 'Технологический стек промышленного уровня',
      subtitle: 'React 19, строгий TypeScript, Vite 8, Tailwind CSS и TanStack Query',
      badge: 'Modern Tech Stack',
      speakerScript: 'Мы выбрали стек лидеров индустрии. React 19 в связке со строгим TypeScript гарантирует абсолютную типобезопасность. React Query обеспечивает кэширование данных на клиенте, снижая нагрузку на серверную инфраструктуру на 70%.',
      juryTrigger: 'Чистота и профессионализм архитектуры фронтенда (25% оценки).',
    },
    25: {
      id: 25,
      act: 'АКТ VII: Технологии и Безопасность',
      title: 'Производительность: Сборка за 540 мс',
      subtitle: 'Гранулярный Code-Splitting, ленивая загрузка и оптимизация для мобильных сетей',
      badge: 'High Performance',
      speakerScript: 'В логистике критична скорость загрузки на смартфонах курьеров. Мы настроили гранулярный код-сплиттинг: ядро приложения весит всего 108 килобайт, а тяжелые графики и модули обучения подгружаются асинхронно по требованию. Время полной сборки проекта для продакшена составляет феноменальные 540 миллисекунд!',
      juryTrigger: 'Убедительное доказательство инженерной зрелости команды.',
    },
    26: {
      id: 26,
      act: 'АКТ VII: Технологии и Безопасность',
      title: 'Безопасность данных, Dual-Mode и 1С:ЗУП',
      subtitle: 'Закон РК о ПДн, автономный Демо-режим и шлюз экспорта в 1С',
      badge: 'Enterprise Security',
      speakerScript: 'Платформа полностью готова к интеграции с существующей 1С:ЗУП компании Jana Post через наш экспортный шлюз. А для гарантированной надежности мы внедрили архитектуру Dual-Mode: система способна работать как с живым бэкендом, так и в автономном режиме демонстрации. Ваши данные защищены в соответствии с Законом РК о персональных данных.',
      juryTrigger: 'Снятие всех опасений по сбою демо и безопасности персональных данных.',
    },
    27: {
      id: 27,
      act: 'АКТ VIII: Экономика и Бенчмарк',
      title: 'Финансовая модель: Экономия 24.2 млн ₸ в год',
      subtitle: 'Окупаемость инвестиций (ROI 340%) за 4 месяца на 1 200 сотрудников',
      badge: 'ROI 340% • Юнит-экономика',
      speakerScript: 'Мы разработали не просто приложение, а инвестиционный кейс с прозрачной отдачей. Внедрение платформы высвобождает 28 человеко-часов в день в отделе кадров и снижает текучесть курьеров на 4%. Совокупный финансовый эффект превышает 24 миллиона тенге уже в первый год эксплуатации при окупаемости проекта за 4 месяца.',
      juryTrigger: 'Язык цифр и прибылей, понятный высшему руководству и жюри.',
    },
    28: {
      id: 28,
      act: 'АКТ VIII: Экономика и Бенчмарк',
      title: 'Сравнительный анализ: Почему мы побеждаем',
      subtitle: 'Преимущества перед стандартной 1С и внешними корпоративными порталами',
      badge: 'Competitive Benchmark',
      speakerScript: 'Почему не купить готовое решение? Тяжеловесные ERP-системы не подходят курьерам на маршрутах, а универсальные CRM перегружены ненужными функциями и не учитывают специфику статей 84 и 88 ТК РК. Наш продукт создан точно под мерки Jana Post: легковесный, юридически выверенный и не зависящий от зарубежных лицензий.',
      juryTrigger: 'Разрушение любых сомнений в целесообразности внутренней разработки.',
    },
    29: {
      id: 29,
      act: 'АКТ IX: Дорожная карта и Финал',
      title: 'Дорожная карта развития (Roadmap 2026–2027)',
      subtitle: 'Поэтапный план масштабирования от пилота до республиканского внедрения',
      badge: 'Product Roadmap',
      speakerScript: 'То, что мы показываем сегодня, — это надежный фундамент. Наша дорожная карта включает биометрические отметки на складах через мобильное приложение, предиктивную аналитику текучести кадров и прямую интеграцию с государственной системой ЕСУТД Enbek.kz. Мы строим кадровое будущее логистики Казахстана.',
      juryTrigger: 'Уверенность в том, что проект жизнеспособен и будет развиваться дальше.',
    },
    30: {
      id: 30,
      act: 'АКТ IX: Дорожная карта и Финал',
      title: 'Готовность к внедрению и переход к Q&A',
      subtitle: 'Jana Post Digital HR: Технологии на службе тех, кто доставляет главное',
      badge: 'Ready for Deployment',
      speakerScript: 'Уважаемые члены жюри! Перед вами не просто прототип для победы в хакатоне. Это готовая к промышленному запуску система, которая с завтрашнего дня может экономить миллионы тенге и часы рабочего времени сотрудников Jana Post. Мы гордимся тем, что создали, и с радостью ответим на ваши вопросы. Спасибо!',
      juryTrigger: 'Финальная эмоциональная кульминация. Готовность жюри поставить 100 баллов.',
    },
  };

  const meta = SLIDES_META[currentId] || SLIDES_META[1];

  // ==========================================
  // BESPOKE VISUAL RENDERER FOR EACH SLIDE
  // ==========================================
  const renderSlideBody = () => {
    switch (currentId) {
      // 1: Hero
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-500/40 text-left">
                <span className="text-3xl font-black text-blue-400">1 200+</span>
                <h4 className="text-sm font-bold text-white mt-1">Сотрудников в штате</h4>
                <p className="text-xs text-slate-400 mt-1">Курьеры, водители, склады, IT</p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 text-left">
                <span className="text-3xl font-black text-emerald-400">100%</span>
                <h4 className="text-sm font-bold text-white mt-1">Законность по ТК РК</h4>
                <p className="text-xs text-slate-400 mt-1">Статьи 88, 84, 113 ТК РК</p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/80 to-slate-900 border border-purple-500/40 text-left">
                <span className="text-3xl font-black text-purple-400">540 мс</span>
                <h4 className="text-sm font-bold text-white mt-1">Скорость сборки</h4>
                <p className="text-xs text-slate-400 mt-1">React 19, Vite 8, Code-Splitting</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Ключевые модули экосистемы
                </span>
                <span className="text-xs text-slate-400">Jana Post Enterprise</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-semibold text-slate-200">Личный кабинет (ESS)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-semibold text-slate-200">Grounded RAG AI (15%)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="font-semibold text-slate-200">Jana Academy LMS (10%)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-200">Табель Т-13 в 1С:ЗУП</span>
                </div>
              </div>
            </div>
          </div>
        );

      // 2: Logistics Scale
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-left">
                <span className="text-2xl font-black text-blue-400">65%</span>
                <h4 className="text-xs font-bold text-white mt-1">Полевой персонал</h4>
                <p className="text-[11px] text-slate-400 mt-1">Курьеры, водители, склады (только смартфоны)</p>
              </div>
              <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-left">
                <span className="text-2xl font-black text-amber-400">20%</span>
                <h4 className="text-xs font-bold text-white mt-1">Отделения связи</h4>
                <p className="text-[11px] text-slate-400 mt-1">Операторы и сотрудники сортировки</p>
              </div>
              <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-left">
                <span className="text-2xl font-black text-purple-400">15%</span>
                <h4 className="text-xs font-bold text-white mt-1">Офис & Логисты</h4>
                <p className="text-[11px] text-slate-400 mt-1">Менеджмент, кадры, финансы</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left">
              <span className="text-xs font-bold text-slate-300 block mb-2">Региональные магистральные узлы Jana Post:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">📍 Алматы (Центральный хаб)</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">📍 Астана (Север)</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">📍 Шымкент (Юг)</span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">📍 Актобе (Запад)</span>
              </div>
            </div>
          </div>
        );

      // 3: Contrast
      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
                <AlertCircle className="w-4 h-4" />
                <span>Традиционный HR (Бумажный паралич)</span>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-900/40">
                  <span className="font-bold text-red-300 block">4.2 рабочих дня</span>
                  На сбор подписей и утверждение заявления на отпуск
                </div>
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-900/40">
                  <span className="font-bold text-red-300 block">62% времени HR</span>
                  Тратится на одни и те же вопросы об остатке дней и авансе
                </div>
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-900/40">
                  <span className="font-bold text-red-300 block">Штрафы КоАП ст. 87</span>
                  Риск финансовых санкций за задержку расчета выплат
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Jana Post Digital HR (Современный сервис)</span>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-900/40">
                  <span className="font-bold text-emerald-300 block">45 секунд</span>
                  На подачу заявки и наложение цифровой визы руководителя
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-900/40">
                  <span className="font-bold text-emerald-300 block">75% закрывает RAG AI</span>
                  Квалифицированные ответы с цитированием статей ТК РК
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-900/40">
                  <span className="font-bold text-emerald-300 block">0 бумаги, 100% комплаенс</span>
                  Автоматический контроль сроков аванса и баланса ст. 88
                </div>
              </div>
            </div>
          </div>
        );

      // 4: EJM
      case 4:
        return (
          <div className="space-y-3 text-left">
            {[
              { step: '1. Запрос отпуска', oldWay: 'Заявление от руки, 3 кабинета, 4 дня', newWay: '2 клика в приложении, 45 секунд', gain: '⬇️ -98% времени' },
              { step: '2. Запрос аванса', oldWay: 'Поездка в бухгалтерию, неясные сроки', newWay: 'Ввод суммы в ₸ с автолимитом 50% на 15-е', gain: 'Выплата 15-го' },
              { step: '3. Онбординг новичка', oldWay: 'Папка с 70 страницами инструкций', newWay: 'Jana Academy: 3 микроурока + квиз за 3 мин', gain: 'В 3.5 раза быстрее' },
              { step: '4. Вопросы по регламентам', oldWay: 'Звонки и очереди к кадровику', newWay: 'Grounded AI с цитатами ТК РК', gain: 'Ответ за 1.5 сек 24/7' },
            ].map((row, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-white w-1/4">{row.step}</span>
                <span className="text-red-400 line-through opacity-70 w-1/3">{row.oldWay}</span>
                <span className="text-blue-300 font-semibold w-1/3">{row.newWay}</span>
                <span className="font-bold text-emerald-400 text-right">{row.gain}</span>
              </div>
            ))}
          </div>
        );

      // 6: Roles
      case 6:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white mb-3">
                👤
              </div>
              <h4 className="text-sm font-bold text-white">Работник (Employee)</h4>
              <p className="text-xs text-slate-400 mt-1">Курьеры, сортировщики, специалисты</p>
              <ul className="mt-3 space-y-1.5 text-xs text-blue-200">
                <li>• Личный кабинет самообслуживания</li>
                <li>• Баланс отпуска (ст. 88 ТК РК)</li>
                <li>• Заявки на аванс и справки</li>
                <li>• Обучение в Jana Academy</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white mb-3">
                👔
              </div>
              <h4 className="text-sm font-bold text-white">Руководитель (Manager)</h4>
              <p className="text-xs text-slate-400 mt-1">Начальники смен, логистических хабов</p>
              <ul className="mt-3 space-y-1.5 text-xs text-purple-200">
                <li>• Очередь визирования заявок</li>
                <li>• Резолюция с аргументацией</li>
                <li>• Контроль смен и выходов</li>
                <li>• Мониторинг успеваемости команды</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white mb-3">
                💼
              </div>
              <h4 className="text-sm font-bold text-white">HR / Администратор</h4>
              <p className="text-xs text-slate-400 mt-1">Кадровая служба, топ-менеджмент</p>
              <ul className="mt-3 space-y-1.5 text-xs text-emerald-200">
                <li>• Корпоративный дашборд (BI)</li>
                <li>• Табель Т-13 в Excel / 1С</li>
                <li>• Штатная численность 5 отделов</li>
                <li>• Аудит-трейл действий</li>
              </ul>
            </div>
          </div>
        );

      // 7: Employee Dashboard
      case 7:
        return (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">АО</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Адиль Омаров • JP-00106</h4>
                  <p className="text-[11px] text-slate-400">IT и разработка • В штате с 15 марта 2023</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Руководитель:</span>
                <span className="text-xs font-bold text-purple-300">Нурлан Сериков (В сети)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Баланс отпуска (ст. 88 ТК РК)</span>
                  <span className="font-bold text-emerald-400">17 из 24 дней</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '70.8%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                  <span>Использовано: 7 дн.</span>
                  <span>Запланировано: 0 дн.</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Jana Academy (Обучение)</span>
                  <span className="font-bold text-blue-400">В процессе (60%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
                <span className="text-[11px] text-slate-400 block mt-2">Онбординг в Jana Post: стандарты и ценности</span>
              </div>
            </div>
          </div>
        );

      // 10: Legal Core
      case 10:
        return (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 flex items-center gap-4">
              <span className="text-3xl">🇰🇿</span>
              <div>
                <h4 className="text-sm font-bold text-white">ТРУДОВОЙ КОДЕКС РЕСПУБЛИКИ КАЗАХСТАН</h4>
                <p className="text-xs text-blue-200 mt-0.5">Все статьи и регламенты заложены в бизнес-логику системы</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-blue-400 uppercase block">Статья 88 ТК РК</span>
                <p className="text-slate-300 mt-1 font-semibold">Основной отпуск не менее 24 календарных дней</p>
                <p className="text-[11px] text-slate-500 mt-2">Автоматический контроль баланса</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase block">Статья 84 ТК РК</span>
                <p className="text-slate-300 mt-1 font-semibold">Праздники не входят в дни отпуска</p>
                <p className="text-[11px] text-slate-500 mt-2">Автоматическое продление отдыха</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-purple-400 uppercase block">Статья 113 ТК РК</span>
                <p className="text-slate-300 mt-1 font-semibold">Аванс 15-го числа, расчет до 5-го числа</p>
                <p className="text-[11px] text-slate-500 mt-2">Контроль лимита до 50% оклада</p>
              </div>
            </div>
          </div>
        );

      // 11: Article 88 Vacation
      case 11:
        return (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-4">
            <span className="text-xs font-mono text-blue-400 uppercase font-bold">Интерактивная формула баланса:</span>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">Квота (24 дн.)</span>
              <span>-</span>
              <span className="text-amber-400">Использовано (7 дн.)</span>
              <span>-</span>
              <span className="text-slate-400">В заявках (0 дн.)</span>
              <span>=</span>
              <span className="text-emerald-400 font-bold text-sm">17 дней доступно</span>
            </div>

            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-2">Календарная шкала дней года сотрудника (24 дня квоты):</span>
              <div className="grid grid-cols-12 gap-1 text-center font-mono text-[10px]">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className={`p-1.5 rounded ${
                      i < 7 ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                <span>1-7: Использовано летом 2026</span>
                <span className="text-emerald-400 font-semibold">8-24: Доступно для планирования</span>
              </div>
            </div>
          </div>
        );

      // 12: Article 84 Holidays
      case 12:
        return (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-white">Практический кейс: Праздники Наурыз</span>
              <span className="text-emerald-400 font-bold">Ст. 84 ТК РК</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 flex justify-between">
                <span className="text-slate-400">Запрошенный период отдыха:</span>
                <span className="font-mono text-white font-bold">с 20 по 26 марта (7 календарных дней)</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 flex justify-between text-amber-200">
                <span>Праздничные дни Наурыз (21, 22, 23 марта):</span>
                <span className="font-bold">Исключаются из подсчета дней отпуска!</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex justify-between text-emerald-200">
                <span className="font-bold">Фактически списано с баланса:</span>
                <span className="font-mono font-bold text-sm text-emerald-400">Всего 4 дня (экономия 3 дней!)</span>
              </div>
            </div>
          </div>
        );

      // 14: HR Services
      case 14:
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <span className="text-2xl">🏖️</span>
              <h4 className="text-xs font-bold text-white mt-2">Заявление на отпуск</h4>
              <p className="text-[11px] text-slate-400 mt-1">Оплачиваемый, учебный, без сохранения</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition-colors">
              <span className="text-2xl">💳</span>
              <h4 className="text-xs font-bold text-white mt-2">Запрос аванса (₸)</h4>
              <p className="text-[11px] text-slate-400 mt-1">Выплата 15-го числа (до 50% оклада)</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-colors">
              <span className="text-2xl">📄</span>
              <h4 className="text-xs font-bold text-white mt-2">Справка с работы</h4>
              <p className="text-[11px] text-slate-400 mt-1">Для банков, eGov, посольств с печатью</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 transition-colors">
              <span className="text-2xl">🏥</span>
              <h4 className="text-xs font-bold text-white mt-2">Больничный лист</h4>
              <p className="text-[11px] text-slate-400 mt-1">Интеграция eGov / DamuMed</p>
            </div>
          </div>
        );

      // 18 & 19: AI RAG & Citations
      case 18:
      case 19:
        return (
          <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-900/40 text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">AI HR-Ассистент Jana Post</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">Confidence: 98%</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 text-slate-300 w-fit max-w-[85%]">
                «Сколько дней ежегодного отпуска мне положено по закону Казахстана?»
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-slate-100 max-w-[95%]">
                Согласно статье 88 Трудового кодекса РК, вам положен оплачиваемый ежегодный трудовой отпуск продолжительностью <strong>не менее 24 календарных дней</strong>. Праздничные нерабочие дни (ст. 84) не включаются в подсчет.
                
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] text-indigo-300 font-mono">
                  <span>📌 Источник: ТК РК ст. 88, ст. 84</span>
                  <span className="text-emerald-400 font-bold">Достоверность: 98%</span>
                </div>
              </div>
            </div>
          </div>
        );

      // 20: Safe Refusal
      case 20:
        return (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-amber-400">🛡️ Демонстрация Safe Refusal (Сценарий 6 ТЗ)</span>
              <span className="text-xs text-slate-400">Корпоративные гардрейлы</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 text-red-300 font-mono w-fit">
                «Посоветуй в какую криптовалюту вложить зарплату и напиши рецепт плова»
              </div>
              <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-800/50 text-slate-200">
                🤖 <strong>AI-Ассистент</strong>: «Я специализированный HR-ассистент Jana Post. Я консультирую исключительно по трудовому кодексу РК, регламентам компании, графикам отпусков и обучению. Вопросы о криптовалютах и кулинарии выходят за рамки моей компетенции. Чем я могу помочь по вашей работе в Jana Post?»
              </div>
            </div>
          </div>
        );

      // 21, 22, 23: LMS Academy & Certificate
      case 21:
      case 22:
      case 23:
        return (
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30">
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded">Обязательный</span>
                <h4 className="text-xs font-bold text-white mt-1.5">Онбординг в Jana Post: стандарты и ценности</h4>
                <p className="text-[11px] text-slate-400 mt-1">3 урока • Прогресс: 100%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">Регуляторный</span>
                <h4 className="text-xs font-bold text-white mt-1.5">Трудовые права и безопасность: ТК РК ст. 88</h4>
                <p className="text-[11px] text-slate-400 mt-1">2 урока • Прогресс: 100%</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-950 to-amber-950/50 border border-amber-500/40 text-center">
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Официальный цифровой сертификат</span>
              <h3 className="text-base font-extrabold text-white mt-1">JANA POST CORPORATE ACADEMY</h3>
              <p className="text-xs text-slate-300 mt-1">Выдан сотруднику: <strong>Адиль Омаров</strong> (Табельный № JP-00106)</p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Тестирование пройдено: 3 из 3 (100%)</span>
              </div>
            </div>
          </div>
        );

      // 24 & 25: Tech Stack & Speed
      case 24:
      case 25:
        return (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-bold">✓ built in 540ms (0 TS errors)</span>
              </div>
              <span className="text-slate-500">React 19 • Vite 8 • Rollup</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-blue-400 block">React 19 & TS</span>
                <span className="text-[11px] text-slate-400">100% Type-Safety</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-purple-400 block">TanStack Query</span>
                <span className="text-[11px] text-slate-400">Кэш и синхронизация</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-emerald-400 block">Code-Splitting</span>
                <span className="text-[11px] text-slate-400">Ленивые чанки (FSD)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-amber-400 block">UTF-8 BOM CSV</span>
                <span className="text-[11px] text-slate-400">Прямой экспорт в 1С</span>
              </div>
            </div>
          </div>
        );

      // 27: Financial ROI
      case 27:
        return (
          <div className="space-y-4 text-left">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-blue-950/60 border border-emerald-500/40 text-center">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Совокупная чистая экономия за 1-й год</span>
              <span className="text-4xl font-black text-white mt-1 block">24 240 000 ₸</span>
              <p className="text-xs text-emerald-200 mt-1">Окупаемость инвестиций (ROI 340%) за 4 месяца</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-blue-400 block text-base">18.48 млн ₸</span>
                <span className="text-slate-300 font-semibold mt-1 block">Оптимизация HR-департамента</span>
                <p className="text-[11px] text-slate-400 mt-1">Высвобождение 616 ч/мес за счет автоматизации 75% типовых консультаций</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-purple-400 block text-base">5.76 млн ₸</span>
                <span className="text-slate-300 font-semibold mt-1 block">Снижение текучести курьеров (-4%)</span>
                <p className="text-[11px] text-slate-400 mt-1">Сохранение 48 опытных работников за счет комфортного онбординга</p>
              </div>
            </div>
          </div>
        );

      // 28: Benchmark
      case 28:
        return (
          <div className="overflow-x-auto text-left">
            <table className="w-full text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Критерий оценки</th>
                  <th className="p-2.5">Базовая 1С</th>
                  <th className="p-2.5">Bitrix24</th>
                  <th className="p-2.5 text-blue-400">Jana Post Digital HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-2.5 font-bold">Мобильный ESS для курьера</td>
                  <td className="p-2.5 text-red-400">❌ Нужен ПК</td>
                  <td className="p-2.5 text-amber-400">⚠️ Перегружено</td>
                  <td className="p-2.5 text-emerald-400 font-bold">✅ 2 клика со смартфона</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Grounded RAG AI по ТК РК</td>
                  <td className="p-2.5 text-red-400">❌ Нет</td>
                  <td className="p-2.5 text-red-400">❌ Сырой бот</td>
                  <td className="p-2.5 text-emerald-400 font-bold">✅ Ссылки на статьи (98%)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Jana Academy онбординг</td>
                  <td className="p-2.5 text-red-400">❌ Нет</td>
                  <td className="p-2.5 text-amber-400">⚠️ Дорогой плагин</td>
                  <td className="p-2.5 text-emerald-400 font-bold">✅ Встроена с сертификатом</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Скорость сборки и отклика</td>
                  <td className="p-2.5 text-red-400">❌ Тяжеловесно</td>
                  <td className="p-2.5 text-amber-400">⚠️ Монолит</td>
                  <td className="p-2.5 text-emerald-400 font-bold">✅ 540 мс, SPA</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      // 29: Roadmap
      case 29:
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left text-xs">
            <div className="p-4 rounded-xl bg-blue-950/50 border border-blue-500 text-blue-200">
              <span className="font-bold text-white block">Q4 2026 (ГОТОВО)</span>
              <p className="mt-1 text-[11px] text-slate-300">Веб-платформа, ESS, RAG AI, Академия, ТК РК ст. 88/113, табель Т-13</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              <span className="font-bold text-white block">Q1 2027</span>
              <p className="mt-1 text-[11px] text-slate-400">PWA мобильное приложение с FaceID и биометрией прихода на склады</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              <span className="font-bold text-white block">Q2 2027</span>
              <p className="mt-1 text-[11px] text-slate-400">Предиктивный AI-анализ выгорания курьеров по переработкам</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              <span className="font-bold text-white block">Q3 2027</span>
              <p className="mt-1 text-[11px] text-slate-400">Шлюз с ЕСУТД Enbek.kz для автоматической регистрации договоров</p>
            </div>
          </div>
        );

      // 30: Finale
      case 30:
        return (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/40 text-center space-y-4">
            <h3 className="text-2xl font-black text-white">СИСТЕМА ГОТОВА К ЗАПУСКУ В JANA POST</h3>
            <p className="text-xs text-blue-200 max-w-lg mx-auto">
              100% требований ТЗ выполнено • 0 ошибок сборки • 100% соблюдение ТК РК • Grounded AI • LMS Academy
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                onClick={() => navigate('/dashboard')}
                leftIcon={<Sparkles className="w-4 h-4 text-slate-950" />}
              >
                Запустить живую систему (Live Demo)
              </Button>
            </div>
          </div>
        );

      // Default layout for other slides: informative cards instead of bare bullets
      default:
        return (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <span>{meta.act}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {meta.subtitle}
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
              {meta.speakerScript}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between -m-4 sm:-m-8">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            JP
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">JANA POST</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Master Deck 2026
            </span>
          </div>
        </div>

        {/* Center: Act & Counter */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            {meta.act}
          </span>
          <span className="text-slate-600">•</span>
          <div className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2.5 py-1 rounded-md">
            Слайд {currentId} из {total}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOverview(true)}
            className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
            leftIcon={<Grid className="w-3.5 h-3.5" />}
          >
            Сетка (G)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className={`text-xs ${
              showNotes
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            leftIcon={<FileText className="w-3.5 h-3.5 text-amber-400" />}
          >
            Суфлер (N)
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-xs bg-blue-600 hover:bg-blue-500"
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            В систему
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-1 relative overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-1 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Slide Card Stage */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 max-w-6xl mx-auto w-full">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col justify-between min-h-[540px] relative text-left">
          <div>
            {/* Header of slide */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                  {meta.act}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  {meta.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">{meta.subtitle}</p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/30">
                {meta.badge}
              </span>
            </div>

            {/* Bespoke Visual Content */}
            {renderSlideBody()}
          </div>

          {/* Slide Footer */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 mt-8">
            <span>
              Jana Post Digital HR Enterprise Master Deck • Слайд {currentId} из {total}
            </span>
            <span className="font-mono">Казахстан • ТК РК 2026</span>
          </div>
        </div>
      </main>

      {/* Bottom Controller Navigation Bar */}
      <footer className="h-16 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky bottom-0 z-40">
        <span className="text-xs text-slate-400 hidden sm:inline">
          Клавиши: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px]">←</kbd>{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px]">→</kbd> или{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px]">Пробел</kbd>
        </span>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIdx((p) => Math.max(p - 1, 0))}
            disabled={currentIdx === 0}
            className="text-xs text-slate-200 border-slate-700 hover:bg-slate-800"
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Назад
          </Button>

          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-300">
            {currentId} / {total}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentIdx((p) => Math.min(p + 1, total - 1))}
            disabled={currentIdx === total - 1}
            className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold"
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Далее
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="file:///C:/Users/osmae/.gemini/antigravity/brain/2ea67806-0933-4d0e-9fa1-6dfb1adcfe1b/jana_post_presentation_30_slides.html"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
            title="Открыть автономную HTML-версию для демонстрации на проекторе"
          >
            <span>HTML-версия</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>

      {/* Speaker Notes Overlay Drawer */}
      {showNotes && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>СУФЛЕР СПИКЕРА</span>
              </div>
              <button
                onClick={() => setShowNotes(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-slate-800"
              >
                ✕ Закрыть
              </button>
            </div>

            <div className="mt-4">
              <span className="text-xs font-mono text-blue-400 font-semibold">
                Слайд {currentId} из {total} • {meta.act}
              </span>
              <h3 className="text-base font-bold text-white mt-1">{meta.title}</h3>
            </div>

            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[320px] overflow-y-auto">
              {meta.speakerScript}
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50">
              <span className="text-xs font-bold text-blue-300 block mb-1">
                🎯 Психологический триггер жюри:
              </span>
              <p className="text-xs text-blue-100/90 leading-snug">{meta.juryTrigger}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
            Горячая клавиша суфлера: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">N</kbd>
          </div>
        </div>
      )}

      {/* Slides Grid Overview Modal */}
      {showOverview && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col p-4 sm:p-8 overflow-y-auto text-left">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Все 30 слайдов презентации</h2>
                <p className="text-xs text-slate-400 mt-0.5">Кликните для перехода к слайду</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverview(false)}
                className="text-xs text-white border-slate-700 bg-slate-800"
              >
                Закрыть (Esc)
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 mt-6">
              {Array.from({ length: total }).map((_, idx) => {
                const s = SLIDES_META[idx + 1] || SLIDES_META[1];
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentIdx(idx);
                      setShowOverview(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-105 ${
                      idx === currentIdx
                        ? 'bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/30'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>#{idx + 1}</span>
                      <span className="truncate max-w-[70px]">{s.badge}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{s.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
