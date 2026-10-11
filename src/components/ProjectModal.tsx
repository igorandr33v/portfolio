import React, { useEffect, useRef } from 'react';
import { Project, Category } from '../types';
import { X, ChevronLeft, ChevronRight, Upload, Trash2 } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  categories: Category[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onUpdateImage: (projectId: string, imageUrl: string | undefined) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  categories,
  onClose,
  onPrev,
  onNext,
  onUpdateImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose, onPrev, onNext]);

  if (!project) return null;

  const category = categories.find((c) => c.id === project.categoryId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          onUpdateImage(project.id, result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onUpdateImage(project.id, undefined);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-wider text-black">
              {project.number}
            </span>
            <span className="text-neutral-300">/</span>
            <span className="text-sm text-neutral-600">
              {category?.name || 'Проект'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
              title="Предыдущий проект (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
              title="Следующий проект (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors ml-2"
              title="Закрыть (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Cover image preview / grey placeholder */}
          <div className="relative w-full aspect-[1.48/1] bg-[#D9D9D9] overflow-hidden flex items-center justify-center">
            {project.imageUrl ? (
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-neutral-500">
                <p className="text-sm font-medium tracking-wide text-neutral-600 mb-2">
                  Серая обложка (макет)
                </p>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Вы можете загрузить изображение для этого проекта прямо сейчас или позже
                </p>
              </div>
            )}

            {/* Quick Upload Action floating in corner */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {project.imageUrl ? 'Заменить обложку' : 'Загрузить изображение'}
              </button>

              {project.imageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-2.5 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer"
                  title="Вернуть серый квадрат"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-4">
            <div>
              <h3
                id="modal-title"
                className="text-xl md:text-2xl font-bold tracking-tight text-black"
              >
                {project.title}
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Клиент: {project.client} · {project.year} год
              </p>
            </div>

            <p className="text-neutral-700 text-sm md:text-base leading-relaxed">
              {project.description}
            </p>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
