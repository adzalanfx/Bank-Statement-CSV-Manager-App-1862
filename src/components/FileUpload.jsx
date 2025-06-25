import React, { useCallback, useState } from 'react';
import { FiUpload, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FileUpload = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    const validTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
    const validExtensions = ['.csv', '.txt'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (file.size > maxSize) {
      return 'File size exceeds 50MB limit';
    }
    
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      return 'Please upload a CSV or TXT file';
    }
    
    return null;
  };

  const handleFiles = useCallback((files) => {
    setError(null);
    
    if (files.length === 0) return;
    
    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (isLoading) return;
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles, isLoading]);

  const handleFileInput = useCallback((e) => {
    if (isLoading) return;
    
    const files = Array.from(e.target.files);
    handleFiles(files);
  }, [handleFiles, isLoading]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${dragActive
            ? 'border-primary-400 bg-primary-50' 
            : error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-white hover:border-primary-300 hover:bg-gray-50'
          }
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,.txt"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            p-4 rounded-full
            ${dragActive
              ? 'bg-primary-100 text-primary-600' 
              : error
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            {error ? (
              <FiAlertCircle className="w-8 h-8" />
            ) : dragActive ? (
              <FiFileText className="w-8 h-8" />
            ) : (
              <FiUpload className="w-8 h-8" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {dragActive
                ? 'Drop your CSV file here'
                : error
                ? 'Invalid file'
                : isLoading
                ? 'Processing...'
                : 'Upload Bank Statement CSV'
              }
            </h3>
            
            {!isLoading && (
              <p className="text-sm text-gray-500">
                {error
                  ? error
                  : 'Drag and drop your CSV file here, or click to browse'
                }
              </p>
            )}
          </div>
          
          {!isLoading && !dragActive && (
            <motion.button
              type="button"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                       transition-colors duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Choose File
            </motion.button>
          )}
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="text-sm font-medium text-gray-700">Processing CSV...</span>
            </div>
          </div>
        )}
      </motion.div>
      
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Supported formats: CSV, TXT</p>
        <p>• Maximum file size: 50MB</p>
        <p>• Files must have at least 11 rows (row 11 used as headers)</p>
        <p>• Columns 1, 5, and 7 will be automatically ignored</p>
      </div>
    </div>
  );
};

export default FileUpload;