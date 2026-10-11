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

// Choreographed stagger container variants for the 3x3 project grid
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
      ease: [0.22, 1, 0.36, 1] as const, // fluid cubic-bezier deceleration
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
          return match
            ? {
                ...initP,
                imageUrl: match.imageUrl || initP.imageUrl,
                galleryImages:
                  match.galleryImages && match.galleryImages.length > 0
                    ? match.galleryImages
                    : initP.galleryImages,
              }
            : initP;
        });
      }
    } catch {
      // fallback
    }
    return INITIAL_PROJECTS;
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string>('branding');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
    showToast(imageUrl ? 'Изображение галереи обновлено' : 'Сброшено на серый квадрат');
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

  // Contacts block rendered identically across modes
  const renderContacts = () => (
    <div className="flex flex-wrap lg:flex-nowrap items-start justify-start lg:justify-end gap-x-6 md:gap-x-8 lg:gap-x-9 xl:gap-x-11 gap-y-2 text-sm md:text-[15px] font-normal text-black pt-1 select-text">
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
        className="hover:opacity-50 transition-opacity duration-300 cursor-pointer whitespace-nowrap shrink-0"
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
        className="hover:opacity-50 transition-opacity duration-300 cursor-pointer whitespace-nowrap shrink-0"
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
          : 'w-screen h-screen overflow-hidden select-none'
      }`}
    >
      {/* 
        LAYOUT CONTAINER:
        When selectedProject is open: allows natural smooth vertical scroll, preserving 40px margins and header.
        When on main grid: strict 5x5 single-screen grid without scrolling.
      */}
      <div
        className={`w-full p-[40px] box-border ${
          selectedProject
            ? 'flex flex-col min-h-screen gap-[20px]'
            : 'h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 lg:grid-rows-5 gap-[20px] overflow-y-auto lg:overflow-hidden'
        }`}
      >
        {/* ROW 1: Header (always stays in place, preserving layout and styling) */}
        {selectedProject ? (
          <header className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0 pb-2">
            <h1 className="text-xl md:text-2xl lg:text-[25px] font-bold uppercase tracking-[-0.02em] text-black leading-tight select-none">
              ГРАФИЧЕСКИЙ И БРЕНД-ДИЗАЙНЕР
            </h1>
            {renderContacts()}
          </header>
        ) : (
          <>
            <div className="lg:col-start-1 lg:col-span-2 lg:row-start-1 flex items-start">
              <h1 className="text-xl md:text-2xl lg:text-[25px] font-bold uppercase tracking-[-0.02em] text-black leading-tight">
                ГРАФИЧЕСКИЙ И БРЕНД-ДИЗАЙНЕР
              </h1>
            </div>
            <div className="lg:col-start-3 lg:col-span-3 lg:row-start-1 flex flex-wrap lg:flex-nowrap items-start justify-start lg:justify-end gap-x-6 md:gap-x-8 lg:gap-x-9 xl:gap-x-11 gap-y-2 text-sm md:text-[15px] font-normal text-black pt-1">
              {renderContacts()}
            </div>
          </>
        )}

        {/* MAIN BODY AREA */}
        {selectedProject ? (
          /* SCROLLABLE PROJECT CASE STUDY PAGE */
          <main className="w-full flex-1 min-h-0 pt-2">
            <ProjectDetailView
              project={selectedProject}
              categories={CATEGORIES}
              nextProject={nextProject}
              onClose={() => {
                setSelectedProject(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPrev={handlePrevProject}
              onNext={handleNextProject}
              onUpdateImage={handleUpdateImage}
              onUpdateGalleryImage={handleUpdateGalleryImage}
            />
          </main>
        ) : (
          /* STRICT 5x5 NO-SCROLL GRID (MAIN PAGE) */
          <>
            {/* ROW 2, COL 1: Navigation Tabs (01 / Брендинг, etc.) */}
            <div className="lg:col-start-1 lg:row-start-2 lg:row-span-2 flex flex-col justify-start">
              <CategoryNav
                categories={CATEGORIES}
                activeCategoryId={activeCategoryId}
                onSelectCategory={(id) => setActiveCategoryId(id)}
              />
            </div>

            {/* ROW 2-4, COL 3-5: The 3x3 Project Cards Grid with Motion animation */}
            <div className="col-span-1 md:col-span-2 lg:col-start-3 lg:col-span-3 lg:row-start-2 lg:row-span-3 w-full h-full min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategoryId}
                  variants={gridContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 gap-[20px]"
                >
                  {currentCategoryProjects.slice(0, 9).map((project) => (
                    <motion.div
                      key={project.id}
                      variants={cardVariants}
                      className="w-full h-full min-h-[100px] lg:min-h-0"
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

            {/* ROW 5, COL 1: User Vector SVG Logo (width: 130px) */}
            <div className="lg:col-start-1 lg:row-start-5 flex items-end pb-1">
              <div className="w-[130px]">
                <Logo className="w-[130px] h-auto text-black hover:opacity-75 transition-opacity duration-300" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Copy Notification Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
