
import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../utils/dataImportExport';

const ImportExportButtons = ({ formData, onImportData }) => {
  const fileInputRef = useRef(null);

  const handleExportExcel = () => {
    try {
      exportToExcel(formData);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data to Excel. Please try again.');
    }
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importedData = await importFromExcel(file);
      onImportData(importedData);
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing from Excel:', error);
      alert('Error importing data from Excel. Please check the file format.');
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="flex gap-2 mb-4">
      <Button
        onClick={handleExportExcel}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download size={16} />
        Export Excel
      </Button>
      
      <Button
        onClick={handleImportExcel}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Upload size={16} />
        Import Excel
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImportExportButtons;
