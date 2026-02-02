
import React from 'react';
import { dbEngine } from '../services/database';
import { Printer, TrendingUp, UserCheck, CreditCard, Activity, Wallet, ShieldCheck, History } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const Reports = () => {
  const db = dbEngine.getRaw();
  
  const totalRevenue = db.receipts.reduce((acc, r) => acc + r.amount, 0);
  const totalExpenses = db.expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const pieData = [
    { name: 'الإيرادات', value: totalRevenue, color: '#10b981' },
    { name: 'المصروفات', value: totalExpenses, color: '#f43f5e' },
  ];

  const fundsData = db.funds.map(f => ({
    name: f.name,
    balance: f.balance
  }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight text-right">مركز التقارير المالية</h2>
          <p className="text-slate-500 font-bold text-sm text-right">تحليل الموقف المالي العام وحركة التدفقات النقدية</p>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200">
          <Printer size={20} /> طباعة التقرير الختامي
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">إجمالي المقبوضات</p>
            <h3 className="text-2xl font-black text-emerald-600 text-right">{totalRevenue.toLocaleString()} <span className="text-xs text-slate-400">{db.settings.currency}</span></h3>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">إجمالي المصروفات</p>
            <h3 className="text-2xl font-black text-rose-600 text-right">{totalExpenses.toLocaleString()} <span className="text-xs text-slate-400">{db.settings.currency}</span></h3>
         </div>
         <div className={`p-6 rounded-[2.5rem] border border-slate-100 shadow-sm ${netProfit >= 0 ? 'bg-blue-600 text-white' : 'bg-rose-900 text-white'}`}>
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1 text-right">صافي الدخل / العجز</p>
            <h3 className="text-2xl font-black text-right">{netProfit.toLocaleString()} <span className="text-xs opacity-60">{db.settings.currency}</span></h3>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">مديونية المشتركين</p>
            <h3 className="text-2xl font-black text-amber-600 text-right">{db.subscribers.reduce((a,s)=>a+s.balance,0).toLocaleString()} <span className="text-xs text-slate-400">{db.settings.currency}</span></h3>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black mb-8 text-slate-800 text-right">هيكل التدفق المالي</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={10} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
             {pieData.map(item => (
               <div key={item.name} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-black text-slate-500">{item.name}</span>
                  <span className="font-black text-slate-800">{item.value.toLocaleString()} {db.settings.currency}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Liquidity Monitor</span>
               <h3 className="text-xl font-black text-slate-800 text-right">أرصدة الصناديق والخزائن</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800}} />
                  <Tooltip />
                  <Bar dataKey="balance" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                   <ShieldCheck className="text-emerald-400" />
                   <h4 className="font-black text-lg">أداء المحصلين (آخر 10 سندات)</h4>
                </div>
                <div className="space-y-4">
                   {db.receipts.slice(-5).reverse().map(r => {
                     const coll = db.collectors.find(c => c.id === r.collectorId);
                     const sub = db.subscribers.find(s => s.id === r.subscriberId);
                     return (
                       <div key={r.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all">
                          <div className="text-left">
                             <p className="font-black text-emerald-400 text-sm">{r.amount.toLocaleString()} ريال</p>
                             <p className="text-[9px] text-slate-500 font-mono mt-1">{r.reference}</p>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-sm">{coll?.name}</p>
                             <p className="text-[10px] text-blue-300 mt-1">المشترك: {sub?.name}</p>
                          </div>
                       </div>
                     );
                   })}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
