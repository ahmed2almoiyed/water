
import React from 'react';
import { ServerAPI } from '../services/server';
import { dbEngine } from '../services/database';
import { User, UserRole, Branch } from '../types';
import { 
  UserPlus, 
  Search, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  X, 
  Building, 
  User as UserIcon, 
  Lock,
  Save,
  Printer,
  Settings2,
  Eye,
  EyeOff,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../components/PrintHeader';

type SortField = 'name' | 'username' | 'role';
type SortOrder = 'asc' | 'desc';

export const Users = () => {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const [db, setDb] = React.useState(dbEngine.getRaw());
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Sorting & Columns
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const [showColumns, setShowColumns] = React.useState({
    name: true,
    username: true,
    role: true,
    branch: true,
    status: true,
    actions: true
  });
  const [isColumnPickerOpen, setIsColumnPickerOpen] = React.useState(false);

  const initialForm = {
    username: '',
    password: '',
    name: '',
    role: 'clerk' as UserRole,
    branchId: db.settings.defaultBranchId,
    active: true
  };

  const [formData, setFormData] = React.useState(initialForm);

  // Fix: handleAddOrUpdate is now async and properly awaits ServerAPI calls
  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete (updateData as any).password;
      }
      await ServerAPI.updateEntity('users', editingId, updateData, authUser);
    } else {
      await ServerAPI.addUser(formData);
    }
    // Fix: Force refresh database engine cache after modification
    await dbEngine.query('users');
    setDb(dbEngine.getRaw());
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const openEditModal = (user: User) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role,
      branchId: user.branchId,
      active: user.active
    });
    setIsModalOpen(true);
  };

  // Fix: toggleStatus is now async and ensures cache refresh
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await ServerAPI.updateEntity('users', id, { active: !currentStatus }, authUser);
    await dbEngine.query('users');
    setDb(dbEngine.getRaw());
  };

  // Fix: handleDelete is now async and ensures cache refresh
  const handleDelete = async (id: string) => {
    if (confirm('🚨 تحذير: هل أنت متأكد من حذف حساب هذا الموظف نهائياً؟')) {
      await ServerAPI.deleteEntity('users', id, authUser);
      await dbEngine.query('users');
      setDb(dbEngine.getRaw());
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const filteredAndSorted = React.useMemo(() => {
    let result = db.users.filter(u => u.name.includes(searchTerm) || u.username.includes(searchTerm));
    result.sort((a, b) => {
      const valA = a[sortField].toLowerCase();
      const valB = b[sortField].toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return result;
  }, [db.users, searchTerm, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortOrder === 'asc' ? <ChevronUp size={12} className="text-blue-600" /> : <ChevronDown size={12} className="text-blue-600" />;
  };

  const RoleBadge = ({ role }: { role: UserRole }) => {
    const config = {
      admin: { label: 'مدير نظام', color: 'bg-rose-100 text-rose-700', icon: ShieldCheck },
      accountant: { label: 'محاسب', color: 'bg-blue-100 text-blue-700', icon: Shield },
      clerk: { label: 'مدخل بيانات', color: 'bg-slate-100 text-slate-700', icon: ShieldAlert },
    };
    const { label, color, icon: Icon } = config[role];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${color}`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print text-right">
        <div>
          <h2 className="text-2xl font-black text-slate-800">إدارة حسابات الموظفين</h2>
          <p className="text-slate-500 font-bold text-sm">إدارة صلاحيات الوصول والأمان لمستخدمي النظام</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all"><Printer size={20} /></button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 text-sm"
          >
            <UserPlus size={18} />
            إضافة موظف
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print text-right">
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="ابحث بالاسم أو اليوزر..."
            className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none font-bold text-sm shadow-sm text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 hover:text-blue-600 flex items-center justify-between transition-all shadow-sm"
          >
            <div className="flex items-center gap-2"><Settings2 size={18} /> تخصيص عرض القائمة</div>
            {isColumnPickerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {isColumnPickerOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl p-4 z-50 space-y-2 animate-in fade-in slide-in-from-top-2">
              {Object.entries(showColumns).map(([key, val]) => (
                <button 
                  key={key} 
                  onClick={() => setShowColumns({...showColumns, [key]: !val})}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <span className="text-[11px] font-black text-slate-600">
                    {key === 'name' ? 'الموظف' : key === 'username' ? 'اليوزر' : key === 'role' ? 'الصلاحية' : key === 'branch' ? 'الفرع' : key === 'status' ? 'الحالة' : 'الإجراءات'}
                  </span>
                  {val ? <Eye size={14} className="text-blue-600" /> : <EyeOff size={14} className="text-slate-300" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <PrintHeader title="سجل مستخدمي وصلاحيات النظام" />
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-right">
                {showColumns.name && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('name')}>الموظف <SortIcon field="name" /></th>}
                {showColumns.username && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest cursor-pointer" onClick={() => handleSort('username')}>اسم المستخدم <SortIcon field="username" /></th>}
                {showColumns.role && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest cursor-pointer" onClick={() => handleSort('role')}>الدور <SortIcon field="role" /></th>}
                {showColumns.branch && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest">الفرع</th>}
                {showColumns.status && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-center">الحالة</th>}
                {showColumns.actions && <th className="px-8 py-5 font-black text-slate-500 text-xs uppercase tracking-widest text-center no-print">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAndSorted.map((u) => (
                <tr key={u.id} className="group hover:bg-slate-50/50 transition-all">
                  {showColumns.name && (
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {u.name[0]}
                        </div>
                        <p className="font-black text-slate-800 text-sm">{u.name}</p>
                      </div>
                    </td>
                  )}
                  {showColumns.username && <td className="px-8 py-5 font-mono text-xs text-slate-500">{u.username}</td>}
                  {showColumns.role && <td className="px-8 py-5"><RoleBadge role={u.role} /></td>}
                  {showColumns.branch && <td className="px-8 py-5 font-bold text-xs text-slate-600">{db.branches.find(b => b.id === u.branchId)?.name}</td>}
                  {showColumns.status && (
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => toggleStatus(u.id, u.active)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition-all ${u.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                      >
                        {u.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {u.active ? 'حساب نشط' : 'محظور'}
                      </button>
                    </td>
                  )}
                  {showColumns.actions && (
                    <td className="px-8 py-5 text-center no-print">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PrintFooter />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print text-right" dir="rtl">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
              <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-2xl transition-all"><X size={24} /></button>
              <div className="text-right">
                <h3 className="text-2xl font-black">{editingId ? 'تعديل موظف' : 'تسجيل موظف جديد'}</h3>
                <p className="text-blue-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">Access Control Profile</p>
              </div>
            </div>
            <form onSubmit={handleAddOrUpdate} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">اسم الموظف الثلاثي</label>
                <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-50" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">اسم المستخدم (اليوزر)</label>
                  <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-center text-sm" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">كلمة المرور</label>
                  <input type="password" required={!editingId} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-center text-sm" placeholder={editingId ? 'أدخل جديداً أو اتركه' : '••••••••'} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الدور الوظيفي</label>
                  <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value="admin">مدير نظام</option>
                    <option value="accountant">محاسب</option>
                    <option value="clerk">مدخل بيانات</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الفرع</label>
                  <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" value={formData.branchId} onChange={(e) => setFormData({...formData, branchId: e.target.value})}>
                    {db.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                <Save size={24} /> {editingId ? 'حفظ كافة البيانات' : 'اعتماد حساب الموظف'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
