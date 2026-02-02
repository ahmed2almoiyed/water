
import React from 'react';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { Fund, Branch } from '../types';
import { ExcelUtils } from '../services/excelUtils';
import { 
  Wallet, 
  Plus, 
  Search, 
  Building, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Trash2,
  Printer,
  Settings2,
  Eye,
  EyeOff,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  X,
  Save,
  FileDown,
  FileUp,
  UserCheck,
  Calendar
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

type SortField = 'name' | 'balance' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const Funds = () => {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const [showColumns, setShowColumns] = React.useState({
    name: true,
    manager: true,
    branch: true,
    openingBalance: true,
    balance: true,
    actions: true
  });
  const [isColumnPickerOpen, setIsColumnPickerOpen] = React.useState(false);

  const initialForm = {
    name: '',
    branchId: db.settings.defaultBranchId,
    manager: '',
    openingBalance: 0,
    createdAt: new Date().toISOString()
  };

  const [formData, setFormData] = React.useState(initialForm);

  const handleSaveOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const dbRaw = dbEngine.getRaw();
    if (editingId) {
      // Fix: Used updateEntity and passed authUser
      ServerAPI.updateEntity('funds', editingId, formData, authUser);
    } else {
      const newFund: Fund = { 
        ...formData, 
        id: crypto.randomUUID(), 
        balance: formData.openingBalance, // الرصيد الحالي يبدأ بالافتتاحي
      };
      dbEngine.commit('funds', [...dbRaw.funds, newFund]);
    }
    setDb(dbEngine.getRaw());
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const openEditModal = (f: Fund) => {
    setEditingId(f.id);
    setFormData({ 
      name: f.name, 
      branchId: f.branchId,
      manager: f.manager,
      openingBalance: f.openingBalance,
      createdAt: f.createdAt
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصندوق؟ سيؤدي ذلك لمسح كافة سجلات الحركات المرتبطة به.')) {
      // Fix: Passed authUser as the 3rd argument
      ServerAPI.deleteEntity('funds', id, authUser);
      setDb(dbEngine.getRaw());
    }
  };

  const handleExport = () => {
    ExcelUtils.exportToCSV('Funds_Register', db.funds);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      ExcelUtils.importFromCSV(file, (data) => {
        const importedFunds = data.map(item => ({
          ...item,
          id: item.id || crypto.randomUUID(),
          balance: Number(item.balance) || 0,
          openingBalance: Number(item.openingBalance) || 0,
          createdAt: item.createdAt || new Date().toISOString()
        }));
        dbEngine.commit('funds', [...db.funds, ...importedFunds]);
        setDb(dbEngine.getRaw());
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const filteredAndSorted = React.useMemo(() => {
    let result = db.funds.filter(f => f.name.includes(searchTerm) || f.manager.includes(searchTerm));
    result.sort((a, b) => {
      if (sortField === 'balance') return sortOrder === 'asc' ? a.balance - b.balance : b.balance - a.balance;
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return result;
  }, [db.funds, searchTerm, sortField, sortOrder]);

  const totalBalance = db.funds.reduce((acc, f) => acc + f.balance, 0);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortOrder === 'asc' ? <ChevronUp size={12} className="text-blue-600" /> : <ChevronDown size={12} className="text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print text-right">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة الصناديق والخزائن</h2>
          <p className="text-slate-500 font-bold text-sm">مراقبة السيولة النقدية، المسؤولين والأرصدة الافتتاحية</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:text-emerald-600 transition-all shadow-sm flex items-center gap-2 font-bold text-xs">
            <FileDown size={18} /> <span className="hidden sm:inline">تصدير Excel</span>
          </button>
          <div className="relative">
            <input type="file" id="import-excel" className="hidden" accept=".csv" onChange={handleImport} />
            <label htmlFor="import-excel" className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2 font-bold text-xs cursor-pointer">
              <FileUp size={18} /> <span className="hidden sm:inline">استيراد</span>
            </label>
          </div>
          <button onClick={() => window.print()} className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all"><Printer size={18} /></button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 text-sm"
          >
            <Plus size={20} />
            إضافة صندوق
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between no-print relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-150 transition-transform duration-700" />
        <div className="flex items-center gap-5 relative z-10">
           <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100"><TrendingUp size={28} /></div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">إجمالي الرصيد النقدي المتوفر</p>
              <p className="text-3xl font-black text-slate-800 text-right">{totalBalance.toLocaleString()} <span className="text-xs text-slate-400">{db.settings.currency}</span></p>
           </div>
        </div>
        <div className="hidden md:flex gap-3">
           <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-500 flex items-center gap-2">
              <Building size={14} /> عدد الصناديق النشطة: {db.funds.length}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="ابحث باسم الصندوق أو المسؤول..."
            className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none font-bold text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 hover:text-blue-600 flex items-center justify-between transition-all shadow-sm"
          >
            <div className="flex items-center gap-2"><Settings2 size={18} /> تخصيص عرض البيانات</div>
            {isColumnPickerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {isColumnPickerOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl p-4 z-50 space-y-2 animate-in fade-in slide-in-from-top-2">
              {Object.entries(showColumns).map(([key, val]) => (
                <button 
                  key={key} 
                  onClick={() => setShowColumns({...showColumns, [key]: !val})}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <span className="text-[11px] font-black text-slate-600">
                    {key === 'name' ? 'اسم الصندوق' : key === 'manager' ? 'المسؤول' : key === 'branch' ? 'الفرع' : key === 'openingBalance' ? 'الافتتاحي' : key === 'balance' ? 'الرصيد اللحظي' : 'الإجراءات'}
                  </span>
                  {val ? <Eye size={14} className="text-blue-600" /> : <EyeOff size={14} className="text-slate-300" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <PrintHeader title="تقرير أرصدة ومسؤولي الصناديق" />
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-right">
                {showColumns.name && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('name')}>الصندوق <SortIcon field="name" /></th>}
                {showColumns.manager && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest">المسؤول</th>}
                {showColumns.branch && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest">الفرع</th>}
                {showColumns.openingBalance && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-center">الافتتاحي</th>}
                {showColumns.balance && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-left cursor-pointer" onClick={() => handleSort('balance')}>الرصيد <SortIcon field="balance" /></th>}
                {showColumns.actions && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-center no-print">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAndSorted.map((fund) => {
                const branch = db.branches.find(b => b.id === fund.branchId);
                return (
                  <tr key={fund.id} className="group hover:bg-slate-50/50 transition-all">
                    {showColumns.name && (
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Wallet size={18} />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{fund.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold">{new Date(fund.createdAt).toLocaleDateString('ar-EG')}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    {showColumns.manager && (
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <UserCheck size={14} className="text-slate-400" />
                          {fund.manager}
                        </div>
                      </td>
                    )}
                    {showColumns.branch && (
                      <td className="px-8 py-5 font-bold text-xs text-slate-600">{branch?.name}</td>
                    )}
                    {showColumns.openingBalance && (
                      <td className="px-8 py-5 text-center text-slate-400 font-mono text-xs">{fund.openingBalance.toLocaleString()}</td>
                    )}
                    {showColumns.balance && (
                      <td className="px-8 py-5 text-left">
                         <p className={`font-black text-base ${fund.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {fund.balance.toLocaleString()} <span className="text-[10px] text-slate-400">{db.settings.currency}</span>
                         </p>
                      </td>
                    )}
                    {showColumns.actions && (
                      <td className="px-8 py-5 text-center no-print">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(fund)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(fund.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <PrintFooter />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print text-right" dir="rtl">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
              <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-2xl transition-all"><X size={24} /></button>
              <div className="text-right">
                <h3 className="text-xl font-black">{editingId ? 'تعديل بيانات الصندوق' : 'إنشاء صندوق مالي جديد'}</h3>
                <p className="text-blue-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">Financial Fund Setup Card</p>
              </div>
            </div>
            <form onSubmit={handleSaveOrUpdate} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">اسم الصندوق / الخزينة</label>
                <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-50" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المسؤول عن الصندوق</label>
                <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700" value={formData.manager} onChange={(e) => setFormData({...formData, manager: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الرصيد الافتتاحي</label>
                  <input type="number" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-emerald-600" value={formData.openingBalance} onChange={(e) => setFormData({...formData, openingBalance: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الفرع المسؤول</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 text-xs" value={formData.branchId} onChange={(e) => setFormData({...formData, branchId: e.target.value})}>
                    {db.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">تاريخ إنشاء الصندوق</label>
                <input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700" value={formData.createdAt.split('T')[0]} onChange={(e) => setFormData({...formData, createdAt: new Date(e.target.value).toISOString()})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-50 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                <Save size={24} /> {editingId ? 'حفظ البيانات المحدثة' : 'اعتماد الصندوق'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
