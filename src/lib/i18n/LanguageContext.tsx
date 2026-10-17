import React, { createContext, useContext, useState } from 'react';

export type Language = 'ru' | 'kk';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ru: {
    'nav.dashboard': 'Панель управления',
    'nav.employees': 'Сотрудники',
    'nav.departments': 'Департаменты',
    'nav.attendance': 'Учет времени (UTC+5)',
    'nav.leave': 'Заявки и сервисы',
    'nav.tasks': 'Задачи (Канбан)',
    'nav.notifications': 'Уведомления',
    'nav.settings': 'Настройки',
    'nav.academy': 'Jana Academy',
    'nav.aiAssistant': 'AI HR-Консультант',
    'nav.presentation': '30-слайдовый питч',
    'topbar.search': 'Поиск по сотрудникам, задачам...',
    'topbar.mode': 'Режим:',
    'topbar.server': 'Сервер:',
    'topbar.jury': 'Жюри • Демо-тур',
    'leave.balance': 'Баланс отпуска (ТК РК ст. 88)',
    'leave.used': 'Использовано в 2026 году',
    'leave.pending': 'Заявки на рассмотрении',
    'leave.apply': 'Подать заявление',
    'leave.export': 'Экспорт реестра',
    'leave.timesheet': 'Табель Т-13',
    'leave.orderT6': 'Приказ Т-6',
    'leave.gantt': 'График отпусков (Гант)',
    'leave.table': 'Таблица заявок',
    'payslip.title': 'Расчетный листок (ст. 113 ТК РК)',
    'payslip.btn': 'Печать расчетного листка',
    'common.logout': 'Выйти из системы',
    'common.profile': 'Мой профиль',
    'common.close': 'Закрыть',
  },
  kk: {
    'nav.dashboard': 'Басқару тақтасы',
    'nav.employees': 'Қызметкерлер',
    'nav.departments': 'Бөлімдер мен хабтар',
    'nav.attendance': 'Жұмыс уақыты (UTC+5)',
    'nav.leave': 'Демалыс және HR-өтінімдер',
    'nav.tasks': 'Тапсырмалар (Канбан)',
    'nav.notifications': 'Хабарламалар',
    'nav.settings': 'Параметрлер',
    'nav.academy': 'Jana Академиясы',
    'nav.aiAssistant': 'AI HR-Кеңесшісі',
    'nav.presentation': '30-слайдтық питч',
    'topbar.search': 'Қызметкерлер мен тапсырмаларды іздеу...',
    'topbar.mode': 'Режим:',
    'topbar.server': 'Сервер:',
    'topbar.jury': 'Қазылар • Демо-тур',
    'leave.balance': 'Демалыс балансы (ҚР ЕК 88-бап)',
    'leave.used': '2026 жылы пайдаланылған',
    'leave.pending': 'Қаралудағы өтінімдер',
    'leave.apply': 'Өтініш беру',
    'leave.export': 'Тізілімді экспорттау',
    'leave.timesheet': 'Т-13 Табелі',
    'leave.orderT6': 'Т-6 Бұйрығы',
    'leave.gantt': 'Демалыс кестесі (Гант)',
    'leave.table': 'Өтінімдер кестесі',
    'payslip.title': 'Есеп айырысу парағы (ҚР ЕК 113-бап)',
    'payslip.btn': 'Есеп парағын басып шығару',
    'common.logout': 'Жүйеден шығу',
    'common.profile': 'Менің бейінім',
    'common.close': 'Жабу',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('jp_lang') as Language) || 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('jp_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'kk' : 'ru');
  };

  const t = (key: string, fallback?: string): string => {
    return TRANSLATIONS[language]?.[key] || fallback || TRANSLATIONS['ru']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
