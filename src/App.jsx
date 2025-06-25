import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import DataGridPage from './pages/DataGridPage';
import ToastContainer from './components/Toast';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/data-grid" element={<DataGridPage />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;