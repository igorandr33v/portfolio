import React from 'react';

interface HeaderProps {
  onCopyContact: (text: string, label: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onCopyContact }) => {
  return (
    <header className="w-full pt-6 md:pt-8 lg:pt-9 xl:pt-11 pb-5 md:pb-7 lg:pb-8 shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
        {/* Brand / Role Title */}
        <div>
          <a
            href="#top"
            className="inline-block text-xl md:text-2xl lg:text-[25px] font-bold uppercase tracking-[-0.02em] text-black hover:opacity-75 transition-opacity duration-300"
          >
            ГРАФИЧЕСКИЙ И БРЕНД-ДИЗАЙНЕР
          </a>
        </div>

        {/* Contacts Bar */}
        <nav
          aria-label="Контакты"
          className="flex flex-wrap items-center gap-x-6 md:gap-x-8 lg:gap-x-10 gap-y-2 text-sm md:text-[15px] font-normal text-black"
        >
          <a
            href="http://t.me/igorandr33v"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-50 transition-opacity duration-300 py-1 cursor-pointer"
          >
            telegram
          </a>

          <a
            href="https://www.instagram.com/igorandr33v/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-50 transition-opacity duration-300 py-1 cursor-pointer"
          >
            instagram
          </a>

          <a
            href="mailto:igor.andreev.1997@gmail.com"
            onClick={(e) => {
              // Copy to clipboard with confirmation
              navigator.clipboard?.writeText('igor.andreev.1997@gmail.com');
              onCopyContact('igor.andreev.1997@gmail.com', 'Email скопирован');
            }}
            className="hover:opacity-50 transition-opacity duration-300 py-1 cursor-pointer"
            title="Нажмите, чтобы написать или скопировать"
          >
            igor.andreev.1997@gmail.com
          </a>

          <a
            href="tel:+79097023881"
            onClick={(e) => {
              navigator.clipboard?.writeText('8 909 702 3881');
              onCopyContact('8 909 702 3881', 'Телефон скопирован');
            }}
            className="hover:opacity-50 transition-opacity duration-300 py-1 cursor-pointer"
            title="Нажмите, чтобы позвонить или скопировать"
          >
            8 909 702 3881
          </a>
        </nav>
      </div>
    </header>
  );
};
