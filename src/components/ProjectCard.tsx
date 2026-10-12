import React from 'react';
import { Project } from '../types';
import { resolveImageUrl } from '../utils/imageUtils';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const resolvedSrc = resolveImageUrl(project.imageUrl);
  const hasImage = Boolean(resolvedSrc);

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
      className="group relative w-full h-full aspect-[1.48/1] lg:aspect-auto bg-[#D9D9D9] overflow-hidden cursor-pointer select-none transition-transform duration-500 ease-out hover:scale-[1.018] focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
    >
      {/* If real image is uploaded */}
      {hasImage ? (
        <img
          src={resolvedSrc}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        /* Default grey rectangle cover matching the Figma mockup */
        <div className="w-full h-full bg-[#D9D9D9] transition-colors duration-400 ease-out group-hover:bg-[#CECECE]" />
      )}


      {/* Subtle modern hover overlay with project title only */}
      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out p-4 md:p-5 flex flex-col justify-end text-white pointer-events-none">
        <h4 className="text-sm md:text-base font-semibold leading-snug line-clamp-2 text-white">
          {project.title}
        </h4>
      </div>
    </article>
  );
};
