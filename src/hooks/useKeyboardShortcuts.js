import { useEffect } from 'react';
import useCSVStore from '../stores/csvStore';

export const useKeyboardShortcuts = (onNewFile, onShowShortcuts, onPrintReport) => {
  const {
    selectedRows,
    selectedColumns,
    canUndo,
    canRedo,
    undo,
    redo,
    deleteRows,
    deleteColumns,
    selectAllRows,
    selectAllColumns,
    clearSelections,
  } = useCSVStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Delete selected rows/columns
      if (e.key === 'Delete') {
        e.preventDefault();
        if (selectedRows.size > 0) {
          deleteRows(selectedRows);
        } else if (selectedColumns.size > 0) {
          deleteColumns(selectedColumns);
        }
      }

      // Undo
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }

      // Redo
      if ((cmdOrCtrl && e.key === 'y') || (cmdOrCtrl && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }

      // Select all rows
      if (cmdOrCtrl && e.key === 'a' && !e.shiftKey) {
        e.preventDefault();
        selectAllRows();
      }

      // Select all columns
      if (cmdOrCtrl && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        selectAllColumns();
      }

      // New file
      if (cmdOrCtrl && e.key === 'n') {
        e.preventDefault();
        onNewFile();
      }

      // Print report
      if (cmdOrCtrl && e.key === 'p') {
        e.preventDefault();
        onPrintReport();
      }

      // Clear selections
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelections();
      }

      // Show shortcuts
      if (cmdOrCtrl && e.key === '/') {
        e.preventDefault();
        onShowShortcuts();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedRows,
    selectedColumns,
    canUndo,
    canRedo,
    undo,
    redo,
    deleteRows,
    deleteColumns,
    selectAllRows,
    selectAllColumns,
    clearSelections,
    onNewFile,
    onShowShortcuts,
    onPrintReport
  ]);
};