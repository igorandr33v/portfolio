import React, { useEffect, useRef, useState } from 'react';
import { Project } from '../types';
import { ArrowLeft, Upload, ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';
import { compressImageFile } from '../utils/imageCompressor';
import { resolveImageUrl, getImageDimensions } from '../utils/imageUtils';

interface ProjectDetailViewProps {
  project: Project;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onAddGalleryImages: (projectId: string, images: string[]) => void;
  onRemoveGalleryImage: (projectId: string, index: number) => void;
  onUpdateGalleryImage: (projectId: string, index: number, imageUrl: string | undefined) => void;
}

/**
 * High-performance case study slide item.
 * Fixes container proportions using CSS aspect-ratio and HTML width/height to eliminate
 * Cumulative Layout Shift (CLS) and ensure lazy-loading only downloads images when scrolled into view.
 */
const CaseStudySlide: React.FC<{
  projectTitle: string;
  img: string;
  idx: number;
}> = ({ projectTitle, img, idx }) => {
  const resolved = resolveImageUrl(img);
  const dims = getImageDimensions(img);
  const [dynamicRatio, setDynamicRatio] = useState<string | undefined>(undefined);

  const effectiveRatio = dims?.aspectRatio || dynamicRatio;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: '0px 0px -40px 0px' }}
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
        delay: idx === 0 ? 0.05 : 0,
      }}
      className="w-full flex justify-center"
    >
      <div
        className="w-full max-w-full overflow-hidden bg-white"
        style={{
          aspectRatio: effectiveRatio,
        }}
      >
        <img
          src={resolved}
          alt={`${projectTitle} — слайд ${idx + 1}`}
          width={dims?.width}
          height={dims?.height}
          loading={idx === 0 ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={(e) => {
            if (!dims) {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth && naturalHeight) {
                setDynamicRatio(`${naturalWidth} / ${naturalHeight}`);
              }
            }
          }}
          className="w-full h-auto object-contain block select-none pointer-events-none"
          style={{
            aspectRatio: effectiveRatio,
          }}
        />
      </div>
    </motion.div>
  );
};

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
          {images.map((img, idx) => (
            <CaseStudySlide
              key={`${project.id}-img-${idx}`}
              projectTitle={project.title}
              img={img}
              idx={idx}
            />
          ))}

          {/* Bottom navigation */}
          <div className="w-full pt-8 flex flex-col items-center">
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
