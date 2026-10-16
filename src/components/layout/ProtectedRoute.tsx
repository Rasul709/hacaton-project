import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { UserRole } from '@/types';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          <p className="text-sm font-medium text-slate-500">Загрузка сессии Jana Post HR...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Доступ ограничен</h3>
        <p className="text-sm text-slate-500 mt-2">
          Данный раздел доступен только для ролей: {allowedRoles.join(', ')}. Ваша текущая роль: {user.role}.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={() => window.history.back()}
        >
          Вернуться назад
        </Button>
      </div>
    );
  }

  return <Outlet />;
};
