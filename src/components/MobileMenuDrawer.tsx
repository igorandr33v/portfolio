import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '../types';
import { Logo } from './Logo';
import { AnimatedBurgerButton } from './AnimatedBurgerButton';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Категории"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative ml-auto w-full max-w-[320px] h-full bg-white flex flex-col justify-between p-6 sm:p-8 select-none shadow-2xl"
          >
            {/* Top Bar with Logo and Close Button */}
            <div className="flex items-center justify-between pb-4">
              <div className="w-[110px]">
                <Logo className="w-[110px] h-auto text-black" />
              </div>
              <AnimatedBurgerButton
                isOpen={true}
                onClick={onClose}
                aria-label="Закрыть меню"
              />
            </div>

            {/* Categories Navigation matching CategoryNav exactly */}
            <nav className="my-auto py-6">
              <ul className="flex flex-col space-y-4">
                {categories.map((cat) => {
                  const isActive = activeCategoryId === cat.id;

                  return (
                    <li key={cat.id} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory(cat.id);
                          onClose();
                        }}
                        className={`relative inline-block text-left text-base sm:text-lg tracking-tight font-normal cursor-pointer select-none transition-opacity duration-200 ${
                          isActive
                            ? 'text-black opacity-100'
                            : 'text-black/80 hover:text-black hover:opacity-100'
                        }`}
                      >
                        <span className="block">{cat.fullName}</span>
                        {isActive && (
                          <div className="absolute left-0 right-0 -bottom-1 h-[1px] bg-black pointer-events-none" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Drawer Contacts in column, no dividers */}
            <div className="flex flex-col gap-2 text-sm font-normal text-black select-text pb-2">
              <a
                href="http://t.me/igorandr33v"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-50 transition-opacity cursor-pointer"
              >
                telegram
              </a>
              <a
                href="https://www.instagram.com/igorandr33v/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-50 transition-opacity cursor-pointer"
              >
                instagram
              </a>
              <a
                href="mailto:igor.andreev.1997@gmail.com"
                className="hover:opacity-50 transition-opacity cursor-pointer"
              >
                igor.andreev.1997@gmail.com
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
