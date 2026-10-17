import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Employee, Department, TaskItem } from '@/types';
import { Search, X, Users, Building2, CheckSquare, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    // Pre-fetch items for instant search
    Promise.all([
      api.employees.getAll({ limit: 50 }),
      api.departments.getAll(),
      api.tasks.getAll(),
    ]).then(([empRes, deptRes, taskRes]) => {
      setEmployees(empRes.data);
      setDepartments(deptRes);
      setTasks(taskRes);
    });
  }, [isOpen]);

  // Handle Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredEmployees = q
    ? employees.filter(
        (e) =>
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          e.jobTitle.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredDepartments = q
    ? departments.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredTasks = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const hasResults =
    filteredEmployees.length > 0 ||
    filteredDepartments.length > 0 ||
    filteredTasks.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск сотрудников, отделов, задач..."
            className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!q && (
            <div className="p-6 text-center text-xs text-slate-400">
              Начните вводить имя сотрудника, должность, название отдела или задачу
            </div>
          )}

          {q && !hasResults && (
            <div className="p-6 text-center text-xs text-slate-400">
              Ничего не найдено по запросу «{query}»
            </div>
          )}

          {/* Employees */}
          {filteredEmployees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Users className="w-3.5 h-3.5" />
                Сотрудники
              </div>
              <div className="mt-1 space-y-1">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      onClose();
                      navigate('/employees');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center shrink-0">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-slate-900">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {emp.jobTitle} • {emp.departmentName}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Departments */}
          {filteredDepartments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Building2 className="w-3.5 h-3.5" />
                Департаменты
              </div>
              <div className="mt-1 space-y-1">
                {filteredDepartments.map((dept) => (
                  <div
                    key={dept.id}
                    onClick={() => {
                      onClose();
                      navigate('/departments');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-900">
                        {dept.name} ({dept.code})
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {dept.employeeCount} сотрудников • Руководитель: {dept.managerName || 'Не назначен'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <CheckSquare className="w-3.5 h-3.5" />
                Задачи
              </div>
              <div className="mt-1 space-y-1">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onClose();
                      navigate('/tasks');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-900">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Исполнитель: {t.assignedToName} • Статус: {t.status}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
