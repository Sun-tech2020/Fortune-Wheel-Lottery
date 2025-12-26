
import React, { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Candidate } from '../types';

interface ExcelUploaderProps {
  onDataLoaded: (data: Candidate[]) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataLoaded }) => {
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet) as any[];

      const candidates: Candidate[] = json.map((row) => ({
        department: row['部门'] || row['Department'] || '未知部门',
        name: row['姓名'] || row['Name'] || '未知姓名',
        id: String(row['编号'] || row['ID'] || row['Id'] || '000'),
      }));

      if (candidates.length > 0) {
        onDataLoaded(candidates);
      } else {
        alert('Excel文件中没有找到有效数据。请确保包含：部门、姓名、编号 三列。');
      }
    };
    reader.readAsBinaryString(file);
  }, [onDataLoaded]);

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-400 rounded-2xl bg-indigo-900/20 backdrop-blur-sm transition-all hover:border-indigo-300">
      <div className="mb-4 text-indigo-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-center font-semibold text-lg">点击或拖拽 Excel 文件上传</p>
        <p className="text-center text-sm text-indigo-300/80 mt-1">需包含列：部门、姓名、编号</p>
      </div>
      <label className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105">
        选择文件
        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </label>
    </div>
  );
};

export default ExcelUploader;
