
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (formData) => {
  const workbook = XLSX.utils.book_new();
  
  // Create company info sheet
  const companyData = [
    ['Field', 'Value'],
    ['Company Name', formData.yourCompany.name || ''],
    ['Company Address', formData.yourCompany.address || ''],
    ['Company Phone', formData.yourCompany.phone || ''],
    ['GST Number', formData.yourCompany.gst || ''],
    ['Cashier', formData.cashier || ''],
    ['Bill To', formData.billTo || ''],
    ['Invoice Number', formData.invoice.number || ''],
    ['Invoice Date', formData.invoice.date || ''],
    ['Currency', formData.selectedCurrency || ''],
    ['Tax Percentage', formData.taxPercentage || 0],
    ['Notes', formData.notes || ''],
    ['Footer', formData.footer || '']
  ];
  
  const companySheet = XLSX.utils.aoa_to_sheet(companyData);
  XLSX.utils.book_append_sheet(workbook, companySheet, 'Company Info');
  
  // Create items sheet
  const itemsData = [
    ['Item Name', 'Description', 'Quantity', 'Amount', 'Total']
  ];
  
  formData.items.forEach(item => {
    itemsData.push([
      item.name || '',
      item.description || '',
      item.quantity || 0,
      item.amount || 0,
      item.total || 0
    ]);
  });
  
  const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
  XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Items');
  
  // Generate filename with timestamp
  const timestamp = new Date().getTime();
  const fileName = `receipt_data_${timestamp}.xlsx`;
  
  // Save the file
  XLSX.writeFile(workbook, fileName);
};

export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Read company info
        const companySheet = workbook.Sheets['Company Info'];
        const companyData = XLSX.utils.sheet_to_json(companySheet, { header: 1 });
        
        // Read items
        const itemsSheet = workbook.Sheets['Items'];
        const itemsData = XLSX.utils.sheet_to_json(itemsSheet, { header: 1 });
        
        // Parse company data
        const formData = {
          yourCompany: {
            name: getValueFromData(companyData, 'Company Name'),
            address: getValueFromData(companyData, 'Company Address'),
            phone: getValueFromData(companyData, 'Company Phone'),
            gst: getValueFromData(companyData, 'GST Number')
          },
          cashier: getValueFromData(companyData, 'Cashier'),
          billTo: getValueFromData(companyData, 'Bill To'),
          invoice: {
            number: getValueFromData(companyData, 'Invoice Number'),
            date: getValueFromData(companyData, 'Invoice Date')
          },
          selectedCurrency: getValueFromData(companyData, 'Currency') || 'MYR',
          taxPercentage: parseFloat(getValueFromData(companyData, 'Tax Percentage')) || 0,
          notes: getValueFromData(companyData, 'Notes'),
          footer: getValueFromData(companyData, 'Footer')
        };
        
        // Parse items data
        const items = [];
        for (let i = 1; i < itemsData.length; i++) {
          const row = itemsData[i];
          if (row && row.length > 0) {
            items.push({
              name: row[0] || '',
              description: row[1] || '',
              quantity: parseFloat(row[2]) || 0,
              amount: parseFloat(row[3]) || 0,
              total: parseFloat(row[4]) || 0
            });
          }
        }
        
        formData.items = items.length > 0 ? items : [{ name: '', description: '', quantity: 0, amount: 0, total: 0 }];
        
        resolve(formData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const getValueFromData = (data, fieldName) => {
  const row = data.find(row => row[0] === fieldName);
  return row ? row[1] : '';
};

export const exportToPDF = async (receiptElement) => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    
    const canvas = await html2canvas(receiptElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [canvas.width * 0.264583, canvas.height * 0.264583],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.264583, canvas.height * 0.264583);

    const timestamp = new Date().getTime();
    const fileName = `Receipt_${timestamp}.pdf`;

    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
