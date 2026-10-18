import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Sliders,
  Cpu,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ChatMessage } from '@/types';
import {
  askAiAssistant,
  POPULAR_QUESTIONS,
  AI_MODEL_BENCHMARKS,
} from './aiKnowledgeService';

export const AiAssistantPage: React.FC = () => {
  // Provider & Model state
  const [selectedProvider, setSelectedProvider] = useState<string>(
    () => localStorage.getItem('jp_ai_provider') || 'openrouter'
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    () => localStorage.getItem('jp_ai_model') || 'nvidia/nemotron-3.5-super-vl:free'
  );
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem('jp_ai_api_key') || ''
  );
  const [showKey, setShowKey] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [pingState, setPingState] = useState<{
    testing: boolean;
    latency?: number;
    success?: boolean;
    msg?: string;
  }>({ testing: false });

  const activeBenchmark = AI_MODEL_BENCHMARKS.find((b) => b.id === selectedModel) || AI_MODEL_BENCHMARKS[0];

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        'Здравствуйте! Я виртуальный **AI HR-консультант АО «Jana Post»**.\n\nЯ подключен к Трудовому кодексу Республики Казахстан (ТК РК ст. 88, 90, 92, 96, 108–110, 113, 182) и корпоративным регламентам логистической сети Jana Post 2026.\n\nГотов ответить на любые вопросы по отпускам, ночным сменам, выплатам зарплаты, авансам, справкам Т-2 и адаптации в Jana Academy. Ответы верифицируются статьями законодательства РК.',
      timestamp: new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Almaty', hour: '2-digit', minute: '2-digit' }),
      modelUsed: activeBenchmark.name,
      sources: [
        {
          title: 'Корпоративная база знаний HR Jana Post & ТК РК',
          document: 'Единый регламент кадровых сервисов 2026',
          section: 'Вводная нормативная часть',
          confidence: 1.0,
        },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSaveConfig = (newModel: string, newProvider: string, newKey: string) => {
    setSelectedModel(newModel);
    setSelectedProvider(newProvider);
    setApiKey(newKey);
    localStorage.setItem('jp_ai_model', newModel);
    localStorage.setItem('jp_ai_provider', newProvider);
    if (newKey.trim()) {
      localStorage.setItem('jp_ai_api_key', newKey.trim());
    } else {
      localStorage.removeItem('jp_ai_api_key');
    }
  };

  const handleTestConnection = async () => {
    setPingState({ testing: true });
    const start = Date.now();
    try {
      const testResponse = await askAiAssistant(
        'Проверка связи с AI сервисом',
        [],
        {
          provider: selectedProvider,
          model: selectedModel,
          apiKey: apiKey.trim() || undefined,
        }
      );
      const elapsed = Date.now() - start;
      setPingState({
        testing: false,
        latency: elapsed,
        success: true,
        msg: testResponse.isAiGenerated
          ? `Соединение успешно! Модель: ${testResponse.modelUsed} (${elapsed} мс)`
          : `Активен автономный RAG-справочник ТК РК (${elapsed} мс). Для доступа к live-LLM укажите бесплатный ключ OpenRouter.`,
      });
    } catch (err: any) {
      setPingState({
        testing: false,
        success: false,
        msg: `Ошибка проверки связи: ${err?.message || 'Сервис временно недоступен'}`,
      });
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Almaty', hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await askAiAssistant(query, messages, {
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey.trim() || undefined,
      });
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Произошла ошибка при обработке запроса: ${err?.message || 'Сервис временно недоступен'}. Пожалуйста, повторите попытку.`,
          timestamp: new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Almaty', hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Чат очищен. Задайте любой вопрос по кадровым процедурам, выплатам и нормам ТК РК в АО «Jana Post»!',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: activeBenchmark.name,
      },
    ]);
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Grounded AI • Jana Post
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              ТК РК Grounding Active
            </span>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 flex items-center gap-1 transition-colors"
            >
              <Cpu className="w-3 h-3 text-purple-600" />
              <span>Модель: {activeBenchmark.name}</span>
            </button>
          </div>
          <h1 className="text-2xl font-black text-[#101828] mt-1.5 tracking-tight">
            AI HR-Консультант
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            Юридически выверенные консультации по Трудовому кодексу РК (квоты 24 дня, праздники ст. 90, ночные 1.5x) и регламентам сети Jana Post.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sliders className="w-3.5 h-3.5 text-purple-600" />}
            onClick={() => setIsConfigOpen(true)}
          >
            API & Модели
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
            onClick={handleResetChat}
          >
            Новый диалог
          </Button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat Window */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E4E7EC] shadow-sm flex flex-col h-[660px] overflow-hidden">
          {/* Active Model Subheader */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700">Активный движок:</span>
              <span className="text-blue-600 font-mono font-medium">{activeBenchmark.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{activeBenchmark.latencyAvg}</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600 font-medium">ТК РК {activeBenchmark.rkComplianceScore}%</span>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-sm font-medium'
                      : msg.isOutOfScope
                      ? 'bg-amber-50/80 text-amber-900 border border-amber-200 rounded-bl-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {/* Assistant Meta Badge */}
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-200/50 text-[10px]">
                      <span className="font-semibold text-blue-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        {msg.modelUsed || activeBenchmark.name}
                      </span>
                      {msg.latencyMs && (
                        <span className="text-slate-400 font-mono">⚡ {msg.latencyMs} мс</span>
                      )}
                    </div>
                  )}

                  {/* Message body with Markdown support */}
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Grounded Sources Box */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                        Верифицированные источники ответа:
                      </span>
                      {msg.sources.map((src, i) => (
                        <div
                          key={i}
                          className="bg-white/80 p-2 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-0.5"
                        >
                          <div className="font-bold text-blue-900 flex items-center justify-between">
                            <span>{src.title}</span>
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                              {(src.confidence * 100).toFixed(0)}% достоверность
                            </span>
                          </div>
                          <p className="text-slate-500 font-mono text-[10px]">{src.document}</p>
                          <p className="text-slate-600 italic text-[10px]">{src.section}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <span
                    className={`text-[10px] block mt-1.5 text-right font-mono ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-9 h-9 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                    Я
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-slate-100 text-slate-600 rounded-2xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-150" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-300" />
                  <span className="ml-1 text-[11px] font-medium text-slate-700">
                    Анализ правовой базы ТК РК через {activeBenchmark.name}...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt chips suggestions */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Частые вопросы:</span>
            {POPULAR_QUESTIONS.slice(0, 3).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Задайте любой рабочий вопрос, расчет, проект приказа, справку по ТК РК или письмо..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Send className="w-4 h-4" />}
                disabled={!input.trim() || isTyping}
              >
                {isTyping ? 'Генерация...' : 'Спросить'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right: Knowledge Base & Intelligence Info */}
        <div className="lg:col-span-4 space-y-4">
          {/* Security & RAG Compliance Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Корпоративный AI-Интеллект</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Универсальный ассистент Jana Post: свободные, грамотные и развернутые ответы на любые деловые, аналитические, технические и организационные вопросы. При кадровых запросах — автоматическая строгая привязка к статьям ТК РК.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>✅ Верификация кадровых ответов по статьям ТК РК</div>
              <div>✅ Генерация деловых писем, инструкций, резюме и планов</div>
              <div>✅ Отказоустойчивый шлюз OpenRouter (NVIDIA Nemotron 3.5)</div>
              <div>✅ Нативная поддержка казахского и русского языков</div>
            </div>
          </div>

          {/* Test Questions to try */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Примеры сценариев и запросов
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Нажмите на любой вопрос для быстрой проверки ответов модели:
            </p>

            <div className="space-y-2">
              {POPULAR_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={isTyping}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all ${
                    idx === POPULAR_QUESTIONS.length - 1
                      ? 'bg-blue-50/60 border-blue-200 text-blue-900 hover:bg-blue-100'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span>{q}</span>
                    {idx === POPULAR_QUESTIONS.length - 1 && (
                      <span className="text-[9px] uppercase font-bold text-blue-700 bg-blue-200/70 px-1.5 py-0.2 rounded shrink-0">
                        Письмо & План
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Model & API Configuration Modal */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Настройки AI HR-Ассистента и выбор модели"
        description="Сравнение потенциала бесплатных нейросетевых API и управление ключами доступа"
        maxWidth="2xl"
      >
        <div className="space-y-6 text-left">
          {/* Comparison Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-600" />
              Сравнение моделей и скорости инференса
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Модель</th>
                    <th className="p-3">Скорость</th>
                    <th className="p-3">Контекст</th>
                    <th className="p-3">Точность ТК РК</th>
                    <th className="p-3">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {AI_MODEL_BENCHMARKS.map((b) => {
                    const isSelected = selectedModel === b.id;
                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-blue-50/50 font-medium' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {b.name}
                            {b.recommendation === 'RECOMMENDED' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                                Топ
                              </span>
                            )}
                            {b.recommendation === 'ULTRA_FAST' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800">
                                LPU Скорость
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{b.description}</p>
                        </td>
                        <td className="p-3 whitespace-nowrap text-slate-700 font-mono">
                          {b.latencyAvg}
                        </td>
                        <td className="p-3 whitespace-nowrap text-slate-600">
                          {b.contextWindow}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {b.rkComplianceScore}%
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant={isSelected ? 'primary' : 'outline'}
                            onClick={() => {
                              handleSaveConfig(b.id, b.provider, apiKey);
                            }}
                          >
                            {isSelected ? 'Активна' : 'Выбрать'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* API Key Configuration */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-600" />
                Пользовательский API Ключ (OpenRouter / Groq / Gemini)
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-1"
              >
                Получить бесплатный ключ на openrouter.ai
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-... (или оставьте пустым для серверного ключа / офлайн RAG)"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? 'Скрыть' : 'Показать'}
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  handleSaveConfig(selectedModel, selectedProvider, apiKey);
                  handleTestConnection();
                }}
              >
                Сохранить
              </Button>
            </div>

            {/* Helper status description */}
            <p className="text-[11px] text-slate-500 leading-normal">
              Ключ сохраняется локально в вашем браузере. Если ключ не указан, запросы направляются через серверный шлюз Jana Post либо обрабатываются автономной базой знаний с гарантией нулевых галлюцинаций.
            </p>

            {/* Test Connection Button & Ping Status */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200/60">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Zap className="w-3.5 h-3.5 text-amber-500" />}
                onClick={handleTestConnection}
                disabled={pingState.testing}
              >
                {pingState.testing ? 'Проверка соединения...' : 'Тест задержки (Ping)'}
              </Button>

              {pingState.msg && (
                <div
                  className={`text-xs flex items-center gap-1.5 font-medium ${
                    pingState.success ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {pingState.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{pingState.msg}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setIsConfigOpen(false)}>
              Готово
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
