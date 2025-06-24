import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Data, Plant } from '../types';

interface ExcelExportOptions {
  filename: string;
  data: Data;
  plants: Plant[];
  regionNumbers?: number[];
}

export const exportToExcel = ({ filename, data, plants, regionNumbers }: ExcelExportOptions) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Determine which regions to include
  const regionsToInclude = regionNumbers && regionNumbers.length > 0 
    ? regionNumbers 
    : data.regions.map(r => r.id);

  // Build column headers
  const columnHeaders = [
    'Type(s)',
    'Botanical Name', 
    'Common Name',
    ...regionsToInclude.flatMap(regionId => [
      `Region ${regionId} Water Use`,
      `Region ${regionId} ET0`,
      `Region ${regionId} Plant Factor`
    ])
  ];

  // Prepare the data rows
  const worksheetData = plants.map(plant => {
    const row: any = {};
    
    // Basic plant information
    row['Type(s)'] = plant.types.map(typeCode => data.plantTypeNameByCode[typeCode] || typeCode).join(', ');
    row['Botanical Name'] = plant.botanicalName;
    row['Common Name'] = plant.commonName;

    // Add region-specific water use data with ET0 and Plant Factor
    regionsToInclude.forEach(regionId => {
      const waterUseCode = plant.waterUseByRegion[regionId - 1]; // 1-based region numbers
      const waterUseData = waterUseCode ? data.waterUseByCode[waterUseCode] : null;
      
      row[`Region ${regionId} Water Use`] = waterUseData?.name || 'N/A';
      row[`Region ${regionId} ET0`] = waterUseData?.percentageET0 ? `${waterUseData.percentageET0}%` : 'N/A';
      row[`Region ${regionId} Plant Factor`] = waterUseData?.plantFactor || 'N/A';
    });

    return row;
  });

  // Create worksheet from the data
  const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header: columnHeaders });

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plants');

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Create blob and save
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};

// Alternative: Export with custom sheets
export const exportToExcelWithSheets = (
  sheets: { name: string; data: any[] }[], 
  filename: string
) => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};

// React component for Excel download button
interface ExcelDownloadButtonProps {
  data: Data;
  plants: Plant[];
  regionNumbers?: number[];
  filename: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const ExcelDownloadButton: React.FC<ExcelDownloadButtonProps> = ({
  data,
  plants,
  regionNumbers,
  filename,
  children,
  className,
  disabled
}) => {
  const handleDownload = () => {
    exportToExcel({ data, plants, regionNumbers, filename });
  };

  return (
    <button 
      onClick={handleDownload}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
