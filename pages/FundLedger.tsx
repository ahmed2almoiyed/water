
import React from 'react';
import { dbEngine } from '../services/database';
import { Printer, Wallet, ArrowDownCircle, ArrowUpCircle, History, Filter } from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const FundLedger = () => {
  const db = dbEngine.getRaw();
  const [selectedFundId, setSelectedFundId] = React.useState(db.funds[0]?.id || '');
  const [startDate, setStartDate] = React.useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState(new Date().toISOString().split('T')[0]);

  const selectedFund = db.funds.find(f => f.id === selectedFundId);

  // تجميع كافة الحركات المرتبطة بالصندوق
  const movements = React.useMemo(() => {
    const receipts = db.receipts
      .filter(r => r.fundId === selectedFundId)
      .map(r => ({
        date: r.date,
        description: `تحصيل من مشترك: ${db.subscribers.find(s => s.id === r.subscriberId)?.name}`,
        reference: r.reference,
        in: r.amount,
        out: 0,
        type: 'receipt'
      }));

    const expenses = db.expenses
      .filter(e => e.fundId === selectedFundId)
      .map(e => ({
        date: e.date,
        description: `مصروف: ${e.description} (${e.category})`,
        reference: e.reference,
        in: 0,
        out: e.amount,
        type: 'expense'
      }));

    return [...receipts, ...expenses]
      .filter(m => m.date.split('T')[0] >= startDate && m.date.split('T')[0] <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedFundId, startDate, endDate, db.receipts, db.expenses, db.subscribers]);

  let runningBalance = selectedFund?.openingBalance || 0;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-800">كشف حساب الصندوق (الخزينة)</h2>
          <p className="text-slate-500 font-bold text-sm">متابعة دقيقة لكل حركة مالية (وارد / صادر) داخل الصندوق</p>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all text-sm">
          <Printer size={18} /> طباعة الكشف
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">اختر الصندوق</label>
          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-blue-600" value={selectedFundId} onChange={(e) => setSelectedFundId(e.target.value)}>
            {db.funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">من تاريخ</label>
          <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">إلى تاريخ</label>
          <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="bg-slate-900 rounded-[2rem] p-4 text-white flex flex-col justify-center">
           <p className="text-[10px] font-black opacity-60 uppercase">الرصيد الختامي الحالي</p>
           <h3 className="text-xl font-black text-blue-400">{selectedFund?.balance.toLocaleString()} <span className="text-xs opacity-60">{db.settings.currency}</span></h3>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <PrintHeader title={`كشف حساب: ${selectedFund?.name}`} />
        
        <div className="grid grid-cols-3 gap-4 mb-8">
           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الرصيد الافتتاحي</p>
              <p className="text-lg font-black text-slate-700">{selectedFund?.openingBalance.toLocaleString()}</p>
           </div>
           <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">إجمالي الوارد (+)</p>
              <p className="text-lg font-black text-emerald-600">{movements.reduce((a,b)=>a+b.in,0).toLocaleString()}</p>
           </div>
           <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <p className="text-[10px] font-black text-rose-500 uppercase mb-1">إجمالي الصادر (-)</p>
              <p className="text-lg font-black text-rose-600">{movements.reduce((a,b)=>a+b.out,0).toLocaleString()}</p>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-4 py-4 text-xs font-black uppercase">التاريخ</th>
                <th className="px-4 py-4 text-xs font-black uppercase">البيان / الشرح</th>
                <th className="px-4 py-4 text-xs font-black uppercase">المرجع</th>
                <th className="px-4 py-4 text-xs font-black uppercase text-center bg-emerald-50 text-emerald-700">مدين (وارد)</th>
                <th className="px-4 py-4 text-xs font-black uppercase text-center bg-rose-50 text-rose-700">دائن (صادر)</th>
                <th className="px-4 py-4 text-xs font-black uppercase text-left">الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-slate-50/50">
                <td className="px-4 py-4 text-xs font-bold text-slate-400">---</td>
                <td className="px-4 py-4 text-xs font-black text-slate-400 italic">رصيد أول المدة المستحق</td>
                <td className="px-4 py-4 text-xs text-slate-400 italic">افتتاحي</td>
                <td className="px-4 py-4"></td>
                <td className="px-4 py-4"></td>
                <td className="px-4 py-4 text-sm font-black text-slate-500 text-left">{selectedFund?.openingBalance.toLocaleString()}</td>
              </tr>
              {movements.map((m, idx) => {
                runningBalance += (m.in - m.out);
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-xs font-bold text-slate-500">{new Date(m.date).toLocaleDateString('ar-EG')}</td>
                    <td className="px-4 py-4 text-xs font-black text-slate-700">{m.description}</td>
                    <td className="px-4 py-4 text-xs font-mono font-bold text-slate-400">{m.reference}</td>
                    <td className="px-4 py-4 text-sm font-black text-emerald-600 text-center">{m.in > 0 ? m.in.toLocaleString() : '-'}</td>
                    <td className="px-4 py-4 text-sm font-black text-rose-600 text-center">{m.out > 0 ? m.out.toLocaleString() : '-'}</td>
                    <td className="px-4 py-4 text-sm font-black text-slate-800 text-left">{runningBalance.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <PrintFooter />
      </div>
    </div>
  );
};
