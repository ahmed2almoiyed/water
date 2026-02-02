
import React from 'react';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { Collector, Fund, Branch } from '../types';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Phone, 
  Wallet, 
  Building, 
  Edit3, 
  Trash2,
  Filter,
  Printer,
  Settings2,
  Eye,
  EyeOff,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  X,
  Save,
  RotateCcw
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

type SortField = 'name' | 'phone';
type SortOrder = 'asc' | 'desc';

export const Collectors = () => {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedBranchId, setSelectedBranchId] = React.useState('all');
  
  // Sorting & Columns
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const [showColumns, setShowColumns] = React.useState({
    name: true,
    phone: true,
    fund: true,
    branch: true,
    actions: true
  });
  const [isColumnPickerOpen, setIsColumnPickerOpen] = React.useState(false);

  const initialForm = {
    name: '',
    phone: '',
    fundId: db.funds[0]?.id || '',
    branchId: db.settings.defaultBranchId
  };

  const [formData, setFormData] = React.useState(initialForm);

  const handleSaveOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Fix: Passed authUser as the 4th argument
      ServerAPI.updateEntity('collectors', editingId, formData, authUser);
    } else {
      // Fix: addCollector now exists
      ServerAPI.addCollector(formData);
    }
    setDb(dbEngine.getRaw());
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const openEditModal = (c: Collector) => {
    setEditingId(c.id);
    setFormData({ ...c });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف بيانات هذا المحصل؟')) {
      // Fix: Passed authUser as the 3rd argument
      ServerAPI.deleteEntity('collectors', id, authUser);
      setDb(dbEngine.getRaw());
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const filteredAndSorted = React.useMemo(() => {
    let result = db.collectors.filter(c => {
      const matchesSearch = c.name.includes(searchTerm) || c.phone.includes(searchTerm);
      const matchesBranch = selectedBranchId === 'all' || c.branchId === selectedBranchId;
      return matchesSearch && matchesBranch;
    });

    result.sort((a, b) => {
      const valA = a[sortField].toLowerCase();
      const valB = b[sortField].toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return result;
  }, [db.collectors, searchTerm, selectedBranchId, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortOrder === 'asc' ? <ChevronUp size={12} className="text-emerald-600" /> : <ChevronDown size={12} className="text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-800">إدارة سجلات المحصلين</h2>
          <p className="text-slate-500 font-bold text-sm">تنظيم وتوزيع مهام التحصيل النقدي والربط المالي</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all"><Printer size={20} /></button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 text-sm"
          >
            <Plus size={20} />
            إضافة محصل
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="md:col-span-1 relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="ابحث بالاسم أو الهاتف..."
            className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Building className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 appearance-none text-sm outline-none"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="all">كافة الفروع</option>
            {db.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 hover:text-emerald-600 flex items-center justify-between transition-all shadow-sm"
          >
            <div className="flex items-center gap-2"><Settings2 size={18} /> تخصيص الأعمدة</div>
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
                    {key === 'name' ? 'اسم المحصل' : key === 'phone' ? 'رقم الهاتف' : key === 'fund' ? 'الصندوق' : key === 'branch' ? 'الفرع' : 'الإجراءات'}
                  </span>
                  {val ? <Eye size={14} className="text-emerald-600" /> : <EyeOff size={14} className="text-slate-300" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <PrintHeader title="سجل بيانات موظفي التحصيل" />
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 print:bg-white text-right">
                {showColumns.name && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('name')}>المحصل <SortIcon field="name" /></th>}
                {showColumns.phone && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest cursor-pointer" onClick={() => handleSort('phone')}>رقم التواصل <SortIcon field="phone" /></th>}
                {showColumns.fund && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest">الصندوق المرتبط</th>}
                {showColumns.branch && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest">الفرع</th>}
                {showColumns.actions && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-center no-print">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAndSorted.map((c) => {
                const fund = db.funds.find(f => f.id === c.fundId);
                const branch = db.branches.find(b => b.id === c.branchId);
                return (
                  <tr key={c.id} className="group hover:bg-slate-50/50 transition-all">
                    {showColumns.name && (
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                            {c.name[0]}
                          </div>
                          <p className="font-black text-slate-800 text-sm">{c.name}</p>
                        </div>
                      </td>
                    )}
                    {showColumns.phone && (
                      <td className="px-8 py-5 font-mono text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                           <Phone size={14} className="text-emerald-500" />
                           {c.phone}
                        </div>
                      </td>
                    )}
                    {showColumns.fund && (
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                           <Wallet size={14} className="text-slate-400" />
                           {fund?.name}
                        </div>
                      </td>
                    )}
                    {showColumns.branch && (
                      <td className="px-8 py-5 font-bold text-xs text-slate-500">
                        {branch?.name}
                      </td>
                    )}
                    {showColumns.actions && (
                      <td className="px-8 py-5 text-center no-print">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(c)} className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <UserCheck size={48} className="opacity-20" />
                      <p className="font-black text-slate-400">لا يوجد محصلين مطابقين لمعايير البحث</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PrintFooter />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print text-right" dir="rtl">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-emerald-600 text-white flex justify-between items-center">
              <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-2xl transition-all"><X size={24} /></button>
              <div className="text-right">
                <h3 className="text-xl font-black">{editingId ? 'تعديل بيانات محصل' : 'تعريف محصل جديد'}</h3>
                <p className="text-emerald-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">Collector Master Record</p>
              </div>
            </div>
            <form onSubmit={handleSaveOrUpdate} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الاسم الكامل للموظف</label>
                <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-50" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">رقم الهاتف النشط</label>
                <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-center text-emerald-600 font-black" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الصندوق</label>
                  <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" value={formData.fundId} onChange={(e) => setFormData({...formData, fundId: e.target.value})}>
                    {db.funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الفرع</label>
                  <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" value={formData.branchId} onChange={(e) => setFormData({...formData, branchId: e.target.value})}>
                    {db.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-50 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                <Save size={24} /> {editingId ? 'حفظ التغييرات' : 'اعتماد المحصل'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
