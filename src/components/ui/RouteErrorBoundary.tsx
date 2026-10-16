import React, { useState } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  AlertOctagon,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Bug,
  RefreshCw,
} from 'lucide-react';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  let statusText = 'Внутренняя ошибка интерфейса';
  let errorMessage = 'Произошел непредвиденный сбой при рендеринге раздела.';
  let stackTrace = '';

  if (isRouteErrorResponse(error)) {
    statusText = `Ошибка маршрутизации (${error.status} ${error.statusText})`;
    errorMessage = error.data?.message || typeof error.data === 'string' ? error.data : 'Запрошенный раздел не найден или недоступен.';
  } else if (error instanceof Error) {
    errorMessage = error.message;
    stackTrace = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  const handleReload = () => {
    window.location.reload();
  };

  const handleResetCache = () => {
    sessionStorage.clear();
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-red-100 shadow-xl p-8 relative overflow-hidden">
        {/* Subtle decorative accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              Safe Recovery • Jana Post
            </span>
            <h2 className="text-xl font-extrabold text-[#101828] mt-0.5">
              {statusText}
            </h2>
          </div>
        </div>

        <p className="text-sm text-[#667085] leading-relaxed mb-6">
          {errorMessage}
        </p>

        {/* Technical stack trace accordion */}
        {stackTrace && (
          <div className="mb-6 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/70">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bug className="w-3.5 h-3.5 text-slate-500" />
                <span>Технические подробности сбоя</span>
              </div>
              {showDetails ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {showDetails && (
              <pre className="p-3 text-[11px] font-mono text-slate-700 bg-slate-900 text-slate-100 overflow-x-auto max-h-48 leading-tight">
                {stackTrace}
              </pre>
            )}
          </div>
        )}

        {/* Action recovery buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-100">
          <Button
            variant="primary"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={handleReload}
            className="flex-1"
          >
            Перезагрузить раздел
          </Button>
          <Button
            variant="outline"
            leftIcon={<Home className="w-4 h-4 text-slate-500" />}
            onClick={() => navigate('/dashboard')}
          >
            На Главную
          </Button>
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4 text-slate-500" />}
            onClick={handleResetCache}
            title="Сбросить сессию и вернуться в систему"
          >
            Сброс кэша
          </Button>
        </div>
      </div>
    </div>
  );
};
