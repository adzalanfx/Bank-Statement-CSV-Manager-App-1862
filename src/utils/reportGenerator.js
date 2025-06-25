export const generateHTMLReport = (data, headers, fileName, fileSize) => {
  const totalRows = data.length;
  const totalColumns = headers.length;
  const generationDate = new Date().toLocaleString();
  
  // Find the Total column index
  const totalColumnIndex = headers.findIndex(header => header === 'Total');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bank Statement Report - ${fileName}</title>
      <style>
        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
          color: #333;
        }
        
        .report-container {
          max-width: 100%;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .report-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .report-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 10px 0;
        }
        
        .report-subtitle {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
        }
        
        .report-summary {
          padding: 20px 30px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .summary-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #667eea;
        }
        
        .summary-label {
          font-size: 12px;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .summary-value {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }
        
        .data-table-container {
          padding: 30px;
          overflow-x: auto;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          background: white;
        }
        
        .data-table th {
          background: #667eea;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          border: 1px solid #5a67d8;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .data-table td {
          padding: 10px 8px;
          border: 1px solid #e9ecef;
          vertical-align: top;
        }
        
        .data-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .data-table tr:hover {
          background-color: #e3f2fd;
        }
        
        .total-row {
          background-color: #fff3cd !important;
          font-weight: 600;
        }
        
        .total-row:hover {
          background-color: #ffeaa7 !important;
        }
        
        .numeric-cell {
          text-align: right;
          font-family: 'Courier New', monospace;
        }
        
        .total-cell {
          background-color: #28a745;
          color: white;
          font-weight: bold;
          text-align: right;
        }
        
        .report-footer {
          padding: 20px 30px;
          background: #f8f9fa;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="report-header">
          <h1 class="report-title">Bank Statement Report</h1>
          <p class="report-subtitle">${fileName}</p>
        </div>
        
        <div class="report-summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Rows</div>
              <div class="summary-value">${totalRows.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Columns</div>
              <div class="summary-value">${totalColumns}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">File Size</div>
              <div class="summary-value">${formatFileSize(fileSize)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Generated</div>
              <div class="summary-value">${generationDate}</div>
            </div>
          </div>
        </div>
        
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                ${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map((row, rowIndex) => {
                const hasTotal = totalColumnIndex >= 0 && row[totalColumnIndex] && row[totalColumnIndex] !== '';
                const rowClass = hasTotal ? 'total-row' : '';
                
                return `<tr class="${rowClass}">
                  ${row.map((cell, cellIndex) => {
                    const cellValue = cell?.toString() || '';
                    const isNumeric = !isNaN(parseFloat(cellValue)) && isFinite(cellValue);
                    const isTotal = cellIndex === totalColumnIndex && cellValue !== '';
                    
                    let cellClass = '';
                    if (isTotal) {
                      cellClass = 'total-cell';
                    } else if (isNumeric) {
                      cellClass = 'numeric-cell';
                    }
                    
                    return `<td class="${cellClass}">${escapeHtml(cellValue)}</td>`;
                  }).join('')}
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="report-footer">
          <p>Generated by Bank Statement CSV Manager | ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return htmlContent;
};

export const printReport = (htmlContent) => {
  try {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups for this site and try again.');
      return;
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
    
  } catch (error) {
    console.error('Error opening print window:', error);
    alert('Unable to open print dialog. Please check your browser settings.');
  }
};

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};