
import React from 'react';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { Subscriber, Settlement } from '../types';
import { 
  Plus, 
  Search, 
  Scale, 
  RotateCcw, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  Printer, 
  X, 
  Save, 
  Info,
  Hash,
  User,
  LayoutList,
  FileText
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const Settlements = () => {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'list' | 'report'>('list');

  const initialForm = {
    subscriberId: '',
    type: 'credit' as Settlement['type'],
    amount: 0,
    newReading: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    reference: `SETL-${Date.now().toString().slice(-6)}`
  };

  const [formData, setFormData] = React.useState(initialForm);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subscriberId || !formData.description) return;
    
    const sub = db.subscribers.find(s => s.id === formData.subscriberId);
    if (!sub) return;

    // Fix: Removed isPosted property from the object literal because ServerAPI.addSettlement 
    // expects Omit<Settlement, 'id' | 'isPosted'> and handles isPosted internally.
    await ServerAPI.addSettlement({
      ...formData,
      branchId: sub.branchId
    });

    await dbEngine.query('settlements');
    await dbEngine.query('subscribers');
    setDb(dbEngine.getRaw());
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialForm);
  };

  const filteredSettlements = db.settlements.filter(s => {
    const sub = db.subscribers.find(sub => sub.id === s.subscriberId);
    return sub?.name.includes(searchTerm) || s.reference.includes(searchTerm);
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print text-right">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight text-right">تسويات المشتركين</h2>
          <p className="text-slate-500 font-bold text-sm text-right">تصفير العدادات، خصم المديونيات، وتصحيح الأرصدة</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm ml-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutList size={14} />
              قائمة
            </button>
            <button 
              onClick={() => setViewMode('report')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'report' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <FileText size={14} />
              تقرير
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl transition-all active:scale-95 text-sm"
          >
            <Plus size={20} /> إضافة تسوية
          </button>
        </div>
      </div>

      <div className="relative group no-print">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="ابحث باسم المشترك أو رقم المرجع..."
          className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold shadow-sm text-right text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={`bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm transition-all ${viewMode === 'report' ? 'border-indigo-200 shadow-xl' : ''}`}>
        <div className="hidden print:block">
           <PrintHeader title="سجل تسويات المشتركين (مالية وفنية)" />
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className={`${viewMode === 'report' ? 'bg-indigo-900 text-white' : 'bg-slate-50 text-slate-500'} border-b border-slate-100 text-right`}>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">التاريخ / المرجع</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">المشترك</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">نوع التسوية</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">البيان / السبب</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-left">التأثير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSettlements.slice().reverse().map((s) => {
                const sub = db.subscribers.find(sub => sub.id === s.subscriberId);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-5">
                       <p className="text-xs font-black text-slate-800">{new Date(s.date).toLocaleDateString('ar-EG')}</p>
                       <p className="text-[10px] text-slate-400 font-mono mt-1">REF: {s.reference}</p>
                    </td>
                    <td className="px-6 py-5">
                       <p className="font-black text-slate-800 text-sm">{sub?.name}</p>
                       <p className="text-[10px] text-slate-400 mt-0.5">عداد: {sub?.meterNumber}</p>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                         s.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 
                         s.type === 'debit' ? 'bg-rose-100 text-rose-700' : 
                         'bg-blue-100 text-blue-700'
                       }`}>
                          {s.type === 'credit' && <ArrowDownCircle size={10} />}
                          {s.type === 'debit' && <ArrowUpCircle size={10} />}
                          {s.type === 'meter_reset' && <RotateCcw size={10} />}
                          {s.type === 'credit' ? 'خصم مديونية' : s.type === 'debit' ? 'إضافة مديونية' : 'تصفير عداد'}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500 max-w-[200px] truncate">{s.description}</td>
                    <td className="px-6 py-5 text-left font-black">
                       {s.type === 'meter_reset' ? (
                         <span className="text-blue-600 text-sm">بداية: {s.newReading} م³</span>
                       ) : (
                         <span className={s.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}>
                           {s.type === 'credit' ? '-' : '+'}{s.amount.toLocaleString()} <span className="text-[10px] text-slate-400">ريال</span>
                         </span>
                       )}
                    </td>
                  </tr>
                );
              })}
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
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-2xl transition-all"><X size={24}/></button>
              <div className="text-right">
                <h3 className="text-xl sm:text-2xl font-black">إجراء تسوية جديدة</h3>
                <p className="text-indigo-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">Accounting Adjustment Memo</p>
              </div>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المشترك المعني</label>
                <select 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none text-right"
                  value={formData.subscriberId}
                  onChange={(e) => setFormData({...formData, subscriberId: e.target.value})}
                >
                  <option value="">-- اختر المشترك --</option>
                  {db.subscribers.map(s => <option key={s.id} value={s.id}>{s.name} (رصيد: {s.balance})</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">نوع العملية</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                   {[
                     { id: 'credit', label: 'خصم رصيد', icon: ArrowDownCircle },
                     { id: 'debit', label: 'إضافة رصيد', icon: ArrowUpCircle },
                     { id: 'meter_reset', label: 'تصفير عداد', icon: RotateCcw }
                   ].map(type => (
                     <button
                       key={type.id}
                       type="button"
                       onClick={() => setFormData({...formData, type: type.id as any})}
                       className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${formData.type === type.id ? 'bg-white shadow-md text-indigo-600 scale-[1.02]' : 'text-slate-400'}`}
                     >
                       <type.icon size={18} />
                       <span className="text-[9px] font-black uppercase">{type.label}</span>
                     </button>
                   ))}
                </div>
              </div>

              {formData.type === 'meter_reset' ? (
                <div className="space-y-1 animate-in slide-in-from-top-2">
                   <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-1">القراءة الافتتاحية الجديدة</label>
                   <input 
                    type="number" 
                    required 
                    className="w-full px-5 py-4 bg-blue-50 border-2 border-blue-500 rounded-2xl font-black text-blue-700 text-2xl text-center" 
                    value={formData.newReading} 
                    onChange={(e) => setFormData({...formData, newReading: Number(e.target.value)})} 
                   />
                </div>
              ) : (
                <div className="space-y-1 animate-in slide-in-from-top-2">
                   <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1">المبلغ المراد تسويته</label>
                   <input 
                    type="number" 
                    required 
                    className="w-full px-5 py-4 bg-indigo-50 border-2 border-indigo-500 rounded-2xl font-black text-indigo-700 text-2xl text-center" 
                    value={formData.amount || ''} 
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} 
                   />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">السبب / المبرر القانوني</label>
                <textarea 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm resize-none h-24 text-right" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="يرجى ذكر سبب التسوية بدقة"
                />
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4 items-start">
                 <Info className="text-amber-600 shrink-0 mt-1" size={18} />
                 <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                   تنبيه: التسويات إجراءات حساسة محاسبياً، سيتم تسجيل هذا الإجراء باسمك ({authUser.name}) ولن يمكن تعديله لاحقاً.
                 </p>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                <Save size={24} /> اعتماد التسوية النهائية
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
