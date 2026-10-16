import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { DEMO_USERS } from '@/lib/api/mockData';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email адрес'),
  password: z.string().min(4, 'Пароль должен содержать не менее 4 символов'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@janapost.kz',
      password: 'password123',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка аутентификации';
      setAuthError(msg);
    }
  };

  const fillQuickCredentials = (roleKey: keyof typeof DEMO_USERS) => {
    const user = DEMO_USERS[roleKey];
    if (user) {
      setValue('email', user.email);
      setValue('password', 'password123');
      setAuthError(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2563EB] text-white shadow-lg shadow-blue-500/25 mb-4">
          <Send className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
          Jana Post Digital HR
        </h2>
        <p className="mt-2 text-sm text-[#667085]">
          Единая платформа управления персоналом и кадровыми процессами
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-[#E4E7EC]">
          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Корпоративный Email"
              type="email"
              placeholder="name@janapost.kz"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3"
              size="lg"
              isLoading={isSubmitting}
            >
              Войти в личный кабинет
            </Button>
          </form>

          {/* Quick Login for Hackathon Jury */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#667085] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Быстрый вход для жюри и тестирования:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
              >
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                  HR Директор
                </p>
                <p className="text-[10px] text-slate-500">Администратор (Айгерим)</p>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials('hr')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
              >
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                  HR Менеджер
                </p>
                <p className="text-[10px] text-slate-500">Зарина Ибраева</p>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials('manager')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
              >
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                  Руководитель
                </p>
                <p className="text-[10px] text-slate-500">Логистика (Бауыржан)</p>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials('employee')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
              >
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                  Сотрудник
                </p>
                <p className="text-[10px] text-slate-500">Разработчик (Адиль)</p>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Безопасная аутентификация • Jana Post Enterprise Security</span>
        </div>
      </div>
    </div>
  );
};
