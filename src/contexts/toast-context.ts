import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'alert';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

export interface ToastContextType {
  showToast: (title: string, message: string, type?: ToastType) => void;
}

// Kept apart from the provider component so the .tsx file exports only
// components, which is what Fast Refresh needs to hot-reload it cleanly.
export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
