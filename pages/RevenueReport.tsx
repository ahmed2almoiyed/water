
import React from 'react';
import { dbEngine } from '../services/database';
import { Printer, Calendar, Filter, TrendingUp, UserCheck, Wallet, FileDown } from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';
import { ExcelUtils } from '../services/excelUtils';

export const RevenueReport = () => {
  const db = dbEngine.getRaw();
  const [startDate, setStartDate] = React.useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [filterCollector, setFilterCollector] = React.useState('all');

  const filteredReceipts = db.receipts.filter(r => {
    const rDate = r.date.split('T')[0];
    const matchesDate = rDate >= startDate && rDate <= endDate;
    const matchesCollector = filterCollector === 'all' || r.collectorId === filterCollector;
    return matchesDate && matchesCollector;
  });

  const totalRevenue = filteredReceipts.reduce((acc, r) => acc + r.amount, 0);

  const handleExport = () => {
    const exportData = filteredReceipts.map(r => ({
      'التاريخ': r.date,
      'المرجع': r.reference,
      'المشترك': db.subscribers.find(s => s.id === r.subscriberId)?.name,
      'المحصل': db.collectors.find(c => c.id === r.collectorId)?.name,
      'الصندوق': db.funds.find(f => f.id === r.fundId)?.name,
      'طريقة الدفع': r.paymentMethod,
      'المبلغ': r.amount
    }));
    ExcelUtils.exportToCSV('Revenue_Report', exportData);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-800">تقرير الإيرادات والمقبوضات</h2>
          <p className="text-slate-500 font-bold text-sm">تحليل التدفقات النقدية الداخلة حسب الفترة والمحصلين</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black flex items-center gap-2 hover:bg-emerald-100 transition-all text-xs">
            <FileDown size={18} /> تصدير Excel
          </button>
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-black transition-all text-sm">
            <Printer size={18} /> طباعة التقرير
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">من تاريخ</label>
          <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">إلى تاريخ</label>
          <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المحصل</label>
          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={filterCollector} onChange={(e) => setFilterCollector(e.target.value)}>
            <option value="all">كافة المحصلين</option>
            {db.collectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="bg-emerald-600 rounded-[2rem] p-4 text-white flex flex-col justify-center">
           <p className="text-[10px] font-black opacity-80 uppercase">إجمالي إيراد الفترة</p>
           <h3 className="text-xl font-black">{totalRevenue.toLocaleString()} <span className="text-xs opacity-60">{db.settings.currency}</span></h3>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0">
        <PrintHeader title="تقرير الإيرادات التفصيلي خلال الفترة" />
        
        <div className="mb-6 flex justify-between items-center px-2">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">نطاق التقرير</p>
              <p className="text-sm font-black text-slate-700">من: {new Date(startDate).toLocaleDateString('ar-EG')} - إلى: {new Date(endDate).toLocaleDateString('ar-EG')}</p>
           </div>
           <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase">عدد العمليات</p>
              <p className="text-sm font-black text-slate-700">{filteredReceipts.length} سند</p>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-4 py-4 text-xs font-black uppercase">التاريخ</th>
                <th className="px-4 py-4 text-xs font-black uppercase">رقم السند</th>
                <th className="px-4 py-4 text-xs font-black uppercase">اسم المشترك</th>
                <th className="px-4 py-4 text-xs font-black uppercase">المحصل</th>
                <th className="px-4 py-4 text-xs font-black uppercase">الصندوق</th>
                <th className="px-4 py-4 text-xs font-black uppercase text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-xs font-bold text-slate-500">{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-4 py-4 text-xs font-mono font-black text-slate-400">{r.reference}</td>
                  <td className="px-4 py-4 text-xs font-black text-slate-700">{db.subscribers.find(s => s.id === r.subscriberId)?.name}</td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-600">{db.collectors.find(c => c.id === r.collectorId)?.name}</td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-600">{db.funds.find(f => f.id === r.fundId)?.name}</td>
                  <td className="px-4 py-4 text-sm font-black text-emerald-600 text-left">{r.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
               <tr>
                  <td colSpan={5} className="px-4 py-5 font-black text-slate-700">إجمالي المقبوضات المفلترة</td>
                  <td className="px-4 py-5 font-black text-xl text-emerald-600 text-left">{totalRevenue.toLocaleString()}</td>
               </tr>
            </tfoot>
          </table>
        </div>
        <PrintFooter />
      </div>
    </div>
  );
};
