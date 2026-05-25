import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User, GraduationCap } from 'lucide-react';
import { IpcMain } from '../../main/ipc';
import { UserRole } from '../../types';

interface AuthProps {
  onLogin: (role: UserRole) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate IPC call to Main process
    const result = await IpcMain.authenticate(username, password);
    
    if (result) {
      onLogin(result.role);
    } else {
      setError('Thông tin đăng nhập không chính xác');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 red-gold-gradient flex items-center justify-center p-6 bg-cover">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] mb-4 border-4 border-secondary/50">
             <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-white text-3xl font-black tracking-tighter uppercase text-center drop-shadow-lg">
            Hệ Thống Xét Tuyển <br/>
            <span className="text-secondary text-xl">Trường CĐ Công nghiệp quốc phòng</span>
          </h1>
        </div>

        {/* LOGIN FORM */}
        <div className="glass-official rounded-[2rem] p-10 border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-t border-l">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
            <ShieldCheck className="text-primary w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-800">Cổng Thông Tin Chính Thức</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Tài khoản</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all shadow-inner font-medium text-slate-800"
                  placeholder="ID công chức / Thí sinh..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Mật mã bảo mật</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all shadow-inner font-medium text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-primary text-xs font-bold bg-primary/5 p-3 rounded-lg border border-primary/10"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-3d bg-primary hover:bg-red-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 text-lg tracking-wide disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Xác Thực Truy Cập
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium leading-relaxed">
            Hệ thống được mã hóa AES-256 <br/>
            Bản quyền thuộc về Cục Khảo Thí & Kiểm Định 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};
