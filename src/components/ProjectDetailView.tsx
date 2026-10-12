import React, { useEffect, useRef } from 'react';
import { Project } from '../types';
import { ArrowLeft, Upload, Trash2, ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';
import { compressImageFile } from '../utils/imageCompressor';
import { resolveImageUrl } from '../utils/imageUtils';

interface ProjectDetailViewProps {
  project: Project;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onAddGalleryImages: (projectId: string, images: string[]) => void;
  onRemoveGalleryImage: (projectId: string, index: number) => void;
  onUpdateGalleryImage: (projectId: string, index: number, imageUrl: string | undefined) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onClose,
  onPrev,
  onNext,
  onAddGalleryImages,
  onRemoveGalleryImage,
  onUpdateGalleryImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Keyboard navigation: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  const handleMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const compressedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImageFile(files[i]);
        compressedList.push(compressed);
      }
      onAddGalleryImages(project.id, compressedList);
    } catch (err) {
      console.error('Failed to process image:', err);
    }
    if (e.target) e.target.value = '';
  };

  const handleReplaceUpload = (index: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        onUpdateGalleryImage(project.id, index, compressed);
      } catch (err) {
        console.error('Failed to replace image:', err);
      }
    }
    if (e.target) e.target.value = '';
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const images = (project.galleryImages || []).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full min-h-[70vh] bg-white font-sans flex flex-col"
    >
      {/* Hidden file input for adding multiple images */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleMultipleUpload}
      />

      {/* If no images uploaded yet: clean white background with minimal elegant upload trigger */}
      {images.length === 0 ? (
        <div className="w-full flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center select-none">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center gap-3.5 px-8 py-12 sm:px-14 sm:py-16 border border-dashed border-neutral-300 hover:border-black rounded-lg transition-colors cursor-pointer bg-white"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
              <Upload className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
            </div>
            <div className="flex flex-col gap-1 items-center">
              <span className="text-sm sm:text-base font-medium text-black">
                Загрузить изображения проекта
              </span>
              <span className="text-xs text-neutral-400">
                PNG, JPG, WebP — можно выбрать несколько файлов
              </span>
            </div>
          </button>
        </div>
      ) : (
        /* If images uploaded: seamless vertical showcase on pure white background */
        <div className="w-full flex flex-col gap-6 sm:gap-8 md:gap-10 pt-2 pb-16">
          {images.map((img, idx) => {
            const resolved = resolveImageUrl(img);
            return (
              <motion.div
                key={`${project.id}-img-${idx}`}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08, margin: '0px 0px -40px 0px' }}
                transition={{
                  duration: 0.75,
                  ease: [0.22, 1, 0.36, 1],
                  delay: idx < 2 ? idx * 0.15 : 0,
                }}
                className="relative group w-full flex justify-center"
              >
                <img
                  src={resolved}
                  alt={`${project.title} — слайд ${idx + 1}`}
                  className="w-full h-auto object-contain block select-none"
                  loading={idx < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                />

                {/* Subtle hover controls for this image */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/70 backdrop-blur-sm px-2 py-1.5 rounded select-none">
                  <input
                    ref={(el) => {
                      replaceInputRefs.current[idx] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleReplaceUpload(idx)}
                  />
                  <button
                    type="button"
                    onClick={() => replaceInputRefs.current[idx]?.click()}
                    className="px-2.5 py-1 bg-white text-black text-xs font-medium rounded hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Заменить
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveGalleryImage(project.id, idx)}
                    className="p-1 text-white hover:text-red-400 transition-colors cursor-pointer"
                    title="Удалить изображение"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Action to add more images and bottom navigation */}
          <div className="w-full pt-8 flex flex-col items-center gap-8">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 border border-neutral-300 hover:border-black text-xs sm:text-sm font-medium text-black transition-colors rounded cursor-pointer select-none"
            >
              <Upload className="w-4 h-4" />
              <span>Добавить ещё изображения</span>
            </button>

            <div className="w-full border-t border-neutral-200 pt-6 flex items-center justify-between select-none">
              <button
                type="button"
                onClick={onClose}
                className="group flex items-center gap-2 text-sm sm:text-base font-medium text-black hover:opacity-50 transition-opacity cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Назад</span>
              </button>

              <button
                type="button"
                onClick={scrollToTop}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-black transition-colors cursor-pointer"
              >
                <span>Наверх</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
