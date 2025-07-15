"use client";

import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ open, onClose, children, title, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className={`relative bg-gray-800 ml-8 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-700  ${className}`}>
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-300 hover:text-gray-100 transition-all"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        
        {/* Title */}
        {title && <h2 className="text-2xl font-semibold text-gray-100 mb-4">{title}</h2>}
        
        {/* Modal Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}