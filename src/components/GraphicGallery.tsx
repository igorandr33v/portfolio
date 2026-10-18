import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GRAPHIC_WORKS, GraphicWorkItem } from '../data/projectsData';

interface GraphicGalleryProps {
  onSelectProject?: (project: any) => void;
}

// 3 identical sets of 8 works to enable seamless infinite looping
const REPEAT_SETS = 3;
const MOBILE_BREAKPOINT = 1024;

export const GraphicGallery: React.FC<GraphicGalleryProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Linear interpolation and infinite loop refs
  const isMobileRef = useRef<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const currentScrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const singleSetSizeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isTouchingRef = useRef(false);

  // Drag-to-scroll refs
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef(0);
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

  // Measure the exact size (width on desktop, height on mobile) of a single 9-item set
  const updateSingleSetSize = useCallback(() => {
    const container = containerRef.current;
    if (!container || container.children.length < GRAPHIC_WORKS.length * 2) return 0;

    const firstItem = container.children[0] as HTMLElement;
    const secondSetFirstItem = container.children[GRAPHIC_WORKS.length] as HTMLElement;

    if (firstItem && secondSetFirstItem) {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      const measured = mobile
        ? secondSetFirstItem.offsetTop - firstItem.offsetTop
        : secondSetFirstItem.offsetLeft - firstItem.offsetLeft;

      if (measured > 0) {
        singleSetSizeRef.current = measured;
        return measured;
      }
    }
    return 0;
  }, []);

  // Initialize and handle viewport mode switches
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initScrollPosition = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      isMobileRef.current = mobile;
      setIsMobile(mobile);

      const setSize = updateSingleSetSize();
      if (setSize > 0) {
        if (mobile) {
          container.scrollLeft = 0;
          container.scrollTop = setSize;
        } else {
          container.scrollTop = 0;
          container.scrollLeft = setSize;
        }
        currentScrollRef.current = setSize;
        targetScrollRef.current = setSize;
      }
    };

    const timer = setTimeout(initScrollPosition, 80);

    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      const modeChanged = mobile !== isMobileRef.current;
      isMobileRef.current = mobile;
      setIsMobile(mobile);

      const setSize = updateSingleSetSize();
      if (modeChanged && setSize > 0 && containerRef.current) {
        if (mobile) {
          containerRef.current.scrollLeft = 0;
          containerRef.current.scrollTop = setSize;
        } else {
          containerRef.current.scrollTop = 0;
          containerRef.current.scrollLeft = setSize;
        }
        currentScrollRef.current = setSize;
        targetScrollRef.current = setSize;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateSingleSetSize]);

  // Smooth lerp animation loop (smooth scrolling with inertia for both horizontal and vertical)
  useEffect(() => {
    const animate = () => {
      if (!isDraggingRef.current && !isTouchingRef.current && containerRef.current) {
        const diff = targetScrollRef.current - currentScrollRef.current;

        // Smooth ease interpolation toward target
        if (Math.abs(diff) > 0.15) {
          currentScrollRef.current += diff * 0.11;
        } else {
          currentScrollRef.current = targetScrollRef.current;
        }

        const setSize = singleSetSizeRef.current;
        if (setSize > 0) {
          // Seamless wrap-around forward
          if (currentScrollRef.current >= 2 * setSize) {
            currentScrollRef.current -= setSize;
            targetScrollRef.current -= setSize;
          }
          // Seamless wrap-around backward
          else if (currentScrollRef.current < setSize * 0.5) {
            currentScrollRef.current += setSize;
            targetScrollRef.current += setSize;
          }
        }

        if (isMobileRef.current) {
          containerRef.current.scrollTop = currentScrollRef.current;
        } else {
          containerRef.current.scrollLeft = currentScrollRef.current;
        }
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
        if (singleSetSizeRef.current === 0) {
          updateSingleSetSize();
        }
        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        targetScrollRef.current += delta * 1.15;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, [activeLightboxIndex, updateSingleSetSize]);

  // Window-level mouse move and mouse up for fluid dragging across the entire page
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      e.preventDefault();

      const currentPos = isMobileRef.current ? e.pageY : e.pageX;
      const walk = currentPos - dragStartPosRef.current;
      dragDistanceRef.current += Math.abs(walk);

      let nextScroll = dragStartScrollRef.current - walk;
      const setSize = singleSetSizeRef.current;

      // Wrap during drag if passing boundary
      if (setSize > 0) {
        if (nextScroll >= 2 * setSize) {
          nextScroll -= setSize;
          dragStartScrollRef.current -= setSize;
        } else if (nextScroll < setSize * 0.5) {
          nextScroll += setSize;
          dragStartScrollRef.current += setSize;
        }
      }

      currentScrollRef.current = nextScroll;
      targetScrollRef.current = nextScroll;

      if (isMobileRef.current) {
        containerRef.current.scrollTop = nextScroll;
      } else {
        containerRef.current.scrollLeft = nextScroll;
      }
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

    const setSize = singleSetSizeRef.current || updateSingleSetSize();
    if (setSize > 0) {
      if (isMobileRef.current) {
        if (container.scrollTop >= 2 * setSize) {
          container.scrollTop -= setSize;
          currentScrollRef.current = container.scrollTop;
          targetScrollRef.current = container.scrollTop;
        } else if (container.scrollTop < setSize * 0.5) {
          container.scrollTop += setSize;
          currentScrollRef.current = container.scrollTop;
          targetScrollRef.current = container.scrollTop;
        } else if (isTouchingRef.current) {
          currentScrollRef.current = container.scrollTop;
          targetScrollRef.current = container.scrollTop;
        }
      } else {
        if (container.scrollLeft >= 2 * setSize) {
          container.scrollLeft -= setSize;
          currentScrollRef.current = container.scrollLeft;
          targetScrollRef.current = container.scrollLeft;
        } else if (container.scrollLeft < setSize * 0.5) {
          container.scrollLeft += setSize;
          currentScrollRef.current = container.scrollLeft;
          targetScrollRef.current = container.scrollLeft;
        } else if (isTouchingRef.current) {
          currentScrollRef.current = container.scrollLeft;
          targetScrollRef.current = container.scrollLeft;
        }
      }
    }
  };

  // Drag start
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.button !== 0) return;

    if (singleSetSizeRef.current === 0) {
      updateSingleSetSize();
    }

    isDraggingRef.current = true;
    dragStartPosRef.current = isMobileRef.current ? e.pageY : e.pageX;
    dragStartScrollRef.current = isMobileRef.current
      ? containerRef.current.scrollTop
      : containerRef.current.scrollLeft;
    dragDistanceRef.current = 0;
    setIsCursorGrabbing(true);
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
    <div className="relative w-full h-full flex-1 min-h-0 flex flex-col">
      {/* 
        Gallery container:
        - Mobile (< lg): vertical scroll (flex-col overflow-y-auto), fills height down to 10px above the logo
        - Desktop (lg+): horizontal scroll (lg:flex-row lg:overflow-x-auto), fills height down to 10px above the logo
        - Seamless infinite scroll in both orientations
        - No numbering labels, no hover zoom, no scrollbar indicator
      */}
      <div className="relative w-full h-full flex-1 min-h-0">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onTouchStart={() => {
            isTouchingRef.current = true;
          }}
          onTouchEnd={() => {
            isTouchingRef.current = false;
          }}
          onTouchCancel={() => {
            isTouchingRef.current = false;
          }}
          className={`w-full h-full flex flex-col lg:flex-row flex-nowrap items-stretch gap-[10px] lg:gap-[40px] overflow-y-auto lg:overflow-y-hidden overflow-x-hidden lg:overflow-x-auto select-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
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
                className="relative shrink-0 w-full lg:w-auto lg:h-full overflow-hidden group cursor-pointer focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
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
                  onLoad={() => {
                    const prevSize = singleSetSizeRef.current;
                    const newSize = updateSingleSetSize();
                    if (prevSize === 0 && newSize > 0 && containerRef.current) {
                      if (isMobileRef.current) {
                        containerRef.current.scrollTop = newSize;
                      } else {
                        containerRef.current.scrollLeft = newSize;
                      }
                      currentScrollRef.current = newSize;
                      targetScrollRef.current = newSize;
                    }
                  }}
                  className={`block select-none pointer-events-none object-cover ${
                    isMobile ? 'w-full h-auto' : 'w-full h-full'
                  }`}
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
