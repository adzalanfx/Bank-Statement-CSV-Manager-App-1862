import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useCSVStore from '../stores/csvStore';

const CELL_HEIGHT = 35;
const HEADER_HEIGHT = 40;
const MIN_COLUMN_WIDTH = 80;
const DEFAULT_COLUMN_WIDTH = 150;
const ROW_NUMBER_WIDTH = 50;

const DataGrid = ({ containerWidth, containerHeight }) => {
  const {
    processedData,
    headers,
    selectedRows,
    selectedColumns,
    sortConfig,
    toggleRowSelection,
    toggleColumnSelection,
    setSortConfig
  } = useCSVStore();

  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef();

  // Calculate column widths
  const columnWidths = useMemo(() => {
    if (!headers.length) return [];
    
    const availableWidth = containerWidth - ROW_NUMBER_WIDTH - 20; // Account for scrollbar
    const totalColumns = headers.length;
    const baseWidth = Math.max(MIN_COLUMN_WIDTH, availableWidth / totalColumns);
    
    return headers.map(() => Math.min(baseWidth, DEFAULT_COLUMN_WIDTH));
  }, [headers, containerWidth]);

  // Sort data based on sort config
  const sortedData = useMemo(() => {
    if (!sortConfig || !processedData.length) return processedData;
    
    const { columnIndex, direction } = sortConfig;
    
    return [...processedData].sort((a, b) => {
      const aValue = a[columnIndex]?.toString() || '';
      const bValue = b[columnIndex]?.toString() || '';
      
      // Try numeric comparison first
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison
      const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      return direction === 'asc' ? comparison : -comparison;
    });
  }, [processedData, sortConfig]);

  // Calculate visible rows
  const visibleRowCount = Math.ceil(containerHeight / CELL_HEIGHT) + 5; // Buffer rows
  const startRow = Math.floor(scrollTop / CELL_HEIGHT);
  const endRow = Math.min(startRow + visibleRowCount, sortedData.length);

  // Calculate visible columns
  const totalTableWidth = columnWidths.reduce((sum, width) => sum + width, 0) + ROW_NUMBER_WIDTH;
  const visibleColumnCount = Math.ceil(containerWidth / DEFAULT_COLUMN_WIDTH) + 3; // Buffer columns
  
  let startCol = 0;
  let accumulatedWidth = ROW_NUMBER_WIDTH;
  for (let i = 0; i < columnWidths.length; i++) {
    if (accumulatedWidth + columnWidths[i] > scrollLeft) {
      startCol = i;
      break;
    }
    accumulatedWidth += columnWidths[i];
  }
  
  const endCol = Math.min(startCol + visibleColumnCount, headers.length);

  const handleSort = (columnIndex) => {
    const currentSort = sortConfig?.columnIndex === columnIndex ? sortConfig.direction : null;
    const newDirection = currentSort === 'asc' ? 'desc' : 'asc';
    setSortConfig({ columnIndex, direction: newDirection });
  };

  const handleCellClick = (rowIndex, columnIndex, event) => {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;

    if (columnIndex === -1) {
      // Row header clicked
      toggleRowSelection(rowIndex, isCtrlOrCmd, isShift);
    } else if (rowIndex === -1) {
      // Column header clicked
      toggleColumnSelection(columnIndex, isCtrlOrCmd, isShift);
    }
  };

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollLeft } = e.target;
    setScrollTop(scrollTop);
    setScrollLeft(scrollLeft);
  }, []);

  if (!processedData.length || !headers.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No data to display</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full bg-white border border-gray-200 rounded-lg overflow-hidden relative"
    >
      {/* Header Row */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 flex">
        {/* Top-left corner */}
        <div
          className="bg-gray-100 border-r border-gray-200 flex-shrink-0"
          style={{ width: ROW_NUMBER_WIDTH, height: HEADER_HEIGHT }}
        />
        
        {/* Column Headers */}
        <div
          className="flex overflow-hidden"
          style={{ transform: `translateX(-${scrollLeft}px)` }}
        >
          {headers.map((header, colIndex) => {
            const isSelected = selectedColumns.has(colIndex);
            const isSorted = sortConfig?.columnIndex === colIndex;
            
            return (
              <div
                key={colIndex}
                className={`
                  flex items-center justify-between px-3 border-r border-gray-200 
                  font-medium text-sm cursor-pointer select-none flex-shrink-0
                  ${isSelected 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
                style={{ width: columnWidths[colIndex], height: HEADER_HEIGHT }}
                onClick={(e) => handleCellClick(-1, colIndex, e)}
                onDoubleClick={() => handleSort(colIndex)}
                title={`${header} (Double-click to sort)`}
              >
                <span className="truncate">{header}</span>
                {isSorted && (
                  <span className="ml-1 text-xs">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="overflow-auto"
        style={{ height: containerHeight - HEADER_HEIGHT }}
        onScroll={handleScroll}
      >
        <div
          style={{
            height: sortedData.length * CELL_HEIGHT,
            width: totalTableWidth,
            position: 'relative'
          }}
        >
          {/* Visible Rows */}
          {Array.from({ length: endRow - startRow }, (_, i) => {
            const rowIndex = startRow + i;
            const row = sortedData[rowIndex];
            const isRowSelected = selectedRows.has(rowIndex);

            return (
              <div
                key={rowIndex}
                className="absolute flex"
                style={{
                  top: rowIndex * CELL_HEIGHT,
                  left: 0,
                  height: CELL_HEIGHT
                }}
              >
                {/* Row Number */}
                <div
                  className={`
                    flex items-center justify-center border-r border-b border-gray-200 
                    text-xs font-medium cursor-pointer select-none flex-shrink-0
                    ${isRowSelected 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }
                  `}
                  style={{ width: ROW_NUMBER_WIDTH }}
                  onClick={(e) => handleCellClick(rowIndex, -1, e)}
                >
                  {rowIndex + 1}
                </div>

                {/* Data Cells */}
                <div
                  className="flex"
                  style={{ transform: `translateX(-${scrollLeft}px)` }}
                >
                  {headers.map((_, colIndex) => {
                    if (colIndex < startCol || colIndex >= endCol) return null;
                    
                    const isColumnSelected = selectedColumns.has(colIndex);
                    const cellValue = row?.[colIndex] || '';
                    
                    // Check if this is a total cell
                    const isTotalCell = colIndex === headers.length - 1 && 
                                       headers[colIndex] === 'Total' && 
                                       cellValue !== '';

                    return (
                      <div
                        key={colIndex}
                        className={`
                          px-3 py-2 border-r border-b border-gray-200 text-sm cursor-pointer 
                          flex items-center flex-shrink-0
                          ${isRowSelected || isColumnSelected 
                            ? 'bg-primary-50 text-primary-900' 
                            : isTotalCell
                            ? 'bg-green-50 text-green-800 font-semibold'
                            : 'bg-white text-gray-900 hover:bg-gray-50'
                          }
                          ${isTotalCell ? 'justify-end' : ''}
                        `}
                        style={{ width: columnWidths[colIndex] }}
                        onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                        title={cellValue}
                      >
                        <span className="truncate">{cellValue}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default DataGrid;