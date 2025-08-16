// Export Utilities for proper Arabic text handling

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  encoding?: 'utf-8' | 'utf-8-bom';
  includeBOM?: boolean;
}

export const exportToCSV = (data: any[], filename: string, options: ExportOptions = { format: 'csv' }) => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null/undefined values
        if (value === null || value === undefined || value === '') {
          return '"N/A"';
        }
        // Escape quotes and wrap in quotes
        const escapedValue = String(value).replace(/"/g, '""');
        return `"${escapedValue}"`;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  
  // Add BOM for proper Arabic text encoding
  const BOM = '\uFEFF';
  const finalContent = options.includeBOM !== false ? BOM + csvContent : csvContent;
  
  // Create and download file
  const blob = new Blob([finalContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  downloadFile(blob, `${filename}.csv`);
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper function to format data for export
export const formatDataForExport = (data: any[]) => {
  return data.map(item => ({
    Source: item.source || 'N/A',
    Code: item.code || 'N/A',
    Title: item.title || 'N/A',
    Price: item.price || (item.dataSource === 'unavailable' ? 'Unavailable' : 'N/A'),
    Seller: item.seller || item.buyboxWinner || (item.dataSource === 'unavailable' ? 'Unavailable' : 'N/A'),
    'Data Source': item.source === 'Amazon' 
      ? (item.dataSource === 'unavailable' ? 'Unavailable' : 
         item.dataSource === 'buying_options' ? 'Buying Options' : 'Main Page')
      : 'N/A',
    Image: item.image || 'N/A',
    Link: item.link || 'N/A',
    'Scraped At': item.scrapedAt ? new Date(item.scrapedAt).toLocaleString('en-US') : 'N/A',
    Status: item.status || 'N/A'
  }));
};

// Helper function to format Amazon Scraper data for export
export const formatAmazonScraperData = (data: any[]) => {
  return data.map(item => ({
    'Product Title': item.title || 'N/A',
    'Price': item.price || (item.dataSource === 'unavailable' ? 'Unavailable' : 'N/A'),
    'Buybox Winner': item.seller || item.buyboxWinner || (item.dataSource === 'unavailable' ? 'Unavailable' : 'N/A'),
    'Data Source': item.dataSource === 'unavailable' ? 'Unavailable' : 
                   item.dataSource === 'buying_options' ? 'Buying Options' : 
                   item.dataSource || 'Main Page',
    'Product Image': item.image || 'N/A',
    'Product Link': item.link || 'N/A',
    'ASIN': item.code || item.asin || 'N/A',
    'Scraped At': item.scrapedAt ? new Date(item.scrapedAt).toLocaleString('en-US') : 'N/A'
  }));
}; 