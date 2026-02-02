
import React from 'react';
import { dbEngine } from '../services/database';
import { ServerAPI } from '../services/server';
import { SubscriptionType, PriceTier } from '../types';
import { 
  Plus, 
  Layers, 
  Trash2, 
  Save, 
  X, 
  Edit3, 
  Coins, 
  Info, 
  CheckCircle2,
  ArrowRightLeft,
  ChevronLeft
} from 'lucide-react';

export const SubscriptionTypes = () => {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const initialForm: Omit<SubscriptionType, 'id'> = {
    name: '',
    fixedFee: 0,
    tiers: [{ from: 0, to: null, price: 0 }]
  };

  const [formData, setFormData] = React.useState(initialForm);

  const handleSaveOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      // Fix: Passed authUser as the 4th argument
      ServerAPI.updateEntity('subscriptionTypes', editingId, formData, authUser);
    } else {
      const dbRaw = dbEngine.getRaw();
      const newType: SubscriptionType = { 
        ...formData, 
        id: crypto.randomUUID() 
      };
      dbEngine.commit('subscriptionTypes', [...dbRaw.subscriptionTypes, newType]);
    }
    
    setDb(dbEngine.getRaw());
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const openEditModal = (type: SubscriptionType) => {
    setEditingId(type.id);
    setFormData({ ...type });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('تنبيه: حذف نوع الاشتراك قد يؤثر على فواتير المشتركين الحاليين المرتبطين به. هل أنت متأكد؟')) {
      // Fix: Passed authUser as the 3rd argument
      ServerAPI.deleteEntity('subscriptionTypes', id, authUser);
      setDb(dbEngine.getRaw());
    }
  };

  const addTier = () => {
    const lastTier = formData.tiers[formData.tiers.length - 1];
    const newFrom = lastTier.to !== null ? lastTier.to + 1 : lastTier.from + 10;
    setFormData({
      ...formData,
      tiers: [...formData.tiers, { from: newFrom, to: null, price: 0 }]
    });
  };

  const removeTier = (index: number) => {
    if (formData.tiers.length <= 1) return;
    const newTiers = formData.tiers.filter((_, i) => i !== index);
    setFormData({ ...formData, tiers: newTiers });
  };

  const updateTier = (index: number, field: keyof PriceTier, value: any) => {
    const newTiers = [...formData.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setFormData({ ...formData, tiers: newTiers });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة أسعار الوحدات والشرائح</h2>
          <p className="text-slate-500 font-bold text-sm">تحديد فئات الاشتراك وأسعار المتر المكعب</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={20} />
          إضافة فئة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {db.subscriptionTypes.map((type) => (
          <div key={type.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
               <div>
                  <h3 className="text-xl font-black text-slate-800">{type.name}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Subscription Category</p>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => openEditModal(type)} className="p-2 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-sm border border-slate-100 transition-all"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(type.id)} className="p-2 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-sm border border-slate-100 transition-all"><Trash2 size={16} /></button>
               </div>
            </div>
            <div className="p-8 space-y-6">
               <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <span className="text-xs font-black text-blue-600">الرسوم الثابتة:</span>
                  <span className="text-lg font-black text-slate-800">{type.fixedFee.toLocaleString()} {db.settings.currency}</span>
               </div>
               
               <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">شرائح الاستهلاك والأسعار</p>
                  {type.tiers.map((tier, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm group/tier">
                       <div className="flex items-center gap-2 font-bold text-slate-600">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px]">{idx + 1}</span>
                          <span>من {tier.from} إلى {tier.to === null ? '∞' : tier.to}</span>
                       </div>
                       <div className="font-black text-blue-600">
                          {tier.price.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">للوحدة</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="px-8 py-4 bg-slate-50/50 text-center">
               <p className="text-[10px] font-bold text-slate-400 italic">سيتم احتساب الاستهلاك آلياً بناءً على هذه الشرائح</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 no-print">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black">{editingId ? 'تعديل فئة الاشتراك' : 'تعريف فئة اشتراك جديدة'}</h3>
                <p className="text-blue-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">Price Tier Management Lab</p>
              </div>
              <button onClick={closeModal} className="hover:bg-white/20 p-2.5 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveOrUpdate} className="p-8 space-y-8 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">اسم الفئة (مثلاً: سكني تجاري)</label>
                  <input 
                    required 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الرسوم الثابتة للدورة</label>
                  <input 
                    type="number"
                    required 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none"
                    value={formData.fixedFee}
                    onChange={(e) => setFormData({...formData, fixedFee: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-800 flex items-center gap-2">
                       <Layers size={18} className="text-blue-600" />
                       شرائح أسعار الاستهلاك (للمتر المكعب)
                    </h4>
                    <button 
                      type="button" 
                      onClick={addTier}
                      className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all"
                    >
                       <Plus size={14} /> إضافة شريحة
                    </button>
                 </div>

                 <div className="space-y-3">
                    {formData.tiers.map((tier, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-end animate-in fade-in slide-in-from-right-2">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">من وحدة</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-center" 
                            value={tier.from} 
                            onChange={(e) => updateTier(index, 'from', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">إلى وحدة (فارغ = ∞)</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-center" 
                            placeholder="بدون حد"
                            value={tier.to === null ? '' : tier.to} 
                            onChange={(e) => updateTier(index, 'to', e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-blue-600 uppercase block mb-1">السعر (ريال/م³)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-4 py-2 bg-white border-2 border-blue-100 rounded-xl font-mono font-black text-center text-blue-600" 
                            value={tier.price} 
                            onChange={(e) => updateTier(index, 'price', Number(e.target.value))}
                          />
                        </div>
                        <div className="flex justify-center">
                           <button 
                            type="button" 
                            onClick={() => removeTier(index)}
                            disabled={formData.tiers.length <= 1}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl disabled:opacity-20 transition-all"
                           >
                             <Trash2 size={20} />
                           </button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4 items-start">
                 <Info className="text-amber-600 shrink-0 mt-1" />
                 <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                   تأكد من تسلسل الشرائح بشكل صحيح (مثلاً من 0 إلى 10، ثم من 11 إلى 30). الشريحة الأخيرة يجب أن تكون بدون حد أقصى (فارغة) لتغطية أي استهلاك زائد.
                 </p>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                <Save size={24} />
                حفظ كافة إعدادات الأسعار
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
