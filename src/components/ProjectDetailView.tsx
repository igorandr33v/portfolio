import React, { useEffect, useRef } from 'react';
import { Project, Category } from '../types';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Upload, Trash2, ArrowRight, ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectDetailViewProps {
  project: Project;
  categories: Category[];
  nextProject?: Project;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onUpdateImage: (projectId: string, imageUrl: string | undefined) => void;
  onUpdateGalleryImage: (projectId: string, index: number, imageUrl: string | undefined) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  categories,
  nextProject,
  onClose,
  onPrev,
  onNext,
  onUpdateImage,
  onUpdateGalleryImage,
}) => {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef1 = useRef<HTMLInputElement>(null);
  const galleryInputRef2 = useRef<HTMLInputElement>(null);
  const galleryInputRef3 = useRef<HTMLInputElement>(null);

  const category = categories.find((c) => c.id === project.categoryId);

  // Keyboard navigation: Escape to close, Left/Right arrow keys to cycle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  // Main cover upload handler
  const handleMainUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) onUpdateImage(project.id, result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gallery image upload handler
  const handleGalleryUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) onUpdateGalleryImage(project.id, index, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format services string with pipes as in the template
  const servicesText = project.services
    ? project.services.join(' | ')
    : project.tags?.join(' | ') || 'Identity | Design | Art Direction';

  // Format industry string
  const industryText = project.industry || project.client || 'Creative Industry';

  // Primary display title (like "THE VOID" in screenshot)
  const displayTitle = project.shortTitle || project.title;

  // Secondary subhead (like "WORLD BUILDING" in screenshot)
  const displaySubheading =
    project.subheading || `${category?.sectionTitle || 'DESIGN'} · ${project.year}`;

  const gallery = project.galleryImages || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col font-sans select-text pb-16"
    >
      {/* Top sticky navigation bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs w-full flex items-center justify-between py-3 mb-6 select-none border-b border-neutral-100">
        {/* Back to all projects */}
        <button
          type="button"
          onClick={onClose}
          className="group flex items-center gap-2 text-xs md:text-sm font-medium text-black hover:opacity-50 transition-opacity duration-300 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300" />
          <span>Назад к проектам</span>
        </button>

        {/* Project category & number tag */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-normal">
          <span className="font-semibold text-black">{project.number}</span>
          <span>/</span>
          <span>{category?.name || 'Проект'}</span>
        </div>

        {/* Top-right controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden md:inline-block text-[11px] uppercase tracking-widest text-neutral-400 mr-2 font-mono">
            HEADLINE
          </span>
          <button
            type="button"
            onClick={onPrev}
            className="p-1 text-neutral-500 hover:text-black transition-colors cursor-pointer"
            title="Предыдущий проект (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="p-1 text-neutral-500 hover:text-black transition-colors cursor-pointer"
            title="Следующий проект (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-black transition-colors ml-1 cursor-pointer"
            title="Закрыть (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION 1: MAIN TEMPLATE HERO (Matches screenshot exactly) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
        {/* LEFT COLUMN: Main Cover image */}
        <div className="relative w-full aspect-[4/3] lg:aspect-[1.15/1] bg-[#D9D9D9] overflow-hidden group flex items-center justify-center">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#D9D9D9] flex flex-col items-center justify-center p-6 text-neutral-500 select-none">
              <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-1">
                {project.number}
              </span>
              <p className="text-sm font-medium text-neutral-600 text-center max-w-xs">
                {project.title}
              </p>
              <p className="text-[11px] text-neutral-400 mt-2">
                Серый квадрат — обложка проекта
              </p>
            </div>
          )}

          {/* Quick upload / remove actions */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMainUpload}
            />
            <button
              type="button"
              onClick={() => mainInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-black/85 hover:bg-black text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer select-none"
            >
              <Upload className="w-3 h-3" />
              <span>{project.imageUrl ? 'Заменить' : 'Загрузить фото'}</span>
            </button>

            {project.imageUrl && (
              <button
                type="button"
                onClick={() => onUpdateImage(project.id, undefined)}
                className="px-2 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer select-none"
                title="Вернуть серый квадрат"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Typography & Structured Table matching screenshot */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Main large display title (like "THE VOID") */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-normal uppercase tracking-tight text-black leading-none">
              {displayTitle}
            </h2>

            {/* Subheading (like "WORLD BUILDING") */}
            <h3 className="text-lg sm:text-xl lg:text-2xl font-light uppercase tracking-wider text-neutral-400 mt-5 lg:mt-7 leading-tight">
              {displaySubheading}
            </h3>
          </div>

          {/* Structured Rows Table matching screenshot */}
          <div className="mt-8 lg:mt-12 space-y-0 text-sm">
            {/* ROW 1: OBJECTIVE */}
            <div className="border-t border-neutral-200 py-4 flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-black w-24 lg:w-28 shrink-0 pt-0.5">
                OBJECTIVE
              </span>
              <p className="flex-1 text-xs md:text-sm text-neutral-800 leading-relaxed font-normal">
                {project.objective || project.description}
              </p>
            </div>

            {/* ROW 2: SERVICES */}
            <div className="border-t border-neutral-200 py-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-black w-24 lg:w-28 shrink-0">
                SERVICES
              </span>
              <p className="flex-1 text-xs md:text-sm text-neutral-800 font-normal">
                {servicesText}
              </p>
            </div>

            {/* ROW 3: INDUSTRY */}
            <div className="border-t border-neutral-200 py-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-black w-24 lg:w-28 shrink-0">
                INDUSTRY
              </span>
              <p className="flex-1 text-xs md:text-sm text-neutral-800 font-normal">
                {industryText}
              </p>
            </div>

            {/* ROW 4: CLIENT & YEAR */}
            <div className="border-t border-neutral-200 py-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-black w-24 lg:w-28 shrink-0">
                CLIENT / YEAR
              </span>
              <p className="flex-1 text-xs md:text-sm text-neutral-800 font-normal">
                {project.client} · {project.year}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WIDE EDITORIAL SHOWCASE BANNER (Scrollable case study content) */}
      <div className="mt-16 lg:mt-24 w-full">
        <div className="relative w-full aspect-[2.1/1] bg-[#D9D9D9] overflow-hidden group flex items-center justify-center">
          {gallery[0] ? (
            <img
              src={gallery[0]}
              alt={`${project.title} - Showcase`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#D9D9D9] flex flex-col items-center justify-center p-6 text-neutral-500 select-none">
              <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-1">
                EDITORIAL SHOWCASE
              </span>
              <p className="text-sm font-medium text-neutral-600 text-center max-w-sm">
                Масштабная визуализация айдентики и системы носителей
              </p>
            </div>
          )}

          {/* Upload action */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <input
              ref={galleryInputRef1}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleGalleryUpload(0)}
            />
            <button
              type="button"
              onClick={() => galleryInputRef1.current?.click()}
              className="px-2.5 py-1.5 bg-black/85 hover:bg-black text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer select-none"
            >
              <Upload className="w-3 h-3" />
              <span>{gallery[0] ? 'Заменить' : 'Загрузить фото'}</span>
            </button>
            {gallery[0] && (
              <button
                type="button"
                onClick={() => onUpdateGalleryImage(project.id, 0, undefined)}
                className="px-2 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer select-none"
                title="Сбросить"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Масштабный визуальный контекст и ключевые носители фирменного стиля
        </p>
      </div>

      {/* SECTION 3: TWO-COLUMN DETAIL SHOTS (Packaging / Mockups / Details) */}
      <div className="mt-12 lg:mt-16 w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Detail Shot 1 */}
        <div>
          <div className="relative w-full aspect-[4/3] bg-[#D9D9D9] overflow-hidden group flex items-center justify-center">
            {gallery[1] ? (
              <img
                src={gallery[1]}
                alt={`${project.title} - Detail 1`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#D9D9D9] flex flex-col items-center justify-center p-6 text-neutral-500 select-none">
                <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-1">
                  DETAIL / MATERIAL
                </span>
                <p className="text-xs text-neutral-500 text-center">
                  Упаковка, фактуры и тактильные материалы
                </p>
              </div>
            )}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
              <input
                ref={galleryInputRef2}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleGalleryUpload(1)}
              />
              <button
                type="button"
                onClick={() => galleryInputRef2.current?.click()}
                className="px-2.5 py-1.5 bg-black/85 hover:bg-black text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer select-none"
              >
                <Upload className="w-3 h-3" />
                <span>{gallery[1] ? 'Заменить' : 'Загрузить фото'}</span>
              </button>
              {gallery[1] && (
                <button
                  type="button"
                  onClick={() => onUpdateGalleryImage(project.id, 1, undefined)}
                  className="px-2 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer select-none"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Детали реализации: полиграфия и печатные носители
          </p>
        </div>

        {/* Detail Shot 2 */}
        <div>
          <div className="relative w-full aspect-[4/3] bg-[#D9D9D9] overflow-hidden group flex items-center justify-center">
            {gallery[2] ? (
              <img
                src={gallery[2]}
                alt={`${project.title} - Detail 2`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#D9D9D9] flex flex-col items-center justify-center p-6 text-neutral-500 select-none">
                <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-1">
                  DIGITAL / INTERFACE
                </span>
                <p className="text-xs text-neutral-500 text-center">
                  Цифровые носители, типографика и анимация
                </p>
              </div>
            )}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
              <input
                ref={galleryInputRef3}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleGalleryUpload(2)}
              />
              <button
                type="button"
                onClick={() => galleryInputRef3.current?.click()}
                className="px-2.5 py-1.5 bg-black/85 hover:bg-black text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer select-none"
              >
                <Upload className="w-3 h-3" />
                <span>{gallery[2] ? 'Заменить' : 'Загрузить фото'}</span>
              </button>
              {gallery[2] && (
                <button
                  type="button"
                  onClick={() => onUpdateGalleryImage(project.id, 2, undefined)}
                  className="px-2 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer select-none"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Цифровой контекст: экраны и адаптивная сетка
          </p>
        </div>
      </div>

      {/* SECTION 4: DESIGN PHILOSOPHY & NOTES */}
      <div className="mt-16 lg:mt-20 pt-8 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            01 / КОНЦЕПЦИЯ
          </span>
          <p className="text-xs md:text-sm text-neutral-700 mt-2 leading-relaxed font-normal">
            Визуальный язык выстроен на контрасте лаконичных архитектурных объемов и легкой типографики. Чистые формы подчеркивают индивидуальность продукта.
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            02 / ТИПОГРАФИКА
          </span>
          <p className="text-xs md:text-sm text-neutral-700 mt-2 leading-relaxed font-normal">
            Использование гротеска Manrope обеспечивает идеальную читаемость во всех масштабах: от микро-бирок до крупноформатной наружной рекламы.
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            03 / МАТЕРИАЛЫ
          </span>
          <p className="text-xs md:text-sm text-neutral-700 mt-2 leading-relaxed font-normal">
            Тактильные дизайнерские бумаги с хлопковыми волокнами, тиснение матовой фольгой и экологичные перерабатываемые материалы для упаковки.
          </p>
        </div>
      </div>

      {/* SECTION 5: FOOTER NAVIGATION (Next project & Back to grid) */}
      <div className="mt-16 lg:mt-24 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-6 select-none">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-medium text-black hover:opacity-50 transition-opacity cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Все проекты</span>
        </button>

        {nextProject && (
          <button
            type="button"
            onClick={onNext}
            className="group flex items-center gap-2 text-sm font-medium text-black hover:opacity-50 transition-opacity cursor-pointer"
          >
            <span>Следующий проект: <strong className="font-semibold">{nextProject.shortTitle || nextProject.title}</strong></span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        )}

        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-black transition-colors cursor-pointer"
        >
          <span>Наверх</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
