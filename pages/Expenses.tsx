
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
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const categories = [
    { label: 'صيانة', color: 'bg-orange-100 text-orange-700' },
    { label: 'رواتب', color: 'bg-blue-100 text-blue-700' },
    { label: 'أخرى', color: 'bg-gray-100 text-gray-700' }
  ];

  const initialForm = {
    category: 'صيانة',
    fundId: '',
    description: '',
    amount: 0,
    reference: `EXP-${Date.now().toString().slice(-6)}`,
    supplierId: '',
    date: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = React.useState(initialForm);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      await dbEngine.query('expenses');
      await dbEngine.query('funds');
      const latest = dbEngine.getRaw();
      setDb(latest);
      setFormData(prev => ({ ...prev, fundId: latest.funds[0]?.id || '' }));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
    // Fix: Explicitly wrap the unsubscribe call in a void-returning function to satisfy EffectCallback return type
    const unsubscribe = dbEngine.subscribe((newDb) => setDb(newDb));
    return () => {
      unsubscribe();
    };
  }, [loadData]);

  const handleSaveOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.description || !formData.fundId) return;
    if (editingId) {
      await ServerAPI.updateEntity('expenses', editingId, formData, authUser);
    } else {
      await ServerAPI.addExpense({ ...formData, branchId: db.settings.defaultBranchId });
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditingId(null); setFormData({ ...initialForm, fundId: db.funds[0]?.id || '' });
  };

  const openEditModal = (exp: Expense) => {
    setEditingId(exp.id); setFormData({ ...exp, supplierId: exp.supplierId || '' }); setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('حذف هذا المصروف؟')) await ServerAPI.deleteEntity('expenses', id, authUser);
  };

  const filteredExpenses = (db.expenses || []).filter(e => 
    (e.description || '').includes(searchTerm) || (e.category || '').includes(searchTerm)
  );

  if (loading) return <div className="py-20 text-center font-bold text-slate-400">جاري جلب سجلات الصرف...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print text-right">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">المصروفات التشغيلية</h2>
          <p className="text-slate-500 font-bold text-sm">إدارة النفقات وسحب السيولة من الصناديق</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-black shadow-xl hover:bg-rose-700 transition-all active:scale-95"><Plus size={20} /> إضافة مصروف</button>
      </div>

      <div className="relative no-print">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="ابحث في البيان أو التصنيف..." className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest">التاريخ / التصنيف</th>
                <th className="px-6 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest">البيان</th>
                <th className="px-6 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">المبلغ</th>
                <th className="px-6 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.slice().reverse().map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-5">
                     <p className="text-xs font-black text-slate-800">{new Date(exp.date).toLocaleDateString('ar-EG')}</p>
                     <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-50 text-rose-600">{exp.category}</span>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-800 text-sm truncate max-w-[250px]">{exp.description}</td>
                  <td className="px-6 py-5 font-black text-rose-600 text-left text-base">{exp.amount.toLocaleString()}</td>
                  <td className="px-6 py-5 text-center no-print">
                     <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(exp)} className="p-2 text-blue-600"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(exp.id)} className="p-2 text-rose-600"><Trash2 size={16} /></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-right" dir="rtl">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-rose-600 mb-6">{editingId ? 'تعديل مصروف' : 'سند صرف جديد'}</h3>
            <form onSubmit={handleSaveOrUpdate} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">البيان</label>
                <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الصندوق</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs" value={formData.fundId} onChange={(e) => setFormData({...formData, fundId: e.target.value})}>
                    {db.funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المبلغ</label>
                  <input type="number" required min="1" className="w-full px-5 py-4 bg-rose-50 border-2 border-rose-500 rounded-2xl font-black text-rose-600 text-2xl text-center" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-3">
                <Save size={24} /> حفظ العملية في SQLite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
