
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Droplets, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Activity,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowLeftRight,
  Receipt,
  Download,
  Calendar,
  MoreVertical,
  BarChart3,
  ShieldCheck,
  FileText,
  // Added Wallet icon to fix the missing import error
  Wallet
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';

const ModernStatCard = ({ title, value, subValue, icon: Icon, trend, color, gradient }: any) => (
  <div className="relative overflow-hidden bg-white p-5 sm:p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 ${color}`} />
    
    <div className="flex justify-between items-start mb-6 relative">
      <div className={`p-3.5 rounded-2xl ${gradient} text-white shadow-lg`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    
    <div className="relative">
      <p className="text-slate-400 text-xs sm:text-sm font-bold mb-1 uppercase tracking-wider text-right">{title}</p>
      <div className="flex items-baseline justify-end gap-2">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{value}</h3>
        {subValue && <span className="text-[10px] font-black text-slate-400">{subValue}</span>}
      </div>
    </div>
  </div>
);

const QuickAction = ({ label, icon: Icon, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-3 group p-4 rounded-3xl hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-slate-100"
  >
    <div className={`p-4 rounded-2xl ${color} text-white shadow-md group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <span className="text-xs font-black text-slate-600 group-hover:text-slate-900">{label}</span>
  </button>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const subscribers = ServerAPI.getSubscribers();
  const db = dbEngine.getRaw();
  
  const totalSubscribers = subscribers.length;
  const totalRevenue = db.receipts.reduce((acc, r) => acc + r.amount, 0);
  const totalExpenses = db.expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalBalance = subscribers.reduce((acc, s) => acc + s.balance, 0);

  const monthlyData = [
    { name: 'يناير', rev: 4200, exp: 2100 },
    { name: 'فبراير', rev: 3800, exp: 2400 },
    { name: 'مارس', rev: 5200, exp: 2800 },
    { name: 'أبريل', rev: 4900, exp: 2600 },
    { name: 'مايو', rev: 6100, exp: 3100 },
    { name: 'يونيو', rev: 5800, exp: 2900 },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 justify-end">
            <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">نظام سُـقيا الذكي</span>
            <div className="h-2 w-10 bg-blue-600 rounded-full" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-right">مرحباً بك، {db.users[0]?.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 font-bold mt-1 text-right">إليك ملخص الأداء المالي لمؤسسة المياه لهذا اليوم.</p>
        </div>
        
        <div className="flex items-center gap-3 no-print w-full lg:w-auto">
          <button className="flex-1 lg:flex-none bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
             <Calendar size={20} />
          </button>
          <button onClick={() => navigate('/reports')} className="flex-1 lg:flex-none bg-blue-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 active:scale-95">
            <Download size={18} />
            <span>تقرير شامل</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ModernStatCard 
          title="إجمالي المشتركين" 
          value={totalSubscribers.toLocaleString()} 
          subValue="مشترك نشط"
          icon={Users} 
          trend={14} 
          color="bg-blue-600"
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <ModernStatCard 
          title="التحصيل النقدي" 
          value={`${totalRevenue.toLocaleString()}`}
          subValue="ريال يمني"
          icon={DollarSign} 
          trend={21.5} 
          color="bg-emerald-500"
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
        />
        <ModernStatCard 
          title="المصروفات التشغيلية" 
          value={`${totalExpenses.toLocaleString()}`}
          subValue="ريال يمني"
          icon={Activity} 
          trend={-4.2} 
          color="bg-rose-500"
          gradient="bg-gradient-to-br from-rose-400 to-pink-600"
        />
        <ModernStatCard 
          title="مديونية المشتركين" 
          value={`${totalBalance.toLocaleString()}`}
          subValue="غير محصلة"
          icon={AlertCircle} 
          color="bg-amber-500"
          gradient="bg-gradient-to-br from-amber-400 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 text-right">
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-800">إحصائيات التدفق المالي</h3>
                <p className="text-slate-400 text-sm font-bold">مقارنة الإيرادات مقابل المصروفات (آخر 6 أشهر)</p>
              </div>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-2">
                <button className="px-5 py-2 rounded-xl bg-white shadow-sm text-xs font-black text-blue-600">شهري</button>
                <button className="px-5 py-2 rounded-xl text-xs font-black text-slate-400 hover:text-slate-600 transition-colors">سنوي</button>
              </div>
            </div>

            <div className="h-[300px] sm:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}} />
                  <Area type="monotone" dataKey="rev" name="الإيرادات" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                  <Area type="monotone" dataKey="exp" name="المصروفات" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-32 -mt-32 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <div className="bg-white/10 p-3 rounded-2xl"><TrendingUp size={24} /></div>
                <div>
                  <h3 className="text-xl font-black">مركز التقارير الرقابية</h3>
                  <p className="text-slate-400 text-sm font-bold mt-1">تقارير مطابقة الأرصدة وكشوفات الحساب</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <QuickAction label="إيرادات الفترة" icon={BarChart3} color="bg-emerald-600" onClick={() => navigate('/revenue-report')} />
                <QuickAction label="كشف الصندوق" icon={Wallet} color="bg-blue-600" onClick={() => navigate('/fund-ledger')} />
                <QuickAction label="كشف المحصل" icon={ShieldCheck} color="bg-indigo-600" onClick={() => navigate('/collector-ledger')} />
                <QuickAction label="مطابقة عجز" icon={FileText} color="bg-rose-600" onClick={() => navigate('/reports')} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full text-right">
            <div className="flex items-center justify-between mb-8 flex-row-reverse">
              <h3 className="text-lg font-black text-slate-800">أحدث المشتركين</h3>
              <button onClick={() => navigate('/subscribers')} className="text-blue-600 font-black text-xs hover:underline">عرض الكل</button>
            </div>
            
            <div className="space-y-5 flex-1 overflow-y-auto no-scrollbar max-h-[400px]">
              {subscribers.slice(-6).reverse().map((sub) => (
                <div key={sub.id} onClick={() => navigate(`/statement/${sub.id}`)} className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-all flex-row-reverse">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-50 border border-white shadow-sm flex items-center justify-center text-blue-600 font-black text-sm">
                      {sub.name[0]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">{sub.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sub.meterNumber}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className={`text-xs font-black ${sub.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {sub.balance.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-bold text-slate-300">ر.ي</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
