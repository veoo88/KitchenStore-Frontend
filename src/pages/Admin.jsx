import React, { useState, useEffect, useCallback } from 'react';
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

// ─── Helpers & Components ──────────────────────────────────────────────────
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
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100">{value}</h3>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  </div>
);

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 shadow-2xl" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-beige-primary outline-none text-sm";

// ═══════════════════════════════════════════════════════════════════════════════
// TABS COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// 1. DASHBOARD
function DashboardTab({ stats, loading }) {
  if (loading) return <LoadingSpinner />;
  if (!stats) return <p className="text-center py-10">Không có dữ liệu thống kê.</p>;

  const chartData = Object.entries(stats.ordersByStatus || {}).map(([st, count]) => ({
    name: ORDER_STATUS[st]?.label || st,
    value: count,
    color: st === 'pending' ? '#eab308' : st === 'processing' ? '#3b82f6' : st === 'delivered' ? '#22c55e' : '#ef4444'
  })).filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon="bx-dollar-circle" label="Doanh thu tháng" value={formatPrice(stats.monthlyRevenue)} color="bg-green-100 text-green-600" sub={`Tổng: ${formatPrice(stats.totalRevenue)}`} />
        <StatCard icon="bx-group" label="Khách hàng" value={stats.totalUsers} color="bg-purple-100 text-purple-600" />
        <StatCard icon="bx-package" label="Sản phẩm" value={stats.totalProducts} color="bg-orange-100 text-orange-600" />
        <StatCard icon="bx-receipt" label="Đơn mới" value={stats.newOrders || 0} color="bg-blue-100 text-blue-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700">
           <h3 className="font-bold mb-4">Trạng thái đơn hàng</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                    {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700">
          <h3 className="font-bold mb-4">Đơn hàng vừa đặt</h3>
          <div className="space-y-3">
            {(stats.recentOrders || []).map(order => (
              <div key={order.id} className="flex justify-between items-center text-sm border-b pb-2 dark:border-gray-700">
                <div><p className="font-bold">{order.fullname}</p><p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p></div>
                <div className="text-right"><p className="font-bold text-beige-primary">{formatPrice(order.totalAmount)}</p><StatusBadge status={order.status} map={ORDER_STATUS} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. ORDERS
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    api.get('/orders').then(res => setOrders(Array.isArray(res.data) ? res.data : [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${filter === s ? 'bg-beige-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {s === 'all' ? 'Tất cả' : ORDER_STATUS[s]?.label}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr><th className="p-4 text-left">Mã</th><th className="p-4 text-left">Khách</th><th className="p-4 text-left">Tổng</th><th className="p-4 text-left">Trạng thái</th><th className="p-4 text-left">Ngày</th></tr>
          </thead>
          <tbody>
            {paginated.map(order => (
              <tr key={order.id} className="border-t dark:border-gray-700">
                <td className="p-4 font-bold text-beige-primary">#{order.id}</td>
                <td className="p-4">{order.fullname}</td>
                <td className="p-4 font-bold">{formatPrice(order.totalAmount)}</td>
                <td className="p-4"><StatusBadge status={order.status} map={ORDER_STATUS} /></td>
                <td className="p-4 text-gray-400">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination totalItems={filtered.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}

// 3. PRODUCTS
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    api.get('/products?limit=200&includeInactive=true').then(res => setProducts(res.data?.items || [])).finally(() => setLoading(false));
  }, []);

  const paginated = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr><th className="p-4 text-left">ID</th><th className="p-4 text-left">Hình</th><th className="p-4 text-left">Tên</th><th className="p-4 text-left">Giá</th><th className="p-4 text-left">Tồn</th></tr>
        </thead>
        <tbody>
          {paginated.map(p => (
            <tr key={p.id} className="border-t dark:border-gray-700">
              <td className="p-4 text-gray-400">#{p.id}</td>
              <td className="p-4">
                <img src={p.image ? `${window.location.origin}${p.image.replace('/images/', '/img/')}` : 'https://placehold.co/100x100'} className="w-10 h-10 object-cover rounded-lg" alt={p.name} />
              </td>
              <td className="p-4 font-semibold">{p.name}</td>
              <td className="p-4 text-beige-primary font-bold">{formatPrice(p.price)}</td>
              <td className="p-4">{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination totalItems={products.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
}

// 4. CUSTOMERS & EMPLOYEES (Dùng chung logic)
function UsersTab({ roleFilter }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users').then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(roleFilter ? data.filter(u => u.role === roleFilter) : data);
    }).finally(() => setLoading(false));
  }, [roleFilter]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr><th className="p-4 text-left">Tên</th><th className="p-4 text-left">Email</th><th className="p-4 text-left">SĐT</th><th className="p-4 text-left">Trạng thái</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t dark:border-gray-700">
              <td className="p-4 font-bold">{u.fullname}</td>
              <td className="p-4">{u.email}</td>
              <td className="p-4">{u.phone || '---'}</td>
              <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 5. FLASH SALE (DEALS)
function DealsTab() {
  const [deals, setDeals] = useState([]);
  useEffect(() => {
    api.get('/deals/admin').then(res => setDeals(Array.isArray(res.data) ? res.data : []));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
       <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
             <tr><th className="p-4">VT</th><th className="p-4">Sản phẩm</th><th className="p-4">Giảm %</th><th className="p-4">Trạng thái</th></tr>
          </thead>
          <tbody>
             {deals.map(deal => (
               <tr key={deal.id} className="border-t dark:border-gray-700">
                  <td className="p-4 font-bold text-yellow-500">#{deal.position}</td>
                  <td className="p-4 font-semibold">{deal.product?.name}</td>
                  <td className="p-4 font-black text-red-500">-{deal.discountPercent}%</td>
                  <td className="p-4">{deal.isActive ? 'Bật' : 'Tắt'}</td>
               </tr>
             ))}
          </tbody>
       </table>
    </div>
  );
}

// 6. AUDIT LOGS
function AuditLogsTab() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    api.get('/audit-logs').then(res => setLogs(Array.isArray(res.data) ? res.data : []));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr><th className="p-4 text-left">Nhân viên</th><th className="p-4 text-left">Hành động</th><th className="p-4 text-left">Thời gian</th></tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-t dark:border-gray-700">
              <td className="p-4 font-bold text-beige-primary">{log.staffName}</td>
              <td className="p-4"><b>{log.action}</b>: {log.detail}</td>
              <td className="p-4 text-gray-400">{formatDate(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const role = currentUser?.user?.role?.toLowerCase();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || (role !== 'admin' && role !== 'staff')) { navigate('/login'); return; }
    api.get('/dashboard').then(res => setStats(res.data)).finally(() => setLoading(false));
  }, [currentUser, role, navigate]);

  const allTabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: 'bx-home-alt', roles: ['admin', 'staff'] },
    { id: 'orders', label: 'Đơn hàng', icon: 'bx-receipt', roles: ['admin', 'staff'] },
    { id: 'products', label: 'Sản phẩm', icon: 'bx-box', roles: ['admin', 'staff'] },
    { id: 'flashsale', label: 'Flash Sale', icon: 'bxs-bolt', roles: ['admin'] },
    { id: 'customers', label: 'Khách hàng', icon: 'bx-group', roles: ['admin'] },
    { id: 'employees', label: 'Nhân viên', icon: 'bx-user-pin', roles: ['admin'] },
    { id: 'logs', label: 'Nhật ký hệ thống', icon: 'bx-history', roles: ['admin'] },
    { id: 'revenue', label: 'Doanh thu', icon: 'bx-dollar-circle', roles: ['admin'] },
  ];

  const tabs = allTabs.filter(t => t.roles.includes(role));

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2"><i className='bx bx-shield-quarter text-beige-primary'></i> Admin Panel</h2>
          <p className="text-xs text-slate-400 mt-1 truncate">{currentUser.user?.fullname}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === t.id ? 'bg-beige-primary text-white shadow-lg shadow-beige-primary/20' : 'text-slate-300 hover:bg-slate-800'}`}>
              <i className={`bx ${t.icon} text-lg`}></i> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white"><i className="bx bx-log-out"></i> Về Trang Chủ</Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 px-6 py-4 flex justify-between border-b dark:border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <i className={`bx ${tabs.find(t => t.id === activeTab)?.icon} text-beige-primary`}></i>
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
        </div>
        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardTab stats={stats} loading={loading} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'flashsale' && <DealsTab />}
          {activeTab === 'customers' && <UsersTab roleFilter="user" />}
          {activeTab === 'employees' && <UsersTab roleFilter="staff" />}
          {activeTab === 'logs' && <AuditLogsTab />}
          {activeTab === 'revenue' && <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">Tính năng doanh thu đang cập nhật dữ liệu...</div>}
        </div>
      </main>
    </div>
  );
}