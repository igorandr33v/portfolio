import React from 'react';
import { motion } from 'motion/react';
import { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  className = '',
}) => {
  return (
    <nav aria-label="Категории проектов" className={`w-full ${className}`}>
      <ul className="flex flex-row flex-wrap items-center justify-start gap-x-6 sm:gap-x-8 lg:gap-x-10 gap-y-2">
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;

          return (
            <li key={cat.id} className="relative">
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`relative inline-block text-left text-sm sm:text-base lg:text-[18px] tracking-tight cursor-pointer select-none transition-opacity duration-200 ${
                  isActive
                    ? 'text-black opacity-100 font-medium'
                    : 'text-black/75 hover:text-black hover:opacity-100 font-normal'
                }`}
              >
                <span className="block whitespace-nowrap">{cat.fullName}</span>
                {isActive && (
                  <motion.div
                    layoutId="category-underline"
                    className="absolute left-0 right-0 -bottom-1 h-[1.5px] bg-black pointer-events-none"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
