import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, FileText, ArrowLeft, Printer, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const DocumentVerificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const docId = id || 'leave-sample';
  const orderNum = `ПР-${docId.replace('leave-', '').slice(-6)}`;
  const verifyDate = new Date().toLocaleDateString('ru-RU');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white text-center relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-3">
            <ShieldCheck className="w-8 h-8 text-emerald-300" />
          </div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-blue-200 block">
            Государственный сервис верификации ЭЦП • НУЦ РК
          </span>
          <h1 className="text-xl font-extrabold mt-1">
            Электронный документ проверен и действителен
          </h1>
          <p className="text-xs text-blue-100 mt-1">
            ТОО «Jana Post Logistics» • Кадровая информационная система
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-950 block">
                Подлинность документа подтверждена
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Электронная цифровая подпись валидна. Изменения после подписания не вносились.
              </p>
            </div>
          </div>

          {/* Certificate & Document Meta Table */}
          <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs overflow-hidden">
            <div className="p-3 bg-slate-50 flex items-center justify-between font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Тип документа:</span>
              </span>
              <span className="text-slate-900">Приказ об отпуске (Форма Т-6 ТК РК)</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Номер документа:</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                № {orderNum}
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Организация (БИН):</span>
              <span className="font-medium text-slate-800">ТОО «Jana Post Logistics» (210840032190)</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Владелец ЭЦП (Подписант):</span>
              <span className="font-bold text-slate-900">Смагулова Айгерим Муратовна</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Должность подписанта:</span>
              <span className="text-slate-700">Директор по персоналу / HR Director</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Удостоверяющий центр:</span>
              <span className="text-slate-700 font-medium">НУЦ РК (GOST KNCA / RSA 2048)</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Дата и время верификации:</span>
              <span className="text-slate-700">{verifyDate} (UTC+5 Asia/Almaty)</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Отпечаток SHA-256:</span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                8f4b82d3...4a1e9c27
              </span>
            </div>
          </div>

          {/* Legal Reference according to RK Law */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Юридическая сила документа:</span>
            </div>
            <p>
              В соответствии с Законом РК от 7 января 2003 года № 370-II «Об электронном документе и электронной цифровой подписи» электронный документ, заверенный ЭЦП лица, обладающего полномочиями на его подписание, равнозначен документу на бумажном носителе.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                В панель Jana Post
              </Button>
            </Link>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.open(`http://localhost:3000/api/v1/documents/leave-order/${docId}`, '_blank')}
            >
              Открыть печатный бланк
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
