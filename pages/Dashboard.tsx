
import React from 'react';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { Users, DollarSign, Activity, AlertCircle } from 'lucide-react';

const ModernStatCard = ({ title, value, subValue, icon: Icon, gradient }: any) => (
  <div className="relative overflow-hidden bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group text-right">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3.5 rounded-2xl ${gradient} text-white shadow-lg`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
    </div>
    <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">{title}</p>
    <div className="flex items-baseline justify-end gap-2">
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
      {subValue && <span className="text-[10px] font-black text-slate-400">{subValue}</span>}
    </div>
  </div>
);

export const Dashboard = () => {
  const [stats, setStats] = React.useState({
    totalSubs: 0, revenue: 0, expenses: 0, debt: 0, loading: true
  });

  const loadStats = React.useCallback(async () => {
    try {
      const [subs, receipts, expenses] = await Promise.all([
        dbEngine.query('subscribers'),
        dbEngine.query('receipts'),
        dbEngine.query('expenses')
      ]);
      
      setStats({
        totalSubs: subs.length,
        revenue: receipts.reduce((a, r) => a + r.amount, 0),
        expenses: expenses.reduce((a, e) => a + e.amount, 0),
        debt: subs.reduce((a, s) => a + s.balance, 0),
        loading: false
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    loadStats();
    return dbEngine.subscribe(() => loadStats());
  }, [loadStats]);

  if (stats.loading) return <div className="flex items-center justify-center h-64 text-slate-400 font-bold">جاري تحميل البيانات من SQLite...</div>;

  return (
    <div className="space-y-8">
      <div className="text-right">
        <h1 className="text-3xl font-black text-slate-800">نظرة عامة على المؤسسة</h1>
        <p className="text-slate-500 font-bold text-sm">إحصائيات مباشرة من قاعدة البيانات</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatCard title="إجمالي المشتركين" value={stats.totalSubs} subValue="مشترك" icon={Users} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
        <ModernStatCard title="إجمالي التحصيل" value={stats.revenue.toLocaleString()} subValue="ريال" icon={DollarSign} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <ModernStatCard title="المصروفات" value={stats.expenses.toLocaleString()} subValue="ريال" icon={Activity} gradient="bg-gradient-to-br from-rose-500 to-rose-700" />
        <ModernStatCard title="مديونية المشتركين" value={stats.debt.toLocaleString()} subValue="ريال" icon={AlertCircle} gradient="bg-gradient-to-br from-amber-500 to-amber-700" />
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center">
         <p className="text-slate-400 font-black text-xs uppercase mb-2">حالة الاتصال</p>
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full font-black text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            النظام متصل بقاعدة البيانات SQLite بنجاح
         </div>
      </div>
    </div>
  );
};
