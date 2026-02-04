
import React from 'react';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { Supplier, Branch } from '../types';
import { 
  Search, 
  Plus, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Building, 
  CheckSquare, 
  Square, 
  Edit3, 
  RotateCw, 
  Save,
  X,
  Filter,
  Trash2,
  Printer,
  TrendingUp
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const Suppliers = () => {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const db = dbEngine.getRaw();
  
  const initialForm = {
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    paymentTerms: 'كاش',
    branchId: db.settings.defaultBranchId
  };

  const [formData, setFormData] = React.useState(initialForm);

  // Fix: Convert fetchData to async to await ServerAPI results
  const fetchData = React.useCallback(async () => {
    // Fix: Await asynchronous getSuppliers and getBranches calls
    const sups = await ServerAPI.getSuppliers(selectedBranchId);
    const brs = await ServerAPI.getBranches();
    setSuppliers(sups);
    setBranches(brs);
  }, [selectedBranchId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      fetchData();
      setIsRefreshing(false);
    }, 500);
  };

  // Fix: Convert handleAddOrUpdate to async to await ServerAPI operations
  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Fix: Await updateEntity operation
      await ServerAPI.updateEntity('suppliers', editingId, formData, authUser);
    } else {
      // Fix: Await addSupplier operation
      await ServerAPI.addSupplier(formData);
    }
    fetchData();
    closeModal();
  };

  // Fix: Convert handleDelete to async to await ServerAPI deletion
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.')) {
      // Fix: Await deleteEntity operation
      await ServerAPI.deleteEntity('suppliers', id, authUser);
      fetchData();
      if (selectedIds.has(id)) {
        const next = new Set(selectedIds);
        next.delete(id);
        setSelectedIds(next);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingId(sup.id);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      email: sup.email,
      address: sup.address,
      paymentTerms: sup.paymentTerms,
      branchId: sup.branchId
    });
    setIsModalOpen(true);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)));
    }
  };

  const filtered = suppliers.filter(s => {
    return s.name.includes(searchTerm) || s.contactPerson.includes(searchTerm);
  });

  const totalBalance = filtered.reduce((acc, s) => acc + s.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-800">إدارة الموردين</h2>
          <p className="text-slate-500 font-bold text-sm">إدارة حسابات الشركات الموردة للمستلزمات</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="bg-white border border-slate-200 p-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            title="طباعة الجدول"
          >
            <Printer size={20} />
          </button>
          <button 
            onClick={handleRefresh}
            className={`bg-white border border-slate-200 p-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}
            title="تحديث البيانات"
          >
            <RotateCw size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 text-sm"
          >
            <Plus size={20} />
            إضافة مورد
          </button>
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">إجمالي المديونية</p>
            <p className="text-xl font-black text-rose-600">{totalBalance.toLocaleString()} ريال</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">عدد الموردين</p>
            <p className="text-xl font-black text-blue-600">{filtered.length} مورد</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="md:col-span-2 relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="ابحث عن مورد بالاسم أو اسم المسؤول..."
            className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none shadow-sm font-bold text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Building className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <select 
            className="w-full pr-12 pl-10 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none shadow-sm font-black text-slate-700 appearance-none text-sm transition-all cursor-pointer"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="all">كافة الفروع</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <PrintHeader title="كشف حسابات الموردين والشركات" />
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 print:bg-white">
                <th className="px-6 py-5 w-16 text-center no-print">
                  <button onClick={toggleSelectAll} className="text-slate-300 hover:text-blue-600 transition-colors">
                    {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={22} className="text-blue-600" /> : <Square size={22} />}
                  </button>
                </th>
                <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest">اسم الشركة / المورد الرسمي</th>
                <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest">المسؤول</th>
                <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest">التواصل</th>
                <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest">العنوان</th>
                <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest">الرصيد القائم</th>
                <th className="px-6 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-center no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? filtered.map((sup) => {
                const isSelected = selectedIds.has(sup.id);
                return (
                  <tr 
                    key={sup.id} 
                    onClick={() => openEditModal(sup)}
                    className={`group cursor-pointer transition-all ${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="px-6 py-5 text-center no-print" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => toggleSelect(sup.id, e)} className="text-slate-200 group-hover:text-blue-300 transition-colors">
                        {isSelected ? <CheckSquare size={22} className="text-blue-600" /> : <Square size={22} />}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Truck size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{sup.name}</p>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-black text-slate-400 uppercase mt-1 inline-block">
                            {sup.paymentTerms}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <User size={14} className="text-slate-400" />
                        {sup.contactPerson}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
                        <Phone size={14} className="text-emerald-500" />
                        {sup.phone}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs max-w-[150px] truncate">
                        <MapPin size={14} className="text-rose-400 shrink-0" />
                        {sup.address}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className={`font-black text-sm ${sup.balance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {sup.balance.toLocaleString()} <span className="text-[10px]">ريال</span>
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center no-print" onClick={(e) => e.stopPropagation()}>
                       <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(sup)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl transition-all">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={(e) => handleDelete(sup.id, e)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <Truck size={48} className="opacity-20" />
                      <p className="font-black text-slate-400">لم يتم العثور على موردين مطابقين للبحث</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PrintFooter />
      </div>

      {/* Registration/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 no-print">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black">{editingId ? 'تعديل بيانات المورد' : 'تسجيل مورد جديد'}</h3>
                <p className="text-blue-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">Supplier Registration Card</p>
              </div>
              <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddOrUpdate} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">اسم الشركة / المورد الرسمي</label>
                  <input 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none font-black transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">الشخص المسؤول</label>
                  <input 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">رقم الهاتف</label>
                  <input 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-right"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="sm:col-span-2">
                   <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">البريد الإلكتروني</label>
                   <input 
                    type="email"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">الفرع التابع له</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                    value={formData.branchId} 
                    onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                  >
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">طريقة التعامل</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                    value={formData.paymentTerms} 
                    onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                  >
                    <option value="كاش">دفع نقدي (كاش)</option>
                    <option value="آجل">حساب آجل</option>
                    <option value="شيكات">نظام شيكات</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                   <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">العنوان التفصيلي</label>
                   <textarea 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none h-24" 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                 <button type="button" onClick={closeModal} className="flex-1 px-6 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all">إلغاء</button>
                 <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                    <Save size={20} />
                    {editingId ? 'حفظ التغييرات' : 'اعتماد المورد'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
