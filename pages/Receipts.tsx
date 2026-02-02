
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
  Trash2
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const Receipts = () => {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [showColumns, setShowColumns] = React.useState({
    dateRef: true,
    subscriber: true,
    statement: true,
    financial: true,
    amount: true,
    actions: true
  });
  const [isColumnPickerOpen, setIsColumnPickerOpen] = React.useState(false);

  const initialForm = {
    subscriberId: '',
    collectorId: db.collectors[0]?.id || '',
    fundId: db.collectors[0]?.fundId || db.funds[0]?.id || '',
    description: 'سداد فاتورة استهلاك مياه',
    amount: 0,
    paymentMethod: 'cash' as Receipt['paymentMethod'],
    reference: `REC-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = React.useState(initialForm);

  const handleSaveOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subscriberId || !formData.fundId || formData.amount <= 0) return;
    
    const sub = db.subscribers.find(s => s.id === formData.subscriberId);
    if (!sub) return;

    if (editingId) {
      // Fix: Passed authUser as the 4th argument
      ServerAPI.updateEntity('receipts', editingId, formData, authUser);
    } else {
      ServerAPI.addReceipt({ ...formData, branchId: sub.branchId });
    }
    
    setDb(dbEngine.getRaw());
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const openEditModal = (r: Receipt) => {
    setEditingId(r.id);
    setFormData({ ...r });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا السند؟ سيتم تحديث أرصدة الصناديق والمشتركين آلياً.')) {
      // Fix: Passed authUser as the 3rd argument
      ServerAPI.deleteEntity('receipts', id, authUser);
      setDb(dbEngine.getRaw());
    }
  };

  const handlePrint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/receipt-print/${id}`);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const filteredReceipts = db.receipts.filter(r => {
    const sub = db.subscribers.find(s => s.id === r.subscriberId);
    return (
      sub?.name.includes(searchTerm) || 
      r.reference.includes(searchTerm) || 
      r.description.includes(searchTerm)
    );
  });

  const handleCollectorChange = (collectorId: string) => {
    const collector = db.collectors.find(c => c.id === collectorId);
    if (collector) {
      setFormData({ ...formData, collectorId, fundId: collector.fundId });
    } else {
      setFormData({ ...formData, collectorId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight text-right">سندات القبض (المقبوضات)</h2>
          <p className="text-slate-500 font-bold text-sm text-right">إدارة التحصيل النقدي والبنكي من المشتركين</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <button 
              onClick={() => window.print()}
              className="flex-1 sm:flex-none bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all text-xs"
            >
              <Printer size={18} />
              طباعة المحدد ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex-1 sm:flex-none bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 text-sm"
          >
            <Plus size={20} />
            إنشاء سند قبض
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 no-print">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="ابحث باسم المشترك، رقم المرجع، أو بيان السند..."
            className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none shadow-sm font-bold text-sm text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)} 
            className="h-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 hover:text-emerald-600 flex items-center gap-2 transition-all shadow-sm"
          >
            <Settings2 size={18} /> 
            <span className="hidden sm:inline">تخصيص العرض</span>
          </button>
          {isColumnPickerOpen && (
            <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-2xl p-4 z-50 space-y-2 animate-in fade-in slide-in-from-top-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2 text-right">الأعمدة الظاهرة</p>
              {Object.entries(showColumns).map(([key, val]) => (
                <button 
                  key={key} 
                  onClick={() => setShowColumns({...showColumns, [key]: !val})} 
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all"
                >
                   {val ? <Eye size={14} className="text-emerald-600" /> : <EyeOff size={14} className="text-slate-300" />}
                  <span className="text-xs font-bold text-slate-600">
                    {key === 'dateRef' ? 'التاريخ والمرجع' : key === 'subscriber' ? 'المشترك' : key === 'statement' ? 'بيان السند' : key === 'financial' ? 'الحساب المالي' : key === 'amount' ? 'المبلغ' : 'الإجراءات'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <PrintHeader title="سجل المقبوضات وسندات التحصيل" />
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 print:bg-white text-right">
                <th className="px-6 py-5 w-16 text-center no-print">
                  <button onClick={() => setSelectedIds(selectedIds.size === filteredReceipts.length ? new Set() : new Set(filteredReceipts.map(r => r.id)))}>
                    {selectedIds.size === filteredReceipts.length && filteredReceipts.length > 0 ? <CheckSquare className="text-emerald-600" /> : <Square className="text-slate-300" />}
                  </button>
                </th>
                {showColumns.dateRef && <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-right">التاريخ / المرجع</th>}
                {showColumns.subscriber && <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-right">المشترك</th>}
                {showColumns.statement && <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-right">بيان السند</th>}
                {showColumns.financial && <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-right">الصندوق / المحصل</th>}
                {showColumns.amount && <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-left">المبلغ</th>}
                {showColumns.actions && <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-center no-print">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReceipts.slice().reverse().map((r) => {
                const sub = db.subscribers.find(s => s.id === r.subscriberId);
                const isSelected = selectedIds.has(r.id);
                const isPrintHidden = selectedIds.size > 0 && !isSelected;
                const collector = db.collectors.find(c => c.id === r.collectorId);
                const fund = db.funds.find(f => f.id === r.fundId);

                return (
                  <tr key={r.id} onClick={() => openEditModal(r)} className={`group cursor-pointer transition-all ${isSelected ? 'bg-emerald-50/40' : 'hover:bg-slate-50/50'} ${isPrintHidden ? 'print:hidden' : ''}`}>
                    <td className="px-6 py-5 text-center no-print" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => toggleSelect(r.id, e)} className="text-slate-200 group-hover:text-emerald-300">
                          {isSelected ? <CheckSquare className="text-emerald-600" size={22} /> : <Square size={22} />}
                      </button>
                    </td>
                    {showColumns.dateRef && (
                      <td className="px-6 py-5 text-right">
                         <p className="text-xs font-black text-slate-800">{new Date(r.date).toLocaleDateString('ar-EG')}</p>
                         <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-end gap-1">{r.reference} <Hash size={10} /></p>
                      </td>
                    )}
                    {showColumns.subscriber && (
                      <td className="px-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <p className="font-black text-slate-800 text-sm">{sub?.name}</p>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-[10px] group-hover:bg-emerald-600 group-hover:text-white transition-all">
                              {sub?.name[0]}
                            </div>
                         </div>
                      </td>
                    )}
                    {showColumns.statement && (
                      <td className="px-6 py-5 text-right">
                        <p className="text-xs font-bold text-slate-500 max-w-[180px] truncate" title={r.description}>{r.description}</p>
                      </td>
                    )}
                    {showColumns.financial && (
                      <td className="px-6 py-5 text-right">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-600 flex items-center justify-end gap-1">{fund?.name} <Wallet size={12} className="text-emerald-500" /></span>
                            <span className="text-[10px] font-black text-slate-400 flex items-center justify-end gap-1">{collector?.name} <UserCheck size={12} className="text-slate-400" /></span>
                         </div>
                      </td>
                    )}
                    {showColumns.amount && (
                      <td className="px-6 py-5 text-left">
                        <p className="font-black text-emerald-600 text-base">{r.amount.toLocaleString()} <span className="text-[10px] text-slate-400">ريال</span></p>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">{r.paymentMethod === 'cash' ? 'CASH' : 'TRANSFER'}</span>
                      </td>
                    )}
                    {showColumns.actions && (
                      <td className="px-6 py-5 text-center no-print" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                           <button 
                            onClick={(e) => handlePrint(r.id, e)} 
                            title="طباعة السند المالي"
                            className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-xl transition-all"
                          >
                            <Printer size={16} />
                          </button>
                          <button onClick={() => openEditModal(r)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl transition-all">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={(e) => handleDelete(r.id, e)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <Banknote size={48} className="opacity-20" />
                      <p className="font-black text-slate-400">لا توجد سندات قبض مسجلة حالياً</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 no-print text-right" dir="rtl">
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
           <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
              <div className="p-8 bg-emerald-600 text-white flex justify-between items-center shrink-0">
                <button onClick={closeModal} className="hover:bg-white/20 p-2.5 rounded-2xl transition-all"><X size={24} /></button>
                <div className="text-right">
                  <h3 className="text-xl sm:text-2xl font-black">{editingId ? 'تعديل سند قبض' : 'تحرير سند قبض جديد'}</h3>
                  <p className="text-emerald-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">Accounting Receipt Voucher</p>
                </div>
              </div>
              
              <form onSubmit={handleSaveOrUpdate} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">اختيار المشترك المسدد</label>
                      <select 
                        required 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-right"
                        value={formData.subscriberId} 
                        onChange={(e) => setFormData({...formData, subscriberId: e.target.value})}
                      >
                         <option value="">-- اختر المشترك من القائمة --</option>
                         {db.subscribers.map(s => <option key={s.id} value={s.id}>{s.name} (رصيد: {s.balance})</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">المحصل (المستلم)</label>
                      <select 
                        required 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-right"
                        value={formData.collectorId} 
                        onChange={(e) => handleCollectorChange(e.target.value)}
                      >
                         {db.collectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">الصندوق (المورد إليه)</label>
                      <select 
                        required 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-right"
                        value={formData.fundId} 
                        onChange={(e) => setFormData({...formData, fundId: e.target.value})}
                      >
                         {db.funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest flex items-center justify-end gap-2">
                        بيان السند (الشرح) <FileText size={12} />
                      </label>
                      <input 
                        required
                        placeholder="مثال: سداد قيمة فواتير الأشهر الماضية..."
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-emerald-50 outline-none text-right"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">رقم المرجع (يدوي/آلي)</label>
                      <input 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm text-right"
                        value={formData.reference}
                        onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">تاريخ السند</label>
                      <input 
                        type="date" 
                        required 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-right"
                        value={formData.date} 
                        onChange={(e) => setFormData({...formData, date: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest text-right">طريقة الدفع</label>
                      <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200">
                         <button 
                          type="button" 
                          onClick={() => setFormData({...formData, paymentMethod: 'transfer'})}
                          className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${formData.paymentMethod === 'transfer' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                         >
                           <CreditCard size={14} /> تحويل
                         </button>
                         <button 
                          type="button" 
                          onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                          className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${formData.paymentMethod === 'cash' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                         >
                           <Banknote size={14} /> نقدي
                         </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">المبلغ المحصل</label>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        placeholder="0.00"
                        className="w-full px-5 py-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl font-black text-emerald-700 text-2xl shadow-inner outline-none focus:ring-4 focus:ring-emerald-100 transition-all text-center"
                        value={formData.amount || ''} 
                        onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} 
                      />
                    </div>
                 </div>

                 <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-emerald-50 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4">
                   <Save size={24} />
                   {editingId ? 'حفظ تعديلات السند' : 'اعتماد وحفظ السند'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
