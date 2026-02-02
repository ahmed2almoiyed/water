
import React from 'react';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { Expense, Fund } from '../types';
import { 
  Plus, Wallet, Tag, Info, Calendar, Search, CheckSquare, Square, 
  Edit3, Save, Printer, Trash2, X, AlertCircle, Layers 
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const Expenses = () => {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const funds = db.funds;

  const categories = [
    { label: 'صيانة', color: 'bg-orange-100 text-orange-700' },
    { label: 'رواتب', color: 'bg-blue-100 text-blue-700' },
    { label: 'كهرباء', color: 'bg-yellow-100 text-yellow-700' },
    { label: 'قرطاسية', color: 'bg-slate-100 text-slate-700' },
    { label: 'إيجار', color: 'bg-purple-100 text-purple-700' },
    { label: 'مشتريات أنابيب', color: 'bg-emerald-100 text-emerald-700' },
    { label: 'أخرى', color: 'bg-gray-100 text-gray-700' }
  ];

  const initialForm = {
    category: 'صيانة',
    fundId: funds[0]?.id || '',
    description: '',
    amount: 0,
    reference: `EXP-${Date.now().toString().slice(-6)}`,
    supplierId: '',
    date: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = React.useState(initialForm);

  const handleSaveOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.description || !formData.fundId) return;
    
    if (editingId) {
      ServerAPI.updateEntity('expenses', editingId, formData, authUser);
    } else {
      // Fix: Removed 'isPosted' property because ServerAPI.addExpense expects a type that omits 'isPosted'.
      // The service implementation already handles setting isPosted to false internally.
      ServerAPI.addExpense({ 
        ...formData, 
        branchId: db.settings.defaultBranchId
      });
    }

    setDb(dbEngine.getRaw());
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const openEditModal = (exp: Expense) => {
    setEditingId(exp.id);
    setFormData({
      category: exp.category,
      fundId: exp.fundId,
      description: exp.description,
      amount: exp.amount,
      reference: exp.reference,
      supplierId: exp.supplierId || '',
      date: exp.date
    });
    setIsModalOpen(true);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredExpenses.length && filteredExpenses.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredExpenses.map(e => e.id)));
  };

  const handleDelete = (id: string) => {
    if (confirm('تنبيه محاسبي: هل أنت متأكد من حذف مستند الصرف هذا؟ سيتم إرجاع المبلغ للصندوق آلياً.')) {
      ServerAPI.deleteEntity('expenses', id, authUser);
      setDb(dbEngine.getRaw());
    }
  };

  const filteredExpenses = (db.expenses || []).filter(e => 
    e.description.includes(searchTerm) || e.category.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print text-right">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">سجل المصروفات التشغيلية</h2>
          <p className="text-slate-500 font-bold text-sm">تبويب النفقات، إدارة الصناديق، واستخراج سندات الصرف</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <button 
              onClick={() => window.print()}
              className="flex-1 sm:flex-none bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl"
            >
              <Printer size={18} /> طباعة المحدد ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none bg-rose-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-rose-700 shadow-xl transition-all active:scale-95"
          >
            <Plus size={20} /> إضافة مصروف
          </button>
        </div>
      </div>

      <div className="relative group no-print">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="ابحث في البيان أو التصنيف..."
          className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-50 outline-none font-bold shadow-sm text-right"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="hidden print:block">
           <PrintHeader title="سجل المصروفات والنفقات التشغيلية" />
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 w-16 text-center no-print">
                  <button onClick={toggleSelectAll}>
                      {selectedIds.size === filteredExpenses.length && filteredExpenses.length > 0 ? <CheckSquare className="text-rose-600" size={22} /> : <Square className="text-slate-300" size={22} />}
                  </button>
                </th>
                <th className="px-6 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-right">التاريخ / التصنيف</th>
                <th className="px-6 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-right">من صندوق</th>
                <th className="px-6 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-right">البيان والشرح</th>
                <th className="px-6 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">المبلغ</th>
                <th className="px-6 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.slice().reverse().map((exp) => {
                const fund = db.funds.find(f => f.id === exp.fundId);
                const isSelected = selectedIds.has(exp.id);
                const catInfo = categories.find(c => c.label === exp.category) || categories[categories.length - 1];
                
                return (
                  <tr 
                    key={exp.id} 
                    className={`transition-all ${isSelected ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-6 py-5 text-center no-print">
                      <button onClick={(e) => toggleSelect(exp.id, e)} className="text-slate-200">
                          {isSelected ? <CheckSquare className="text-rose-600" size={22} /> : <Square size={22} />}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-black text-slate-800">{new Date(exp.date).toLocaleDateString('ar-EG')}</p>
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-black mt-1 inline-block ${catInfo.color}`}>
                         {exp.category}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-end gap-2 text-slate-600 text-xs font-bold">
                          {fund?.name}
                          <Wallet size={14} className="text-rose-400" />
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="font-black text-slate-800 text-sm truncate max-w-[250px]">{exp.description}</p>
                       <p className="text-[10px] text-slate-400 font-mono mt-0.5">REF: {exp.reference}</p>
                    </td>
                    <td className="px-6 py-5 font-black text-rose-600 text-left text-base">
                      {exp.amount.toLocaleString()} <span className="text-[10px] text-slate-400">ريال</span>
                    </td>
                    <td className="px-6 py-5 text-center no-print">
                       <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(exp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(exp.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-20 text-center text-slate-300 font-black">لا توجد سجلات مصروفات مطابقة للبحث</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="hidden print:block">
           <PrintFooter />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-right" dir="rtl">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-rose-600 text-white flex justify-between items-center">
              <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-2xl transition-all"><X size={24} /></button>
              <div className="text-right">
                <h3 className="text-xl sm:text-2xl font-black">{editingId ? 'تعديل مستند صرف' : 'تحرير سند صرف جديد'}</h3>
                <p className="text-rose-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">Accounting Expense Voucher</p>
              </div>
            </div>
            
            <form onSubmit={handleSaveOrUpdate} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">بيان المصروف (الشرح)</label>
                <input 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-right outline-none focus:ring-4 focus:ring-blue-50 transition-all" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="مثال: شراء قطع غيار للمضخة الرئيسية..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">تصنيف المصروف</label>
                  <div className="relative">
                    <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-right outline-none focus:ring-4 focus:ring-rose-50 transition-all appearance-none" 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">من صندوق / عهدة</label>
                   <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-right text-xs" 
                    value={formData.fundId} 
                    onChange={(e) => setFormData({...formData, fundId: e.target.value})}
                  >
                    {db.funds.map(f => <option key={f.id} value={f.id}>{f.name} (رصيد: {f.balance})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">تاريخ المستند</label>
                   <input type="date" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-center" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المبلغ المصروف</label>
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    className="w-full px-5 py-4 bg-rose-50 border-2 border-rose-500 rounded-2xl font-black text-rose-600 text-2xl text-center shadow-inner outline-none focus:ring-4 focus:ring-rose-100" 
                    value={formData.amount || ''} 
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                <Save size={24} />
                {editingId ? 'تعديل سند الصرف' : 'اعتماد الصرف وتحديث الصندوق'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
