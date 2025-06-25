import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiArrowLeft } from 'react-icons/fi';
import { toast } from '../components/Toast';
import useCSVStore from '../stores/csvStore';
import DataGrid from '../components/DataGrid';
import Toolbar from '../components/Toolbar';
import WarningsPanel from '../components/WarningsPanel';
import ShortcutsModal from '../components/ShortcutsModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { generateHTMLReport, printReport } from '../utils/reportGenerator';
import { formatFileSize } from '../utils/csvProcessor';

const DataGridPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [showWarnings, setShowWarnings] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const {
    fileName,
    fileSize,
    processedData,
    headers,
    warnings,
    reset
  } = useCSVStore();

  // Redirect if no data
  useEffect(() => {
    if (!processedData.length || !headers.length) {
      navigate('/');
    }
  }, [processedData, headers, navigate]);

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleNewFile = () => {
    reset();
    navigate('/');
  };

  const handlePrintReport = () => {
    try {
      const htmlContent = generateHTMLReport(processedData, headers, fileName, fileSize);
      printReport(htmlContent);
      toast.success('Report opened for printing');
    } catch (error) {
      toast.error('Failed to generate report: ' + error.message);
    }
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts(
    handleNewFile,
    () => setShowShortcuts(true),
    handlePrintReport
  );

  if (!processedData.length || !headers.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleNewFile}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <FiFileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs">
                    {fileName}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(fileSize)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Warnings */}
      {showWarnings && warnings.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <WarningsPanel
            warnings={warnings}
            onDismiss={() => setShowWarnings(false)}
          />
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        onNewFile={handleNewFile}
        onShowShortcuts={() => setShowShortcuts(true)}
      />

      {/* Data Grid */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full"
          ref={containerRef}
        >
          {containerSize.width > 0 && containerSize.height > 0 && (
            <DataGrid
              containerWidth={containerSize.width}
              containerHeight={containerSize.height}
            />
          )}
        </motion.div>
      </div>

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};

export default DataGridPage;