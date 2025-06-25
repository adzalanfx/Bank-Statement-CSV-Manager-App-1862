import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const useCSVStore = create(
  subscribeWithSelector((set, get) => ({
    // File data
    fileName: '',
    fileSize: 0,
    rawData: [],
    processedData: [],
    headers: [],
    originalHeaders: [],
    
    // UI state
    isLoading: false,
    error: null,
    warnings: [],
    
    // Selection state
    selectedRows: new Set(),
    selectedColumns: new Set(),
    
    // Sorting state
    sortConfig: null,
    
    // History for undo/redo
    history: [],
    historyIndex: -1,
    maxHistorySize: 20,
    
    // Actions
    setFile: (fileName, fileSize) => {
      set({ fileName, fileSize });
    },
    
    setData: (rawData, processedData, headers, originalHeaders) => {
      const state = get();
      const newState = {
        rawData,
        processedData,
        headers,
        originalHeaders,
        selectedRows: new Set(),
        selectedColumns: new Set(),
        sortConfig: null,
      };
      
      // Add to history
      const historyEntry = {
        processedData: [...processedData],
        headers: [...headers],
        timestamp: Date.now(),
        action: 'file_loaded'
      };
      
      set({
        ...newState,
        history: [historyEntry],
        historyIndex: 0,
      });
    },
    
    setLoading: (isLoading) => set({ isLoading }),
    
    setError: (error) => set({ error }),
    
    setWarnings: (warnings) => set({ warnings }),
    
    // Selection actions
    selectRows: (rows) => {
      set({ selectedRows: new Set(rows) });
    },
    
    selectColumns: (columns) => {
      set({ selectedColumns: new Set(columns) });
    },
    
    toggleRowSelection: (rowIndex, isMultiSelect = false, isRangeSelect = false) => {
      const state = get();
      const newSelectedRows = new Set(state.selectedRows);
      
      if (isRangeSelect && state.selectedRows.size > 0) {
        const existingIndices = Array.from(state.selectedRows);
        const lastSelected = Math.max(...existingIndices);
        const start = Math.min(lastSelected, rowIndex);
        const end = Math.max(lastSelected, rowIndex);
        
        for (let i = start; i <= end; i++) {
          newSelectedRows.add(i);
        }
      } else if (isMultiSelect) {
        if (newSelectedRows.has(rowIndex)) {
          newSelectedRows.delete(rowIndex);
        } else {
          newSelectedRows.add(rowIndex);
        }
      } else {
        newSelectedRows.clear();
        newSelectedRows.add(rowIndex);
      }
      
      set({ selectedRows: newSelectedRows });
    },
    
    toggleColumnSelection: (columnIndex, isMultiSelect = false, isRangeSelect = false) => {
      const state = get();
      const newSelectedColumns = new Set(state.selectedColumns);
      
      if (isRangeSelect && state.selectedColumns.size > 0) {
        const existingIndices = Array.from(state.selectedColumns);
        const lastSelected = Math.max(...existingIndices);
        const start = Math.min(lastSelected, columnIndex);
        const end = Math.max(lastSelected, columnIndex);
        
        for (let i = start; i <= end; i++) {
          newSelectedColumns.add(i);
        }
      } else if (isMultiSelect) {
        if (newSelectedColumns.has(columnIndex)) {
          newSelectedColumns.delete(columnIndex);
        } else {
          newSelectedColumns.add(columnIndex);
        }
      } else {
        newSelectedColumns.clear();
        newSelectedColumns.add(columnIndex);
      }
      
      set({ selectedColumns: newSelectedColumns });
    },
    
    selectAllRows: () => {
      const state = get();
      const allRows = new Set(Array.from({ length: state.processedData.length }, (_, i) => i));
      set({ selectedRows: allRows });
    },
    
    selectAllColumns: () => {
      const state = get();
      const allColumns = new Set(Array.from({ length: state.headers.length }, (_, i) => i));
      set({ selectedColumns: allColumns });
    },
    
    clearSelections: () => {
      set({ selectedRows: new Set(), selectedColumns: new Set() });
    },
    
    // Sorting
    setSortConfig: (sortConfig) => {
      set({ sortConfig });
    },
    
    // Data manipulation with history
    addToHistory: (action) => {
      const state = get();
      const historyEntry = {
        processedData: [...state.processedData],
        headers: [...state.headers],
        timestamp: Date.now(),
        action
      };
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyEntry);
      
      if (newHistory.length > state.maxHistorySize) {
        newHistory.shift();
      }
      
      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    },
    
    deleteRows: (rowIndices) => {
      const state = get();
      state.addToHistory('delete_rows');
      
      const sortedIndices = Array.from(rowIndices).sort((a, b) => b - a);
      let newData = [...state.processedData];
      
      sortedIndices.forEach(index => {
        newData.splice(index, 1);
      });
      
      set({
        processedData: newData,
        selectedRows: new Set(),
      });
    },
    
    deleteColumns: (columnIndices) => {
      const state = get();
      state.addToHistory('delete_columns');
      
      const sortedIndices = Array.from(columnIndices).sort((a, b) => b - a);
      let newHeaders = [...state.headers];
      let newData = state.processedData.map(row => [...row]);
      
      sortedIndices.forEach(index => {
        newHeaders.splice(index, 1);
        newData.forEach(row => {
          row.splice(index, 1);
        });
      });
      
      set({
        headers: newHeaders,
        processedData: newData,
        selectedColumns: new Set(),
      });
    },
    
    // Undo/Redo
    canUndo: () => {
      const state = get();
      return state.historyIndex > 0;
    },
    
    canRedo: () => {
      const state = get();
      return state.historyIndex < state.history.length - 1;
    },
    
    undo: () => {
      const state = get();
      if (state.canUndo()) {
        const newIndex = state.historyIndex - 1;
        const historyEntry = state.history[newIndex];
        
        set({
          processedData: [...historyEntry.processedData],
          headers: [...historyEntry.headers],
          historyIndex: newIndex,
          selectedRows: new Set(),
          selectedColumns: new Set(),
        });
      }
    },
    
    redo: () => {
      const state = get();
      if (state.canRedo()) {
        const newIndex = state.historyIndex + 1;
        const historyEntry = state.history[newIndex];
        
        set({
          processedData: [...historyEntry.processedData],
          headers: [...historyEntry.headers],
          historyIndex: newIndex,
          selectedRows: new Set(),
          selectedColumns: new Set(),
        });
      }
    },
    
    // Reset store
    reset: () => {
      set({
        fileName: '',
        fileSize: 0,
        rawData: [],
        processedData: [],
        headers: [],
        originalHeaders: [],
        isLoading: false,
        error: null,
        warnings: [],
        selectedRows: new Set(),
        selectedColumns: new Set(),
        sortConfig: null,
        history: [],
        historyIndex: -1,
      });
    },
  }))
);

export default useCSVStore;