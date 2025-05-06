"use client";

import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: ReactNode; 
  iconBgColor: string; 
  message1: string;
  message: string;
  cancelText: string; 
  confirmText: string; 
  confirmButtonColor: string;
  onConfirm: () => void; 
  className?: string; 
}

export default function Modal({
  isOpen,
  onClose,
  title,
  icon,
  iconBgColor,
  message1,
  message,
  cancelText,
  confirmText,
  confirmButtonColor,
  onConfirm,
  className = "",
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent
        className={`sm:max-w-[425px] border-none rounded-lg p-6 bg-card ${className}`}
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold ">{title}</h2>
        
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full"
            style={{ backgroundColor: iconBgColor }}
          >
            {icon}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium">{message1}</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button
            variant="outline"
            className="text-gray-700 border-gray-300 hover:bg-gray-100"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            className="text-white"
            style={{ backgroundColor: confirmButtonColor }}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}