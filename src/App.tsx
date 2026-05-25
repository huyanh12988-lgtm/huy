import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  Search, 
  Filter,
  PlusCircle,
  FileDown,
  FileUp,
  Trash2,
  Bell,
  LogOut,
  ShieldCheck,
  SearchCode,
  FileJson,
  Printer,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { Candidate, AdmissionStatus, UserRole } from './types';
import { IpcMain } from './main/ipc';
import { CandidateForm } from './components/CandidateForm';
import { CandidateTable } from './components/CandidateTable';
import { ExcelImport } from './components/ExcelImport';
import { Reports } from './components/Reports';
import { Auth } from './renderer/components/Auth';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import * as XLSX from 'xlsx';
import { printCandidateForms } from './lib/printUtils';

export default function App() {
  const [portal, setPortal] = useState<'LANDING' | 'STUDENT' | 'ADMIN'>('LANDING');
  const [user, setUser] = useState<{role: UserRole} | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AdmissionStatus | 'ALL'>('ALL');
  const [view, setView] = useState<'LIST' | 'FORM' | 'REPORTS'>('LIST');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const refreshData = async () => {
    try {
      const data = await IpcMain.getCandidates();
      console.log(`Data refreshed. Found ${data.length} candidates.`);
      setCandidates(data);
      // Synchronize selection
      setSelectedIds(prev => prev.filter(id => data.some(c => c.id === id)));
    } catch (e) {
      console.error('Refresh data failed', e);
    }
  };

  useEffect(() => {
    if (user) refreshData();
  }, [user]);

  const handleExportExcel = () => {
    if (candidates.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      try {
        const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
        if (parts.length === 3) {
          // If input is YYYY-MM-DD
          if (parts[0].length === 4) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
          // If input is already DD/MM/YYYY
          return `${parts[0]}/${parts[1]}/${parts[2]}`;
        }
        return dateStr;
      } catch (e) {
        return dateStr;
      }
    };

    const exportData = candidates.map(c => ({
      'Số CMND/CCCD': ` ${c.identificationNumber || ''}`.trim(),
      'Số báo danh': c.examRegistrationNumber,
      'Họ và tên': c.fullName,
      'Ngày sinh': formatDate(c.dateOfBirth),
      'Giới tính': c.gender,
      'Dân tộc': c.ethnicity,
      'Nơi sinh': c.birthPlace,
      'Nơi thường trú': c.permanentAddress,
      'Số điện thoại': ` ${c.phone || ''}`.trim(),
      'Email': c.email,
      'Tên trường THPT': c.highSchool,
      'Mã tỉnh trường THPT': c.highSchoolProvinceCode,
      'Mã trường THPT': c.highSchoolCode,
      'Năm tốt nghiệp': c.graduationYear,
      'Người tư vấn tuyển sinh': c.consultantName,
      'Toán': c.mathScore,
      'Ngữ văn': c.literatureScore,
      'Tiếng Anh': c.englishScore || 0,
      'Vật Lý': c.physicsScore || 0,
      'Hóa Học': c.chemistryScore || 0,
      'Sinh Học': c.biologyScore || 0,
      'Lịch Sử': c.historyScore || 0,
      'Địa Lý': c.geographyScore || 0,
      'GD Công dân': c.civicEducationScore || 0,
      'Tin học': c.informaticsScore || 0,
      'Tiếng Nga': c.russianScore || 0,
      'Tiếng Trung': c.chineseScore || 0,
      'Bậc đào tạo': c.level,
      'Hệ đào tạo': c.system,
      'Ngành': c.major,
      'Tổng điểm': c.totalScore,
      'Trạng thái': c.status === AdmissionStatus.ACCEPTED ? 'Trúng tuyển' : 
                   c.status === AdmissionStatus.REJECTED ? 'Từ chối' : 
                   c.status === AdmissionStatus.REVIEWING ? 'Đang xét' : 'Chờ duyệt'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-calculate column widths
    const colWidths = Object.keys(exportData[0] || {}).map(key => {
      const headerLen = key.length;
      const maxDataLen = exportData.reduce((max, row) => {
        const val = row[key as keyof typeof row];
        const len = val ? val.toString().length : 0;
        return Math.max(max, len);
      }, headerLen);
      return { wch: Math.min(Math.max(headerLen, maxDataLen) + 2, 50) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachThiSinh");
    XLSX.writeFile(wb, `DS_ThiSinh_HCQP_2026_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(candidates, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Data_Backup_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDeleteAll = async () => {
    if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ hồ sơ thí sinh khỏi hệ thống? Thao tác này không thể hoàn tác.')) {
      await IpcMain.deleteAllCandidates();
      refreshData();
    }
  };

  const handlePrintList = () => {
    if (selectedIds.length > 0) {
      const selectedCandidates = candidates.filter(c => selectedIds.includes(c.id));
      printCandidateForms(selectedCandidates);
    } else {
      window.print();
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} thí sinh đã chọn không? Hành động này không thể hoàn tác.`)) {
      try {
        setIsDeleting(true);
        const countToDelete = selectedIds.length;
        await IpcMain.deleteCandidates(selectedIds);
        
        // Finalize state
        setSelectedIds([]);
        const data = await IpcMain.getCandidates();
        setCandidates(data);
        
        alert(`Đã xóa thành công ${countToDelete} hồ sơ thí sinh.`);
      } catch (error: any) {
        console.error('Delete error:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa dữ liệu. Vui lòng thử lại.');
        await refreshData();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBulkStatusUpdate = async (status: AdmissionStatus) => {
    if (selectedIds.length === 0) return;
    if (confirm(`Xác nhận cập nhật trạng thái cho ${selectedIds.length} hồ sơ đã chọn?`)) {
      try {
        for (const id of selectedIds) {
          await IpcMain.updateCandidate(id, { status });
        }
        const updatedCount = selectedIds.length;
        setSelectedIds([]);
        await refreshData();
        alert(`Đã cập nhật trạng thái cho ${updatedCount} thí sinh.`);
      } catch (error) {
        alert('Có lỗi xảy ra khi cập nhật trạng thái.');
      }
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.identificationNumber.includes(searchTerm) ||
                          c.examRegistrationNumber.includes(searchTerm);
    const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (portal === 'LANDING') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Flag Decoration */}
        <motion.div 
          animate={{ 
            rotate: [0, 1, 0, -1, 0],
            skewX: [0, 2, 0, -2, 0],
            y: [0, -2, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 w-24 h-16 bg-[#DA251D] flex items-center justify-center shadow-2xl rounded-sm z-50 border border-white/10"
        >
          <div className="text-[#FFFF00] text-3xl select-none">★</div>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10"></div>
        </motion.div>

        {/* Background blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="max-w-7xl w-full flex flex-col items-center gap-12 relative z-10">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-lg whitespace-nowrap">
                TRƯỜNG CAO ĐẲNG CÔNG NGHIỆP QUỐC PHÒNG
              </h1>
              <p className="text-primary font-black tracking-[0.3em] md:tracking-[0.5em] text-xs sm:text-sm md:text-base opacity-80 uppercase">
                Hệ thống Quản lý Tuyển sinh Trực tuyến
              </p>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[3.5rem] flex flex-col items-center text-center group hover:bg-white/15 transition-all cursor-pointer shadow-2xl" onClick={() => setPortal('STUDENT')}>
              <div className="w-24 h-24 bg-secondary text-primary rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform">
                <Users className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">CỔNG ĐĂNG KÝ THÍ SINH</h2>
              <p className="text-white/60 font-medium leading-relaxed">Dành cho học sinh đăng ký xét tuyển trực tuyến vào hệ chính quy của nhà trường.</p>
              <div className="mt-10 btn-3d bg-white text-slate-900 px-10 py-4 rounded-2xl font-black tracking-widest text-sm">TRUY CẬP NGAY</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[3.5rem] flex flex-col items-center text-center group hover:bg-white/15 transition-all cursor-pointer shadow-2xl" onClick={() => setPortal('ADMIN')}>
              <div className="w-24 h-24 bg-primary text-white rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">CỔNG QUẢN TRỊ VIÊN</h2>
              <p className="text-white/60 font-medium leading-relaxed">Dành cho cán bộ quản lý, xét duyệt hồ sơ và xử lý dữ liệu tuyển sinh.</p>
              <div className="mt-10 btn-3d bg-primary text-white px-10 py-4 rounded-2xl font-black tracking-widest text-sm">ĐĂNG NHẬP HỆ THỐNG</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (portal === 'STUDENT') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-6">
        <div className="max-w-4xl w-full space-y-12">
          <div className="flex flex-col items-center text-center gap-4">
            <button onClick={() => setPortal('LANDING')} className="text-slate-400 font-black text-xs tracking-widest hover:text-primary transition-all">← QUAY LẠI TRANG CHỦ</button>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">ĐĂNG KÝ XÉT TUYỂN TRỰC TUYẾN 2026</h1>
            <p className="text-slate-500 font-bold max-w-xl">Vui lòng điền đầy đủ và chính xác thông tin cá nhân cùng kết quả thi tốt nghiệp THPT theo yêu cầu.</p>
          </div>
          <CandidateForm onSuccess={() => { alert('Đăng ký thành công! Hồ sơ của bạn đã được gửi vào hệ thống xét tuyển.'); setPortal('LANDING'); }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative">
        <button 
          onClick={() => setPortal('LANDING')} 
          className="absolute top-10 left-10 z-50 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-black text-xs tracking-widest hover:bg-white/30 transition-all border border-white/20"
        >
          ← QUAY LẠI
        </button>
        <Auth onLogin={(role) => setUser({ role })} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* VERTICAL SIDEBAR / RAIL */}
      <aside className="w-24 bg-primary flex flex-col items-center py-8 gap-10 border-r border-black/10 shadow-[5px_0_30px_rgba(0,0,0,0.1)] z-50">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
          <GraduationCap className="text-primary w-8 h-8" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-6">
          <button onClick={() => setView('LIST')} className={cn("p-4 rounded-2xl transition-all btn-3d", view === 'LIST' ? "bg-secondary text-primary" : "text-white/60 hover:text-white hover:bg-white/10")}>
             <Users className="w-6 h-6" />
          </button>
          <button onClick={() => setView('FORM')} className={cn("p-4 rounded-2xl transition-all btn-3d", view === 'FORM' ? "bg-secondary text-primary" : "text-white/60 hover:text-white hover:bg-white/10")}>
             <PlusCircle className="w-6 h-6" />
          </button>
          <button onClick={() => setView('REPORTS')} className={cn("p-4 rounded-2xl transition-all btn-3d", view === 'REPORTS' ? "bg-secondary text-primary" : "text-white/60 hover:text-white hover:bg-white/10")}>
             <TrendingUp className="w-6 h-6" />
          </button>
          <button className="p-4 rounded-2xl transition-all text-white/60 hover:text-white hover:bg-white/10 btn-3d">
             <SearchCode className="w-6 h-6" />
          </button>
        </nav>

        <button 
          onClick={() => setUser(null)}
          className="p-4 rounded-2xl text-white/40 hover:text-white hover:bg-rose-500 transition-all btn-3d"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* HEADER / TOPBAR */}
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shadow-sm z-40">
           <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="relative w-full group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-all" />
                 <input 
                   type="text" 
                   placeholder="Tìm kiếm danh tính thí sinh, số báo danh hoặc CCCD..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-full outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
                 />
              </div>
              <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4 text-slate-400" />
                 <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="border-2 border-slate-100 rounded-full px-4 py-2.5 text-xs font-bold text-slate-500 bg-slate-50 outline-none focus:border-primary/20"
                 >
                    <option value="ALL">TẤT CẢ TRẠNG THÁI</option>
                    <option value={AdmissionStatus.PENDING}>CHỜ DUYỆT</option>
                    <option value={AdmissionStatus.REVIEWING}>ĐANG XÉT</option>
                    <option value={AdmissionStatus.ACCEPTED}>TRÚNG TUYỂN</option>
                    <option value={AdmissionStatus.REJECTED}>TỪ CHỐI</option>
                 </select>
              </div>
           </div>

           <div className="flex items-center gap-6 border-l border-slate-100 pl-8 ml-8">
              <div className="flex flex-col items-end">
                 <span className="text-xs font-black text-primary tracking-widest">{user.role} ACCESS</span>
                 <span className="text-sm font-bold text-slate-800">Trường Cao đẳng Công nghiệp quốc phòng</span>
              </div>
              <button className="relative w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all font-bold text-slate-600">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full"></span>
              </button>
           </div>
        </header>

        {/* MIDDLE CONTENT: DATA TABLE / FORM */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          <AnimatePresence mode="wait">
            {view === 'LIST' ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                       <ShieldCheck className="text-primary w-8 h-8" />
                       Hàng đợi xét tuyển trực tuyến
                    </h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                      Tổng số: {candidates.length} thí sinh • Dữ liệu đã mã hóa AES-256
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <ExcelImport onImportComplete={refreshData} />
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                  <CandidateTable 
                    candidates={filteredCandidates} 
                    onUpdate={refreshData}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                  />
                </div>
              </motion.div>
            ) : view === 'FORM' ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Thêm Hồ Sơ Mới</h2>
                  <button onClick={() => setView('LIST')} className="text-sm font-bold text-slate-400 hover:text-primary transition-all">Quay lại danh sách</button>
                </div>
                <CandidateForm onSuccess={() => { refreshData(); setView('LIST'); }} />
              </motion.div>
            ) : (
              <motion.div 
                key="reports"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full"
              >
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-4">
                    <TrendingUp className="text-primary w-8 h-8" />
                    Báo cáo & Phân tích Tuyển sinh
                  </h2>
                  <button onClick={() => setView('LIST')} className="text-sm font-bold text-slate-400 hover:text-primary transition-all">Quay lại danh sách</button>
                </div>
                <Reports candidates={candidates} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM ACTION RAIL */}
        <footer className="h-24 bg-white border-t border-slate-200 px-10 flex items-center justify-between gap-6 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] z-40">
           <div className="flex gap-4 items-center">
              {selectedIds.length > 0 ? (
                <div className="flex items-center gap-3 bg-secondary/20 p-2 rounded-full border border-secondary/30 transition-all animate-in zoom-in-95 duration-200">
                  <span className="text-[10px] font-black text-primary px-4 uppercase tracking-widest whitespace-nowrap">ĐÃ CHỌN {selectedIds.length}</span>
                  <select 
                    onChange={(e) => handleBulkStatusUpdate(e.target.value as AdmissionStatus)}
                    className="h-10 px-4 bg-white border-2 border-secondary/50 rounded-full text-xs font-black text-slate-700 outline-none focus:border-primary transition-all cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled>--- CHUYỂN TRẠNG THÁI ---</option>
                    <option value={AdmissionStatus.PENDING}>CHỜ DUYỆT</option>
                    <option value={AdmissionStatus.REVIEWING}>ĐANG XÉT</option>
                    <option value={AdmissionStatus.ACCEPTED}>TRÚNG TUYỂN</option>
                    <option value={AdmissionStatus.REJECTED}>TỪ CHỐI</option>
                  </select>
                </div>
              ) : (
                <>
                  <button onClick={() => setView('FORM')} className="btn-3d bg-slate-900 text-white px-8 h-12 rounded-full font-black text-sm flex items-center gap-3 tracking-wide">
                     <PlusCircle className="w-4 h-4" />
                     THÊM HỒ SƠ
                  </button>
                  <button 
                     onClick={handleExportExcel}
                     className="btn-3d bg-emerald-600 text-white px-8 h-12 rounded-full font-black text-sm flex items-center gap-3 tracking-wide"
                  >
                     <FileUp className="w-4 h-4" />
                     XUẤT EXCEL
                  </button>
                </>
              )}
              
              {!selectedIds.length && (
                <button 
                   onClick={handleExportJSON}
                   className="btn-3d bg-blue-600 text-white px-8 h-12 rounded-full font-black text-sm flex items-center gap-3 tracking-wide"
                >
                   <FileJson className="w-4 h-4" />
                   SAO LƯU JSON
                </button>
              )}
           </div>

           <div className="flex gap-4">
              <button 
                onClick={handlePrintList}
                className="btn-3d bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 h-12 rounded-full font-black text-xs flex items-center gap-3"
              >
                 <Printer className="w-4 h-4" />
                 {selectedIds.length > 0 ? `IN ĐÃ CHỌN (${selectedIds.length})` : 'IN DANH SÁCH'}
              </button>
              <button 
                onClick={selectedIds.length > 0 ? handleBulkDelete : handleDeleteAll}
                disabled={isDeleting}
                className={cn(
                  "btn-3d px-6 h-12 rounded-full font-black text-xs flex items-center gap-3 border transition-all",
                  isDeleting 
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                    : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                )}
              >
                 <Trash2 className={cn("w-4 h-4", isDeleting && "animate-pulse")} />
                 {isDeleting ? 'ĐANG XỬ LÝ...' : (selectedIds.length > 0 ? `XÓA ĐÃ CHỌN (${selectedIds.length})` : 'XÓA TẤT CẢ')}
              </button>
           </div>
        </footer>
      </div>
    </div>
  );
}
