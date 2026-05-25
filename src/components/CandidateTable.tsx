import React, { useState } from 'react';
import { Candidate, AdmissionStatus } from '../types';
import { IpcMain } from '../main/ipc';
import { GraduationCap, MoreVertical, Trash2, CheckCircle, Clock, XCircle, Eye, ChevronDown, ChevronUp, Calculator, User, Printer, Save, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { COMBINATIONS, COMBINATION_LABELS } from '../constants';
import { printCandidateForms } from '../lib/printUtils';

interface CandidateTableProps {
  candidates: Candidate[];
  onUpdate: () => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({ 
  candidates, 
  onUpdate,
  selectedIds,
  onSelectionChange
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingScores, setEditingScores] = useState<string | null>(null);
  const [tempScores, setTempScores] = useState<Partial<Candidate>>({});

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(candidates.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleStatusChange = async (id: string, status: AdmissionStatus) => {
    await IpcMain.updateCandidate(id, { status });
    onUpdate();
  };

    const getValidCombinations = (candidate: Candidate) => {
    return Object.entries(COMBINATIONS).map(([key, subjects]) => {
      const allPositive = subjects.every(subj => {
        const val = candidate[subj as keyof Candidate];
        return typeof val === 'number' && val > 0;
      });
      if (!allPositive) return null;
      const score = (subjects as string[]).reduce((sum, subj) => sum + (candidate[subj as keyof Candidate] as number || 0), 0);
      return { key, score };
    }).filter((c): c is { key: string; score: number } => c !== null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thí sinh này không?')) {
      await IpcMain.deleteCandidate(id);
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter(sid => sid !== id));
      }
      onUpdate();
    }
  };

  const handlePrint = (candidate: Candidate) => {
    printCandidateForms([candidate]);
  };

  const handleEditScores = (candidate: Candidate) => {
    setEditingScores(candidate.id);
    setTempScores({
      mathScore: candidate.mathScore,
      literatureScore: candidate.literatureScore,
      englishScore: candidate.englishScore,
      physicsScore: candidate.physicsScore,
      chemistryScore: candidate.chemistryScore,
      biologyScore: candidate.biologyScore,
      historyScore: candidate.historyScore,
      geographyScore: candidate.geographyScore,
      civicEducationScore: candidate.civicEducationScore,
      informaticsScore: candidate.informaticsScore,
    });
  };

  const handleSaveScores = async (id: string) => {
    await IpcMain.updateCandidate(id, tempScores);
    setEditingScores(null);
    onUpdate();
  };

  const getStatusBadge = (status: AdmissionStatus) => {
    switch (status) {
      case AdmissionStatus.PENDING:
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-500 border border-slate-200"><Clock className="w-3 h-3" /> CHỜ DUYỆT</span>;
      case AdmissionStatus.REVIEWING:
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-600 border border-blue-200"><Eye className="w-3 h-3" /> ĐANG XÉT</span>;
      case AdmissionStatus.ACCEPTED:
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-600 border border-emerald-200"><CheckCircle className="w-3 h-3" /> TRÚNG TUYỂN</span>;
      case AdmissionStatus.REJECTED:
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-600 border border-rose-200"><XCircle className="w-3 h-3" /> TỪ CHỐI</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-8 py-5">
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox"
                  checked={candidates.length > 0 && selectedIds.length === candidates.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Thí sinh & CCCD</span>
              </div>
            </th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Nơi thường trú</th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Ngành xét tuyển</th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Môn thi (T-V-A)</th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Điểm tổ hợp</th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Điều chuyển</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {candidates.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-8 py-20 text-center">
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <GraduationCap className="w-12 h-12" />
                  <p className="font-bold uppercase tracking-widest text-sm">Cơ sở dữ liệu trống</p>
                </div>
              </td>
            </tr>
          ) : (
            candidates.map((candidate) => (
              <React.Fragment key={candidate.id}>
                <tr className={cn(
                  "hover:bg-slate-50/80 transition-colors group",
                  expandedRow === candidate.id && "bg-slate-50/50",
                  selectedIds.includes(candidate.id) && "bg-primary/5"
                )}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(candidate.id)}
                        onChange={() => toggleSelectOne(candidate.id)}
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                      />
                      <button 
                        onClick={() => setExpandedRow(expandedRow === candidate.id ? null : candidate.id)}
                        className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-primary border border-transparent hover:border-slate-200"
                      >
                        {expandedRow === candidate.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-base">{candidate.fullName}</span>
                        <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">CCCD: {candidate.identificationNumber}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">SBD: {candidate.examRegistrationNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-600 underline decoration-secondary/30 decoration-2 underline-offset-4">{candidate.permanentAddress}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800 leading-tight">{candidate.major}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{candidate.level} • {candidate.system}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {[candidate.mathScore, candidate.literatureScore, candidate.englishScore].map((score, idx) => (
                        <div key={idx} className="flex flex-col items-center w-10 py-1 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                          <span className="font-mono font-black text-xs text-slate-700">{(score || 0).toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2 max-w-[200px]">
                      {getValidCombinations(candidate).map(combo => (
                        <div key={combo.key} className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10">
                          <span className="text-[10px] font-black text-primary">{combo.key}</span>
                          <span className="text-xs font-black text-slate-700">{combo.score.toFixed(1)}</span>
                        </div>
                      ))}
                      {getValidCombinations(candidate).length === 0 && (
                        <span className="text-[10px] font-bold text-slate-400 italic">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {getStatusBadge(candidate.status)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <select
                        value={candidate.status}
                        onChange={(e) => handleStatusChange(candidate.id, e.target.value as AdmissionStatus)}
                        className="text-xs font-bold border-2 border-slate-100 rounded-xl px-3 py-2 outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all bg-white"
                      >
                        <option value={AdmissionStatus.PENDING}>CHỜ DUYỆT</option>
                        <option value={AdmissionStatus.REVIEWING}>ĐANG XÉT</option>
                        <option value={AdmissionStatus.ACCEPTED}>TRÚNG TUYỂN</option>
                        <option value={AdmissionStatus.REJECTED}>TỪ CHỐI</option>
                      </select>
                      <button
                        onClick={() => handlePrint(candidate)}
                        className="p-3 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-all active:scale-90"
                        title="In phiếu đăng ký"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(candidate.id);
                        }}
                        className="p-3 text-slate-300 hover:text-primary hover:bg-red-50 rounded-full transition-all active:scale-90"
                        title="Xóa hồ sơ"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRow === candidate.id && (
                  <tr>
                    <td colSpan={7} className="px-12 py-8 bg-slate-50/50 border-y border-slate-100 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 tracking-widest uppercase">
                            <Calculator className="w-5 h-5 text-primary" />
                            ĐIỂM XÉT TUYỂN CHI TIẾT THEO TỔ HỢP
                          </h4>
                          <div className="flex items-center gap-3">
                            {editingScores === candidate.id ? (
                               <button 
                                 onClick={() => handleSaveScores(candidate.id)}
                                 className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                               >
                                 <Save className="w-4 h-4" /> LƯU ĐIỂM
                               </button>
                            ) : (
                               <button 
                                 onClick={() => handleEditScores(candidate)}
                                 className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-xl font-black text-[10px] border border-slate-200 hover:border-primary/30 transition-all shadow-sm"
                               >
                                 <Edit3 className="w-4 h-4 text-primary" /> CẬP NHẬT ĐIỂM
                               </button>
                            )}
                            <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">KỲ THI TN THPT 2026</span>
                          </div>
                        </div>
                        
                        {editingScores === candidate.id ? (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-white rounded-3xl border-2 border-primary/10 shadow-xl">
                            {Object.entries({
                              mathScore: 'Toán',
                              literatureScore: 'Văn',
                              englishScore: 'Anh',
                              physicsScore: 'Lý',
                              chemistryScore: 'Hóa',
                              biologyScore: 'Sinh',
                              historyScore: 'Sử',
                              geographyScore: 'Địa',
                              civicEducationScore: 'GDCD',
                              informaticsScore: 'Tin',
                            }).map(([key, label]) => (
                              <div key={key} className="space-y-1.5 font-sans">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</label>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  value={tempScores[key as keyof Candidate] as number || 0}
                                  onChange={(e) => setTempScores({ ...tempScores, [key]: parseFloat(e.target.value) || 0 })}
                                  className="w-full h-10 px-3 font-mono font-black text-slate-700 border-2 border-slate-100 rounded-xl outline-none focus:border-primary/30 transition-all"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {getValidCombinations(candidate).map((combo) => (
                                <div key={combo.key} className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-primary/20 transition-all group/card">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-base font-black text-slate-800">{combo.key}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{COMBINATION_LABELS[combo.key].split(', ')[0]}...</span>
                                  </div>
                                  <div className="text-2xl font-black text-primary mb-1">{combo.score.toFixed(1)}</div>
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none group-hover/card:text-slate-600 transition-colors">
                                    {COMBINATION_LABELS[combo.key]}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200/50">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Thông tin bổ sung</span>
                            <div className="grid grid-cols-2 gap-4">
                              {[
                                { label: 'Nơi sinh', val: candidate.birthPlace },
                                { label: 'Dân tộc', val: candidate.ethnicity },
                                { label: 'Giới tính', val: candidate.gender },
                                { label: 'Tốt nghiệp', val: candidate.graduationYear },
                                { label: 'Mã tỉnh', val: candidate.highSchoolProvinceCode },
                                { label: 'Mã trường', val: candidate.highSchoolCode },
                              ].map(item => (
                                <div key={item.label} className="bg-white/50 p-3 rounded-xl border border-slate-100">
                                  <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none mb-1">{item.label}</span>
                                  <span className="text-xs font-black text-slate-700">{item.val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Cán bộ tư vấn phụ trách</span>
                            <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <User className="w-6 h-6" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800">{candidate.consultantName || 'Chưa phân công'}</span>
                                <span className="text-xs font-bold text-slate-400">Hệ thống xét tuyển Trường CĐ CNQP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
