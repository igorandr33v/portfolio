import React from 'react';
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
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  textDecorationLine: 'underline',
                  textDecorationThickness: '1px',
                  textUnderlineOffset: '5px',
                  textDecorationSkipInk: 'none',
                  textDecorationColor: isActive ? '#000000' : 'transparent',
                  transition: 'text-decoration-color 0.2s ease, opacity 0.2s ease',
                }}
                className={`text-left text-base md:text-lg lg:text-[19px] tracking-tight font-normal cursor-pointer select-none ${
                  isActive
                    ? 'text-black opacity-100'
                    : 'text-black/80 hover:text-black hover:opacity-100'
                }`}
              >
                {cat.fullName}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
