/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { CATEGORIES, INITIAL_PROJECTS } from './data/projectsData';
import { Project } from './types';
import { CategoryNav } from './components/CategoryNav';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetailView } from './components/ProjectDetailView';
import { Toast } from './components/Toast';
import { Logo } from './components/Logo';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { AnimatedBurgerButton } from './components/AnimatedBurgerButton';
import { ArrowLeft } from 'lucide-react';

// Choreographed stagger container variants for the project grid
const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.32, 0, 0.67, 0] as const,
    },
  },
};

// Smooth organic card appearance animation
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('igor_andreev_projects');
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        return INITIAL_PROJECTS.map((initP) => {
          const match = parsed.find((p) => p.id === initP.id);
          if (!match) return initP;

          // For Croydon (b-1), ensure the updated 8 case study images and new cover.webp preview are loaded
          if (initP.id === 'b-1') {
            const isUserCustomUpload = match.imageUrl?.startsWith('data:');
            const targetImageUrl = isUserCustomUpload ? match.imageUrl : initP.imageUrl;

            const updatedGallery = match.galleryImages?.map((img) =>
              img.includes('croydon-cover') ? './images/cover.webp' : img
            );

            const hasCompleteGallery =
              updatedGallery &&
              updatedGallery.length >= 8 &&
              updatedGallery.some((img) => img.includes('jersey.webp'));

            return {
              ...initP,
              imageUrl: targetImageUrl,
              galleryImages: hasCompleteGallery
                ? updatedGallery
                : initP.galleryImages,
            };
          }

          return {
            ...initP,
            imageUrl: match.imageUrl || initP.imageUrl,
            galleryImages:
              match.galleryImages && match.galleryImages.length > 0
                ? match.galleryImages
                : initP.galleryImages,
          };
        });
      }
    } catch {
      // fallback
    }
    return INITIAL_PROJECTS;
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string>('branding');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('igor_andreev_projects', JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleUpdateImage = (projectId: string, imageUrl: string | undefined) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, imageUrl } : p))
    );
    setSelectedProject((prev) =>
      prev && prev.id === projectId ? { ...prev, imageUrl } : prev
    );
    showToast(imageUrl ? 'Изображение обновлено' : 'Обложка сброшена на серый квадрат');
  };

  const handleAddGalleryImages = (projectId: string, newImages: string[]) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const gallery = [...(p.galleryImages || []), ...newImages];
        return { ...p, galleryImages: gallery };
      })
    );
    setSelectedProject((prev) => {
      if (!prev || prev.id !== projectId) return prev;
      const gallery = [...(prev.galleryImages || []), ...newImages];
      return { ...prev, galleryImages: gallery };
    });
    showToast(`Загружено изображений: ${newImages.length}`);
  };

  const handleRemoveGalleryImage = (projectId: string, index: number) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const gallery = [...(p.galleryImages || [])];
        gallery.splice(index, 1);
        return { ...p, galleryImages: gallery };
      })
    );
    setSelectedProject((prev) => {
      if (!prev || prev.id !== projectId) return prev;
      const gallery = [...(prev.galleryImages || [])];
      gallery.splice(index, 1);
      return { ...prev, galleryImages: gallery };
    });
    showToast('Изображение удалено');
  };

  const handleUpdateGalleryImage = (
    projectId: string,
    index: number,
    imageUrl: string | undefined
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const gallery = [...(p.galleryImages || [])];
        gallery[index] = imageUrl || '';
        return { ...p, galleryImages: gallery };
      })
    );
    setSelectedProject((prev) => {
      if (!prev || prev.id !== projectId) return prev;
      const gallery = [...(prev.galleryImages || [])];
      gallery[index] = imageUrl || '';
      return { ...prev, galleryImages: gallery };
    });
    showToast(imageUrl ? 'Изображение обновлено' : 'Изображение удалено');
  };

  const currentCategoryProjects = projects.filter(
    (p) => p.categoryId === activeCategoryId
  );

  const currentIndex = selectedProject
    ? currentCategoryProjects.findIndex((p) => p.id === selectedProject.id)
    : -1;
  const nextProject =
    currentIndex >= 0
      ? currentCategoryProjects[(currentIndex + 1) % currentCategoryProjects.length]
      : undefined;

  const handlePrevProject = () => {
    if (!selectedProject) return;
    const prevIndex =
      (currentIndex - 1 + currentCategoryProjects.length) %
      currentCategoryProjects.length;
    setSelectedProject(currentCategoryProjects[prevIndex]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextProject = () => {
    if (!selectedProject) return;
    const nextIdx = (currentIndex + 1) % currentCategoryProjects.length;
    setSelectedProject(currentCategoryProjects[nextIdx]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setSelectedProject(null);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // Contacts block exactly as in desktop (adapted: wraps neatly on smaller screens)
  const renderContacts = () => (
    <div className="flex flex-wrap lg:flex-nowrap items-baseline justify-start lg:justify-end gap-x-5 sm:gap-x-6 md:gap-x-8 lg:gap-x-9 xl:gap-x-11 gap-y-1.5 text-sm sm:text-[14px] md:text-[15px] font-normal text-black pt-1 select-text">
      <a
        href="http://t.me/igorandr33v"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-50 transition-opacity duration-300 cursor-pointer whitespace-nowrap shrink-0"
      >
        telegram
      </a>
      <a
        href="https://www.instagram.com/igorandr33v/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-50 transition-opacity duration-300 cursor-pointer whitespace-nowrap shrink-0"
      >
        instagram
      </a>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText('igor.andreev.1997@gmail.com');
          showToast('Email скопирован: igor.andreev.1997@gmail.com');
        }}
        className="hover:opacity-50 transition-opacity duration-300 cursor-pointer whitespace-nowrap shrink-0 text-left"
        title="Нажмите, чтобы скопировать"
      >
        igor.andreev.1997@gmail.com
      </button>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText('8 909 702 3881');
          showToast('Телефон скопирован: 8 909 702 3881');
        }}
        className="hover:opacity-50 transition-opacity duration-300 cursor-pointer whitespace-nowrap shrink-0 text-left"
        title="Нажмите, чтобы скопировать"
      >
        8 909 702 3881
      </button>
    </div>
  );

  return (
    <div
      className={`relative w-full bg-white text-black font-sans selection:bg-neutral-900 selection:text-white min-h-screen overflow-y-auto ${
        selectedProject ? '' : 'select-none'
      }`}
    >
      {/* 
        LAYOUT CONTAINER:
        - Header at top (Title on left, Contacts on right)
        - Horizontal tabs aligned to right edge
        - Project covers below tabs arranged in 3 columns
        - Vector Logo in footer
      */}
      <div
        className={`w-full ${
          selectedProject
            ? 'px-5 sm:px-8 lg:px-[40px] py-6 lg:py-[40px] flex flex-col min-h-screen gap-6 lg:gap-[32px]'
            : 'px-4 sm:px-6 md:px-8 lg:px-[40px] pt-4 sm:pt-6 md:pt-8 lg:pt-[40px] pb-0 flex flex-col min-h-screen justify-between'
        } box-border`}
      >
        {/* ROW 1: Header (Fixed at top so Back button stays in place upon scroll) */}
        {selectedProject ? (
          <>
            <header className="fixed top-0 left-0 right-0 z-50 w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-5 sm:px-8 lg:px-[40px] py-4 lg:py-5 bg-white/95 backdrop-blur-xs transition-colors">
              <div className="flex items-center justify-between w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProject(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex items-center gap-2 py-1 text-sm sm:text-base font-medium text-black hover:opacity-50 transition-opacity cursor-pointer select-none"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:-translate-x-1" />
                  <span>Назад</span>
                </button>
                <AnimatedBurgerButton
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden"
                  aria-label={isMobileMenuOpen ? "Закрыть меню разделов" : "Открыть меню разделов"}
                />
              </div>
              {/* Contacts on desktop and mobile */}
              <div className="w-full lg:w-auto">
                {renderContacts()}
              </div>
            </header>
            {/* Spacer so the first slide is not obscured by the fixed header */}
            <div className="w-full h-12 sm:h-14 lg:h-16 shrink-0 pointer-events-none" aria-hidden="true" />
          </>
        ) : (
          <>
            {/* Desktop & Mobile Header Bar */}
            <header className="w-full flex items-baseline justify-between pb-3 sm:pb-5 lg:pb-0 shrink-0">
              <div className="flex items-center justify-between w-full lg:w-auto">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-[25px] font-bold uppercase tracking-[-0.02em] text-black leading-tight">
                  ГРАФИЧЕСКИЙ И БРЕНД-ДИЗАЙНЕР
                </h1>

                {/* Mobile Burger Menu Button (Top Right, hidden on desktop) */}
                <AnimatedBurgerButton
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden ml-4"
                  aria-label={isMobileMenuOpen ? "Закрыть меню разделов" : "Открыть меню разделов"}
                />
              </div>

              {/* Desktop: Contacts aligned to the right */}
              <div className="hidden lg:flex items-center justify-end">
                {renderContacts()}
              </div>
            </header>

            {/* Mobile Subheader (Contacts & Current Category) */}
            <div className="lg:hidden w-full flex flex-col gap-2.5 pb-4">
              <div className="w-full">
                {renderContacts()}
              </div>
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-neutral-800 uppercase">
                  {CATEGORIES.find((c) => c.id === activeCategoryId)?.fullName || 'Категория'}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {currentCategoryProjects.length} проектов
                </span>
              </div>
            </div>
          </>
        )}

        {/* MAIN BODY AREA */}
        {selectedProject ? (
          /* PROJECT CASE STUDY PAGE */
          <main className="w-full flex-1 min-h-0 pt-1 sm:pt-2">
            <ProjectDetailView
              project={selectedProject}
              onClose={() => {
                setSelectedProject(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPrev={handlePrevProject}
              onNext={handleNextProject}
              onAddGalleryImages={handleAddGalleryImages}
              onRemoveGalleryImage={handleRemoveGalleryImage}
              onUpdateGalleryImage={handleUpdateGalleryImage}
            />
          </main>
        ) : (
          /* MAIN GRID VIEW (Desktop: Horizontal Tabs Left-Aligned + 3-col Grid Below) */
          <>
            {/* DESKTOP TABS: Horizontal aligned to the left with 100px offset from header */}
            <div className="hidden lg:flex w-full items-center justify-start mt-[100px] pb-6 shrink-0">
              <CategoryNav
                categories={CATEGORIES}
                activeCategoryId={activeCategoryId}
                onSelectCategory={handleSelectCategory}
              />
            </div>

            {/* PROJECT CARDS GRID: Placed below tabs, arranged in 3 columns */}
            <main className="w-full flex-1 min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategoryId}
                  variants={gridContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-[20px]"
                >
                  {currentCategoryProjects.slice(0, 9).map((project) => (
                    <motion.div
                      key={project.id}
                      variants={cardVariants}
                      className="w-full min-h-[110px] sm:min-h-[140px] lg:min-h-0"
                    >
                      <ProjectCard
                        project={project}
                        onSelect={(p) => {
                          setSelectedProject(p);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* FOOTER: Vector Logo centered at bottom with 40px bottom offset */}
            <footer className="mt-10 sm:mt-12 lg:mt-16 pb-[40px] flex items-center justify-center">
              <div className="w-[120px] lg:w-[130px]">
                <Logo className="w-[120px] lg:w-[130px] h-auto text-black hover:opacity-75 transition-opacity duration-300" />
              </div>
            </footer>
          </>
        )}
      </div>

      {/* Mobile Navigation Drawer with burger menu */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={CATEGORIES}
        activeCategoryId={activeCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      {/* Copy Notification Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
