
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Droplets, Receipt, Wallet, Settings, 
  Menu, X, TrendingUp, Truck, Zap, LogOut, Building, UserCheck, Shield, UserCog, Tags, FileBarChart
} from 'lucide-react';
import { dbEngine } from '../services/database';

const SidebarItem = ({ to, icon: Icon, label, active, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 lg:translate-x-1' 
        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className="font-bold text-sm">{label}</span>
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
    { to: '/subscription-types', icon: Tags, label: 'أسعار الاشتراكات' },
    { to: '/suppliers', icon: Truck, label: 'الموردين' },
    { to: '/funds', icon: Shield, label: 'الصناديق' },
    { to: '/collectors', icon: UserCheck, label: 'المحصلين' },
    { to: '/readings', icon: Droplets, label: 'القراءات والفواتير' },
    { to: '/receipts', icon: Receipt, label: 'سندات القبض' },
    { to: '/expenses', icon: Wallet, label: 'المصروفات' },
    { to: '/report-designer', icon: FileBarChart, label: 'مصمم التقارير' },
    { to: '/reports', icon: TrendingUp, label: 'التقارير المالية' },
    { to: '/users', icon: UserCog, label: 'المستخدمين' },
    { to: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const currentBranch = db.branches.find(b => b.id === db.settings.defaultBranchId);

  return (
    <div className="min-h-screen flex bg-slate-50 font-cairo overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 right-0 z-[60] w-[280px] sm:w-80 bg-white border-l border-slate-200 shadow-2xl transition-all duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100">
                <Droplets size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">سُـقـيـا</h1>
                <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-1">Smart Water</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="sidebar flex-1 space-y-1 overflow-y-auto no-scrollbar relative pt-2 border-r border-slate-200">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.to} 
                {...item} 
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <Building size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">الفرع النشط</p>
                <p className="text-xs font-black text-slate-800 truncate">{currentBranch?.name}</p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-between p-3 text-rose-600 hover:bg-rose-50 rounded-2xl font-black text-xs transition-all group"
            >
              <span className="group-hover:-translate-x-1 transition-transform flex items-center gap-3">
                <LogOut size={18} />
                خروج من النظام
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 no-print">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-base sm:text-lg font-black text-slate-800">
              {navItems.find(i => i.to === location.pathname)?.label || 'لوحة التحكم'}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-4 group cursor-pointer">
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-slate-800 text-right">{user?.name}</p>
                <p className="text-[9px] text-blue-600 font-black text-right uppercase tracking-wider">{user?.role}</p>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-100 to-blue-50 border border-white shadow-md flex items-center justify-center text-blue-600 font-black text-sm">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
