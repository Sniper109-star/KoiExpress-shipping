"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const Modal = ({ open, onOpenChange, title, description, children }: ModalProps) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-dark/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg mx-4 animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {(title || description) && (
            <div className="flex items-start justify-between p-6 border-b">
              <div className="space-y-1">
                {title && (
                  <h2 className="text-lg font-semibold text-dark">{title}</h2>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-dark hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {!title && !description && (
            <div className="flex justify-end p-4 border-b">
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-dark hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

Modal.displayName = "Modal";

export { Modal };
