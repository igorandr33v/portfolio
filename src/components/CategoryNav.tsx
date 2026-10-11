import React from 'react';
import { motion } from 'motion/react';
import { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <nav aria-label="Категории проектов" className="w-full">
      <ul className="flex flex-col space-y-3.5 md:space-y-4 lg:space-y-5">
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;

          return (
            <li key={cat.id} className="relative">
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`relative inline-block text-left text-base md:text-lg lg:text-[19px] tracking-tight font-normal cursor-pointer select-none transition-opacity duration-200 ${
                  isActive
                    ? 'text-black opacity-100'
                    : 'text-black/80 hover:text-black hover:opacity-100'
                }`}
              >
                <span className="block">{cat.fullName}</span>
                {isActive && (
                  <motion.div
                    layoutId="category-underline"
                    className="absolute left-0 right-0 -bottom-1 h-[1px] bg-black pointer-events-none"
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
