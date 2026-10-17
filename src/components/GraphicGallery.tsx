import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GRAPHIC_WORKS, GraphicWorkItem } from '../data/projectsData';

interface GraphicGalleryProps {
  onSelectProject?: (project: any) => void;
}

// 3 identical sets of 9 works to enable seamless infinite looping
const REPEAT_SETS = 3;

export const GraphicGallery: React.FC<GraphicGalleryProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Linear interpolation and infinite loop refs
  const currentScrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // Drag-to-scroll refs
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const [isCursorGrabbing, setIsCursorGrabbing] = useState(false);

  // Flattened array of repeated works (total 27 items)
  const items = useMemo(() => {
    return Array.from({ length: REPEAT_SETS }, (_, setIndex) =>
      GRAPHIC_WORKS.map((work) => ({
        ...work,
        uniqueKey: `${work.id}-set-${setIndex}`,
      }))
    ).flat();
  }, []);

  // Measure the exact width of a single 9-item set
  const updateSingleSetWidth = useCallback(() => {
    const container = containerRef.current;
    if (!container || container.children.length < GRAPHIC_WORKS.length * 2) return;

    const firstItem = container.children[0] as HTMLElement;
    const secondSetFirstItem = container.children[GRAPHIC_WORKS.length] as HTMLElement;

    if (firstItem && secondSetFirstItem) {
      const measured = secondSetFirstItem.offsetLeft - firstItem.offsetLeft;
      if (measured > 0) {
        singleSetWidthRef.current = measured;
      }
    }
  }, []);

  // Set initial position to middle set on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Wait for images layout to stabilize
    const timer = setTimeout(() => {
      updateSingleSetWidth();
      const setWidth = singleSetWidthRef.current;
      if (setWidth > 0) {
        container.scrollLeft = setWidth;
        currentScrollRef.current = setWidth;
        targetScrollRef.current = setWidth;
      }
    }, 100);

    const handleResize = () => {
      updateSingleSetWidth();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateSingleSetWidth]);

  // Smooth lerp animation loop (smooth scrolling with inertia)
  useEffect(() => {
    const animate = () => {
      if (!isDraggingRef.current && containerRef.current) {
        const diff = targetScrollRef.current - currentScrollRef.current;

        // Smooth ease interpolation toward target
        if (Math.abs(diff) > 0.15) {
          currentScrollRef.current += diff * 0.11; // Buttery smooth deceleration
        } else {
          currentScrollRef.current = targetScrollRef.current;
        }

        const setWidth = singleSetWidthRef.current;
        if (setWidth > 0) {
          // Seamless wrap-around forward
          if (currentScrollRef.current >= 2 * setWidth) {
            currentScrollRef.current -= setWidth;
            targetScrollRef.current -= setWidth;
          }
          // Seamless wrap-around backward
          else if (currentScrollRef.current < setWidth * 0.5) {
            currentScrollRef.current += setWidth;
            targetScrollRef.current += setWidth;
          }
        }

        containerRef.current.scrollLeft = currentScrollRef.current;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Wheel listener: active on the images component and the entire area below it
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (activeLightboxIndex !== null) return;
      if (e.deltaY === 0 && e.deltaX === 0) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      // Trigger scroll when cursor is over the images or anywhere below the component
      if (e.clientY >= rect.top - 5) {
        e.preventDefault();
        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        targetScrollRef.current += delta * 1.15;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, [activeLightboxIndex]);

  // Window-level mouse move and mouse up for fluid dragging across the entire page
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      e.preventDefault();

      const walk = e.pageX - dragStartXRef.current;
      dragDistanceRef.current += Math.abs(walk);

      let nextScroll = dragStartScrollRef.current - walk;
      const setWidth = singleSetWidthRef.current;

      // Wrap during drag if passing boundary
      if (setWidth > 0) {
        if (nextScroll >= 2 * setWidth) {
          nextScroll -= setWidth;
          dragStartScrollRef.current -= setWidth;
        } else if (nextScroll < setWidth * 0.5) {
          nextScroll += setWidth;
          dragStartScrollRef.current += setWidth;
        }
      }

      currentScrollRef.current = nextScroll;
      targetScrollRef.current = nextScroll;
      containerRef.current.scrollLeft = nextScroll;
    };

    const handleWindowMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsCursorGrabbing(false);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []);

  // Handle native scroll events (e.g. mobile touch swipes) to ensure infinite wrap
  const handleScroll = () => {
    if (isDraggingRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const setWidth = singleSetWidthRef.current;
    if (setWidth > 0) {
      if (container.scrollLeft >= 2 * setWidth) {
        container.scrollLeft -= setWidth;
        currentScrollRef.current = container.scrollLeft;
        targetScrollRef.current = container.scrollLeft;
      } else if (container.scrollLeft < setWidth * 0.5) {
        container.scrollLeft += setWidth;
        currentScrollRef.current = container.scrollLeft;
        targetScrollRef.current = container.scrollLeft;
      }
    }
  };

  // Drag start
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.button !== 0) return;

    isDraggingRef.current = true;
    dragStartXRef.current = e.pageX;
    dragStartScrollRef.current = containerRef.current.scrollLeft;
    dragDistanceRef.current = 0;
    setIsCursorGrabbing(true);
  };

  // Drag end
  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsCursorGrabbing(false);
    }
  };

  // Card click: open lightbox (only if not dragged)
  const handleItemClick = (originalIndex: number) => {
    if (dragDistanceRef.current < 6) {
      setActiveLightboxIndex(originalIndex);
    }
  };

  // Lightbox navigation (cycle seamlessly through 9 works)
  const handlePrev = useCallback(() => {
    setActiveLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + GRAPHIC_WORKS.length) % GRAPHIC_WORKS.length : null
    );
  }, []);

  const handleNext = useCallback(() => {
    setActiveLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % GRAPHIC_WORKS.length : null
    );
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setActiveLightboxIndex(null);
  }, []);

  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeLightboxIndex, handleCloseLightbox, handlePrev, handleNext]);

  const activeWork: GraphicWorkItem | null =
    activeLightboxIndex !== null ? GRAPHIC_WORKS[activeLightboxIndex] : null;

  return (
    <div className="relative w-full flex flex-col">
      {/* 
        Horizontal single-row gallery container:
        - Seamless infinite scroll (images loop infinitely)
        - Silky smooth inertia-based wheel scrolling
        - No numbering labels
        - No hover zoom on images
        - Scroll indicator completely hidden
      */}
      <div className="relative w-full">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          className={`w-full flex flex-row flex-nowrap items-stretch gap-[10px] overflow-x-auto select-none py-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isCursorGrabbing ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
          tabIndex={0}
          role="region"
          aria-label="Галерея графического дизайна с бесконечным скроллом"
        >
          {items.map((work, index) => {
            const originalIndex = index % GRAPHIC_WORKS.length;

            return (
              <article
                key={work.uniqueKey}
                onClick={() => handleItemClick(originalIndex)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveLightboxIndex(originalIndex);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={work.title}
                className="relative shrink-0 h-[240px] sm:h-[280px] md:h-[330px] lg:h-[370px] xl:h-[390px] overflow-hidden group cursor-pointer focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
                style={{
                  aspectRatio: `${work.width} / ${work.height}`,
                }}
              >
                {/* Image without any zoom animation on hover */}
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  width={work.width}
                  height={work.height}
                  loading={index < 12 ? 'eager' : 'lazy'}
                  decoding="async"
                  onLoad={updateSingleSetWidth}
                  className="w-full h-full object-cover block select-none pointer-events-none"
                  style={{
                    aspectRatio: `${work.width} / ${work.height}`,
                  }}
                />

                {/* Minimalist hover overlay: pure project title, NO numbering */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-250 ease-out p-3 md:p-5 flex flex-col justify-end text-white pointer-events-none">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold leading-snug tracking-wide uppercase text-white">
                    {work.title}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeWork && activeLightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 md:p-8"
            onClick={handleCloseLightbox}
          >
            {/* Top Bar with pure title (NO numbering) and close button */}
            <div
              className="absolute top-0 left-0 right-0 px-5 sm:px-8 py-5 flex items-center justify-between text-white z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center">
                <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">
                  {activeWork.title}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseLightbox}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
                aria-label="Закрыть просмотр"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10"
              aria-label="Следующее изображение"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Main Lightbox Image View */}
            <div
              className="relative max-w-full max-h-[86vh] flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={activeWork.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                src={activeWork.imageUrl}
                alt={activeWork.title}
                className="max-h-[86vh] max-w-[94vw] w-auto h-auto object-contain select-none shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
