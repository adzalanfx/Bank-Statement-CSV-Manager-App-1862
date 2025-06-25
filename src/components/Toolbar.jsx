import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrash2, 
  FiRotateCcw, 
  FiRotateCw, 
  FiDownload, 
  FiPrinter, 
  FiFileText, 
  FiCommand, 
  FiInfo 
} from 'react-icons/fi';
import { toast } from '../components/Toast';
import useCSVStore from '../stores/csvStore';
import { exportToCSV } from '../utils/csvProcessor';
import { generateHTMLReport, printReport } from '../utils/reportGenerator';

const Toolbar = ({ onNewFile, onShowShortcuts }) => {
  const {
    processedData,
    headers,
    selectedRows,
    selectedColumns,
    fileName,
    fileSize,
    canUndo,
    canRedo,
    undo,
    redo,
    deleteRows,
    deleteColumns,
  } = useCSVStore();

  const handleDeleteRows = () => {
    if (selectedRows.size === 0) {
      toast.warning('Please select rows to delete');
      return;
    }
    deleteRows(selectedRows);
    toast.success(`Deleted ${selectedRows.size} row(s)`);
  };

  const handleDeleteColumns = () => {
    if (selectedColumns.size === 0) {
      toast.warning('Please select columns to delete');
      return;
    }
    deleteColumns(selectedColumns);
    toast.success(`Deleted ${selectedColumns.size} column(s)`);
  };

  const handleUndo = () => {
    if (canUndo()) {
      undo();
      toast.info('Undone');
    }
  };

  const handleRedo = () => {
    if (canRedo()) {
      redo();
      toast.info('Redone');
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(processedData, headers, fileName);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV: ' + error.message);
    }
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

  const ToolbarButton = ({ icon: Icon, label, onClick, disabled = false, variant = 'default' }) => {
    const baseClasses = "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";
    
    const variantClasses = {
      default: disabled 
        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300",
      danger: disabled 
        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
        : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300",
      primary: disabled 
        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
        : "bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200 hover:border-primary-300"
    };

    return (
      <motion.button
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        className={`${baseClasses} ${variantClasses[variant]}`}
        onClick={onClick}
        disabled={disabled}
        title={label}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </motion.button>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <ToolbarButton
            icon={FiTrash2}
            label={`Delete Rows (${selectedRows.size})`}
            onClick={handleDeleteRows}
            disabled={selectedRows.size === 0}
            variant="danger"
          />
          
          <ToolbarButton
            icon={FiTrash2}
            label={`Delete Columns (${selectedColumns.size})`}
            onClick={handleDeleteColumns}
            disabled={selectedColumns.size === 0}
            variant="danger"
          />
          
          <div className="h-6 w-px bg-gray-300" />
          
          <ToolbarButton
            icon={FiRotateCcw}
            label="Undo"
            onClick={handleUndo}
            disabled={!canUndo()}
          />
          
          <ToolbarButton
            icon={FiRotateCw}
            label="Redo"
            onClick={handleRedo}
            disabled={!canRedo()}
          />
          
          <div className="h-6 w-px bg-gray-300" />
          
          <ToolbarButton
            icon={FiDownload}
            label="Export CSV"
            onClick={handleExportCSV}
            variant="primary"
          />
          
          <ToolbarButton
            icon={FiPrinter}
            label="Print/PDF"
            onClick={handlePrintReport}
            variant="primary"
          />
        </div>

        <div className="flex items-center space-x-2">
          <ToolbarButton
            icon={FiCommand}
            label="Shortcuts"
            onClick={onShowShortcuts}
          />
          
          <ToolbarButton
            icon={FiFileText}
            label="New File"
            onClick={onNewFile}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>
            <FiInfo className="w-3 h-3 inline mr-1" />
            {processedData.length.toLocaleString()} rows × {headers.length} columns
          </span>
          
          {selectedRows.size > 0 && (
            <span className="text-primary-600 font-medium">
              {selectedRows.size} row(s) selected
            </span>
          )}
          
          {selectedColumns.size > 0 && (
            <span className="text-primary-600 font-medium">
              {selectedColumns.size} column(s) selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;