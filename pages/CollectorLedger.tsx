
import React from 'react';
import { dbEngine } from '../services/database';
import { Printer, UserCheck, ShieldCheck, History, TrendingUp, Search } from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const CollectorLedger = () => {
  const db = dbEngine.getRaw();
  const [selectedCollectorId, setSelectedCollectorId] = React.useState(db.collectors[0]?.id || '');
  const [searchTerm, setSearchTerm] = React.useState('');

  const selectedCollector = db.collectors.find(c => c.id === selectedCollectorId);
  const receipts = db.receipts.filter(r => 
    r.collectorId === selectedCollectorId && 
    (r.reference.includes(searchTerm) || db.subscribers.find(s => s.id === r.subscriberId)?.name.includes(searchTerm))
  );

  const totalCollected = receipts.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print text-right">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">كشف تحصيلات الموظف (المحصل)</h2>
          <p className="text-slate-500 font-bold text-sm">مراجعة وتدقيق كافة السندات التي تم تحصيلها بواسطة الموظف</p>
        </div>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all text-sm">
          <Printer size={18} /> طباعة كشف التحصيل
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
         <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">اختيار المحصل للمراجعة</label>
            <select className="w-full px-5 py-4 bg-white border border-slate-200 rounded-3xl font-black text-emerald-600 outline-none focus:ring-4 focus:ring-emerald-50" value={selectedCollectorId} onChange={(e) => setSelectedCollectorId(e.target.value)}>
               {db.collectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
         </div>
         <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">بحث في سندات المحصل</label>
            <div className="relative">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input type="text" placeholder="اسم المشترك أو رقم السند..." className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-3xl font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
         </div>
         <div className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-6 flex flex-col justify-center items-center">
            <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">إجمالي عهدة المحصل</p>
            <h3 className="text-3xl font-black text-emerald-600">{totalCollected.toLocaleString()} <span className="text-xs text-emerald-400 uppercase font-bold">{db.settings.currency}</span></h3>
         </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <PrintHeader title={`كشف مطابقة تحصيلات: ${selectedCollector?.name}`} />
        
        <div className="flex items-center gap-6 mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
              <UserCheck size={32} />
           </div>
           <div className="flex-1">
              <h3 className="text-xl font-black text-slate-800">{selectedCollector?.name}</h3>
              <p className="text-sm font-bold text-slate-400 flex items-center gap-2 mt-1">
                 <ShieldCheck size={14} /> موظف تحصيل معتمد • هاتف: {selectedCollector?.phone}
              </p>
           </div>
           <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase">تاريخ استخراج الكشف</p>
              <p className="text-sm font-black text-slate-700">{new Date().toLocaleDateString('ar-EG')}</p>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-6 py-4 text-xs font-black uppercase rounded-tr-2xl">التاريخ</th>
                <th className="px-6 py-4 text-xs font-black uppercase">المرجع</th>
                <th className="px-6 py-4 text-xs font-black uppercase">المشترك</th>
                <th className="px-6 py-4 text-xs font-black uppercase">الصندوق المودع له</th>
                <th className="px-6 py-4 text-xs font-black uppercase">طريقة الدفع</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-left rounded-tl-2xl">المبلغ المحصل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-6 py-4 text-xs font-mono font-black text-slate-400">{r.reference}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-800">{db.subscribers.find(s => s.id === r.subscriberId)?.name}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{db.funds.find(f => f.id === r.fundId)?.name}</td>
                  <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{r.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-600 text-left">{r.amount.toLocaleString()}</td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-16 text-center text-slate-300 font-bold">لا توجد عمليات تحصيل مسجلة لهذا الموظف</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black">
               <tr>
                  <td colSpan={5} className="px-6 py-6 text-slate-700">إجمالي ما تم تحصيله بموجب هذا الكشف</td>
                  <td className="px-6 py-6 text-2xl text-emerald-600 text-left">{totalCollected.toLocaleString()}</td>
               </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-10 no-print">
           <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <h4 className="font-black text-blue-800 mb-2 flex items-center gap-2"><TrendingUp size={18} /> تحليل الأداء</h4>
              <p className="text-xs text-blue-600 leading-relaxed font-bold">المحصل {selectedCollector?.name} قام بإنجاز {receipts.length} عملية تحصيل ناجحة بمتوسط {(totalCollected / (receipts.length || 1)).toFixed(0)} لكل عملية.</p>
           </div>
        </div>

        <PrintFooter />
      </div>
    </div>
  );
};
