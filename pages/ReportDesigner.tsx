
import React from 'react';
import { dbEngine } from '../services/database';
import { ServerAPI } from '../services/server';
import { 
  FileSearch, 
  Settings2, 
  Table as TableIcon, 
  Filter, 
  Printer, 
  CheckSquare, 
  Square,
  ChevronLeft,
  Calendar,
  Layout,
  Database,
  Eye
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';
import { ReportModule, ReportConfig } from '../types';

export const ReportDesigner = () => {
  const db = dbEngine.getRaw();
  const [activeModule, setActiveModule] = React.useState<ReportModule>('subscribers');
  const [config, setConfig] = React.useState<ReportConfig>({
    title: 'تقرير مخصص',
    module: 'subscribers',
    columns: ['name', 'meterNumber', 'balance'],
    filters: { branchId: 'all' }
  });
  
  const [reportData, setReportData] = React.useState<any[]>([]);

  const modules = [
    { id: 'subscribers', label: 'المشتركين', icon: Database, cols: { name: 'الاسم', meterNumber: 'رقم العداد', phone: 'الهاتف', balance: 'الرصيد', region: 'المنطقة' } },
    { id: 'invoices', label: 'الفواتير', icon: FileSearch, cols: { invoiceNumber: 'رقم الفاتورة', date: 'التاريخ', amount: 'المبلغ', status: 'الحالة' } },
    { id: 'receipts', label: 'المقبوضات', icon: Settings2, cols: { reference: 'المرجع', date: 'التاريخ', amount: 'المبلغ', description: 'البيان' } },
    { id: 'expenses', label: 'المصروفات', icon: Layout, cols: { description: 'البيان', category: 'التصنيف', amount: 'المبلغ', date: 'التاريخ' } }
  ];

  const handleModuleChange = (modId: ReportModule) => {
    setActiveModule(modId);
    const mod = modules.find(m => m.id === modId);
    setConfig({
      ...config,
      module: modId,
      columns: Object.keys(mod!.cols).slice(0, 3)
    });
  };

  const toggleColumn = (col: string) => {
    const newCols = config.columns.includes(col) 
      ? config.columns.filter(c => c !== col)
      : [...config.columns, col];
    setConfig({ ...config, columns: newCols });
  };

  const generateReport = () => {
    let data: any[] = [];
    if (activeModule === 'subscribers') data = db.subscribers;
    else if (activeModule === 'invoices') data = db.invoices;
    else if (activeModule === 'receipts') data = db.receipts;
    else if (activeModule === 'expenses') data = db.expenses;

    // Apply simple date filters
    if (config.filters.startDate) {
      data = data.filter(d => d.date >= config.filters.startDate!);
    }
    if (config.filters.endDate) {
      data = data.filter(d => d.date <= config.filters.endDate!);
    }

    setReportData(data);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-800">مصمم التقارير الاحترافي</h2>
          <p className="text-slate-500 font-bold">قم بتخصيص وبناء تقاريرك المالية والبيانية حسب الطلب</p>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl">
          <Printer size={20} /> معاينة وطباعة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        <div className="lg:col-span-4 space-y-6">
           {/* Module Selector */}
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">1. اختيار وحدة البيانات</h3>
              <div className="space-y-2">
                 {modules.map(m => (
                   <button 
                    key={m.id} 
                    onClick={() => handleModuleChange(m.id as ReportModule)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeModule === m.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
                   >
                      <m.icon size={20} />
                      <span className="font-black text-sm">{m.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* Column Selector */}
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">2. اختيار أعمدة الجدول</h3>
              <div className="grid grid-cols-1 gap-2">
                 {Object.entries(modules.find(m => m.id === activeModule)!.cols).map(([key, label]) => (
                   <button 
                    key={key} 
                    onClick={() => toggleColumn(key)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all"
                   >
                      <span className="text-xs font-bold text-slate-700">{label}</span>
                      {config.columns.includes(key) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} className="text-slate-300" />}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">3. محرك الفلاتر المتقدم</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 mr-2 flex items-center gap-1 uppercase tracking-tighter"><Calendar size={12}/> من تاريخ</label>
                    <input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={config.filters.startDate || ''} onChange={(e) => setConfig({...config, filters: {...config.filters, startDate: e.target.value}})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 mr-2 flex items-center gap-1 uppercase tracking-tighter"><Calendar size={12}/> إلى تاريخ</label>
                    <input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={config.filters.endDate || ''} onChange={(e) => setConfig({...config, filters: {...config.filters, endDate: e.target.value}})} />
                 </div>
              </div>
              <button 
                onClick={generateReport}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
              >
                 <Eye size={20} /> عرض وتحليل البيانات الآن
              </button>
           </div>

           {/* Preview Card */}
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative z-10 flex items-center justify-between">
                 <div>
                    <h4 className="text-xl font-black">جاهز للاستخراج</h4>
                    <p className="text-slate-400 text-xs font-bold mt-1">تم العثور على {reportData.length} سجل مطابق للإعدادات الحالية.</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                    <TableIcon size={32} className="text-blue-400" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Report Body */}
      {reportData.length > 0 && (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 mt-8">
           <PrintHeader title={config.title} />
           
           <div className="overflow-x-auto mt-6">
              <table className="w-full text-right border-collapse">
                 <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                       {config.columns.map(col => (
                         <th key={col} className="px-6 py-5 text-xs font-black uppercase text-slate-600">
                            {modules.find(m => m.id === activeModule)!.cols[col as keyof typeof modules[0]['cols']]}
                         </th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                         {config.columns.map(col => (
                           <td key={col} className="px-6 py-5 text-xs font-bold text-slate-700">
                              {col === 'balance' || col === 'amount' 
                                ? Number(row[col]).toLocaleString() + ' ' + db.settings.currency 
                                : row[col]}
                           </td>
                         ))}
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <PrintFooter />
        </div>
      )}
    </div>
  );
};
