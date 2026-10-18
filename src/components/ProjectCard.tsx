import React from 'react';
import { Project } from '../types';
import { resolveImageUrl, getImageDimensions } from '../utils/imageUtils';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const resolvedSrc = resolveImageUrl(project.imageUrl);
  const hasImage = Boolean(resolvedSrc);
  const dims = getImageDimensions(project.imageUrl);
  const isLogo = project.categoryId === 'logo';

  return (
    <article
      onClick={() => onSelect(project)}
      tabIndex={0}
      role="button"
      aria-label={`${project.number}: ${project.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(project);
        }
      }}
      className={`group relative w-full h-full aspect-[1.48/1] overflow-hidden cursor-pointer select-none transition-all duration-500 ease-out hover:scale-[1.018] focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 ${
        isLogo && hasImage
          ? 'bg-white border border-neutral-200/80 hover:border-black/40'
          : 'bg-[#D9D9D9]'
      }`}
    >
      {/* If real image is uploaded */}
      {hasImage ? (
        isLogo ? (
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
        /* Default grey rectangle cover matching the Figma mockup */
        <div className="w-full h-full bg-[#D9D9D9] transition-colors duration-400 ease-out group-hover:bg-[#CECECE]" />
      )}

      {/* Subtle modern hover overlay with project title only */}
      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out p-3 sm:p-4 md:p-5 flex flex-col justify-end text-white pointer-events-none">
        <h4 className="text-xs sm:text-sm md:text-base font-semibold leading-snug line-clamp-2 text-white">
          {project.title}
        </h4>
      </div>
    </article>
  );
};
