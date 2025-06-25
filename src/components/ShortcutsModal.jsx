import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCommand } from 'react-icons/fi';

const shortcuts = [
  { key: 'Delete', description: 'Delete selected rows/columns' },
  { key: 'Ctrl+Z (Cmd+Z)', description: 'Undo last action' },
  { key: 'Ctrl+Y (Cmd+Y)', description: 'Redo last action' },
  { key: 'Ctrl+A (Cmd+A)', description: 'Select all rows' },
  { key: 'Ctrl+Shift+A (Cmd+Shift+A)', description: 'Select all columns' },
  { key: 'Ctrl+N (Cmd+N)', description: 'Start new file' },
  { key: 'Ctrl+P (Cmd+P)', description: 'Print/PDF report' },
  { key: 'Escape', description: 'Clear all selections' },
  { key: 'Click', description: 'Select single row/column' },
  { key: 'Ctrl+Click (Cmd+Click)', description: 'Multi-select rows/columns' },
  { key: 'Shift+Click', description: 'Range select rows/columns' },
  { key: 'Double-click header', description: 'Sort by column' },
];

const ShortcutsModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiCommand className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-3">
                {shortcuts.map((shortcut, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-900">
                      {shortcut.description}
                    </span>
                    <kbd className="px-3 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-md shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                <strong>Tip:</strong> Use Ctrl (or Cmd on Mac) for multi-selection and Shift for range selection. 
                Double-click column headers to sort data.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShortcutsModal;