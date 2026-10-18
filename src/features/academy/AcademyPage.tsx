import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Course } from '@/types';
import { api } from '@/lib/api';

export const AcademyPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ['academyCourses'],
    queryFn: () => api.academy.getCourses(),
  });

  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const completedCount = courses.filter((c) => c.isCompleted).length;
  const overallProgress = courses.length > 0 ? Math.round((completedCount / courses.length) * 100) : 0;

  const handleStartCourse = (course: Course) => {
    setActiveCourse(course);
    setCurrentLessonIndex(0);
    setIsTakingQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const handleNextLesson = () => {
    if (!activeCourse) return;
    const nextIdx = currentLessonIndex + 1;
    const pct = Math.round((nextIdx / activeCourse.lessons.length) * 80);
    api.academy.updateProgress(activeCourse.id, pct).catch(() => {});
    if (currentLessonIndex < activeCourse.lessons.length - 1) {
      setCurrentLessonIndex(nextIdx);
    } else {
      setIsTakingQuiz(true);
    }
  };


  const handlePrevLesson = () => {
    if (isTakingQuiz) {
      setIsTakingQuiz(false);
    } else if (currentLessonIndex > 0) {
      setCurrentLessonIndex((prev) => prev - 1);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeCourse) return;

    try {
      const res = await api.academy.submitQuiz(activeCourse.id, quizAnswers);
      setQuizScore(res.score);
      setQuizSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['academyCourses'] });

      if (res.passed) {
        toast.success(
          'Поздравляем! Курс успешно сдан 🎉',
          `Результат: ${res.score}%. Сертификат «${activeCourse.badgeName}» зафиксирован в кадровом реестре.`
        );
        setActiveCourse((prev) => (prev ? { ...prev, isCompleted: true, progressPercent: 100, score: res.score } : null));
      } else {
        toast.error(
          'Тест не пройден',
          `Результат: ${res.score}%. Для получения сертификата необходимо минимум 80% правильных ответов.`
        );
      }
    } catch (err: any) {
      toast.error('Ошибка отправки теста', err?.message);
    }
  };

  const handleResetCourse = async (courseId: string) => {
    await api.academy.updateProgress(courseId, 0).catch(() => {});
    queryClient.invalidateQueries({ queryKey: ['academyCourses'] });
    if (activeCourse?.id === courseId) {
      setActiveCourse((prev) => (prev ? { ...prev, isCompleted: false, progressPercent: 0, score: undefined } : null));
      setIsTakingQuiz(false);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(null);
      setCurrentLessonIndex(0);
    }
    toast.info('Прогресс сброшен', 'Вы можете пройти курс и проверочный тест заново.');
  };


  // If a course is active, render interactive Player
  if (activeCourse) {
    const currentLesson = activeCourse.lessons[currentLessonIndex];
    return (
      <div className="space-y-6 text-left max-w-5xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => setActiveCourse(null)}
          >
            В каталог курсов
          </Button>

          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
              Jana Academy LMS
            </span>
            <span className="text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-md block">
              {activeCourse.title}
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {isTakingQuiz
              ? 'Итоговый тест'
              : `Урок ${currentLessonIndex + 1} из ${activeCourse.lessons.length}`}
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-[#E4E7EC] shadow-sm p-6 sm:p-8 space-y-6">
          {!isTakingQuiz && currentLesson ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    Урок {currentLessonIndex + 1}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#101828] mt-1.5">
                    {currentLesson.title}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>~{currentLesson.durationMinutes} мин чтения</span>
                </div>
              </div>

              {/* Lesson body markdown */}
              <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4 whitespace-pre-wrap">
                {currentLesson.content}
              </div>

              {/* Bottom Next/Prev actions */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  onClick={handlePrevLesson}
                  disabled={currentLessonIndex === 0}
                >
                  Предыдущий урок
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  onClick={handleNextLesson}
                >
                  {currentLessonIndex < activeCourse.lessons.length - 1
                    ? 'Следующий урок'
                    : 'Перейти к тесту'}
                </Button>
              </div>
            </div>
          ) : (
            /* Quiz View */
            <div className="space-y-6">
              <div className="text-center space-y-1 pb-4 border-b border-slate-100">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-purple-100 text-purple-700">
                  Итоговая аттестация
                </span>
                <h2 className="text-2xl font-black text-[#101828]">
                  Проверочный тест по курсу
                </h2>
                <p className="text-xs text-[#667085]">
                  Ответьте на 3 вопроса для подтверждения квалификации и получения корпоративного бейджа
                </p>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {activeCourse.quiz.map((q, qIndex) => {
                  const selectedOptId = quizAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-left"
                    >
                      <h4 className="text-sm font-bold text-slate-900">
                        {qIndex + 1}. {q.question}
                      </h4>

                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isSelected = selectedOptId === opt.id;
                          let optStyle =
                            'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/40';

                          if (quizSubmitted) {
                            if (opt.isCorrect) {
                              optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                            } else if (isSelected && !opt.isCorrect) {
                              optStyle = 'bg-red-50 border-red-500 text-red-900 line-through';
                            }
                          } else if (isSelected) {
                            optStyle = 'bg-blue-50 border-blue-600 text-blue-900 font-semibold shadow-xs';
                          }

                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleSelectOption(q.id, opt.id)}
                              disabled={quizSubmitted}
                              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt.text}</span>
                              {quizSubmitted && opt.isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-2.5 rounded-xl bg-blue-50/80 text-[11px] text-blue-900 border border-blue-200">
                          <b>Пояснение:</b> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quiz Submit Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  onClick={handlePrevLesson}
                >
                  Вернуться к урокам
                </Button>

                {!quizSubmitted ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < activeCourse.quiz.length}
                  >
                    Завершить и проверить тест
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    {quizScore !== null && (
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        Результат: {quizScore}%
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<RotateCcw className="w-4 h-4 text-slate-500" />}
                      onClick={() => handleResetCourse(activeCourse.id)}
                    >
                      Пройти заново
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Award className="w-4 h-4" />}
                      onClick={() => setActiveCourse(null)}
                    >
                      Завершить курс
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-[#111827] text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Корпоративный университет Jana Post
              </span>
              <span className="text-xs text-slate-300 font-mono">
                LMS модуль • Сертификация
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Jana Academy
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Обучающие курсы, стандарты работы, знание норм Трудового кодекса РК (ст. 88) и правила информационной безопасности логистического оператора.
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center min-w-[200px] shrink-0">
            <div className="text-3xl font-black text-white">{overallProgress}%</div>
            <span className="text-xs text-blue-200 block mt-0.5 font-medium">
              Пройдено {completedCount} из {courses.length} курсов
            </span>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-3">
              <div
                style={{ width: `${overallProgress}%` }}
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Catalog Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#101828]">Каталог назначенных курсов</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {courses.length} программы
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                    {course.category}
                  </span>
                  {course.isCompleted ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Завершено (100%)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      В процессе
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-[#101828] leading-snug">
                  {course.title}
                </h3>

                <p className="text-xs text-[#667085] line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span>{course.lessonsCount} урока</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>~{course.estimatedMinutes} мин</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Бейдж: {course.badgeName}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer / Action */}
              <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Прогресс усвоения
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${course.progressPercent}%` }}
                        className={`h-full ${
                          course.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {course.progressPercent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {course.isCompleted && (
                    <button
                      onClick={() => handleResetCourse(course.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      title="Сбросить прогресс и пройти заново"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <Button
                    variant={course.isCompleted ? 'outline' : 'primary'}
                    size="sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => handleStartCourse(course)}
                  >
                    {course.isCompleted ? 'Повторить материал' : 'Начать обучение'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
