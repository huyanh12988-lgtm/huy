import React, { useMemo } from 'react';
import { Candidate } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { COMBINATIONS } from '../constants';
import { LayoutDashboard, MapPinned, GraduationCap, Calculator, TrendingUp } from 'lucide-react';

interface ReportsProps {
  candidates: Candidate[];
}

const COLORS = ['#b91c1c', '#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

export const Reports: React.FC<ReportsProps> = ({ candidates }) => {
  
  // 1. Geography Stats (by Province Code)
  const provinceStats = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(c => {
      const code = c.highSchoolProvinceCode || 'N/A';
      counts[code] = (counts[code] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([code, count]) => ({ code: `Tỉnh ${code}`, count }))
      .sort((a, b) => b.count - a.count);
  }, [candidates]);

  // 2. Major & Level Stats
  const majorStats = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(c => {
      const key = `${c.level} - ${c.major}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, count]) => ({ name: key, count }))
      .sort((a, b) => b.count - a.count);
  }, [candidates]);

  // 3. Score Stats by Combination
  const combinationStats = useMemo(() => {
    return Object.entries(COMBINATIONS).map(([key, subjects]) => {
      const scores = candidates.map(c => {
        return subjects.reduce((sum, subj) => sum + (c[subj as keyof Candidate] as number || 0), 0);
      });
      
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const max = scores.length > 0 ? Math.max(...scores) : 0;
      
      return {
        name: key,
        'Điểm TB': Number(avg.toFixed(2)),
        'Điểm Cao Nhất': Number(max.toFixed(2))
      };
    });
  }, [candidates]);

  const statsCards = [
    { label: 'Tổng hồ sơ', value: candidates.length, icon: LayoutDashboard, color: 'text-primary' },
    { label: 'Số tỉnh thành', value: provinceStats.length, icon: MapPinned, color: 'text-blue-600' },
    { label: 'Số ngành học', value: majorStats.length, icon: GraduationCap, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-6">
            <div className={cn("p-4 rounded-2xl bg-slate-50", card.color)}>
              <card.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-4xl font-black text-slate-800 tracking-tighter">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Province Chart */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <MapPinned className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Phân bổ hồ sơ theo Tỉnh (Mã Tỉnh)</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#b91c1c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Major Distribution */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Cơ cấu Ngành & Bậc Đào tạo</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={majorStats}
                  cx="40%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ count }) => `${count} HS`}
                >
                  {majorStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right" 
                  formatter={(value, entry: any) => (
                    <span className="text-xs font-bold text-slate-600">
                      {value}: <span className="text-primary ml-1">{entry.payload.count}</span>
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Combination Score Chart */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <Calculator className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Thống kê điểm thi theo Tổ hợp môn</h3>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinationStats}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#b91c1c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="Điểm TB" stroke="#b91c1c" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
                <Area type="monotone" dataKey="Điểm Cao Nhất" stroke="#0f172a" strokeWidth={3} fill="none" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
