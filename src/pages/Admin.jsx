import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, formatDate } from '../utils/format';
import Pagination from '../components/Pagination';
import Swal from 'sweetalert2';

// ─── Helpers ────────────────────────────────────────────────────────────────
const ORDER_STATUS = {
  pending: { label: 'Chờ xử lý', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  processing: { label: 'Đang xử lý', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  shipped: { label: 'Đang giao', cls: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
  delivered: { label: 'Đã giao', cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  refunded: { label: 'Hoàn trả', cls: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <i className="bx bx-loader-alt bx-spin text-4xl text-beige-primary"></i>
  </div>
);

const StatusBadge = ({ status, map }) => {
  const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>;
};

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>
        <i className={`bx ${icon}`}></i>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100">{value}</h3>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  </div>
);

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <i className="bx bx-x text-xl text-gray-500"></i>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <i className="bx bx-error-circle text-5xl text-red-500 mb-3"></i>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Xác nhận</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 transition-colors">Hủy</button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">Xóa</button>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-beige-primary outline-none dark:text-white text-sm";

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardTab({ stats, loading }) {
  if (loading) return <LoadingSpinner />;
  if (!stats) return <p className="text-center text-gray-500 py-10">Không thể tải dữ liệu dashboard.</p>;

  const chartData = Object.entries(stats.ordersByStatus || {}).map(([st, count]) => ({
    name: ORDER_STATUS[st]?.label || st,
    value: count,
    color: st === 'pending' ? '#eab308' : st === 'processing' ? '#3b82f6' : st === 'shipped' ? '#6366f1' : st === 'delivered' ? '#22c55e' : st === 'refunded' ? '#a855f7' : '#ef4444'
  })).filter(item => item.value > 0);

  const dailyRevenueData = Object.entries(stats.dailyRevenue || {}).map(([date, total]) => ({
    name: date.split('-').slice(2, 3) + '/' + date.split('-').slice(1, 2),
    revenue: total
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="bx-dollar-circle" label="Doanh thu tháng" value={formatPrice(stats.monthlyRevenue)} color="bg-green-100 text-green-600" sub={`Tổng: ${formatPrice(stats.totalRevenue)}`} />
        <StatCard icon="bx-group" label="Khách hàng" value={stats.totalUsers} color="bg-purple-100 text-purple-600" />
        <StatCard icon="bx-package" label="Kho hàng (Sắp hết)" value={stats.lowStockProducts || 0} color={stats.lowStockProducts > 0 ? "bg-red-100 text-red-600 animate-pulse" : "bg-orange-100 text-orange-600"} sub={stats.lowStockProducts > 0 ? "Cần nhập thêm hàng" : "Số lượng ổn định"} />
        <StatCard icon="bx-message-dots" label="Yêu cầu mới" value={stats.newContacts || 0} color="bg-blue-100 text-blue-600" sub="Liên hệ khách hàng" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2"><i className='bx bx-trending-up text-beige-primary'></i> Doanh thu 7 ngày gần nhất</h3>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyRevenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8A97E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C8A97E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}k`} />
              <RechartsTooltip formatter={(v) => [formatPrice(v), 'Doanh thu']} contentStyle={{ borderRadius: '16px', border: 'none' }} />
              <Area type="monotone" dataKey="revenue" stroke="#C8A97E" strokeWidth={4} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold mb-6 text-lg"><i className='bx bx-bar-chart-alt-2 text-beige-primary'></i> Đơn theo trạng thái</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold mb-6 text-lg"><i className='bx bx-time-five text-beige-primary'></i> Đơn hàng vừa đặt</h3>
          <div className="space-y-4">
            {(stats.recentOrders || []).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-beige-light flex items-center justify-center text-beige-primary font-bold">#{order.id.toString().slice(-2)}</div>
                  <div>
                    <p className="font-bold text-sm">{order.fullname}</p>
                    <p className="text-[10px] text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-beige-primary text-sm">{formatPrice(order.totalAmount)}</p>
                  <StatusBadge status={order.status} map={ORDER_STATUS} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════   
// ORDERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { currentUser } = useAuth();
  const role = currentUser?.user?.role?.toLowerCase();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/orders');
      setOrders(Array.isArray(r.data) ? r.data : []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put('/orders', { id, status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (editOrder?.id === id) setEditOrder(prev => ({ ...prev, status }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cập nhật thành công', showConfirmButton: false, timer: 1500 });
    } catch { Swal.fire('Lỗi', 'Cập nhật thất bại', 'error'); }
    finally { setUpdating(null); }
  };

  const deleteOrder = async () => {
    try {
      await api.delete('/orders', { data: { id: deleteTarget } });
      setOrders(prev => prev.filter(o => o.id !== deleteTarget));
      setDeleteTarget(null);
    } catch { setDeleteTarget(null); }
  };

  const NEXT = { pending: 'processing', processing: 'shipped', shipped: 'delivered' };
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      {deleteTarget && <ConfirmDialog message="Xóa đơn hàng này?" onConfirm={deleteOrder} onCancel={() => setDeleteTarget(null)} />}
      
      {editOrder && (
        <Modal title={`Chi tiết đơn hàng #${editOrder.id}`} onClose={() => setEditOrder(null)}>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl grid grid-cols-2 gap-4">
              <div><p className="text-gray-500">Khách hàng</p><p className="font-bold">{editOrder.fullname}</p></div>
              <div><p className="text-gray-500">Trạng thái</p><StatusBadge status={editOrder.status} map={ORDER_STATUS} /></div>
            </div>
            {NEXT[editOrder.status] && (
              <button onClick={() => updateStatus(editOrder.id, NEXT[editOrder.status])} disabled={updating === editOrder.id} className="w-full bg-beige-primary text-white py-3 rounded-xl font-bold">
                Chuyển sang {ORDER_STATUS[NEXT[editOrder.status]]?.label}
              </button>
            )}
          </div>
        </Modal>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === s ? 'bg-beige-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {s === 'all' ? 'Tất cả' : ORDER_STATUS[s]?.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500">
                <tr>{['#', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Ngày', 'Hành động'].map(h => <th key={h} className="px-4 py-3 text-left font-bold uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginated.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-bold text-beige-primary">#{order.id}</td>
                    <td className="px-4 py-3">{order.fullname}</td>
                    <td className="px-4 py-3 font-bold">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} map={ORDER_STATUS} /></td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                        <button onClick={() => setEditOrder(order)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><i className="bx bx-show"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination totalItems={filtered.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', categoryId: '', price: '', stock: '', image: '', isActive: true });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([api.get('/products?limit=200&includeInactive=true'), api.get('/categories')]);
      setProducts(pRes.data?.items || []);
      setCategories(Array.isArray(cRes.data) ? cRes.data : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="flex gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sản phẩm..." className={`${inputCls} flex-1`} />
        <button className="bg-beige-primary text-white px-5 py-2 rounded-xl font-bold">+ Thêm sản phẩm</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500">
              <tr>{['#', 'Hình', 'Tên sản phẩm', 'Giá', 'Tồn', 'Hành động'].map(h => <th key={h} className="px-4 py-3 text-left uppercase font-bold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">#{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={p.image ? `${window.location.origin}${p.image.replace('/images/', '/img/')}` : 'https://placehold.co/100x100'} 
                        className="w-full h-full object-contain" 
                        alt={p.name} 
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3 text-beige-primary font-bold">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-2"><i className="bx bx-pencil"></i></button>
                    <button className="p-2 bg-red-50 text-red-500 rounded-lg"><i className="bx bx-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination totalItems={filtered.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVENUE TAB
// ═══════════════════════════════════════════════════════════════════════════════
function RevenueTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders?paymentStatus=paid').then(r => {
      setOrders(Array.isArray(r.data) ? r.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const monthlyRevenue = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon="bx-dollar-circle" label="Tổng doanh thu" value={formatPrice(totalRevenue)} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon="bx-calendar" label="Doanh thu tháng" value={formatPrice(monthlyRevenue)} color="bg-blue-100 text-blue-600" />
        <StatCard icon="bx-check-circle" label="Đơn thành công" value={orders.length} color="bg-beige-primary/10 text-beige-primary" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold mb-5 text-lg">Lịch sử thanh toán</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-gray-500"><th>Mã ĐH</th><th>Khách hàng</th><th>Tổng tiền</th><th>Ngày</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="py-3 font-bold">#{o.id}</td>
                <td>{o.fullname}</td>
                <td className="font-bold text-emerald-600">{formatPrice(o.totalAmount)}</td>
                <td className="text-gray-400">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const role = currentUser?.user?.role?.toLowerCase();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || (role !== 'admin' && role !== 'staff')) {
        navigate('/login');
        return;
    }
    api.get('/dashboard').then(r => setStats(r.data)).finally(() => setStatsLoading(false));
  }, [currentUser, role, navigate]);

  if (!currentUser) return null;

  const allTabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: 'bx-home-alt', roles: ['admin', 'staff'] },
    { id: 'orders', label: 'Đơn hàng', icon: 'bx-receipt', roles: ['admin', 'staff'] },
    { id: 'products', label: 'Sản phẩm', icon: 'bx-box', roles: ['admin', 'staff'] },
    { id: 'revenue', label: 'Doanh thu', icon: 'bx-dollar-circle', roles: ['admin'] },
  ];

  const tabs = allTabs.filter(t => t.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2"><i className='bx bx-shield-quarter text-beige-primary'></i> Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === t.id ? 'bg-beige-primary text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              <i className={`bx ${t.icon} text-lg`}></i> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white"><i className="bx bx-log-out"></i> Thoát</Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-b">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <i className={`bx ${tabs.find(t => t.id === activeTab)?.icon} text-beige-primary`}></i>
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
        </div>
        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardTab stats={stats} loading={statsLoading} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'revenue' && <RevenueTab />}
        </div>
      </main>
    </div>
  );
}