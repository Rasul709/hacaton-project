import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { isDemoModeEnabled, setDemoModeEnabled, api } from '@/lib/api';
import { formatKazakhstanDate, formatKazakhstanTime } from '@/lib/utils';
import {
  Menu,
  Bell,
  Search,
  Database,
  Radio,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { JuryDemoWidget } from './JuryDemoWidget';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface TopbarProps {
  onMobileMenuToggle: () => void;
  onOpenSearch: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const isDemo = isDemoModeEnabled();
  const queryClient = useQueryClient();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Notifications via TanStack Query
  const { data: allNotifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.getAll(),
    refetchInterval: 30000,
  });

  const notifications = allNotifications.slice(0, 5);
  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await api.notifications.markAllAsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E4E7EC] flex items-center justify-between px-4 lg:px-8">
      {/* Left side: Hamburger + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Открыть меню"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-xs font-medium w-48 sm:w-64 md:w-80"
        >
          <Search className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="truncate">{t('topbar.search', 'Поиск по сотрудникам, задачам...')}</span>
          <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-500 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: Timezone info + Demo Switcher + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Kazakhstan Time Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-800">
            {formatKazakhstanTime(currentTime)}
          </span>
          <span className="text-slate-400">•</span>
          <span>{formatKazakhstanDate(currentTime)}</span>
          <span className="text-[10px] text-slate-400 font-mono">(UTC+5 Almaty)</span>
        </div>

        {/* Language Switcher (KZ / RU) */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
          title="Тілді ауыстыру / Сменить язык"
        >
          <span>{language === 'ru' ? '🇰🇿 ҚАЗ' : '🇷🇺 РУС'}</span>
        </button>

        {/* Jury / Pitch Walkthrough Mode */}
        <JuryDemoWidget />

        {/* Demo Mode Toggle Badge */}
        <div className="flex items-center">
          <button
            onClick={() => setDemoModeEnabled(!isDemo)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
              isDemo
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
            title="Нажмите, чтобы переключить режим Demo / Live Backend"
          >
            {isDemo ? (
              <>
                <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="hidden md:inline">Режим:</span> ДЕМО
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Сервер:</span> LIVE API
              </>
            )}
          </button>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Уведомления"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Уведомления</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {unreadCount} новых
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Прочитать все
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Нет новых уведомлений
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                        !n.isRead ? 'bg-blue-50/40' : ''
                      }`}
                      onClick={async () => {
                        setNotificationsOpen(false);
                        if (!n.isRead) {
                          await api.notifications.markAsRead(n.id);
                          queryClient.invalidateQueries({ queryKey: ['notifications'] });
                        }
                        if (n.link) navigate(n.link);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {formatKazakhstanDate(n.createdAt, true)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 block py-1"
                >
                  Все уведомления →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight">
                {user?.jobTitle || 'Сотрудник'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1 inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {user?.role}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Мой профиль
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  Настройки системы
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти из системы
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
