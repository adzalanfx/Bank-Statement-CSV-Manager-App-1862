import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

let toastId = 0;

const toastTypes = {
  success: {
    icon: FiCheckCircle,
    className: 'bg-green-50 text-green-800 border-green-200'
  },
  error: {
    icon: FiXCircle,
    className: 'bg-red-50 text-red-800 border-red-200'
  },
  warning: {
    icon: FiAlertCircle,
    className: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
  info: {
    icon: FiInfo,
    className: 'bg-blue-50 text-blue-800 border-blue-200'
  }
};

class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = [];
  }

  addToast(message, type = 'info', duration = 4000) {
    const toast = {
      id: ++toastId,
      message,
      type,
      duration
    };
    
    this.toasts.push(toast);
    this.notifyListeners();
    
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
    
    return toast.id;
  }

  removeToast(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.toasts));
  }
}

const toastManager = new ToastManager();

export const toast = {
  success: (message, duration) => toastManager.addToast(message, 'success', duration),
  error: (message, duration) => toastManager.addToast(message, 'error', duration),
  warning: (message, duration) => toastManager.addToast(message, 'warning', duration),
  info: (message, duration) => toastManager.addToast(message, 'info', duration)
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => {
          const { icon: Icon, className } = toastTypes[toast.type];
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className={`flex items-center p-4 rounded-lg border shadow-lg max-w-sm ${className}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mr-3" />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => toastManager.removeToast(toast.id)}
                className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <FiX className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;