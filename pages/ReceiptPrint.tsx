
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbEngine } from '../services/database';
import { Printer, ArrowRight, Hash, User, Wallet, UserCheck, Calendar, CreditCard, Banknote } from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const ReceiptPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = dbEngine.getRaw();
  
  const receipt = db.receipts.find(r => r.id === id);
  const subscriber = receipt ? db.subscribers.find(s => s.id === receipt.subscriberId) : null;
  const collector = receipt ? db.collectors.find(c => c.id === receipt.collectorId) : null;
  const fund = receipt ? db.funds.find(f => f.id === receipt.fundId) : null;

  if (!receipt || !subscriber) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Hash size={64} className="mb-4 opacity-20" />
        <p className="font-black">عذراً، لم يتم العثور على السند المطلوب</p>
        <button onClick={() => navigate('/receipts')} className="mt-4 text-emerald-600 font-bold underline">العودة لسجل المقبوضات</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center no-print bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <button 
          onClick={() => navigate('/receipts')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-black transition-colors"
        >
          <ArrowRight size={20} />
          العودة للمقبوضات
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
        >
          <Printer size={20} />
          طباعة السند الآن
        </button>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border-2 border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0">
        <PrintHeader title="سند قبض نقدي / تحويل" />
        
        <div className="flex justify-between items-center mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
           <div className="flex items-center gap-4">
              <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-100">
                <Hash size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Voucher Number</p>
                 <h2 className="text-xl font-black text-slate-800 font-mono">{receipt.reference}</h2>
              </div>
           </div>
           <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date of Issue</p>
              <h2 className="text-xl font-black text-slate-800">{new Date(receipt.date).toLocaleDateString('ar-EG')}</h2>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-6">
            <div className="border-r-4 border-emerald-500 pr-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Received From / استلمنا من</p>
               <h3 className="text-lg font-black text-slate-800">{subscriber.name}</h3>
               <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-2">
                 <Hash size={12} /> رقم العداد: {subscriber.meterNumber}
               </p>
            </div>

            <div className="border-r-4 border-slate-200 pr-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statement / وذلك عن (البيان)</p>
               <p className="text-sm font-black text-slate-700 leading-relaxed">{receipt.description}</p>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Banknote size={80} /></div>
             <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Amount Received</p>
             <h2 className="text-5xl font-black text-emerald-600 mb-2">
               {receipt.amount.toLocaleString()}
             </h2>
             <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{db.settings.currency}</p>
             
             <div className="mt-6 pt-6 border-t border-emerald-100 w-full flex justify-around items-center">
                <div className="flex flex-col items-center gap-1">
                   {receipt.paymentMethod === 'cash' ? <Banknote size={18} className="text-emerald-600" /> : <CreditCard size={18} className="text-blue-600" />}
                   <span className="text-[10px] font-black text-slate-400 uppercase">{receipt.paymentMethod}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
           <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Wallet size={16} className="text-emerald-600" />
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase">Deposit to Fund / الصندوق</p>
                 <p className="text-xs font-black text-slate-700">{fund?.name}</p>
              </div>
           </div>
           <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <UserCheck size={16} className="text-blue-600" />
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase">Received By / المحصل</p>
                 <p className="text-xs font-black text-slate-700">{collector?.name}</p>
              </div>
           </div>
        </div>

        <div className="mt-12 flex justify-between items-end border-t-2 border-dashed border-slate-100 pt-10">
           <div className="text-center w-40">
              <div className="h-1 bg-slate-100 w-full mb-4"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Customer Signature</p>
              <p className="text-[10px] font-bold text-slate-300">توقيع المستلم منه</p>
           </div>
           
           <div className="w-24 h-24 border-4 border-emerald-100 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 border-2 border-emerald-50 rounded-full scale-110"></div>
              <p className="text-[8px] font-black text-emerald-200 uppercase text-center rotate-12">Official<br/>Finance Seal</p>
           </div>

           <div className="text-center w-40">
              <div className="h-1 bg-slate-100 w-full mb-4"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Authorized Signature</p>
              <p className="text-[10px] font-bold text-slate-300">توقيع أمين الصندوق</p>
           </div>
        </div>

        <PrintFooter />
      </div>
    </div>
  );
};
