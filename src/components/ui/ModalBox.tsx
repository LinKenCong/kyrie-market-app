import { useEffect, useRef, useState } from "react";
import { createPortal as reactDomCreatePortal } from "react-dom";
import { BaseLoadingIndicator } from "./LoadingIndicator";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/* 
Example Usage:
```
import { useState } from 'react';
import BaseModalBox from './BaseModalBox';

const App = () => {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>open modal</button>
      <BaseModalBox isOpen={isOpen} onClose={() => setOpen(false)} className="max-w-sm">
        <h2>Title</h2>
        <p>Content</p>
        <input type="text" placeholder="input 1" />
        <input type="text" placeholder="input 2" />
        <button onClick={() => setOpen(false)}>close</button>
      </BaseModalBox>
    </>
  );
};
```
*/
export const BaseModalBox: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = Array.from(
        modalRef.current.querySelectorAll(
          'a, button, input, select, textArea, [tabindex]:not([tabindex="-1"])'
        )
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (focusableElements.length > 0) {
        (firstElement as HTMLElement).focus();

        const handleTabKeydown = (e: KeyboardEvent) => {
          if (e.key === "Tab") {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                (lastElement as HTMLElement).focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                (firstElement as HTMLElement).focus();
              }
            }
          }
        };

        document.addEventListener("keydown", handleTabKeydown);

        return () => {
          document.removeEventListener("keydown", handleTabKeydown);
        };
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleEscapeKeydown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscapeKeydown);
      return () => {
        document.removeEventListener("keydown", handleEscapeKeydown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return reactDomCreatePortal(
    <div
      className="fixed z-50 inset-0 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div
          ref={modalRef}
          className={`overflow-auto max-h-screen bg-white p-6 shadow-md ${className}`}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
};

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  children: React.ReactNode;
  title: string;
  formData: { [key: string]: string };
}

export const FormModalBox = (
  props: React.PropsWithChildren<FormModalProps>
) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await props.onSubmit(props.formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModalBox
      isOpen={props.isOpen}
      onClose={props.onClose}
      className="km-border bg-white p-6 shadow-lg w-full max-w-md sm:h-auto h-full"
    >
      <>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{props.title}</h2>
        {loading ? (
          <BaseLoadingIndicator />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-gray-900">
            {props.children}
            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={props.onClose}
                className="km-border font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="km-border font-bold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2"
              >
                Enter
              </button>
            </div>
          </form>
        )}
      </>
    </BaseModalBox>
  );
};
