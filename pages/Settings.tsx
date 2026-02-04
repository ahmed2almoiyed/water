
import React from 'react';
import { dbEngine } from '../services/database';
import { ServerAPI } from '../services/server';
import { 
  Save, Building, Database as DbIcon, Download, RefreshCcw, 
  Trash2, AlertTriangle, CheckCircle, Lock, Calendar, ShieldCheck
} from 'lucide-react';

export const Settings = () => {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [settings, setSettings] = React.useState(db.settings);
  const [closeDate, setCloseDate] = React.useState(settings.lastClosedDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = React.useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authUser.role !== 'admin') return alert('عذراً، التعديل متاح للمدير فقط');
    
    const updatedDb = dbEngine.getRaw();
    updatedDb.settings = settings;
    await dbEngine.overwrite(updatedDb);
    setStatus({ type: 'success', message: 'تم حفظ الإعدادات بنجاح' });
  };

  const handleClosePeriod = async () => {
    if (confirm(`تنبيه أمان: هل أنت متأكد من إقفال الفترة المالية حتى تاريخ ${closeDate}؟ لن يتمكن أي موظف من إضافة أو تعديل مستندات قبل هذا التاريخ.`)) {
      await ServerAPI.closeFinancialPeriod(closeDate, authUser);
      setDb(dbEngine.getRaw());
      setStatus({ type: 'success', message: 'تم إقفال الفترة المالية بنجاح' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 text-right" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">إعدادات الرقابة والصيانة</h2>
           <p className="text-slate-500 font-bold">إدارة الهوية المالية وفترات الإقفال المحاسبي</p>
        </div>
        {status && <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black text-sm animate-bounce">{status.message}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
           <form onSubmit={handleSave} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xl font-black flex items-center gap-2 justify-end"><Building className="text-blue-600" /> بيانات الهوية الرسمية</h3>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">اسم المؤسسة</label>
                    <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black focus:ring-4 focus:ring-blue-50 outline-none" value={settings.institutionName} onChange={(e) => setSettings({...settings, institutionName: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">العملة</label>
                       <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black" value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">رقم الهاتف</label>
                       <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold font-mono" value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} />
                    </div>
                 </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                 <Save size={20} /> حفظ تغييرات الهوية
              </button>
           </form>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-rose-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700" />
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4 justify-end text-right">
                   <div>
                      <h3 className="text-xl font-black">الإقفال المالي النهائي</h3>
                      <p className="text-rose-200 text-xs font-bold mt-1">تجميد كافة الحسابات للفترات الماضية</p>
                   </div>
                   <Lock size={32} className="text-rose-400 shrink-0" />
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase opacity-60 px-1">تاريخ إقفال العمليات (يشمل هذا التاريخ وما قبله)</label>
                   <input type="date" className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 font-black outline-none focus:bg-white/20 transition-all text-center" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
                </div>

                <div className="p-5 bg-black/20 rounded-[2rem] border border-white/10 space-y-2">
                   <p className="text-[10px] leading-relaxed opacity-90 font-bold">
                     * سيتم قفل الفواتير، المقبوضات، والمصروفات.
                     <br/>* لا يمكن لأي موظف "غير المدير" تعديل البيانات المرحلة.
                     <br/>* الإجراء ضروري قبل استخراج الميزانية العمومية.
                   </p>
                </div>

                <button onClick={handleClosePeriod} className="w-full bg-white text-rose-900 py-5 rounded-3xl font-black hover:bg-rose-50 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95">
                   <ShieldCheck size={22} /> تنفيذ الإقفال الآن
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
