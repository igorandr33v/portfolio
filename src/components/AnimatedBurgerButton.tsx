import React from 'react';
import { motion } from 'motion/react';

interface AnimatedBurgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  'aria-label'?: string;
}

/**
 * AnimatedBurgerButton
 * Smoothly morphs between a 3-line hamburger menu and an 'X' close icon
 * using Framer Motion lines with elegant timing and clean minimalist styling.
 */
export const AnimatedBurgerButton: React.FC<AnimatedBurgerButtonProps> = ({
  isOpen,
  onClick,
  className = '',
  'aria-label': ariaLabel = isOpen ? 'Закрыть меню' : 'Открыть меню',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      className={`relative flex flex-col items-center justify-center w-10 h-10 -mr-2 text-black cursor-pointer select-none group focus:outline-none ${className}`}
    >
      <div className="relative w-6 h-5 flex flex-col justify-between items-center">
        {/* Top line */}
        <motion.span
          animate={
            isOpen
              ? { rotate: 45, y: 9 }
              : { rotate: 0, y: 0 }
          }
          transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-6 h-[1.75px] bg-black block origin-center rounded-full group-hover:opacity-60 transition-[opacity] duration-200"
        />

        {/* Middle line */}
        <motion.span
          animate={
            isOpen
              ? { opacity: 0, scaleX: 0 }
              : { opacity: 1, scaleX: 1 }
          }
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="w-6 h-[1.75px] bg-black block origin-center rounded-full group-hover:opacity-60 transition-[opacity] duration-200"
        />

        {/* Bottom line */}
        <motion.span
          animate={
            isOpen
              ? { rotate: -45, y: -9 }
              : { rotate: 0, y: 0 }
          }
          transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-6 h-[1.75px] bg-black block origin-center rounded-full group-hover:opacity-60 transition-[opacity] duration-200"
        />
      </div>
    </button>
  );
};
