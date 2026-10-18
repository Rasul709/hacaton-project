import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle,
  ChevronRight,
  X,
} from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  roleBadge: string;
  scenario: string;
  targetRoute: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'admin',
    name: 'Айгерим Смагулова',
    email: 'admin@janapost.kz',
    roleTitle: 'HR Director / Super Admin',
    roleBadge: 'ADMIN',
    scenario: 'Кадровая аналитика, приказы Т-6, личные карточки Т-2, реестр сотрудников',
    targetRoute: '/dashboard',
  },
  {
    id: 'manager',
    name: 'Нурлан Сериков',
    email: 'manager@janapost.kz',
    roleTitle: 'Руководитель логистического хаба',
    roleBadge: 'MANAGER',
    scenario: 'Согласование заявлений на отпуск (24 дн. по ТК РК), табель Т-13, канбан-задачи',
    targetRoute: '/leave',
  },
  {
    id: 'employee',
    name: 'Азамат Ибраев',
    email: 'employee@janapost.kz',
    roleTitle: 'Водитель-курьер сети Jana Post',
    roleBadge: 'EMPLOYEE',
    scenario: 'Мобильный Clock-In (UTC+5), подача больничного с вложением, Jana Academy LMS',
    targetRoute: '/attendance',
  },
];

export const JuryDemoWidget: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchPersona = async (p: Persona) => {
    setIsSwitching(true);
    try {
      await login(p.email, 'password123');
      navigate(p.targetRoute);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all border border-blue-500/30"
        title="Сценарий для жюри хакатона PostTech"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
        <span>Жюри • Демо-тур</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Сценарий демонстрации для жюри PostTech
                  </h3>
                  <p className="text-xs text-slate-500">
                    Быстрое переключение между 3 ролями и ключевыми бизнес-сценариями платформы
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Stack Badges */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                🟢 Live Express 5 API
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-200">
                🐘 PostgreSQL 16 + Prisma
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                🔒 bcrypt + JWT
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                📁 Multer Вложения
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-200">
                🇰🇿 ТК РК (24 дн. • Т-6, Т-2, Т-13)
              </span>
            </div>

            {/* Personas Switcher List */}
            <div className="mt-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Выберите роль для мгновенной авторизации:
              </span>

              {PERSONAS.map((p) => {
                const isActive = user?.email.toLowerCase() === p.email.toLowerCase();
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchPersona(p)}
                    disabled={isSwitching}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 font-bold text-sm text-slate-700 flex items-center justify-center shrink-0">
                        {p.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{p.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 text-slate-600">
                            {p.roleBadge}
                          </span>
                          {isActive && (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                              <CheckCircle className="w-3 h-3" /> Текущая
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.scenario}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
