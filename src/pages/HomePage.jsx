import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiTrendingUp, FiShield, FiZap } from 'react-icons/fi';
import { toast } from '../components/Toast';
import FileUpload from '../components/FileUpload';
import useCSVStore from '../stores/csvStore';
import { processCSVFile } from '../utils/csvProcessor';

const HomePage = () => {
  const navigate = useNavigate();
  const { setFile, setData, setLoading, setError, setWarnings } = useCSVStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file) => {
    setIsProcessing(true);
    setLoading(true);
    setError(null);

    try {
      const result = await processCSVFile(file);
      
      setFile(result.fileName, result.fileSize);
      setData(result.rawData, result.processedData, result.headers, result.originalHeaders);
      setWarnings(result.warnings);
      
      toast.success(`Successfully processed ${result.fileName}`);
      navigate('/data-grid');
      
    } catch (error) {
      console.error('File processing error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FiFileText,
      title: 'Smart CSV Processing',
      description: 'Automatically processes bank statement CSVs with intelligent column filtering and data cleaning'
    },
    {
      icon: FiTrendingUp,
      title: 'Advanced Analytics',
      description: 'Generate grand totals, group data by person names, and create professional reports'
    },
    {
      icon: FiShield,
      title: 'Data Integrity',
      description: 'Robust error handling, data validation, and comprehensive undo/redo functionality'
    },
    {
      icon: FiZap,
      title: 'High Performance',
      description: 'Virtualized tables handle large datasets with smooth scrolling and responsive interactions'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Bank Statement CSV Manager
                </h1>
                <p className="text-sm text-gray-500">Professional data management solution</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Upload Your Bank Statement
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional CSV processing with automatic data cleaning, intelligent grouping, 
              and comprehensive reporting features designed for financial data management.
            </p>
          </motion.div>
        </div>

        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <FileUpload 
            onFileSelect={handleFileSelect}
            isLoading={isProcessing}
          />
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h3>
            <p className="text-lg text-gray-600">
              Everything you need to manage and analyze your bank statement data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-3 bg-primary-100 rounded-lg w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Processing Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-primary-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Upload CSV File</h4>
              <p className="text-sm text-gray-600">
                Upload your bank statement CSV or TXT file (up to 50MB)
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-primary-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Auto Processing</h4>
              <p className="text-sm text-gray-600">
                Automatic data cleaning, column filtering, and intelligent grouping
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-primary-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Analyze & Export</h4>
              <p className="text-sm text-gray-600">
                View, edit, sort data and generate professional reports
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;