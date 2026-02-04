
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { Subscriber, Receipt, Fund, Collector } from '../types';
import { 
  Plus, 
  Banknote, 
  Search, 
  CheckSquare, 
  Square, 
  Edit3, 
  Save, 
  Wallet, 
  UserCheck, 
  Settings2, 
  Eye, 
  EyeOff, 
  Printer, 
  FileText,
  X,
  CreditCard,
  Hash,
  Trash2,
  AlertCircle,
  LayoutList
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const Receipts = () => {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'list' | 'report'>('list');

  const initialForm = {
    subscriberId: '',
    collectorId: '',
    fundId: '',
    description: 'سداد فاتورة استهلاك مياه',
    amount: 0,
    paymentMethod: 'cash' as Receipt['paymentMethod'],
    reference: `REC-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = React.useState(initialForm);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      await dbEngine.query('receipts');
      await dbEngine.query('subscribers');
      await dbEngine.query('funds');
      await dbEngine.query('collectors');
      const latest = dbEngine.getRaw();
      setDb(latest);
      // Auto-set default collector/fund
      setFormData(prev => ({
        ...prev,
        collectorId: latest.collectors[0]?.id || '',
        fundId: latest.collectors[0]?.fundId || latest.funds[0]?.id || ''
      }));
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
    setError(null);
    if (formData.amount <= 0 || !formData.subscriberId || !formData.fundId) {
      setError('يرجى التحقق من صحة البيانات والمبلغ واختيار الصندوق.');
      return;
    }
    const sub = db.subscribers.find(s => s.id === formData.subscriberId);
    if (!sub) return;

    if (editingId) {
      await ServerAPI.updateEntity('receipts', editingId, formData, authUser);
    } else {
      await ServerAPI.addReceipt({ ...formData, branchId: sub.branchId });
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditingId(null); setFormData({ ...initialForm, collectorId: db.collectors[0]?.id || '', fundId: db.collectors[0]?.fundId || db.funds[0]?.id || '' }); setError(null);
  };

  const openEditModal = (r: Receipt) => {
    setEditingId(r.id); setFormData({ ...r }); setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('حذف هذا السند؟')) await ServerAPI.deleteEntity('receipts', id, authUser);
  };

  const filteredReceipts = db.receipts.filter(r => {
    const sub = db.subscribers.find(s => s.id === r.subscriberId);
    return (sub?.name || '').includes(searchTerm) || r.reference.includes(searchTerm) || r.description.includes(searchTerm);
  });

  if (loading) return <div className="py-20 text-center font-bold text-slate-400">جاري جلب السندات...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print text-right">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">سندات القبض</h2>
          <p className="text-slate-500 font-bold text-sm">مزامنة حركات التحصيل مع SQLite</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-lg text-xs font-black ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}><LayoutList size={14} /></button>
            <button onClick={() => setViewMode('report')} className={`px-4 py-1.5 rounded-lg text-xs font-black ${viewMode === 'report' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}><FileText size={14} /></button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black shadow-xl hover:bg-emerald-700 transition-all"><Plus size={20} /> إنشاء سند</button>
        </div>
      </div>

      <div className="relative no-print">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="ابحث باسم المشترك، المرجع..." className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest">التاريخ / المرجع</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest">المشترك</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest">المبلغ</th>
                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-center no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReceipts.slice().reverse().map((r) => {
                const sub = db.subscribers.find(s => s.id === r.subscriberId);
                return (
                  <tr key={r.id} onClick={() => openEditModal(r)} className="hover:bg-slate-50/50 cursor-pointer">
                    <td className="px-6 py-5">
                       <p className="text-xs font-black text-slate-800">{new Date(r.date).toLocaleDateString('ar-EG')}</p>
                       <p className="text-[10px] text-slate-400 font-mono">{r.reference}</p>
                    </td>
                    <td className="px-6 py-5 font-black text-slate-800 text-sm">{sub?.name}</td>
                    <td className="px-6 py-5 font-black text-emerald-600 text-base">{r.amount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-center no-print">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/receipt-print/${r.id}`); }} className="p-2 text-slate-400"><Printer size={16}/></button>
                        <button onClick={(e) => handleDelete(r.id, e)} className="p-2 text-rose-400"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-right" dir="rtl">
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
           <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-emerald-600 mb-6">{editingId ? 'تعديل سند قبض' : 'تحرير سند قبض جديد'}</h3>
              {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl">{error}</div>}
              <form onSubmit={handleSaveOrUpdate} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">اختيار المشترك</label>
                  <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.subscriberId} onChange={(e) => setFormData({...formData, subscriberId: e.target.value})}>
                     <option value="">-- اختر المشترك --</option>
                     {db.subscribers.map(s => <option key={s.id} value={s.id}>{s.name} (رصيد: {s.balance})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase">المبلغ المحصل</label>
                  <input type="number" required min="1" className="w-full px-5 py-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl font-black text-emerald-700 text-2xl text-center" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                   <Save size={24} /> حفظ السند في SQLite
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
