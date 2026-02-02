
import React from 'react';
import { dbEngine } from '../services/database';
import { Droplets, Phone, Mail, Globe, Printer } from 'lucide-react';

export const PrintHeader: React.FC<{ title: string }> = ({ title }) => {
  const settings = dbEngine.getRaw().settings;
  const date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="mb-10 border-b-4 border-blue-600 pb-8">
      <div className="flex justify-between items-start gap-6">
        {/* معلومات التواصل للمؤسسة */}
        <div className="text-right space-y-2 flex-1">
          <h1 className="text-2xl font-black text-slate-800 mb-2">{settings.institutionName}</h1>
          <div className="grid grid-cols-1 gap-1">
            {settings.phone && (
              <p className="text-[11px] font-bold text-slate-600 flex items-center justify-end gap-2">
                <span>{settings.phone}</span>
                <Phone size={12} className="text-blue-600 shrink-0" />
              </p>
            )}
            {settings.email && (
              <p className="text-[11px] font-bold text-slate-600 flex items-center justify-end gap-2">
                <span>{settings.email}</span>
                <Mail size={12} className="text-blue-600 shrink-0" />
              </p>
            )}
            {settings.website && (
              <p className="text-[11px] font-bold text-slate-600 flex items-center justify-end gap-2">
                <span>{settings.website}</span>
                <Globe size={12} className="text-blue-600 shrink-0" />
              </p>
            )}
            {settings.fax && (
              <p className="text-[11px] font-bold text-slate-600 flex items-center justify-end gap-2">
                <span>{settings.fax}</span>
                <Printer size={12} className="text-blue-600 shrink-0" />
              </p>
            )}
          </div>
          <div className="pt-2">
            <p className="text-[10px] font-black text-slate-400">تاريخ الإصدار: {date}</p>
          </div>
        </div>
        
        {/* شعار المؤسسة المركزي */}
        <div className="flex flex-col items-center justify-center shrink-0 px-4">
          <div className="w-28 h-28 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center overflow-hidden mb-3 shadow-sm ring-4 ring-slate-50">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-full h-full object-contain p-3" />
            ) : (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl text-white shadow-lg">
                <Droplets size={44} />
              </div>
            )}
          </div>
          <span className="text-[10px] font-black tracking-[0.4em] text-blue-600 uppercase">OFFICIAL DOCUMENT</span>
        </div>

        {/* عنوان المستند والباركود الوهمي */}
        <div className="text-left flex-1 space-y-3">
          <div className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg">
             <h2 className="text-lg font-black uppercase whitespace-nowrap">{title}</h2>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400">رقم السند الموحد</p>
            <p className="text-sm font-black text-slate-800 font-mono tracking-tighter">
              #{Math.floor(Math.random() * 9000000 + 1000000)}
            </p>
          </div>
          <div className="w-24 h-10 border-2 border-slate-100 rounded-lg flex items-center justify-center bg-slate-50">
             <div className="flex gap-[2px]">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`h-6 w-[2px] bg-slate-300 ${i % 3 === 0 ? 'h-4' : ''}`} />
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrintFooter: React.FC = () => {
  const settings = dbEngine.getRaw().settings;
  return (
    <div className="mt-16">
      {settings.notes && (
        <div className="mb-12 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 text-[11px] font-bold text-slate-600 text-center leading-relaxed">
          <div className="flex items-center justify-center gap-2 mb-2 text-blue-600 opacity-60">
             <Droplets size={14} />
             <span className="font-black uppercase tracking-widest text-[9px]">ملاحظات هامة</span>
             <Droplets size={14} />
          </div>
          {settings.notes}
        </div>
      )}
      <div className="grid grid-cols-3 gap-10 pt-10 border-t-2 border-dashed border-slate-200">
        <div className="text-center space-y-8">
          <p className="font-black text-xs text-slate-700 uppercase tracking-widest">توقيع المحاسب المختص</p>
          <div className="border-b-2 border-slate-200 mx-auto w-3/4" />
        </div>
        <div className="text-center relative flex flex-col items-center">
          <p className="font-black text-xs text-slate-700 mb-4 uppercase tracking-widest">الختم الرسمي للمؤسسة</p>
          <div className="w-24 h-24 border-4 border-dashed border-blue-100 rounded-full flex items-center justify-center opacity-40">
             <div className="w-20 h-20 border-2 border-blue-50 rounded-full flex items-center justify-center">
                <Droplets size={24} className="text-blue-100" />
             </div>
          </div>
        </div>
        <div className="text-center space-y-8">
          <p className="font-black text-xs text-slate-700 uppercase tracking-widest">توقيع وإعتماد المدير</p>
          <div className="border-b-2 border-slate-200 mx-auto w-3/4" />
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em]">System Generated • Security Verified • Suqia v2.5</p>
      </div>
    </div>
  );
};
