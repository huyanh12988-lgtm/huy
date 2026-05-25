import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle, FileDown } from 'lucide-react';
import { IpcMain } from '../main/ipc';
import { cn } from '../lib/utils';

interface ExcelImportProps {
  onImportComplete: () => void;
}

export const ExcelImport: React.FC<ExcelImportProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const bstr = event.target?.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });
      
      const normalizeDate = (dateStr: string) => {
        if (!dateStr) return '';
        const clean = dateStr.toString().trim();
        if (clean.includes('/')) {
          const parts = clean.split('/');
          if (parts.length === 3) {
            // Convert DD/MM/YYYY to YYYY-MM-DD
            const d = parts[0].padStart(2, '0');
            const m = parts[1].padStart(2, '0');
            const y = parts[2];
            return `${y}-${m}-${d}`;
          }
        }
        return clean;
      };

      const candidatesToImport = data.map(item => ({
        fullName: item['Họ và tên'] || '',
        dateOfBirth: normalizeDate(item['Ngày sinh'] || ''),
        email: item['Email'] || '',
        phone: String(item['Số điện thoại'] || '').trim(),
        identificationNumber: String(item['Số CMND/CCCD'] || '').trim(),
        examRegistrationNumber: String(item['Số báo danh'] || '').trim(),
        birthPlace: item['Nơi sinh'] || '',
        ethnicity: item['Dân tộc'] || '',
        gender: item['Giới tính'] || 'Nam',
        permanentAddress: item['Nơi thường trú'] || '',
        highSchool: item['Tên trường THPT'] || '',
        highSchoolProvinceCode: item['Mã tỉnh trường THPT'] || '',
        highSchoolCode: item['Mã trường THPT'] || '',
        graduationYear: item['Năm tốt nghiệp'] || '',
        consultantName: item['Người tư vấn tuyển sinh'] || '',
        mathScore: Number(item['Toán'] || 0),
        literatureScore: Number(item['Ngữ văn'] || 0),
        englishScore: Number(item['Tiếng Anh'] || 0),
        physicsScore: Number(item['Vật Lý'] || 0),
        chemistryScore: Number(item['Hóa Học'] || 0),
        biologyScore: Number(item['Sinh Học'] || 0),
        historyScore: Number(item['Lịch Sử'] || 0),
        geographyScore: Number(item['Địa Lý'] || 0),
        civicEducationScore: Number(item['GD Công dân'] || 0),
        informaticsScore: Number(item['Tin học'] || 0),
        russianScore: Number(item['Tiếng Nga'] || 0),
        chineseScore: Number(item['Tiếng Trung'] || 0),
        level: item['Bậc đào tạo'] || 'Cao đẳng',
        system: item['Hệ đào tạo'] || 'Hệ chỉ tiêu CNQP',
        major: item['Ngành'] || '',
      }));

      try {
        const beforeCount = (await IpcMain.getCandidates()).length;
        await IpcMain.addCandidates(candidatesToImport);
        const afterCount = (await IpcMain.getCandidates()).length;
        const imported = afterCount - beforeCount;
        const duplicates = candidatesToImport.length - imported;
        
        if (duplicates > 0) {
          alert(`Đã nhập thành công ${imported} thí sinh. Đã bỏ qua ${duplicates} thí sinh do trùng số CCCD.`);
        } else {
          alert(`Đã nhập thành công toàn bộ ${imported} thí sinh.`);
        }
        
        onImportComplete();
      } catch (error) {
        console.error(error);
        alert('Có lỗi xảy ra khi nhập dữ liệu.');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      { 
        'Số CMND/CCCD': '012345678901',
        'Số báo danh': '01000123',
        'Họ và tên': 'Nguyễn Văn A', 
        'Ngày sinh': '01/01/2005', 
        'Giới tính': 'Nam',
        'Dân tộc': 'Kinh',
        'Nơi sinh': 'Hà Nội',
        'Nơi thường trú': 'Số 1 Trần Phú, Ba Đình, Hà Nội',
        'Số điện thoại': '0912345678', 
        'Email': 'a@example.com', 
        'Tên trường THPT': 'THPT Chuyên', 
        'Mã tỉnh trường THPT': '01',
        'Mã trường THPT': '001',
        'Năm tốt nghiệp': '2026',
        'Người tư vấn tuyển sinh': 'Nguyễn Văn B',
        'Toán': 9, 
        'Ngữ văn': 8, 
        'Tiếng Anh': 8.5,
        'Vật Lý': 0,
        'Hóa Học': 0,
        'Sinh Học': 0,
        'Lịch Sử': 0,
        'Địa Lý': 0,
        'GD Công dân': 0,
        'Tin học': 0,
        'Tiếng Nga': 0,
        'Tiếng Trung': 0,
        'Bậc đào tạo': 'Cao đẳng',
        'Hệ đào tạo': 'Hệ chỉ tiêu CNQP',
        'Ngành': 'Công nghệ thông tin'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Auto-calculate column widths
    const colWidths = Object.keys(templateData[0]).map(key => {
      const headerLen = key.length;
      return { wch: Math.max(headerLen + 2, 15) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MauThiSinh");
    XLSX.writeFile(wb, "Mau_Danh_Sach_Thi_Sinh_2026.xlsx");
  };

  return (
    <div className="flex gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
        className="hidden"
      />
      
      <button
        onClick={downloadTemplate}
        className="btn-3d bg-white border-2 border-slate-200 text-slate-600 px-6 h-12 rounded-full font-black text-xs flex items-center gap-3"
      >
        <FileDown className="w-4 h-4 text-primary" />
        TẢI FILE MẪU
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn-3d bg-primary text-white px-8 h-12 rounded-full font-black text-sm flex items-center gap-3 tracking-wide"
      >
        <Upload className="w-4 h-4" />
        NHẬP DỮ LIỆU EXCEL
      </button>
    </div>
  );
};
