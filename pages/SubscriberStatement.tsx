
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ServerAPI } from '../services/server';
import { Printer, ArrowRight, Download, User, MapPin, Phone } from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const SubscriberStatement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscriber, setSubscriber] = React.useState<any>(null);
  const [statement, setStatement] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (id) {
      const sub = ServerAPI.getSubscriberById(id);
      if (sub) {
        setSubscriber(sub);
        setStatement(ServerAPI.getSubscriberStatement(id));
      }
    }
  }, [id]);

  if (!subscriber) return <div>جاري التحميل...</div>;

  let runningBalance = 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center no-print">
        <button 
          onClick={() => navigate('/subscribers')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold"
        >
          <ArrowRight size={20} />
          العودة للمشتركين
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg"
        >
          <Printer size={20} />
          طباعة كشف الحساب
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print:shadow-none print:border-none relative">
        <PrintHeader title="كشف حساب المشترك التفصيلي" />
        
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 no-print">
                <User size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">اسم المشترك</p>
                <p className="text-lg font-black text-slate-800">{subscriber.name}</p>
                <p className="text-xs text-slate-400 font-mono">{subscriber.meterNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 no-print">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">رقم التواصل</p>
                <p className="text-slate-600 font-bold">{subscriber.phone}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 no-print">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">العنوان</p>
                <p className="text-slate-600 font-bold text-sm">{subscriber.address}, {subscriber.region}</p>
              </div>
            </div>
            <div className="bg-blue-600 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg shadow-blue-100 print:bg-white print:text-black print:border-2 print:border-blue-600 print:shadow-none">
              <span className="font-bold">إجمالي المديونية القائمة:</span>
              <span className="text-2xl font-black">{subscriber.balance.toLocaleString()} ريال</span>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200 print:bg-white">
                <th className="px-4 py-4 font-black text-slate-700 text-sm">التاريخ</th>
                <th className="px-4 py-4 font-black text-slate-700 text-sm">البيان / الوصف</th>
                <th className="px-4 py-4 font-black text-rose-600 text-sm">مدين (فاتورة)</th>
                <th className="px-4 py-4 font-black text-emerald-600 text-sm">دائن (سداد)</th>
                <th className="px-4 py-4 font-black text-blue-600 text-sm">الرصيد التراكمي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statement.map((item, idx) => {
                runningBalance += (item.debit - item.credit);
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">{new Date(item.date).toLocaleDateString('ar-EG')}</td>
                    <td className="px-4 py-4 font-bold text-slate-800 text-xs">{item.description}</td>
                    <td className="px-4 py-4 font-black text-rose-500 text-xs">{item.debit > 0 ? item.debit.toLocaleString() : '-'}</td>
                    <td className="px-4 py-4 font-black text-emerald-500 text-xs">{item.credit > 0 ? item.credit.toLocaleString() : '-'}</td>
                    <td className="px-4 py-4 font-black text-slate-800 text-xs">{runningBalance.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-black text-base border-t-2 border-slate-200 print:bg-white">
                <td colSpan={2} className="px-4 py-6 text-slate-700">إجمالي العمليات</td>
                <td className="px-4 py-6 text-rose-600">{statement.reduce((a, b) => a + b.debit, 0).toLocaleString()}</td>
                <td className="px-4 py-6 text-emerald-600">{statement.reduce((a, b) => a + b.credit, 0).toLocaleString()}</td>
                <td className="px-4 py-6 text-blue-600">{subscriber.balance.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <PrintFooter />
      </div>
    </div>
  );
};
