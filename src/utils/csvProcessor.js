const IGNORED_COLUMNS = [0, 4, 6]; // 0-based indices for columns 1, 5, 7
const HEADER_ROW_INDEX = 10; // 0-based index for row 11

// Simple CSV parser implementation
const parseCSV = (text) => {
  const lines = text.split('\n');
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const row = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current.trim());
    result.push(row);
  }
  
  return result;
};

export const processCSVFile = async (file) => {
  return new Promise((resolve, reject) => {
    const warnings = [];
    
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      reject(new Error(`File size (${formatFileSize(file.size)}) exceeds the 50MB limit`));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const data = parseCSV(text);
        const processedResult = processCSVData(data, warnings);
        
        resolve({
          ...processedResult,
          warnings,
          fileName: file.name,
          fileSize: file.size
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

const processCSVData = (rawData, warnings) => {
  // Validate data structure
  if (!rawData || rawData.length === 0) {
    throw new Error('CSV file is empty');
  }
  
  if (rawData.length < HEADER_ROW_INDEX + 1) {
    throw new Error(`CSV file must have at least ${HEADER_ROW_INDEX + 1} rows (found ${rawData.length})`);
  }
  
  // Extract headers from row 11 (index 10)
  const headerRow = rawData[HEADER_ROW_INDEX];
  if (!headerRow || headerRow.length === 0) {
    throw new Error('Header row is empty');
  }
  
  // Filter out ignored columns and clean headers
  const { headers: cleanHeaders, originalHeaders } = processHeaders(headerRow, warnings);
  
  // Process data rows (skip rows 1-11, start from row 12)
  const dataRows = rawData.slice(HEADER_ROW_INDEX + 1);
  const processedData = dataRows.map(row => 
    filterAndCleanRow(row, IGNORED_COLUMNS)
  ).filter(row => row.some(cell => cell !== '')); // Remove completely empty rows
  
  if (processedData.length === 0) {
    throw new Error('No data rows found after processing');
  }
  
  // Auto-sort by person name column (index 3 after filtering)
  const personNameIndex = 3;
  if (cleanHeaders.length > personNameIndex) {
    processedData.sort((a, b) => {
      const aValue = (a[personNameIndex] || '').toString().toLowerCase();
      const bValue = (b[personNameIndex] || '').toString().toLowerCase();
      return aValue.localeCompare(bValue);
    });
    warnings.push(`Data automatically sorted by "${cleanHeaders[personNameIndex]}" column`);
  }
  
  // Add grand total column
  const dataWithTotals = addGrandTotalColumn(processedData, cleanHeaders, personNameIndex, warnings);
  
  return {
    rawData,
    processedData: dataWithTotals.data,
    headers: dataWithTotals.headers,
    originalHeaders
  };
};

const processHeaders = (headerRow, warnings) => {
  const originalHeaders = [...headerRow];
  
  // Filter out ignored columns
  const filteredHeaders = headerRow.filter((_, index) => !IGNORED_COLUMNS.includes(index));
  
  if (IGNORED_COLUMNS.length > 0) {
    warnings.push(`Ignored columns: ${IGNORED_COLUMNS.map(i => i + 1).join(', ')} (1-based indexing)`);
  }
  
  // Clean and sanitize headers
  const cleanHeaders = [];
  const headerCounts = new Map();
  
  filteredHeaders.forEach((header, index) => {
    let cleanHeader = cleanCellData(header || `Column_${index + 1}`);
    
    // Sanitize header name
    cleanHeader = cleanHeader
      .replace(/[^a-zA-Z0-9_]/g, '_') // Replace invalid characters
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 30); // Limit length
    
    if (!cleanHeader) {
      cleanHeader = `Column_${index + 1}`;
    }
    
    // Handle duplicates
    if (headerCounts.has(cleanHeader)) {
      const count = headerCounts.get(cleanHeader) + 1;
      headerCounts.set(cleanHeader, count);
      cleanHeader = `${cleanHeader}_${count}`;
    } else {
      headerCounts.set(cleanHeader, 1);
    }
    
    cleanHeaders.push(cleanHeader);
    
    if (cleanHeader !== (originalHeaders[index] || '')) {
      warnings.push(`Header "${originalHeaders[index] || ''}" cleaned to "${cleanHeader}"`);
    }
  });
  
  return { headers: cleanHeaders, originalHeaders };
};

const filterAndCleanRow = (row, ignoredColumns) => {
  return row
    .filter((_, index) => !ignoredColumns.includes(index))
    .map(cell => cleanCellData(cell));
};

const cleanCellData = (cell) => {
  if (cell === null || cell === undefined) return '';
  
  let cleaned = cell.toString().trim();
  
  // Remove leading = and " characters
  while (cleaned.startsWith('=') || cleaned.startsWith('"')) {
    cleaned = cleaned.substring(1);
  }
  
  // Remove trailing " characters
  while (cleaned.endsWith('"')) {
    cleaned = cleaned.substring(0, cleaned.length - 1);
  }
  
  return cleaned.trim();
};

const addGrandTotalColumn = (data, headers, personNameIndex, warnings) => {
  const debitAmountIndex = 5; // Index 5 after filtering columns 1, 5, 7
  
  if (headers.length <= Math.max(personNameIndex, debitAmountIndex)) {
    warnings.push('Insufficient columns for grand total calculation');
    return { data, headers: [...headers, 'Total'] };
  }
  
  // Group data by person name
  const groups = new Map();
  data.forEach((row, index) => {
    const personName = row[personNameIndex] || '';
    if (!groups.has(personName)) {
      groups.set(personName, []);
    }
    groups.get(personName).push({ row, index });
  });
  
  // Calculate totals and mark last row of each group
  const processedData = data.map(row => [...row, '']); // Add empty Total column
  
  groups.forEach((groupRows, personName) => {
    let total = 0;
    let lastRowIndex = -1;
    
    groupRows.forEach(({ row, index }) => {
      const debitAmount = parseFloat(row[debitAmountIndex]) || 0;
      total += debitAmount;
      lastRowIndex = Math.max(lastRowIndex, index);
    });
    
    // Set total on the last row of the group
    if (lastRowIndex >= 0) {
      processedData[lastRowIndex][processedData[lastRowIndex].length - 1] = total.toFixed(2);
    }
  });
  
  const newHeaders = [...headers, 'Total'];
  warnings.push('Grand total column added based on debit amounts grouped by person name');
  
  return { data: processedData, headers: newHeaders };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const exportToCSV = (data, headers, fileName) => {
  const csvContent = [
    // Metadata header
    `# Bank Statement CSV Export`,
    `# Generated: ${new Date().toISOString()}`,
    `# Rows: ${data.length}`,
    `# Columns: ${headers.length}`,
    '',
    // Headers
    headers.join(','),
    // Data
    ...data.map(row => 
      row.map(cell => {
        const stringCell = cell?.toString() || '';
        // Escape commas and quotes
        if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n')) {
          return `"${stringCell.replace(/"/g, '""')}"`;
        }
        return stringCell;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.replace(/\.[^/.]+$/, '') + '_processed.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};