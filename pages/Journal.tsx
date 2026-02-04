
import React from 'react';
import { dbEngine } from '../services/database';
import { Search, Printer, FileText, ArrowDownLeft, ArrowUpRight, Scale, Filter, Calendar, Hash } from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const Journal = () => {
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    await dbEngine.query('journal');
    setDb(dbEngine.getRaw());
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
    const unsubscribe = dbEngine.subscribe((newDb) => setDb(newDb));
    return () => unsubscribe();
  }, [loadData]);

  const filteredJournal = db.journal.filter(j => {
    const matchesSearch = (j.description || '').includes(searchTerm) || (j.referenceId || '').includes(searchTerm);
    const matchesType = filterType === 'all' || j.referenceType === filterType;
    return matchesSearch && matchesType;
  });

  const totalDebit = filteredJournal.reduce((a, b) => a + b.debit, 0);
  const totalCredit = filteredJournal.reduce((a, b) => a + b.credit, 0);

  if (loading) return <div className="py-20 text-center font-black text-slate-400">جاري جلب القيود المحاسبية...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print text-right">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">دفتر القيود اليومية العام</h2>
          <p className="text-slate-500 font-bold text-sm">السجل التاريخي لكافة الحركات المالية والحسابات المزدوجة</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl">
            <Printer size={18} /> طباعة دفتر اليومية
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ابحث في وصف القيد أو المرجع..." 
            className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm outline-none focus:ring-4 focus:ring-blue-50 text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 font-black text-xs text-slate-600 outline-none"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">كافة أنواع المستندات</option>
          <option value="invoice">الفواتير</option>
          <option value="receipt">المقبوضات</option>
          <option value="expense">المصروفات</option>
          <option value="settlement">التسويات</option>
        </select>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between px-6">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تطابق ميزان المراجعة</span>
           {totalDebit === totalCredit ? <Scale className="text-emerald-500" /> : <Scale className="text-rose-500 animate-pulse" />}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <PrintHeader title="سجل القيود اليومية التفصيلي" />
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">التاريخ</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">البيان / الوصف المحاسبي</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">المرجع</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-center">مدين (+)</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-center">دائن (-)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredJournal.slice().reverse().map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-6 py-5">
                     <p className="text-xs font-black text-slate-800">{new Date(j.date).toLocaleDateString('ar-EG')}</p>
                     <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">{j.accountType}</p>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-2">
                        {j.debit > 0 ? <ArrowUpRight className="text-emerald-500" size={14} /> : <ArrowDownLeft className="text-rose-500" size={14} />}
                        <span className="font-black text-slate-700 text-sm leading-relaxed">{j.description}</span>
                     </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-[10px] text-slate-400">{j.referenceId.slice(-8)}</td>
                  <td className="px-6 py-5 text-center font-black text-emerald-600 font-mono text-base">{j.debit > 0 ? j.debit.toLocaleString() : '-'}</td>
                  <td className="px-6 py-5 text-center font-black text-rose-600 font-mono text-base">{j.credit > 0 ? j.credit.toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white">
               <tr>
                  <td colSpan={3} className="px-6 py-6 font-black text-sm text-right">إجمالي ميزان العمليات</td>
                  <td className="px-6 py-6 text-center font-black text-xl text-emerald-400">{totalDebit.toLocaleString()}</td>
                  <td className="px-6 py-6 text-center font-black text-xl text-rose-400">{totalCredit.toLocaleString()}</td>
               </tr>
            </tfoot>
          </table>
        </div>
        <PrintFooter />
      </div>
    </div>
  );
};
