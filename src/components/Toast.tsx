import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black text-white px-4 py-2.5 shadow-lg text-xs md:text-sm font-medium tracking-tight animate-fade-in transition-all">
      <Check className="w-4 h-4 text-white" />
      <span>{message}</span>
    </div>
  );
};
