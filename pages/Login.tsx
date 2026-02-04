
import React from 'react';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { User } from '../types';
import { 
  Droplets, Lock, User as UserIcon, ShieldCheck, 
  Wifi, WifiOff, ArrowLeft, Power, RefreshCw, Terminal, 
  AlertCircle, ChevronDown, CheckCircle2, Cpu, Activity, Copy, Check
} from 'lucide-react';

export const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('admin');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [checkingServer, setCheckingServer] = React.useState(false);
  const [serverOnline, setServerOnline] = React.useState<boolean | null>(null);
  const [showGuide, setShowGuide] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const checkStatus = React.useCallback(async () => {
    setCheckingServer(true);
    // محاكاة وقت معالجة لإظهار تفاعل النظام
    await new Promise(r => setTimeout(r, 600));
    const status = await dbEngine.pingServer();
    setServerOnline(status);
    setCheckingServer(false);
    if (status) {
      setShowGuide(false);
      setError('');
    } else {
      setShowGuide(true);
    }
  }, []);

  React.useEffect(() => {
    checkStatus();
    const interval = setInterval(async () => {
      const status = await dbEngine.checkServerStatus();
      setServerOnline(status);
    }, 10000); // فحص تلقائي كل 10 ثواني
    return () => clearInterval(interval);
  }, [checkStatus]);

  const copyCommand = () => {
    navigator.clipboard.writeText('node server.js');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (serverOnline === false) {
      setError('يرجى تشغيل السيرفر أولاً لتتمكن من الدخول.');
      setShowGuide(true);
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const user = await ServerAPI.login(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
      }
    } catch (err) {
      setError('فشل الاتصال بقاعدة البيانات المحلية. تأكد من تشغيل Node.js');
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-cairo overflow-hidden relative" dir="rtl">
      {/* تأثيرات الخلفية الديناميكية */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 right-0 w-full h-full opacity-20 transition-all duration-1000 ${serverOnline === false ? 'bg-rose-900/40' : 'bg-blue-900/40'}`} />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <div className={`inline-flex p-6 rounded-[3rem] shadow-2xl transition-all duration-700 ${serverOnline === false ? 'bg-rose-600 shadow-rose-500/20' : 'bg-blue-600 shadow-blue-500/40'}`}>
            <Droplets size={54} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mt-6 mb-1 tracking-tight">سُـقـيـا</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] opacity-60">Enterprise SQLite Hub</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/10">
          <div className={`h-2 w-full transition-all duration-1000 ${serverOnline === true ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_20px_#f43f5e]'}`} />
          
          <div className="p-8 md:p-10">
            {/* بطاقة السيرفر التفاعلية */}
            <div className={`mb-8 p-5 rounded-[2rem] border transition-all duration-500 ${serverOnline === true ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-right">
                  <div className={`w-4 h-4 rounded-full transition-all duration-500 ${serverOnline === true ? 'bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse' : 'bg-rose-500 shadow-[0_0_15px_#f43f5e]'}`} />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Local Database</p>
                    <p className={`text-sm font-black ${serverOnline === true ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {serverOnline === true ? 'السيرفر متصل ونشط' : 'السيرفر متوقف حالياً'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={checkStatus}
                  disabled={checkingServer}
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all active:scale-90 ${
                    serverOnline === true 
                      ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' 
                      : 'bg-rose-600 text-white shadow-xl shadow-rose-200 animate-bounce'
                  }`}
                  title="تحقق من حالة السيرفر"
                >
                  {checkingServer ? <RefreshCw size={24} className="animate-spin" /> : <Power size={24} />}
                </button>
              </div>

              {serverOnline === false && showGuide && (
                <div className="mt-5 pt-5 border-t border-rose-100 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                      <Terminal size={18} />
                    </div>
                    <div className="space-y-3 flex-1">
                      <p className="text-[11px] text-rose-800 font-black leading-relaxed">
                        يرجى فتح شاشة الأوامر (Terminal) في مجلد المشروع وتشغيل السيرفر بالأمر التالي:
                      </p>
                      <button 
                        onClick={copyCommand}
                        className="w-full bg-slate-900 p-3 rounded-2xl flex items-center justify-between border border-white/10 group active:scale-95 transition-all"
                      >
                        <code className="text-blue-400 text-xs font-mono">node server.js</code>
                        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-500 group-hover:text-white transition-colors" />}
                      </button>
                      <p className="text-[10px] text-slate-400 italic font-bold">بمجرد التشغيل، سيتحول المؤشر للأخضر تلقائياً.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-widest">اسم المستخدم</label>
                <div className="relative">
                  <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text"
                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-widest">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password"
                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 text-[11px] font-black rounded-2xl flex items-center gap-3 border border-rose-100">
                  <AlertCircle size={20} className="shrink-0" />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || serverOnline === false}
                className="w-full bg-[#020617] hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl hover:shadow-blue-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <Activity size={24} className="animate-pulse" />
                ) : (
                  <>
                    <span>دخول النظام</span>
                    <ArrowLeft size={22} className="group-hover:-translate-x-2 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
               <button 
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto"
               >
                  دليل الدخول الافتراضي <ChevronDown size={14} className={`transition-transform ${showGuide ? 'rotate-180' : ''}`} />
               </button>
               
               {showGuide && (
                 <div className="mt-4 flex justify-center gap-10 animate-in fade-in slide-in-from-top-2">
                    <div className="text-right">
                      <p className="text-[11px] font-black text-slate-800">المدير</p>
                      <p className="text-[10px] text-blue-600 font-bold font-mono">admin / admin</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-right">
                      <p className="text-[11px] font-black text-slate-800">محاسب</p>
                      <p className="text-[10px] text-blue-600 font-bold font-mono">acc / 123</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-600 font-black text-[10px] uppercase tracking-[0.5em] opacity-40">
          Water Management System • Local Engine • v2.6.2
        </p>
      </div>
    </div>
  );
};
