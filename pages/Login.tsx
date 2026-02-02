
import React from 'react';
import { ServerAPI } from '../services/server';
import { User } from '../types';
import { Droplets, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';

export const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('admin');
  const [error, setError] = React.useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = ServerAPI.login(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20 mb-6">
            <Droplets size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">مؤسسة المياه</h1>
          <p className="text-slate-400 font-bold">النظام المحاسبي المتكامل - سُقيا</p>
        </div>

        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 block mr-1">اسم المستخدم</label>
              <div className="relative">
                <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  required
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-bold"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 block mr-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password"
                  required
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-bold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                <ShieldCheck size={20} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              دخول للنظام
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">جميع الحقوق محفوظة © ٢٠٢٥</p>
          </div>
        </div>
      </div>
    </div>
  );
};
