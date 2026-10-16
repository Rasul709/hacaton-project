import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  FileText,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChatMessage } from '@/types';
import {
  queryHrAssistant,
  POPULAR_QUESTIONS,
  HR_KNOWLEDGE_BASE,
} from './aiKnowledgeService';

export const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        'Здравствуйте! Я официальный **AI HR-ассистент АО «Jana Post»**.\n\nЯ обучен по внутренней базе знаний компании, Трудовому кодексу Республики Казахстан (ТК РК ст. 88, ст. 113 и др.) и кадровым регламентам. Готов ответить на любые вопросы по отпускам, выплате авансов, получению справок и обучению в Jana Academy.\n\nКаждый мой ответ подтверждается ссылкой на официальный нормативный документ.',
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      sources: [
        {
          title: 'Корпоративная база знаний HR Jana Post',
          document: 'Единый регламент кадровых сервисов 2026',
          section: 'Вводная часть',
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

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate smart AI inference delay
    setTimeout(() => {
      const response = queryHrAssistant(query);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Чат очищен. Готов ответить на ваши вопросы по кадровым процессам Jana Post!',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Корпоративный AI • Jana Post
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              RAG Guardrails Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#101828] mt-1 tracking-tight">
            AI HR-Ассистент
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            Мгновенные консультации по кадровым регламентам, ст. 88 ТК РК, авансам и справкам с подтверждением источников.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
          onClick={handleResetChat}
        >
          Новый диалог
        </Button>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat Window */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E4E7EC] shadow-sm flex flex-col h-[650px] overflow-hidden">
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
                              {(src.confidence * 100).toFixed(0)}% совпадение
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
                <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-2 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-150" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-300" />
                  <span className="ml-1 text-[11px] font-medium">Поиск в базе знаний Jana Post...</span>
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
                placeholder="Задайте вопрос по отпускам, авансам, ТК РК или справкам..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Send className="w-4 h-4" />}
                disabled={!input.trim()}
              >
                Спросить
              </Button>
            </form>
          </div>
        </div>

        {/* Right: Knowledge Base & Guardrail Info */}
        <div className="lg:col-span-4 space-y-4">
          {/* Security & RAG Compliance Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AI-Безопасность (Guardrails)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ассистент жестко заземлен на официальную базу знаний АО «Jana Post». При вопросах вне HR-контекста модель не придумывает факты, а выдает регламентированный отказ с предложением эскалации в HR-отдел.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>✅ Персональные данные защищены</div>
              <div>✅ Проверка релевантности по ТК РК</div>
              <div>✅ Защита от prompt-инъекций</div>
            </div>
          </div>

          {/* Test Questions to try for Jury */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Сценарии для проверки жюри
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Нажмите на любой вопрос, чтобы мгновенно протестировать поведение модели:
            </p>

            <div className="space-y-2">
              {POPULAR_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all ${
                    idx === POPULAR_QUESTIONS.length - 1
                      ? 'bg-amber-50/60 border-amber-200 text-amber-800 hover:bg-amber-100'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span>{q}</span>
                    {idx === POPULAR_QUESTIONS.length - 1 && (
                      <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded shrink-0">
                        Тест отказа
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
