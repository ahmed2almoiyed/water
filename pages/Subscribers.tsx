
import React from 'react';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { Subscriber, SubscriberAttachment } from '../types';
import { ExcelUtils } from '../services/excelUtils';
import { 
  Search, 
  Plus, 
  UserPlus, 
  ExternalLink, 
  MapPin, 
  Phone, 
  CheckSquare, 
  Square, 
  Edit3, 
  X, 
  Trash2, 
  Printer, 
  RotateCw,
  Settings2,
  Eye,
  EyeOff,
  Filter,
  FileDown,
  FileUp,
  Layers,
  FileSignature,
  LayoutList,
  FileText,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

export const Subscribers = () => {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTypeId, setSelectedTypeId] = React.useState<string>('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'list' | 'report'>('list');
  
  const [showColumns, setShowColumns] = React.useState({
    location: true,
    contact: true,
    balance: true,
    actions: true
  });
  const [isColumnPickerOpen, setIsColumnPickerOpen] = React.useState(false);

  const db = dbEngine.getRaw();
  
  const initialFormState = {
    name: '',
    meterNumber: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    country: 'اليمن',
    governorate: '',
    region: '',
    docNumber: '',
    docType: 'بطاقة شخصية',
    docIssueDate: '',
    docIssuePlace: '',
    notes: '',
    initialReading: 0,
    branchId: db.settings.defaultBranchId,
    typeId: db.subscriptionTypes[0]?.id || ''
  };

  const [formData, setFormData] = React.useState(initialFormState);

  // Await async fetch
  const fetchData = React.useCallback(async () => {
    const data = await ServerAPI.getSubscribers();
    setSubscribers(data);
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      fetchData();
      setIsRefreshing(false);
    }, 600);
  };

  const handleExport = () => {
    ExcelUtils.exportToCSV('Subscribers_List', subscribers);
  };

  // Fix: handleImport now properly awaits the async mergeSubscribers method
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      ExcelUtils.importFromCSV(file, async (data) => {
        const stats = await ServerAPI.mergeSubscribers(data);
        alert(`تم استيراد ${stats.added} مشترك جديد بنجاح.`);
        fetchData();
      });
    }
  };

  // Await async updates
  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await ServerAPI.updateEntity('subscribers', editingId, formData, authUser);
    } else {
      await ServerAPI.addSubscriber(formData);
    }
    fetchData();
    closeModal();
  };

  // Await async delete
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا المشترك نهائياً؟ سيتم حذف كافة السجلات المرتبطة به من قاعدة البيانات.')) {
      await ServerAPI.deleteEntity('subscribers', id, authUser);
      fetchData();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const openEditModal = (sub: Subscriber) => {
    setEditingId(sub.id);
    setFormData({
      name: sub.name,
      meterNumber: sub.meterNumber,
      phone: sub.phone,
      email: sub.email || '',
      website: sub.website || '',
      address: sub.address,
      country: sub.country,
      governorate: sub.governorate,
      region: sub.region,
      docNumber: sub.docNumber,
      docType: sub.docType,
      docIssueDate: sub.docIssueDate,
      docIssuePlace: sub.docIssuePlace,
      notes: sub.notes || '',
      initialReading: sub.initialReading,
      branchId: sub.branchId,
      typeId: sub.typeId
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

  const filtered = React.useMemo(() => {
    return subscribers.filter(s => {
      const nameStr = s.name || '';
      const meterStr = s.meterNumber || '';
      const phoneStr = s.phone || '';
      const matchesSearch = nameStr.includes(searchTerm) || meterStr.includes(searchTerm) || phoneStr.includes(searchTerm);
      const matchesType = selectedTypeId === 'all' || s.typeId === selectedTypeId;
      return matchesSearch && matchesType;
    });
  }, [subscribers, searchTerm, selectedTypeId]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print text-right">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">قاعدة بيانات المشتركين</h2>
          <p className="text-slate-500 font-bold text-xs sm:text-sm">إدارة كافة البيانات، الوثائق، وتصدير السجلات</p>
        </div>
        <div className="flex items-center gap-2">
          {/* محول وضع العرض */}
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm ml-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutList size={14} />
              قائمة
            </button>
            <button 
              onClick={() => setViewMode('report')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'report' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <FileText size={14} />
              تقرير
            </button>
          </div>

          <button onClick={handleExport} className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:text-emerald-600 transition-all shadow-sm flex items-center gap-2 font-bold text-xs">
            <FileDown size={18} /> <span className="hidden sm:inline">Excel</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={18} />
          </button>
          <button 
            onClick={handleRefresh}
            className={`bg-white border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RotateCw size={18} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 text-xs sm:text-sm"
          >
            <UserPlus size={18} />
            تسجيل مشترك
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 no-print text-right">
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="ابحث بالاسم، رقم العداد، الهاتف..."
            className="w-full pr-12 pl-4 py-3 sm:py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold shadow-sm text-sm text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
             <select 
              className="h-full pr-12 pl-10 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none shadow-sm font-black text-slate-700 appearance-none text-sm transition-all cursor-pointer text-right"
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
             >
                <option value="all">كافة فئات الاشتراك</option>
                {db.subscriptionTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
             </select>
             <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
        </div>
        
        {viewMode === 'list' && (
          <div className="relative">
               <button 
                onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
                className="h-full px-5 py-3 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-all shadow-sm"
               >
                  <Settings2 size={18} /> تخصيص الأعمدة
               </button>
               {isColumnPickerOpen && (
                 <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl p-4 z-50 space-y-2 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest px-2 text-right">الأعمدة المعروضة</p>
                    {Object.entries(showColumns).map(([key, val]) => (
                      <button 
                        key={key} 
                        onClick={() => setShowColumns({...showColumns, [key]: !val})}
                        className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <span className="text-[11px] font-black text-slate-600">
                          {key === 'location' ? 'الموقع الجغرافي' : key === 'contact' ? 'بيانات التواصل' : key === 'balance' ? 'الرصيد' : 'الإجراءات'}
                        </span>
                        {val ? <Eye size={14} className="text-blue-600" /> : <EyeOff size={14} className="text-slate-300" />}
                      </button>
                    ))}
                 </div>
               )}
          </div>
        )}
      </div>

      <div className={`bg-white rounded-2xl sm:rounded-[32px] border border-slate-200 overflow-hidden shadow-sm transition-all ${viewMode === 'report' ? 'border-slate-300 shadow-xl' : ''}`}>
        <PrintHeader title={viewMode === 'report' ? "تقرير مفصل ببيانات المشتركين" : "سجل قاعدة بيانات المشتركين"} />
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse min-w-[700px] lg:min-w-full">
            <thead>
              <tr className={`${viewMode === 'report' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'} border-b border-slate-200 print:bg-white print:text-slate-900 text-right`}>
                {viewMode === 'list' && (
                  <th className="px-4 py-5 w-12 text-center no-print">
                    <button onClick={toggleSelectAll}>
                      {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                    </button>
                  </th>
                )}
                <th className="px-6 py-5 font-black text-xs sm:text-sm">المشترك / العداد</th>
                {(showColumns.location || viewMode === 'report') && <th className="px-6 py-5 font-black text-xs sm:text-sm">الموقع</th>}
                {(showColumns.contact || viewMode === 'report') && <th className="px-6 py-5 font-black text-xs sm:text-sm">التواصل</th>}
                {(showColumns.balance || viewMode === 'report') && <th className="px-6 py-5 font-black text-center text-xs sm:text-sm">الرصيد</th>}
                {viewMode === 'list' && showColumns.actions && <th className="px-6 py-5 font-black text-center text-xs sm:text-sm no-print">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sub) => {
                const isSelected = selectedIds.has(sub.id);
                const isPrintHidden = selectedIds.size > 0 && !isSelected;
                return (
                  <tr 
                    key={sub.id} 
                    onClick={() => viewMode === 'list' && openEditModal(sub)}
                    className={`transition-all ${viewMode === 'list' ? 'cursor-pointer hover:bg-blue-50/30' : ''} ${isSelected ? 'bg-blue-50/50' : ''} ${isPrintHidden ? 'print:hidden' : ''}`}
                  >
                    {viewMode === 'list' && (
                      <td className="px-4 py-5 text-center no-print" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => toggleSelect(sub.id, e)} className="text-slate-300">
                          {isSelected ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${viewMode === 'report' ? 'bg-slate-100 text-slate-800' : 'bg-blue-600 text-white'} flex items-center justify-center font-black text-sm sm:text-base shadow-sm shrink-0`}>
                          {sub.name ? sub.name[0] : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 text-xs sm:text-sm truncate">{sub.name}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400 font-black mt-0.5 tracking-wider font-mono">{sub.meterNumber}</p>
                        </div>
                      </div>
                    </td>
                    {(showColumns.location || viewMode === 'report') && (
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-col gap-1 text-xs font-bold text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-blue-500" />
                            {sub.governorate}
                          </div>
                          <span className="text-slate-400 text-[10px] pr-4.5">{sub.region}</span>
                        </div>
                      </td>
                    )}
                    {(showColumns.contact || viewMode === 'report') && (
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1 text-xs font-bold text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-emerald-500" />
                            <span className="font-mono">{sub.phone}</span>
                          </div>
                          {sub.email && <span className="text-slate-400 text-[10px] pr-4.5">{sub.email}</span>}
                        </div>
                      </td>
                    )}
                    {(showColumns.balance || viewMode === 'report') && (
                      <td className="px-6 py-5 text-center">
                        <div className={`${viewMode === 'report' ? '' : 'bg-slate-50 border border-slate-100'} inline-flex flex-col px-3 py-1.5 rounded-2xl min-w-[90px]`}>
                          <span className={`font-black text-xs sm:text-sm ${sub.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {sub.balance.toLocaleString()}
                          </span>
                          <span className="text-[8px] font-black text-slate-400 leading-none">ريال</span>
                        </div>
                      </td>
                    )}
                    {viewMode === 'list' && showColumns.actions && (
                      <td className="px-6 py-5 text-center no-print" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                           <Link 
                            to={`/statement/${sub.id}`} 
                            title="كشف حساب"
                            className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl transition-all"
                          >
                            <ExternalLink size={16} />
                          </Link>
                          <button 
                            onClick={() => openEditModal(sub)}
                            className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all"
                            title="تعديل"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(sub.id, e)}
                            className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-xl transition-all"
                            title="حذف المشترك"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <PrintFooter />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 no-print text-right" dir="rtl">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-5xl rounded-3xl sm:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[95vh]">
            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
              <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                <X size={24} />
              </button>
              <div>
                <h3 className="text-lg sm:text-xl font-black">{editingId ? 'بيانات المشترك والمرفقات' : 'تسجيل مشترك جديد'}</h3>
                <p className="text-blue-100 font-medium opacity-80 text-[10px] sm:text-xs uppercase tracking-widest">Subscriber Identity Portal</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-8 space-y-10">
              <form onSubmit={handleAddOrUpdate} className="space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 pb-2 border-b border-slate-100 justify-end">
                    <h4 className="font-black text-sm uppercase tracking-wider">البيانات الأساسية والتواصل</h4>
                    <h4 className="font-black text-sm uppercase tracking-wider">البيانات الأساسية والتواصل</h4>
                    <Info size={16} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">اسم المشترك الثلاثي</label>
                      <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">رقم العداد</label>
                      <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm" value={formData.meterNumber} onChange={(e) => setFormData({...formData, meterNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">رقم الهاتف</label>
                      <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-center" dir="ltr" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                   <div className="flex items-center gap-2 text-blue-600 pb-2 border-b border-slate-100 justify-end">
                    <h4 className="font-black text-sm uppercase tracking-wider">الموقع الجغرافي والعنوان</h4>
                    <MapPin size={16} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">المحافظة</label>
                        <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={formData.governorate} onChange={(e) => setFormData({...formData, governorate: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">المنطقة / المديرية</label>
                        <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} />
                     </div>
                     <div className="lg:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">العنوان التفصيلي</label>
                        <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                     </div>
                  </div>
                </section>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={closeModal} className="px-8 py-3 rounded-xl font-black text-slate-400 hover:bg-slate-50 transition-all text-sm">إلغاء</button>
                  <button type="submit" className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 text-sm flex items-center gap-2">
                    {editingId ? <><Edit3 size={18} /> حفظ التغييرات</> : <><UserPlus size={18} /> تسجيل المشترك</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
