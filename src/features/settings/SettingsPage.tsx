import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Lock,
  Server,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import { getInitials } from '@/lib/utils';

const passwordSchema = z
  .object({
    oldPassword: z.string().min(4, 'Минимум 4 символа'),
    newPassword: z.string().min(6, 'Пароль должен содержать не менее 6 символов'),
    confirmPassword: z.string().min(6, 'Подтвердите пароль'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const SettingsPage: React.FC = () => {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setPasswordSuccess(false);
    setPasswordError(null);
    try {
      await changePassword(values.oldPassword, values.newPassword);
      setPasswordSuccess(true);
      toast.success('Пароль обновлен', 'Новый пароль успешно сохранен в системе');
      reset();
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось изменить пароль';
      setPasswordError(msg);
      toast.error('Ошибка смены пароля', msg);
    }
  };

  const handleTestBackendPing = async () => {
    setPingStatus('checking');
    const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    try {
      const res = await fetch(`${apiUrl}/health`, { method: 'GET' });
      if (res.ok) {
        setPingStatus('online');
        setPingMessage(`Сервер успешно отвечает (${res.status} OK)`);
        toast.success('Сервер онлайн', `Сервер бэкенда доступен (${res.status} OK)`);
      } else {
        setPingStatus('offline');
        setPingMessage(`Сервер вернул статус ${res.status}`);
        toast.error('Сервер вернул ошибку', `HTTP Status: ${res.status}`);
      }
    } catch {
      setPingStatus('offline');
      setPingMessage('Сервер недоступен по адресу: ' + apiUrl);
      toast.error('Сервер недоступен', 'Проверьте запуск сервера на порту 3000');
    }
  };

  const handleResetData = () => {
    api.demo.resetData();
    toast.info('Данные сброшены', 'Восстановлены исходные данные системы');
    setTimeout(() => window.location.reload(), 500);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#101828]">Профиль и настройки</h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Управление учетной записью сотрудника и параметрами интеграции с сервером
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Учетная запись сотрудника</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {getInitials(user?.firstName || '', user?.lastName || '')}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-900">
              {user?.firstName} {user?.lastName}
            </h4>
            <p className="text-xs font-semibold text-blue-600">{user?.jobTitle}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                Табельный: {user?.employeeId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                Роль: {user?.role}
              </span>
              {user?.departmentName && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                  {user.departmentName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Lock className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Безопасность и смена пароля</h3>
        </div>

        {passwordSuccess && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Пароль успешно обновлен в системе!</span>
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
          <Input
            label="Текущий пароль"
            type="password"
            placeholder="••••••••"
            error={errors.oldPassword?.message}
            {...register('oldPassword')}
          />
          <Input
            label="Новый пароль"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Подтверждение нового пароля"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Обновить пароль
          </Button>
        </form>
      </div>

      {/* System & Storage Controls */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Служба данных и системные параметры
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            СИСТЕМА АКТИВНА
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                API Base URL (Jana Post Core Gateway)
              </span>
              <span className="text-slate-800 font-bold">
                {import.meta.env.VITE_API_BASE_URL || '/api/v1'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestBackendPing}
              isLoading={pingStatus === 'checking'}
              className="text-xs shrink-0"
            >
              Проверить пинг шлюза
            </Button>
          </div>

          {pingMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                pingStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {pingStatus === 'online' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{pingMessage}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h5 className="font-bold text-slate-900">Локальное хранилище данных и сессий</h5>
              <p className="text-slate-500 mt-0.5">
                Очистка локального кэша и восстановление эталонных кадровых записей компании.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
                onClick={handleResetData}
                title="Сбросить все изменения и восстановить исходные данные"
              >
                Сбросить к исходным данным
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Card */}
      <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-red-900">Выход из личного кабинета</h4>
          <p className="text-[11px] text-red-700 mt-0.5">
            Завершить сессию авторизации на этом устройстве
          </p>
        </div>
        <Button
          variant="danger"
          size="sm"
          leftIcon={<LogOut className="w-4 h-4" />}
          onClick={handleLogout}
        >
          Выйти
        </Button>
      </div>
    </div>
  );
};
