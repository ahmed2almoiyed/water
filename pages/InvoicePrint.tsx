
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbEngine } from '../services/database';
import { Printer, ArrowRight, Droplets, Calendar, Hash, User, MapPin, Receipt, ShieldCheck } from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const InvoicePrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = dbEngine.getRaw();
  
  const invoice = db.invoices.find(i => i.id === id);
  const subscriber = invoice ? db.subscribers.find(s => s.id === invoice.subscriberId) : null;
  const reading = invoice ? db.readings.find(r => r.id === invoice.readingId) : null;
  const subType = subscriber ? db.subscriptionTypes.find(t => t.id === subscriber.typeId) : null;

  if (!invoice || !subscriber || !reading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 min-h-[60vh]">
        <Hash size={64} className="mb-4 opacity-10 animate-pulse" />
        <h2 className="text-xl font-black text-slate-800">عذراً، لم يتم العثور على الفاتورة المطلوبة</h2>
        <p className="text-sm font-bold text-slate-500 mt-2">قد يكون تم حذف الفاتورة أو أن الرابط غير صحيح</p>
        <button 
          onClick={() => navigate('/readings')} 
          className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <ArrowRight size={20} /> العودة لسجل القراءات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 px-2 sm:px-0">
      {/* شريط التحكم العلوي */}
      <div className="flex flex-col sm:flex-row justify-between items-center no-print bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl gap-4">
        <button 
          onClick={() => navigate('/readings')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black transition-all group"
        >
          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
            <ArrowRight size={18} />
          </div>
          <span>رجوع للقراءات</span>
        </button>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex flex-col items-end px-4 border-l border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase">حالة الفاتورة</p>
             <p className={`text-xs font-black ${invoice.status === 'paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {invoice.status === 'paid' ? 'مـسددة بالكامل' : 'قيد الانتظار'}
             </p>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black flex items-center gap-3 hover:bg-black shadow-2xl transition-all active:scale-95"
          >
            <Printer size={20} />
            طباعة الفاتورة النهائية
          </button>
        </div>
      </div>

      {/* نموذج الفاتورة المطبوع */}
      <div className="bg-white p-8 sm:p-14 rounded-[3rem] border border-slate-200 shadow-2xl print:shadow-none print:border-none print:p-0 relative overflow-hidden">
        {/* علامة مائية للتحصيل */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-12 no-print">
           <Droplets size={400} />
        </div>

        <PrintHeader title="فاتورة استهلاك المياه الرسمية" />
        
        {/* قسم معلومات الفاتورة والطرف المستلم */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 relative z-10">
          <div className="space-y-6">
            <div className="bg-slate-50/80 p-6 rounded-[2.5rem] border border-slate-100">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm border border-slate-50">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">بيانات المشترك</p>
                    <h3 className="text-lg font-black text-slate-800">{subscriber.name}</h3>
                  </div>
               </div>
               <div className="space-y-2 pr-2">
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <Hash size={12} className="text-blue-400" /> 
                    <span>رقم العداد المعتمد:</span>
                    <span className="font-mono text-slate-800">{subscriber.meterNumber}</span>
                  </p>
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <MapPin size={12} className="text-rose-400" /> 
                    <span>العنوان المسجل:</span>
                    <span className="text-slate-800">{subscriber.governorate} - {subscriber.region}</span>
                  </p>
                  <p className="text-[10px] font-black text-slate-400 pr-5">{subscriber.address}</p>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
               <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-3 bg-white/20 rounded-2xl text-white backdrop-blur-md">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest leading-none mb-1">تفاصيل المستند</p>
                    <h3 className="text-lg font-black text-white">رقم: {invoice.invoiceNumber}</h3>
                  </div>
               </div>
               <div className="space-y-2 relative z-10">
                  <div className="flex justify-between items-center text-xs">
                     <span className="font-bold opacity-80">تاريخ الإصدار:</span>
                     <span className="font-black">{new Date(invoice.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="font-bold opacity-80">تاريخ الاستحقاق:</span>
                     <span className="font-black text-yellow-300">{new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] pt-2 border-t border-white/10">
                     <span className="font-black opacity-60 uppercase tracking-widest">Financial Period</span>
                     <span className="font-black">شهر {reading.periodMonth} / {reading.periodYear}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* جدول بيانات القراءة الفنية */}
        <div className="mb-12 overflow-hidden rounded-[2.5rem] border-2 border-slate-100 bg-slate-50/50">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest">القراءة السابقة</th>
                <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">القراءة الحالية</th>
                <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest bg-blue-600 border-none">الاستهلاك (م³)</th>
                <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest border-l border-white/10">فئة الاشتراك</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-8 px-4 font-black text-2xl text-slate-400 font-mono">{reading.previousReading}</td>
                <td className="py-8 px-4 font-black text-2xl text-slate-800 font-mono">{reading.currentReading}</td>
                <td className="py-8 px-4 font-black text-4xl text-blue-600 bg-blue-50/50 font-mono">{reading.units}</td>
                <td className="py-8 px-4">
                  <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-xs font-black text-slate-500 shadow-sm">
                     {subType?.name}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* تفاصيل المبالغ المالية */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-5">
             <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">تفصيل البنود المالية للفاتورة</h4>
             </div>
             <div className="space-y-4 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">قيمة استهلاك المياه</span>
                    <span className="text-[10px] font-bold text-slate-400">بناءً على شرائح الاستهلاك المعتمدة</span>
                  </div>
                  <span className="text-base font-black text-slate-800">{reading.totalAmount.toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">رسوم الخدمات الثابتة</span>
                    <span className="text-[10px] font-bold text-slate-400">رسوم صيانة الشبكة والعداد</span>
                  </div>
                  <span className="text-base font-black text-slate-800">{subType?.fixedFee.toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-rose-600">متأخرات سابقة</span>
                    <span className="text-[10px] font-bold text-rose-400">أرصدة مدورة من فترات ماضية</span>
                  </div>
                  <span className="text-base font-black text-rose-600">{invoice.arrears.toLocaleString()} ريال</span>
                </div>
             </div>
          </div>

          <div className="lg:col-span-5">
             <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group print:bg-white print:text-black print:border-4 print:border-slate-900 print:shadow-none h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-20 -mr-24 -mt-24" />
                <div className="relative z-10 space-y-4">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-4">Final Due Amount</p>
                      <p className="text-xs font-bold text-slate-400 mb-2">المبلغ الإجمالي المطلوب سداده</p>
                      <div className="flex items-baseline justify-center gap-3 mb-4">
                        <h2 className="text-6xl font-black tracking-tighter">
                          {invoice.totalDue.toLocaleString()}
                        </h2>
                        <span className="text-sm font-black text-blue-400 uppercase tracking-widest">{db.settings.currency}</span>
                      </div>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md print:bg-slate-50 print:border-slate-200">
                      <p className="text-[9px] font-black text-blue-300 leading-relaxed text-center">
                         يرجى المبادرة بالسداد قبل تاريخ الاستحقاق لتجنب انقطاع الخدمة وغرامات التأخير.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* تذييل الفاتورة الرسمي */}
        <PrintFooter />
      </div>
    </div>
  );
};
