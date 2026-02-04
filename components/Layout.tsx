
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Droplets, Receipt, Wallet, Settings, 
  Menu, X, TrendingUp, Truck, Zap, LogOut, Building, UserCheck, Shield, UserCog, Tags, FileBarChart,
  Scale, ChevronLeft, BookText
} from 'lucide-react';
import { dbEngine } from '../services/database';

const SidebarItem = ({ to, icon: Icon, label, active, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group relative overflow-hidden ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-[-4px] scale-[1.02]' 
        : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-[-2px]'
    }`}
  >
    {/* مؤشر الحالة النشطة الجانبي */}
    <div className={`absolute right-0 top-0 bottom-0 w-1 bg-white transition-all duration-500 transform ${active ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`} />
    
    <div className={`transition-transform duration-500 ${active ? 'rotate-0 scale-110' : 'group-hover:rotate-12 group-hover:scale-110'}`}>
      <Icon size={19} strokeWidth={active ? 2.5 : 2} />
    </div>
    
    <span className={`flex-1 font-bold text-[13px] transition-all duration-300 ${active ? 'tracking-normal' : 'group-hover:pr-1'}`}>
      {label}
    </span>

    <ChevronLeft 
      size={14} 
      className={`transition-all duration-500 transform ${
        active ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 group-hover:opacity-40 group-hover:translate-x-0'
      }`} 
    />
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode, user: any, onLogout: () => void }> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const db = dbEngine.getRaw();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { to: '/quick-readings', icon: Zap, label: 'الإدخال السريع' },
    { to: '/subscribers', icon: Users, label: 'المشتركين' },
    { to: '/settlements', icon: Scale, label: 'تسويات المشتركين' },
    { to: '/subscription-types', icon: Tags, label: 'أسعار الاشتراكات' },
    { to: '/suppliers', icon: Truck, label: 'الموردين' },
    { to: '/funds', icon: Shield, label: 'الصناديق' },
    { to: '/collectors', icon: UserCheck, label: 'المحصلين' },
    { to: '/readings', icon: Droplets, label: 'القراءات والفواتير' },
    { to: '/receipts', icon: Receipt, label: 'سندات القبض' },
    { to: '/expenses', icon: Wallet, label: 'المصروفات' },
    { to: '/journal', icon: BookText, label: 'القيود اليومية' },
    { to: '/report-designer', icon: FileBarChart, label: 'مصمم التقارير' },
    { to: '/reports', icon: TrendingUp, label: 'التقارير المالية' },
    { to: '/users', icon: UserCog, label: 'المستخدمين' },
    { to: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const currentBranch = db.branches.find(b => b.id === db.settings.defaultBranchId);

  return (
    <div className="min-h-screen flex bg-slate-50 font-cairo overflow-hidden selection:bg-blue-100 selection:text-blue-700">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 right-0 z-[60] w-72 bg-white border-l border-slate-100 shadow-2xl transition-all duration-500 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
                <Droplets size={22} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">سُـقـيـا</h1>
                <p className="text-[8px] text-blue-600 font-black uppercase tracking-widest mt-1">Smart Water Pro</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar flex-1 space-y-1 overflow-y-auto no-scrollbar pr-1">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.to} 
                {...item} 
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Building size={14} className="text-slate-400" />
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">الفرع النشط</p>
                <p className="text-[11px] font-black text-slate-700 truncate">{currentBranch?.name}</p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-between p-3 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-[11px] transition-all group"
            >
              <span className="flex items-center gap-3">
                <LogOut size={16} />
                خروج آمن
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-40 no-print">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 bg-slate-100 rounded-lg text-slate-600 active:scale-95 transition-transform" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <h2 className="text-sm font-black text-slate-800">
              {navItems.find(i => i.to === location.pathname)?.label || 'لوحة التحكم'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 group cursor-pointer hover:bg-slate-50 p-1 pr-3 rounded-xl transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-800">{user?.name}</p>
                <p className="text-[8px] text-blue-600 font-black uppercase">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                {user?.name?.[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth no-scrollbar bg-slate-50/50">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
