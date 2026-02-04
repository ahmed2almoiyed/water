
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { Reading, Invoice, Subscriber, SubscriptionType } from '../types';
import { 
  Plus, Calculator, Printer, CheckSquare, Square, Search, X, Edit3, Trash2, 
  Lock, CheckCircle2, Unlock, Filter, Calendar, FileText, Hash, MapPin, User, ShieldCheck, Droplets, Receipt, AlertCircle,
  Save, LayoutList
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

const InvoicePrintItem: React.FC<{ invoice: Invoice, db: any }> = ({ invoice, db }) => {
  const subscriber = db.subscribers.find((s: Subscriber) => s.id === invoice.subscriberId);
  const reading = db.readings.find((r: Reading) => r.id === invoice.readingId);
  const subType = subscriber ? db.subscriptionTypes.find((t: SubscriptionType) => t.id === subscriber.typeId) : null;

  if (!subscriber || !reading) return null;

  return (
    <div className="page-break bg-white p-12 sm:p-14 relative overflow-hidden h-[297mm] w-[210mm] mx-auto" dir="rtl">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none rotate-12">
           <Droplets size={400} />
       </div>
       <PrintHeader title="فاتورة استهلاك المياه الرسمية" />
       <div className="grid grid-cols-2 gap-10 mb-10 relative z-10">
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm border border-slate-50"><User size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">بيانات المشترك</p>
                  <h3 className="text-base font-black text-slate-800">{subscriber.name}</h3>
                </div>
             </div>
             <div className="space-y-1 pr-1 text-[11px] font-bold text-slate-500">
                <p>رقم العداد: <span className="font-mono text-slate-800">{subscriber.meterNumber}</span></p>
                <p>العنوان: <span className="text-slate-800">{subscriber.governorate} - {subscriber.region}</span></p>
             </div>
          </div>
          <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl text-white backdrop-blur-md"><Receipt size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-blue-200 uppercase leading-none mb-1">تفاصيل المستند</p>
                  <h3 className="text-base font-black">رقم الفاتورة: {invoice.invoiceNumber}</h3>
                </div>
             </div>
             <div className="space-y-1 text-[11px]">
                <div className="flex justify-between font-bold"><span>تاريخ الإصدار:</span> <span>{new Date(invoice.issueDate || invoice.date).toLocaleDateString('ar-EG')}</span></div>
                <div className="flex justify-between font-bold"><span>تاريخ الاستحقاق:</span> <span className="text-yellow-300">{new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</span></div>
                <div className="flex justify-between border-t border-white/10 pt-1 mt-1 font-black"><span>الفترة المالية:</span> <span>شهر {reading.periodMonth} / {reading.periodYear}</span></div>
             </div>
          </div>
       </div>
       <div className="mb-10 rounded-[2rem] border-2 border-slate-100 overflow-hidden">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-900 text-white text-[10px] font-black">
               <tr>
                  <th className="py-4">القراءة السابقة</th>
                  <th className="py-4 border-r border-white/10">القراءة الحالية</th>
                  <th className="py-4 bg-blue-500">الاستهلاك (م³)</th>
                  <th className="py-4 border-l border-white/10">فئة السعر</th>
               </tr>
            </thead>
            <tbody className="font-black text-xl">
               <tr>
                  <td className="py-6 text-slate-400 font-mono">{reading.previousReading}</td>
                  <td className="py-6 font-mono">{reading.currentReading}</td>
                  <td className="py-6 text-blue-600 bg-blue-50/50 text-3xl font-mono">{reading.units}</td>
                  <td className="py-6 text-sm text-slate-500">{subType?.name}</td>
               </tr>
            </tbody>
          </table>
       </div>
       <div className="grid grid-cols-2 gap-10 items-end mb-10">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-3">
             <div className="flex justify-between text-xs font-bold"><span>قيمة الاستهلاك:</span> <span>{reading.totalAmount.toLocaleString()}</span></div>
             <div className="flex justify-between text-xs font-bold"><span>رسوم الخدمات:</span> <span>{subType?.fixedFee.toLocaleString()}</span></div>
             <div className="flex justify-between text-xs font-black text-rose-600 pt-2 border-t border-slate-200"><span>متأخرات سابقة:</span> <span>{invoice.arrears.toLocaleString()}</span></div>
          </div>
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] text-center">
             <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Due Amount</p>
             <p className="text-xs font-bold opacity-60 mb-1">المبلغ المطلوب سداده</p>
             <h2 className="text-4xl font-black">{invoice.totalDue.toLocaleString()} <span className="text-xs">{db.settings.currency}</span></h2>
          </div>
       </div>
       <PrintFooter />
    </div>
  );
};

export const Readings = () => {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = React.useState('');
  const [currReading, setCurrReading] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'list' | 'report'>('list');

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [filterText, setFilterText] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'posted' | 'draft'>('all');
  const [filterPeriod, setFilterPeriod] = React.useState({ month: '', year: '' });
  const [filterIssueDate, setFilterIssueDate] = React.useState('');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      await dbEngine.query('readings');
      await dbEngine.query('invoices');
      await dbEngine.query('subscribers');
      await dbEngine.query('subscriptionTypes');
      setDb(dbEngine.getRaw());
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

  const filteredReadings = React.useMemo(() => {
    return db.readings.filter(r => {
      const sub = db.subscribers.find(s => s.id === r.subscriberId);
      const invoice = db.invoices.find(i => i.readingId === r.id);
      const matchesText = (sub?.name || '').includes(filterText) || (sub?.meterNumber || '').includes(filterText);
      const matchesStatus = filterStatus === 'all' ? true : (filterStatus === 'posted' ? r.isPosted : !r.isPosted);
      const matchesMonth = filterPeriod.month === '' ? true : r.periodMonth === Number(filterPeriod.month);
      const matchesYear = filterPeriod.year === '' ? true : r.periodYear === Number(filterPeriod.year);
      const matchesIssueDate = filterIssueDate === '' ? true : (invoice?.issueDate === filterIssueDate);
      return matchesText && matchesStatus && matchesMonth && matchesYear && matchesIssueDate;
    });
  }, [db, filterText, filterStatus, filterPeriod, filterIssueDate]);

  const handleSaveOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedSubId) return;
    const selectedSub = db.subscribers.find(s => s.id === selectedSubId);
    if (!selectedSub) return;

    const prevReading = db.readings
      .filter(r => r.subscriberId === selectedSubId && r.id !== editingId)
      .sort((a,b) => b.currentReading - a.currentReading)[0]?.currentReading || selectedSub.initialReading;

    if (currReading < prevReading) {
      setError(`خطأ محاسبي: القراءة الحالية (${currReading}) لا يمكن أن تكون أقل من القراءة السابقة (${prevReading}) لهذا المشترك.`);
      return;
    }

    if (editingId) {
      const units = currReading - prevReading;
      const subType = db.subscriptionTypes.find(t => t.id === selectedSub.typeId);
      const totalAmount = subType ? ServerAPI.calculateTieredCost(units, subType) : 0;
      await ServerAPI.updateEntity('readings', editingId, { currentReading: currReading, units, totalAmount }, authUser);
    } else {
      const units = currReading - prevReading;
      const subType = db.subscriptionTypes.find(t => t.id === selectedSub.typeId);
      const totalAmount = subType ? ServerAPI.calculateTieredCost(units, subType) : 0;
      const result = await ServerAPI.addReading({
        subscriberId: selectedSubId, 
        periodYear: new Date().getFullYear(), 
        periodMonth: new Date().getMonth() + 1,
        previousReading: prevReading, 
        currentReading: currReading, 
        units, 
        totalAmount,
        date: new Date().toISOString().split('T')[0], 
        branchId: selectedSub.branchId
      });
      if (!result.success) { setError(result.message || 'خطأ غير متوقع'); return; }
    }
    closeModal();
  };

  const togglePost = async (id: string, currentlyPosted: boolean) => {
    if (currentlyPosted) {
      if (confirm('هل أنت متأكد من إلغاء الترحيل؟')) await ServerAPI.unpostEntity('readings', id, authUser);
    } else {
      if (confirm('هل أنت متأكد من ترحيل هذه القراءة؟')) await ServerAPI.postEntity('readings', id, authUser);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('حذف السجل نهائياً؟')) await ServerAPI.deleteEntity('readings', id, authUser);
  };

  const closeModal = () => { 
    setIsModalOpen(false); setEditingId(null); setSelectedSubId(''); setCurrReading(0); setError(null);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
       <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
       <p className="font-bold">جاري تحميل سجلات الفوترة من SQLite...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="hidden print:block fixed inset-0 z-[200] bg-white overflow-y-auto" dir="rtl">
        {Array.from(selectedIds).map((id) => {
          const invoice = db.invoices.find(i => i.readingId === id);
          if (invoice) return <InvoicePrintItem key={id} invoice={invoice} db={db} />;
          return null;
        })}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print text-right">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">سجل القراءات والفوترة</h2>
          <p className="text-slate-500 font-bold text-sm">إدارة دورة الفوترة الشهرية المتصلة بقاعدة البيانات</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm ml-2">
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutList size={14} /> قائمة</button>
            <button onClick={() => setViewMode('report')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'report' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}><FileText size={14} /> تقرير</button>
          </div>
          {selectedIds.size > 0 && (
             <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-black shadow-xl"><Printer size={18} /> طباعة المحدد ({selectedIds.size})</button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-xl"><Plus size={18} /> إصدار فاتورة</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 no-print bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
         <div className="lg:col-span-2 relative group text-right">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input type="text" placeholder="ابحث بالمشترك أو رقم العداد..." className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-4 focus:ring-blue-50 text-right" value={filterText} onChange={(e) => setFilterText(e.target.value)} />
         </div>
         <select className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-black text-xs text-slate-600" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
            <option value="all">كافة الحالات</option>
            <option value="posted">المرحلة</option>
            <option value="draft">المسودات</option>
         </select>
         <button onClick={() => { setFilterText(''); setFilterStatus('all'); setFilterPeriod({month: '', year: ''}); setFilterIssueDate(''); }} className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-black flex items-center justify-center"><X size={18} /></button>
      </div>

      <div className={`bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm ${viewMode === 'report' ? 'border-slate-300 shadow-xl' : ''}`}>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className={`${viewMode === 'report' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500'} border-b border-slate-100`}>
                {viewMode === 'list' && (
                  <th className="px-6 py-5 w-12 text-center no-print">
                    <button onClick={() => setSelectedIds(selectedIds.size === filteredReadings.length ? new Set() : new Set(filteredReadings.map(r => r.id)))}>
                      {selectedIds.size === filteredReadings.length && filteredReadings.length > 0 ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                    </button>
                  </th>
                )}
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">الحالة</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">المشترك / العداد</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-center">الاستهلاك</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-left">المبلغ</th>
                {viewMode === 'list' && <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-center no-print">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReadings.slice().reverse().map((r) => {
                const sub = db.subscribers.find(s => s.id === r.subscriberId);
                const isSelected = selectedIds.has(r.id);
                return (
                  <tr key={r.id} className={`transition-all ${isSelected ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                    {viewMode === 'list' && (
                      <td className="px-6 py-5 text-center no-print">
                         <button onClick={() => { const n = new Set(selectedIds); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); setSelectedIds(n); }} className="text-slate-300">{isSelected ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}</button>
                      </td>
                    )}
                    <td className="px-6 py-5">
                       {r.isPosted ? <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black"><Lock size={10} /> مُرحّل</span> : <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black"><Unlock size={10} /> مسودة</span>}
                    </td>
                    <td className="px-6 py-5">
                       <p className="font-black text-slate-800 text-sm">{sub?.name}</p>
                       <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{sub?.meterNumber}</p>
                    </td>
                    <td className="px-6 py-5 text-center font-black text-blue-600 font-mono text-base">{r.units}</td>
                    <td className="px-6 py-5 text-left font-black text-slate-700">{r.totalAmount.toLocaleString()}</td>
                    {viewMode === 'list' && (
                      <td className="px-6 py-5 text-center no-print">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => togglePost(r.id, r.isPosted)} className={`p-2 rounded-lg ${r.isPosted ? 'text-rose-600' : 'text-emerald-600'}`}>{r.isPosted ? <Unlock size={16} /> : <CheckCircle2 size={16} />}</button>
                          {!r.isPosted && <button onClick={() => { setEditingId(r.id); setSelectedSubId(r.subscriberId); setCurrReading(r.currentReading); setIsModalOpen(true); }} className="p-2 text-blue-600"><Edit3 size={16} /></button>}
                          <button onClick={() => handleDelete(r.id)} className="p-2 text-rose-400"><Trash2 size={16} /></button>
                          <button onClick={() => navigate(`/invoice/${db.invoices.find(i => i.readingId === r.id)?.id}`)} className="p-2 text-slate-400"><FileText size={16} /></button>
                        </div>
                      </td>
                    )}
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
          <div className="relative bg-white w-full max-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
             <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                <button onClick={closeModal} className="text-slate-400 hover:text-rose-600"><X size={24}/></button>
                <h3 className="text-xl font-black text-slate-800">{editingId ? 'تعديل فاتورة' : 'إصدار فاتورة جديدة'}</h3>
             </div>
             {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl">{error}</div>}
             <form onSubmit={handleSaveOrUpdate} className="space-y-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase">اختيار المشترك</label>
                   <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={selectedSubId} onChange={(e) => setSelectedSubId(e.target.value)} disabled={!!editingId}>
                      <option value="">-- اختر المشترك --</option>
                      {db.subscribers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.meterNumber})</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase">القراءة الحالية</label>
                   <input type="number" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-blue-600 text-center text-xl" value={currReading || ''} onChange={(e) => setCurrReading(Number(e.target.value))} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                   <Save size={20} /> حفظ الفاتورة في SQLite
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
