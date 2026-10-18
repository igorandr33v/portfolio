import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { LOGO_WORKS, LogoWorkItem } from '../data/projectsData';
import { resolveImageUrl } from '../utils/imageUtils';

export const LogoGrid: React.FC = () => {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const activeWork: LogoWorkItem | null =
    activeLightboxIndex !== null ? LOGO_WORKS[activeLightboxIndex] : null;

  const handlePrev = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + LOGO_WORKS.length) % LOGO_WORKS.length : 0
    );
  }, [activeLightboxIndex]);

  const handleNext = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % LOGO_WORKS.length : 0
    );
  }, [activeLightboxIndex]);

  const closeLightbox = useCallback(() => {
    setActiveLightboxIndex(null);
  }, []);

  // Keyboard controls for lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, closeLightbox, handlePrev, handleNext]);

  return (
    <div className="w-full">
      {/* 2-column on mobile, 3-column on desktop matching the portfolio layout */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-[20px]">
        {LOGO_WORKS.map((work, index) => {
          const resolvedSrc = resolveImageUrl(work.imageUrl);
          const isWide = work.width / work.height > 2;

          return (
            <article
              key={work.id}
              role="button"
              tabIndex={0}
              aria-label={`${work.number}: ${work.title}`}
              onClick={() => setActiveLightboxIndex(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveLightboxIndex(index);
                }
              }}
              className="group relative w-full aspect-[1.5/1] sm:aspect-[1.75/1] lg:aspect-[2.4/1] lg:max-h-[175px] xl:max-h-[185px] bg-white border border-neutral-200/90 hover:border-black transition-all duration-300 overflow-hidden cursor-pointer select-none flex items-center justify-center p-4 sm:p-5 lg:p-4 xl:p-5 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
            >
              {/* Logo Mark Centered with Optical Weight Balance */}
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={resolvedSrc}
                  alt={work.title}
                  loading="lazy"
                  decoding="async"
                  width={work.width}
                  height={work.height}
                  style={{ mixBlendMode: 'multiply' }}
                  className={`${
                    isWide ? 'max-w-[78%] max-h-[50%]' : 'max-w-[65%] max-h-[62%]'
                  } w-auto h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none`}
                />
              </div>


            </article>
          );
        })}
      </div>

      {/* Lightbox Modal for closer inspection of the logo design */}
      <AnimatePresence>
        {activeLightboxIndex !== null && activeWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={closeLightbox}
          >
            {/* Top Bar with Number, Title, Counter, and Close Button */}
            <div
              className="absolute top-4 left-4 sm:top-6 sm:left-8 right-4 sm:right-8 flex items-center justify-between text-white z-20 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div />

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="p-2 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Prev Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10"
              aria-label="Предыдущий логотип"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10"
              aria-label="Следующий логотип"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Main Lightbox Logo Showcase */}
            <div
              className="relative max-w-2xl w-full aspect-[1.48/1] bg-white rounded-sm shadow-2xl p-8 sm:p-14 flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={activeWork.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                src={resolveImageUrl(activeWork.imageUrl)}
                alt={activeWork.title}
                width={activeWork.width}
                height={activeWork.height}
                style={{ mixBlendMode: 'multiply' }}
                className="max-w-[85%] max-h-[70%] w-auto h-auto object-contain select-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
