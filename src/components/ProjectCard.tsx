import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Project } from '../types';
import { resolveImageUrl, getImageDimensions } from '../utils/imageUtils';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const resolvedSrc = resolveImageUrl(project.imageUrl);
  const hasImage = Boolean(resolvedSrc);
  const dims = getImageDimensions(project.imageUrl);
  const isLogo = project.categoryId === 'logo';
  const isDigital = project.categoryId === 'web';

  // Handle ESC key to close lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const handleClick = () => {
    if (isDigital) {
      setIsLightboxOpen(true);
    } else {
      onSelect(project);
    }
  };

  return (
    <>
      <article
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label={`${project.number}: ${project.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`group relative overflow-hidden cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 ${
          isDigital
            ? 'w-full aspect-[1604/812] bg-transparent'
            : `w-full h-full aspect-[1.48/1] transition-all duration-500 ease-out hover:scale-[1.018] ${
                isLogo && hasImage
                  ? 'bg-white border border-neutral-200/80 hover:border-black/40'
                  : 'bg-[#D9D9D9]'
              }`
        }`}
        style={isDigital && dims?.aspectRatio ? { aspectRatio: dims.aspectRatio } : undefined}
      >
        {/* Image rendering */}
        {hasImage ? (
          isDigital ? (
            <img
              src={resolvedSrc}
              alt={project.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              width={dims?.width || 1604}
              height={dims?.height || 812}
              className="w-full h-full object-contain pointer-events-none"
            />
          ) : isLogo ? (
            <div className="w-full h-full flex items-center justify-center p-5 sm:p-7 md:p-8 bg-white">
              <img
                src={resolvedSrc}
                alt={project.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                width={dims?.width || 500}
                height={dims?.height || 250}
                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          ) : (
            <img
              src={resolvedSrc}
              alt={project.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              width={dims?.width || 1172}
              height={dims?.height || 732}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )
        ) : (
          /* Default grey rectangle cover */
          <div className="w-full h-full bg-[#D9D9D9] transition-colors duration-400 ease-out group-hover:bg-[#CECECE]" />
        )}

        {/* Hover overlay: only for non-digital projects */}
        {!isDigital && (
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out p-3 sm:p-4 md:p-5 flex flex-col justify-end text-white pointer-events-none">
            <h4 className="text-xs sm:text-sm md:text-base font-semibold leading-snug line-clamp-2 text-white">
              {project.title}
            </h4>
          </div>
        )}
      </article>

      {/* Fullscreen Lightbox for Digital project */}
      {isDigital &&
        isLightboxOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
              onClick={() => setIsLightboxOpen(false)}
            >
              {/* Close Button */}
              <div
                className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="Закрыть"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Fullscreen Image Container */}
              <div
                className="relative max-w-[95vw] max-h-[90vh] w-auto h-auto flex items-center justify-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  src={resolvedSrc}
                  alt={project.title}
                  width={dims?.width || 1604}
                  height={dims?.height || 812}
                  className="max-w-full max-h-[90vh] w-auto h-auto object-contain select-none shadow-2xl"
                />
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
