import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarDays,
  CheckSquare,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Send,
  GraduationCap,
  Bot,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}) => {
  const { user } = useAuth();

  const navItems = [
    {
      label: 'Дашборд',
      to: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    },
    {
      label: 'Сотрудники',
      to: '/employees',
      icon: Users,
      roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD'],
    },
    {
      label: 'Департаменты',
      to: '/departments',
      icon: Building2,
      roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD'],
    },
    {
      label: 'Посещаемость',
      to: '/attendance',
      icon: Clock,
      roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    },
    {
      label: 'Мои заявки',
      to: '/leave',
      icon: CalendarDays,
      roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    },
    {
      label: 'Задачи',
      to: '/tasks',
      icon: CheckSquare,
      roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    },
    {
      label: 'Jana Academy',
      to: '/academy',
      icon: GraduationCap,
      badge: 'LMS',
      roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    },
    {
      label: 'HR-ассистент',
      to: '/ai-assistant',
      icon: Bot,
      badge: 'AI',
      roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    },
    {
      label: 'Уведомления',
      to: '/notifications',
      icon: Bell,
      roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    },
    {
      label: 'Настройки',
      to: '/settings',
      icon: Settings,
      roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    },
  ];

  const filteredItems = navItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#111827] text-white border-r border-slate-800 transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Send className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-white truncate">
                  Jana Post
                </span>
                <span className="text-[11px] font-medium text-blue-400 tracking-wider uppercase truncate">
                  Digital HR
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-5 h-5 shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {collapsed && (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card in bottom of Sidebar */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50',
              collapsed && 'justify-center p-1.5'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-600 overflow-hidden">
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
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.role === 'ADMIN'
                    ? 'Администратор'
                    : user?.role === 'HR_MANAGER'
                    ? 'HR Менеджер'
                    : user?.role === 'DEPARTMENT_HEAD'
                    ? 'Руководитель'
                    : 'Сотрудник'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
