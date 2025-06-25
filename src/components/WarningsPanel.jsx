import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiChevronDown, FiChevronRight, FiX } from 'react-icons/fi';

const WarningsPanel = ({ warnings, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!warnings || warnings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-50 border border-yellow-200 rounded-lg mb-4"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800">
              Processing Warnings ({warnings.length})
            </h3>
            <p className="text-sm text-yellow-700">
              Your file was processed successfully with some modifications
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            {isExpanded ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onDismiss}
            className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-yellow-200 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {warnings.map((warning, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-2 text-sm text-yellow-700"
                >
                  <span className="font-mono text-yellow-600 mt-0.5">•</span>
                  <span>{warning}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WarningsPanel;