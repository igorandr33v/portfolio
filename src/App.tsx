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

          // For Croydon (b-1), ensure the updated 8 case study images (.webp) are always loaded
          if (initP.id === 'b-1') {
            const hasCompleteGallery =
              match.galleryImages &&
              match.galleryImages.length >= 8 &&
              match.galleryImages.some((img) => img.includes('jersey.webp'));

            return {
              ...initP,
              imageUrl: match.imageUrl || initP.imageUrl,
              galleryImages: hasCompleteGallery
                ? match.galleryImages
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

  // Contacts block exactly as in desktop (adapted: wraps neatly on smaller screens)
  const renderContacts = () => (
    <div className="flex flex-wrap lg:flex-nowrap items-baseline justify-start lg:justify-end gap-x-5 sm:gap-x-6 md:gap-x-8 lg:gap-x-9 xl:gap-x-11 gap-y-1.5 text-sm sm:text-[14px] md:text-[15px] font-normal text-black pt-1 select-text">
      <a
        href="https://t.me/igor_andreev"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-50 transition-opacity duration-300 whitespace-nowrap shrink-0"
      >
        telegram
      </a>
      <a
        href="https://instagram.com/igor.andreev"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-50 transition-opacity duration-300 whitespace-nowrap shrink-0"
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
      className={`relative w-full bg-white text-black font-sans selection:bg-neutral-900 selection:text-white ${
        selectedProject
          ? 'min-h-screen overflow-y-auto'
          : 'min-h-screen overflow-y-auto lg:w-screen lg:h-screen lg:overflow-hidden select-none'
      }`}
    >
      {/* 
        LAYOUT CONTAINER:
        - Mobile: Natural vertical scroll, exact desktop elements and fonts adapted to screen width.
        - Desktop: Strict 5x5 single-screen grid without scrolling (when on main page).
      */}
      <div
        className={`w-full ${
          selectedProject
            ? 'px-[40px] py-6 lg:py-[40px] flex flex-col min-h-screen gap-6 lg:gap-[32px]'
            : 'p-4 sm:p-6 md:p-8 lg:p-[40px] flex flex-col min-h-screen lg:h-full lg:grid lg:grid-cols-5 lg:grid-rows-5 gap-4 sm:gap-6 lg:gap-[20px]'
        } box-border`}
      >
        {/* ROW 1: Header */}
        {selectedProject ? (
          <header className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 pb-2">
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
        ) : (
          <>
            {/* Desktop: Title in Col 1-2 | Mobile: Header with Burger */}
            <div className="lg:col-start-1 lg:col-span-2 lg:row-start-1 flex flex-col justify-start">
              <div className="flex items-center justify-between w-full">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-[25px] font-bold uppercase tracking-[-0.02em] text-black leading-tight">
                  ГРАФИЧЕСКИЙ И БРЕНД-ДИЗАЙНЕР
                </h1>

                {/* Mobile Burger Menu Button (Top Right, hidden on desktop) */}
                <AnimatedBurgerButton
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden"
                  aria-label={isMobileMenuOpen ? "Закрыть меню разделов" : "Открыть меню разделов"}
                />
              </div>

              {/* Contacts directly on mobile under title using exact same text and font */}
              <div className="lg:hidden w-full mt-2 sm:mt-3">
                {renderContacts()}
              </div>
            </div>

            {/* Desktop: Contacts in Col 3-5 */}
            <div className="hidden lg:flex lg:col-start-3 lg:col-span-3 lg:row-start-1 items-start justify-end">
              {renderContacts()}
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
          /* MAIN GRID VIEW */
          <>
            {/* DESKTOP ONLY: Row 2, Col 1 Navigation Tabs (01 / Брендинг, etc.) */}
            <div className="hidden lg:flex lg:col-start-1 lg:row-start-2 lg:row-span-2 flex-col justify-start">
              <CategoryNav
                categories={CATEGORIES}
                activeCategoryId={activeCategoryId}
                onSelectCategory={(id) => setActiveCategoryId(id)}
              />
            </div>

            {/* PROJECT CARDS GRID (Mobile: 1 col or 2 cols on tablet | Desktop: 3x3 strict grid) */}
            <div className="w-full flex-1 min-h-0 lg:col-start-3 lg:col-span-3 lg:row-start-2 lg:row-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategoryId}
                  variants={gridContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 gap-4 sm:gap-5 lg:gap-[20px]"
                >
                  {currentCategoryProjects.slice(0, 9).map((project) => (
                    <motion.div
                      key={project.id}
                      variants={cardVariants}
                      className="w-full h-full min-h-[140px] lg:min-h-0"
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
            </div>

            {/* DESKTOP ONLY: Row 5, Col 1 User Vector SVG Logo */}
            <div className="hidden lg:flex lg:col-start-1 lg:row-start-5 items-end pb-1">
              <div className="w-[130px]">
                <Logo className="w-[130px] h-auto text-black hover:opacity-75 transition-opacity duration-300" />
              </div>
            </div>

            {/* MOBILE ONLY: Vector Logo at bottom of projects */}
            <div className="mt-8 pt-4 flex items-center justify-start lg:hidden pb-6">
              <div className="w-[120px]">
                <Logo className="w-[120px] h-auto text-black" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Navigation Drawer with burger menu */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={CATEGORIES}
        activeCategoryId={activeCategoryId}
        onSelectCategory={(id) => {
          setActiveCategoryId(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Copy Notification Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
