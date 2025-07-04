import React, { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

// Define la estructura de un toast
type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

// Define lo que nuestro contexto va a proveer
interface ToastContextType {
  addToast: (message: string, type: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- El Componente Proveedor ---
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // El toast se borrará solo después de 5 segundos
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* El portal donde se renderizarán los toasts */}
      <div className="toast-portal">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-item-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// --- El Hook para usar los toasts fácilmente ---
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};