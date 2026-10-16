import React from 'react';
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
  UserCheck,
  Shield,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
  if (!employee) return null;

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
              onClick={() => window.print()}
              title="Печать личной карточки работника (форма Т-2)"
            >
              Печать (Т-2)
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
