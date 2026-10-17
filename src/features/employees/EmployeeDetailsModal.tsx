import React, { useState } from 'react';
import { Employee } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { formatKazakhstanDate } from '@/lib/utils';
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  HeartHandshake,
  Shield,
  Printer,
  FileText,
  FileSignature,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Star,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEdit?: (emp: Employee) => void;
}

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  isOpen,
  onClose,
  employee,
  onEdit,
}) => {
  const toast = useToast();
  const [isSyncingEnbek, setIsSyncingEnbek] = useState(false);
  const [enbekStatus, setEnbekStatus] = useState<string>('REGISTERED');
  const [enbekId, setEnbekId] = useState<string>(
    employee?.enbekContractId || `ESUTD-2026-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  if (!employee) return null;

  const handleSyncEnbek = async () => {
    setIsSyncingEnbek(true);
    try {
      const res = await api.employees.syncEnbek(employee.id);
      setEnbekStatus('REGISTERED');
      setEnbekId(res.employee.enbekContractId || enbekId);
      toast.success(
        'Синхронизация с ЕСУТД',
        `Трудовой договор № ${enbekId} успешно подтвержден на портале Enbek.kz`
      );
    } catch (e: any) {
      toast.error('Ошибка ЕСУТД', e.message);
    } finally {
      setIsSyncingEnbek(false);
    }
  };

  const handleGetAiReview = async () => {
    setIsLoadingReview(true);
    try {
      const res = await api.employees.getAiReview(employee.id);
      setAiReview(res.evaluation);
      toast.success('AI-Характеристика готова', 'Сформирован сводный отчет по эффективности сотрудника');
    } catch (e: any) {
      toast.error('Ошибка AI-оценки', e.message);
    } finally {
      setIsLoadingReview(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Личное дело сотрудника"
      description={`Табельный номер: ${employee.employeeId}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Official Statutory Form T-2 header for print */}
        <div className="hidden print:block text-center border-b border-slate-300 pb-3 mb-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Утверждена приказом МЗСР РК</span>
          <h2 className="text-base font-extrabold uppercase tracking-wide text-black mt-1">Личная карточка работника (Форма Т-2)</h2>
          <p className="text-xs text-slate-600">АО «Jana Post» • Кадровая служба</p>
        </div>

        {/* Header with avatar & name */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            {employee.avatarUrl ? (
              <img
                src={employee.avatarUrl}
                alt={employee.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {employee.firstName[0]}
                {employee.lastName[0]}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-slate-900">
                {employee.firstName} {employee.lastName}
              </h4>
              <StatusBadge status={employee.status} />
            </div>
            <p className="text-sm font-medium text-blue-600 mt-0.5">
              {employee.jobTitle}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {employee.departmentName}
            </p>
          </div>
        </div>

        {/* Enbek.kz / ЕСУТД Kazakhstan Labor Ministry Integration Banner */}
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 flex-wrap">
                <span>ЕСУТД РК (Портал Enbek.kz)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-200/80 text-emerald-800 font-mono">
                  {enbekId} • {enbekStatus}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Электронный трудовой договор зарегистрирован и подтвержден ЭЦП в Минтруда РК
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncEnbek}
              disabled={isSyncingEnbek}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-300 font-semibold hover:bg-emerald-100 transition-colors cursor-pointer text-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingEnbek ? 'animate-spin' : ''}`} />
              <span>{isSyncingEnbek ? 'Синхронизация...' : 'Обновить ЕСУТД'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.open(api.documents.getContractUrl(employee.id), '_blank')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors cursor-pointer text-xs shadow-xs"
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>Трудовой договор (ст. 33)</span>
            </button>
          </div>
        </div>

        {/* Logistics Courier Performance & AI Review */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-900">
                Операционные KPI доставки и дисциплины Jana Post
              </span>
            </div>
            <button
              type="button"
              onClick={handleGetAiReview}
              disabled={isLoadingReview}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isLoadingReview ? 'Анализ данных...' : 'AI-Характеристика'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">SLA Доставки</span>
              <span className="text-sm font-extrabold text-emerald-600">98.8%</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Ср. время</span>
              <span className="text-sm font-extrabold text-blue-600">22 мин</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Рейтинг (CSAT)</span>
              <span className="text-sm font-extrabold text-amber-600 flex items-center justify-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" /> 4.95
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Вручено заказов</span>
              <span className="text-sm font-extrabold text-slate-800">342+</span>
            </div>
          </div>

          {aiReview && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-slate-700 whitespace-pre-line font-mono animate-fadeIn">
              {aiReview}
            </div>
          )}
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Mail className="w-3.5 h-3.5" /> Корпоративный Email
            </span>
            <p className="font-semibold text-slate-800 text-sm">{employee.email}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Phone className="w-3.5 h-3.5" /> Мобильный телефон
            </span>
            <p className="font-semibold text-slate-800 text-sm">{employee.phone}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5" /> Дата вступления в должность
            </span>
            <p className="font-semibold text-slate-800 text-sm">
              {formatKazakhstanDate(employee.startDate)}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Building2 className="w-3.5 h-3.5" /> Непосредственный руководитель
            </span>
            <p className="font-semibold text-slate-800 text-sm">
              {employee.managerName || 'Руководство компании'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1 sm:col-span-2">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5" /> Фактический адрес
            </span>
            <p className="font-semibold text-slate-800 text-sm">
              {employee.address || 'Адрес не указан в анкете'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1 sm:col-span-2">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <HeartHandshake className="w-3.5 h-3.5" /> Контакт на случай экстренной связи
            </span>
            <p className="font-semibold text-slate-800 text-sm">
              {employee.emergencyContact || 'Не заполнен'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 print:hidden">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Конфиденциальные персональные данные Jana Post HR</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4 text-slate-500" />}
              onClick={() => window.open(api.documents.getEmployeeCardUrl(employee.id), '_blank')}
              title="Печать личной карточки работника (типовая форма Т-2 РК)"
            >
              Печать (Т-2)
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText className="w-4 h-4 text-emerald-600" />}
              onClick={() => window.open(api.documents.getPayslipUrl(employee.id), '_blank')}
              title="Печать расчетного листка (ст. 113 ТК РК)"
              className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
            >
              Расчетный листок (ст. 113)
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(employee);
                }}
              >
                Редактировать
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
