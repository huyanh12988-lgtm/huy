import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, School, Calculator, BookOpen, Languages, Send, Briefcase, ShieldCheck } from 'lucide-react';
import { IpcMain } from '../main/ipc';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { MAJORS_DATA } from '../constants';

interface CandidateFormProps {
  onSuccess: () => void;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({ onSuccess }) => {
  const levels = Object.keys(MAJORS_DATA);
  
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    identificationNumber: '',
    examRegistrationNumber: '',
    birthPlace: '',
    ethnicity: '',
    gender: 'Nam',
    permanentAddress: '',
    highSchool: '',
    highSchoolProvinceCode: '',
    highSchoolCode: '',
    graduationYear: new Date().getFullYear().toString(),
    consultantName: '',
    mathScore: 0,
    literatureScore: 0,
    englishScore: 0,
    physicsScore: 0,
    chemistryScore: 0,
    biologyScore: 0,
    historyScore: 0,
    geographyScore: 0,
    civicEducationScore: 0,
    informaticsScore: 0,
    russianScore: 0,
    chineseScore: 0,
    level: levels[0],
    system: Object.keys(MAJORS_DATA[levels[0] as keyof typeof MAJORS_DATA])[0],
    major: '',
  });

  const systems = Object.keys(MAJORS_DATA[formData.level as keyof typeof MAJORS_DATA] || {});
  const majors = (MAJORS_DATA[formData.level as keyof typeof MAJORS_DATA] as any)?.[formData.system] || [];

  useEffect(() => {
    if (!majors.includes(formData.major)) {
      setFormData(prev => ({ ...prev, major: majors[0] || '' }));
    }
  }, [formData.level, formData.system, majors]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Score') ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        identificationNumber: formData.identificationNumber.trim(),
        phone: formData.phone.trim(),
        examRegistrationNumber: formData.examRegistrationNumber.trim()
      };
      await IpcMain.addCandidate(submissionData);
      setIsSubmitting(false);
      onSuccess();
      setFormData({
        fullName: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        identificationNumber: '',
        examRegistrationNumber: '',
        birthPlace: '',
        ethnicity: '',
        gender: 'Nam',
        permanentAddress: '',
        highSchool: '',
        highSchoolProvinceCode: '',
        highSchoolCode: '',
        graduationYear: new Date().getFullYear().toString(),
        consultantName: '',
        mathScore: 0,
        literatureScore: 0,
        englishScore: 0,
        physicsScore: 0,
        chemistryScore: 0,
        biologyScore: 0,
        historyScore: 0,
        geographyScore: 0,
        civicEducationScore: 0,
        informaticsScore: 0,
        russianScore: 0,
        chineseScore: 0,
        level: levels[0],
        system: Object.keys(MAJORS_DATA[levels[0] as keyof typeof MAJORS_DATA])[0],
        major: majors[0] || '',
      });
    } catch (error: any) {
      setIsSubmitting(false);
      alert(error.message || 'Có lỗi xảy ra khi lưu hồ sơ.');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-10 bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <User className="w-3 h-3 text-primary" />
            Họ và tên thí sinh
          </label>
          <input
            required
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder="VD: Nguyễn Văn A"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <User className="w-3 h-3 text-primary" />
            Mã định danh (CCCD)
          </label>
          <input
            required
            name="identificationNumber"
            value={formData.identificationNumber}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder="0xxxxxxxxxxx"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Calculator className="w-3 h-3 text-primary" />
            Số báo danh (Mã dự thi TN THPT)
          </label>
          <input
            required
            name="examRegistrationNumber"
            value={formData.examRegistrationNumber}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-mono font-bold text-slate-800"
            placeholder="VD: 01000123"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Calculator className="w-3 h-3 text-primary" />
            Giới tính
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Calculator className="w-3 h-3 text-primary" />
            Ngày sinh
          </label>
          <input
            required
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-primary" />
            Nơi sinh
          </label>
          <input
            required
            name="birthPlace"
            value={formData.birthPlace}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder="Tỉnh/Thành phố"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-primary" />
            Dân tộc
          </label>
          <input
            required
            name="ethnicity"
            value={formData.ethnicity}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder="Kinh, Tày, Nùng..."
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-primary" />
            Hộ khẩu thường trú (đầy đủ)
          </label>
          <input
            required
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder="Số nhà, đường, xã/phường, quận/huyện, tỉnh/thành phố"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Phone className="w-3 h-3 text-primary" />
            Số điện thoại
          </label>
          <input
            required
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder="09xx xxx xxx"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Mail className="w-3 h-3 text-primary" />
            Email liên hệ
          </label>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder="name@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <School className="w-3 h-3 text-primary" />
            Trường THPT
          </label>
          <input
            required
            name="highSchool"
            value={formData.highSchool}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder="Tên trường THPT"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            Mã tỉnh trường
          </label>
          <input
            required
            name="highSchoolProvinceCode"
            value={formData.highSchoolProvinceCode}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-mono font-bold text-slate-800"
            placeholder="VD: 01"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            Mã trường THPT
          </label>
          <input
            required
            name="highSchoolCode"
            value={formData.highSchoolCode}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-mono font-bold text-slate-800"
            placeholder="VD: 001"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            Năm tốt nghiệp
          </label>
          <input
            required
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder="2026"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            Cán bộ tư vấn
          </label>
          <input
            name="consultantName"
            value={formData.consultantName}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder="Tên cán bộ (nếu có)"
          />
        </div>
      </div>

      <div className="pt-10 border-t border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3 tracking-tight">
          <Briefcase className="w-6 h-6 text-primary" />
          THÔNG TIN ĐĂNG KÝ XÉT TUYỂN
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              BẬC ĐÀO TẠO
            </label>
            <select
              required
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            >
              {levels.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              HỆ ĐÀO TẠO
            </label>
            <select
              required
              name="system"
              value={formData.system}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            >
              {systems.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              NGÀNH XÉT TUYỂN
            </label>
            <select
              required
              name="major"
              value={formData.major}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-800"
            >
              {majors.map((m: string) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3 tracking-tight">
          <Calculator className="w-6 h-6 text-primary" />
          KẾT QUẢ THI TỐT NGHIỆP THPT (CÁC MÔN BẮT BUỘC)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-secondary" />
              Điểm Toán
            </label>
            <input
              required
              type="number"
              step="0.1"
              min="0"
              max="10"
              name="mathScore"
              value={formData.mathScore}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-mono font-black text-lg text-slate-800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-primary" />
              Điểm Ngữ văn
            </label>
            <input
              required
              type="number"
              step="0.1"
              min="0"
              max="10"
              name="literatureScore"
              value={formData.literatureScore}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary/20 focus:bg-white outline-none transition-all font-mono font-black text-lg text-slate-800"
            />
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3 tracking-tight">
          <BookOpen className="w-6 h-6 text-amber-500" />
          CÁC MÔN TỰ CHỌN / KHỐI KHTN - KHXH
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { name: 'englishScore', label: 'Tiếng Anh', color: 'text-emerald-500' },
            { name: 'physicsScore', label: 'Vật Lý', color: 'text-blue-500' },
            { name: 'chemistryScore', label: 'Hóa Học', color: 'text-amber-500' },
            { name: 'biologyScore', label: 'Sinh Học', color: 'text-emerald-500' },
            { name: 'historyScore', label: 'Lịch Sử', color: 'text-rose-500' },
            { name: 'geographyScore', label: 'Địa Lý', color: 'text-green-500' },
            { name: 'civicEducationScore', label: 'GD Công dân', color: 'text-purple-500' },
            { name: 'informaticsScore', label: 'Tin học', color: 'text-primary' },
            { name: 'russianScore', label: 'Tiếng Nga', color: 'text-blue-700' },
            { name: 'chineseScore', label: 'Tiếng Trung', color: 'text-red-700' },
          ].map((subj) => (
            <div key={subj.name} className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <BookOpen className={cn("w-3 h-3", subj.color)} />
                {subj.label}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name={subj.name}
                value={(formData as any)[subj.name] || 0}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary/20 focus:bg-white outline-none transition-all font-mono font-bold text-slate-700"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "btn-3d bg-primary text-white px-12 py-5 rounded-2xl font-black text-lg tracking-wider flex items-center gap-4 disabled:opacity-50",
            isSubmitting && "animate-pulse"
          )}
        >
          {isSubmitting ? "Đang xử lý hồ sơ..." : "GỬI HỒ SƠ ĐĂNG KÝ"}
          {!isSubmitting && <Send className="w-5 h-5" />}
        </button>
      </div>
    </motion.form>
  );
};
