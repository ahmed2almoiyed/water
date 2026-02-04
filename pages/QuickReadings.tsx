
import React from 'react';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { Subscriber, SubscriptionType } from '../types';
import { Zap, Save, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';

export const QuickReadings = () => {
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [branchId, setBranchId] = React.useState(db.settings.defaultBranchId);
  const [period, setPeriod] = React.useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [entries, setEntries] = React.useState<Record<string, number>>({});
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [subTypes, setSubTypes] = React.useState<SubscriptionType[]>([]);

  // Load subscribers and types asynchronously
  React.useEffect(() => {
    const load = async () => {
      const s = await ServerAPI.getSubscribers(branchId);
      const t = await ServerAPI.getSubscriptionTypes();
      setSubscribers(s);
      setSubTypes(t);
      setDb(dbEngine.getRaw());
    };
    load();
  }, [branchId]);

  const handleReadingChange = (subId: string, val: string) => {
    setEntries(prev => ({ ...prev, [subId]: Number(val) }));
  };

  const handleBulkSave = async () => {
    setSaving(true);
    try {
      for (const subId in entries) {
        const sub = subscribers.find(s => s.id === subId);
        if (!sub) continue;

        const lastReading = db.readings
          .filter(r => r.subscriberId === subId)
          .sort((a,b) => b.date.localeCompare(a.date))[0]?.currentReading || sub.initialReading;

        const currentReading = entries[subId];
        if (currentReading <= lastReading) continue;

        const units = currentReading - lastReading;
        const type = subTypes.find(t => t.id === sub.typeId)!;
        const totalAmount = ServerAPI.calculateTieredCost(units, type);

        await ServerAPI.addReading({
          subscriberId: subId,
          periodYear: period.year,
          periodMonth: period.month,
          previousReading: lastReading,
          currentReading,
          units,
          totalAmount,
          date: new Date().toISOString(),
          branchId: sub.branchId
        });
      }
      setSuccess(true);
      setEntries({});
      setDb(dbEngine.getRaw());
      setTimeout(() => setSuccess(false), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-right">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">الإدخال السريع للقراءات</h2>
          <p className="text-slate-500">تسجيل قراءات متعددة في شاشة واحدة وإصدار الفواتير فوراً</p>
        </div>
        <button 
          onClick={handleBulkSave}
          disabled={Object.keys(entries).length === 0 || saving}
          className="bg-indigo-600 disabled:bg-slate-300 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          {saving ? 'جاري الحفظ...' : success ? <><CheckCircle2 /> تم بنجاح</> : <><Save /> حفظ وإصدار الفواتير</>}
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase mr-1">الفرع</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            {db.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase mr-1">الشهر</label>
          <input 
            type="number" 
            min="1" max="12"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
            value={period.month}
            onChange={(e) => setPeriod({...period, month: Number(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase mr-1">السنة</label>
          <input 
            type="number"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
            value={period.year}
            onChange={(e) => setPeriod({...period, year: Number(e.target.value)})}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl text-right">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 font-black text-slate-600">المشترك / العداد</th>
              <th className="px-6 py-5 font-black text-slate-600">آخر قراءة</th>
              <th className="px-6 py-5 font-black text-blue-600">القراءة الحالية</th>
              <th className="px-6 py-5 font-black text-slate-600">الاستهلاك المتوقع</th>
              <th className="px-6 py-5 font-black text-emerald-600">القيمة التقديرية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscribers.map((sub) => {
              const lastReading = db.readings
                .filter(r => r.subscriberId === sub.id)
                .sort((a,b) => b.date.localeCompare(a.date))[0]?.currentReading || sub.initialReading;
              
              const currentVal = entries[sub.id] || 0;
              const diff = Math.max(0, currentVal - lastReading);
              const type = subTypes.find(t => t.id === sub.typeId);
              const estCost = (type && currentVal > lastReading) ? ServerAPI.calculateTieredCost(diff, type) : 0;

              return (
                <tr key={sub.id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-800">{sub.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">{sub.meterNumber} • {type?.name}</p>
                  </td>
                  <td className="px-6 py-5 font-mono text-slate-500 font-bold">{lastReading}</td>
                  <td className="px-6 py-5">
                    <input 
                      type="number"
                      placeholder="٠٠٠٠"
                      className="w-32 px-4 py-2 bg-white border-2 border-slate-100 rounded-xl font-black text-blue-600 focus:border-blue-500 outline-none transition-all shadow-sm"
                      value={entries[sub.id] || ''}
                      onChange={(e) => handleReadingChange(sub.id, e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-5">
                    {diff > 0 && <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-black text-sm">{diff} م³</span>}
                  </td>
                  <td className="px-6 py-5">
                    {estCost > 0 && <span className="font-black text-emerald-600">{estCost.toLocaleString()} ريال</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
