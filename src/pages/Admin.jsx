import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// Chỉ import những thứ CHẮC CHẮN có trong thư mục project
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
const PAY_STATUS = {
  paid: { label: 'Đã Thanh Toán', cls: 'bg-green-100 text-green-700' },
  unpaid: { label: 'Chưa Thanh Toán', cls: 'bg-orange-100 text-orange-700' },
  refunded: { label: 'Đã Hoàn Trả', cls: 'bg-purple-100 text-purple-700' },
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

// ─── Modal Wrapper ───────────────────────────────────────────────────────────
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

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
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

// ─── Input Field Component ───────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);
const inputCls = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-beige-primary outline-none dark:text-white text-sm";

// Pagination component has been moved to ../components/Pagination

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardTab({ stats, loading }) {
  if (loading) return <LoadingSpinner />;
  if (!stats) return <p className="text-center text-gray-500 py-10">Không thể tải dữ liệu dashboard.</p>;

  // Chuẩn hóa dữ liệu biểu đồ
  const chartData = Object.entries(stats.ordersByStatus || {}).map(([st, count]) => ({
    name: ORDER_STATUS[st]?.label || st,
    value: count,
    color: st === 'pending' ? '#eab308' : st === 'processing' ? '#3b82f6' : st === 'shipped' ? '#6366f1' : st === 'delivered' ? '#22c55e' : st === 'refunded' ? '#a855f7' : '#ef4444'
  })).filter(d => d.value > 0);

  const dailyRevenueData = Object.entries(stats.dailyRevenue || {}).map(([date, total]) => ({
    name: date.split('-').slice(2, 3) + '/' + date.split('-').slice(1, 2),
    revenue: total
  }));

  return (
    <div className="space-y-6">
      {/* TẦNG 1: CHỈ SỐ SỨC KHỎE HỆ THỐNG */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="bx-dollar-circle"
          label="Doanh thu tháng"
          value={formatPrice(stats.monthlyRevenue)}
          color="bg-green-100 text-green-600"
          sub={`Tổng: ${formatPrice(stats.totalRevenue)}`}
        />
        <StatCard
          icon="bx-group"
          label="Khách hàng"
          value={stats.totalUsers}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon="bx-package"
          label="Kho hàng (Sắp hết)"
          value={stats.lowStockProducts || 0}
          color={stats.lowStockProducts > 0 ? "bg-red-100 text-red-600 animate-pulse" : "bg-orange-100 text-orange-600"}
          sub={stats.lowStockProducts > 0 ? "Cần nhập thêm hàng" : "Số lượng ổn định"}
        />
        <StatCard
          icon="bx-message-dots"
          label="Yêu cầu mới"
          value={stats.newContacts || 0}
          color="bg-blue-100 text-blue-600"
          sub="Liên hệ khách hàng"
        />
      </div>

      {/* TẦNG 2: XU HƯỚNG DOANH THU (DIỆN RỘNG) */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
            <i className='bx bx-trending-up text-beige-primary'></i> Doanh thu 7 ngày gần nhất
          </h3>
          <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800">Cập nhật thời gian thực</span>
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
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}M` : `${value / 1000}k`}
              />
              <RechartsTooltip
                formatter={(value) => [formatPrice(value), 'Doanh thu']}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C8A97E" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TẦNG 3: VẬN HÀNH VÀ HIỆU SUẤT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI: BIỂU ĐỒ VẬN HÀNH (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-6 text-lg flex items-center gap-2">
              <i className='bx bx-bar-chart-alt-2 text-beige-primary'></i> Đơn theo trạng thái
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-6 text-lg flex items-center gap-2">
              <i className='bx bx-medal text-yellow-500'></i> Hiệu suất hoàn thành đơn (Nhân viên)
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.staffPerformance || []} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="staffName" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Bar dataKey="ordersCompleted" fill="#C8A97E" radius={[0, 10, 10, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: HOẠT ĐỘNG GẦN ĐÂY (4/12) */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-6 text-lg flex items-center gap-2">
              <i className='bx bx-time-five text-beige-primary'></i> Đơn hàng vừa đặt
            </h3>
            <div className="space-y-4">
              {(stats.recentOrders || []).map((o) => (
                <div key={o.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-beige-light dark:bg-gray-700 flex items-center justify-center text-beige-primary font-bold">
                      #{o.id.toString().slice(-2)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{o.fullname}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{formatDate(o.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-beige-primary text-sm">{formatPrice(o.totalAmount)}</p>
                    <StatusBadge status={o.status} map={ORDER_STATUS} />
                  </div>
                </div>
              ))}
              {(stats.recentOrders || []).length === 0 && (
                <div className="text-center py-10">
                   <i className='bx bx-ghost text-4xl text-gray-200'></i>
                   <p className="text-gray-400 text-xs mt-2 italic">Chưa phát sinh giao dịch mới</p>
                </div>
              )}
            </div>
            <button className="w-full mt-6 py-3 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              Xem tất cả đơn hàng
            </button>
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

  const [staffList, setStaffList] = useState([]);
  const { currentUser } = useAuth();
  const role = currentUser?.user?.role?.toLowerCase();
  const currentUserId = currentUser?.user?.id;

  useEffect(() => { setCurrentPage(1); }, [filter]);

const loadStaff = useCallback(async () => {
  // Chỉ Admin mới được phép tải danh sách này để phân công
  if (role !== 'admin') return; 

  try {
    const res = await api.get('/users'); 
    const allUsers = Array.isArray(res.data) ? res.data : [];
    
    const staffOnly = allUsers.filter(u => 
      u.role?.toLowerCase() === 'staff' || u.role?.toLowerCase() === 'admin'
    );
    
    setStaffList(staffOnly);
  } catch (err) {
    console.log('Lỗi khi tải danh sách nhân viên:', err);
  }
}, [role]); // Thêm role vào dependency

  const load = useCallback(async () => {
  setLoading(true);
  try {
    const r = await api.get('/orders');
    // Staff phải thấy toàn bộ dữ liệu từ API trả về giống Admin
    setOrders(Array.isArray(r.data) ? r.data : []); 
  }
  catch { setOrders([]); } 
  finally { setLoading(false); }
}, []);

  useEffect(() => {
    load();
    loadStaff();
  }, [load, loadStaff]);

  const handleAssignStaff = async (orderId, employeeId) => {
    setUpdating(orderId); 
    try {
      const empId = parseInt(employeeId) || null;
      await api.put(`/orders/assign/${orderId}`, { employeeId: empId });
      
      // Tìm tên nhân viên vừa gán để cập nhật UI ngay lập tức
      const staffMember = staffList.find(s => s.id === empId);
      
      setOrders(prev => prev.map(o => d.id === orderId ? { 
        ...o, 
        employeeId: empId,
        employeeName: staffMember ? staffMember.fullname : null 
      } : o));

      if (editOrder?.id === orderId) {
        setEditOrder(prev => ({ 
          ...prev, 
          employeeId: empId,
          employeeName: staffMember ? staffMember.fullname : null 
        }));
      }
      
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã gán nhân viên xử lý', showConfirmButton: false, timer: 1500 });
    } catch (e) {
      Swal.fire('Lỗi', e.response?.data?.message || 'Không thể gán nhân viên', 'error');
    } finally { setUpdating(null); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put('/orders', { id, status });
      setOrders(prev => prev.map(o => d.id === id ? { ...o, status } : o));
      setEditOrder(prev => prev?.id === id ? { ...prev, status } : prev);
    } catch (e) { Swal.fire('Lỗi', 'Cập nhật thất bại', 'error'); }
    finally { setUpdating(null); }
  };

  const cancelOrder = async (id) => {
    const result = await Swal.fire({
      title: 'Xác nhận hủy?',
      text: 'Hủy đơn hàng này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý hủy'
    });
    if (!result.isConfirmed) return;
    setUpdating(id);
    try {
      await api.put('/orders', { id, status: 'cancelled' });
      setOrders(prev => prev.map(o => d.id === id ? { ...o, status: 'cancelled' } : o));
      setEditOrder(prev => prev?.id === id ? { ...prev, status: 'cancelled' } : prev);
      Swal.fire('Thành công', 'Đã hủy đơn hàng.', 'success');
    } catch (e) { Swal.fire('Lỗi', 'Hủy đơn thất bại', 'error'); }
    finally { setUpdating(null); }
  };

  const refundOrder = async (id) => {
    const result = await Swal.fire({
      title: 'Xác nhận hoàn trả?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận'
    });
    if (!result.isConfirmed) return;
    setUpdating(id);
    try {
      await api.put('/orders', { id, status: 'refunded', paymentStatus: 'refunded' });
      setOrders(prev => prev.map(o => d.id === id ? { ...o, status: 'refunded', paymentStatus: 'refunded' } : o));
      setEditOrder(prev => prev?.id === id ? { ...prev, status: 'refunded', paymentStatus: 'refunded' } : prev);
      Swal.fire('Thành công', 'Đã hoàn trả đơn hàng.', 'success');
    } catch (e) { Swal.fire('Lỗi', 'Hoàn trả thất bại', 'error'); }
    finally { setUpdating(null); }
  };

  const deleteOrder = async () => {
    try {
      await api.delete('/orders', { data: { id: deleteTarget } });
      setOrders(prev => prev.filter(o => d.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (e) { setDeleteTarget(null); }
  };

  const NEXT = { pending: 'processing', processing: 'shipped', shipped: 'delivered' };
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      {deleteTarget && <ConfirmDialog message="Xóa đơn hàng này?" onConfirm={deleteOrder} onCancel={() => setDeleteTarget(null)} />}
      
      {editOrder && (
  <Modal title={`Quản lý đơn hàng #${editOrder.id}`} onClose={() => setEditOrder(null)}>
    <div className="space-y-5 text-sm">
      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
        <div>
          <p className="text-gray-500 mb-1">Khách hàng</p>
          <p className="font-bold text-gray-800 dark:text-gray-100">{editOrder.fullname}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Trạng thái hiện tại</p>
          <StatusBadge status={editOrder.status} map={ORDER_STATUS} />
        </div>
      </div>

      <hr className="dark:border-gray-700" />

      {/* KHU VỰC 3 CHỨC NĂNG CHÍNH */}
      <div className="space-y-3">
        <label className="block text-xs font-black uppercase text-gray-400 tracking-wider">
          Hành động yêu cầu
        </label>

        {/* 1. NÚT XỬ LÝ (Chuyển trạng thái tiếp theo) */}
        {NEXT[editOrder.status] && (
          <button
            onClick={() => updateStatus(editOrder.id, NEXT[editOrder.status])}
            disabled={updating === editOrder.id}
            className="w-full flex items-center justify-center gap-2 bg-beige-primary text-white py-3 rounded-xl font-bold hover:bg-beige-dark transition-all shadow-lg shadow-beige-primary/20"
          >
            <i className='bx bx-right-arrow-alt text-xl'></i>
            DUYỆT ĐƠN: Chuyển sang {ORDER_STATUS[NEXT[editOrder.status]]?.label}
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* 2. NÚT HỦY ĐƠN (Chỉ cho phép khi đơn chưa giao/hoàn thành) */}
          {['pending', 'processing'].includes(editOrder.status) && (
            <button
              onClick={() => cancelOrder(editOrder.id)}
              disabled={updating === editOrder.id}
              className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-100 dark:border-red-900/30"
            >
              <i className='bx bx-x-circle text-xl'></i> HỦY ĐƠN
            </button>
          )}

          {/* 3. NÚT HOÀN TRẢ (Chỉ dành cho đơn đã thanh toán/đã giao) */}
          {['delivered', 'shipped'].includes(editOrder.status) && (
            <button
              onClick={() => refundOrder(editOrder.id)}
              disabled={updating === editOrder.id}
              className="flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 py-3 rounded-xl font-bold hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-100 dark:border-purple-900/30"
            >
              <i className='bx bx-undo text-xl'></i> HOÀN TRẢ
            </button>
          )}
        </div>
      </div>

      {/* Thông báo hướng dẫn nếu không còn thao tác nào */}
      {!NEXT[editOrder.status] && !['pending', 'processing'].includes(editOrder.status) && editOrder.status !== 'delivered' && (
        <p className="text-center text-gray-400 italic py-2">Đơn hàng này đã kết thúc quy trình xử lý.</p>
      )}
    </div>
  </Modal>
)}
      {/* Danh sách các nút lọc */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === s ? 'bg-beige-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {s === 'all' ? `Tất cả (${orders.length})` : `${ORDER_STATUS[s]?.label}`}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['#', 'Khách hàng', 'Người xử lý', 'Tổng tiền', 'Trạng thái', 'Ngày', 'Hành động'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
  {paginated.map((order) => ( // Đặt tên rõ là order
    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <td className="px-4 py-3 font-bold text-beige-primary">#{order.id}</td>
      <td className="px-4 py-3 font-semibold">{order.fullname}</td>
      <td className="px-4 py-3">
        {order.employeeName ? (
          <span className="text-blue-600 font-bold text-xs">
            <i className='bx bxs-user-circle'></i> {order.employeeName}
          </span>
        ) : (
          <span className="text-gray-400 italic text-xs">Chưa ai nhận</span>
        )}
      </td>
      <td className="px-4 py-3 font-bold">{formatPrice(order.totalAmount)}</td>
      <td className="px-4 py-3"><StatusBadge status={order.status} map={ORDER_STATUS} /></td>
      <td className="px-4 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
      <td className="px-4 py-3">
        <button onClick={() => setEditOrder(order)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
          <i className="bx bx-show text-lg"></i>
        </button>
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
const EMPTY_PRODUCT = { name: '', categoryId: '', price: '', originalPrice: '', stock: '', description: '', image: '', isActive: true, isFeatured: false };

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { setCurrentPage(1); }, [search]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      set('image', res.data?.url || '');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload hình ảnh thất bại');
    } finally {
      setUploadingImg(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/products?limit=200&includeInactive=true'),
        api.get('/categories'),
      ]);
      setProducts(pRes.data?.items || []);
      setCategories(Array.isArray(cRes.data) ? cRes.data : []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY_PRODUCT); setModal('add'); };
  const openEdit = (p) => {
    setForm({ id: p.id, name: p.name, categoryId: p.categoryId, price: p.price, originalPrice: p.originalPrice || '', stock: p.stock, description: p.description || '', image: p.image || '', isActive: p.isActive, isFeatured: p.isFeatured });
    setModal('edit');
  };
  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      Swal.fire('Thông báo', 'Vui lòng điền tên, danh mục và giá.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, price: parseFloat(form.price), originalPrice: parseFloat(form.originalPrice) || 0, stock: parseInt(form.stock) || 0 };
      if (modal === 'add') {
        await api.post('/products', body);
      } else {
        await api.put('/products', body);
      }
      await load();
      setModal(null);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã lưu sản phẩm thành công',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (e) {
      Swal.fire('Lỗi', e.response?.data?.message || 'Lưu thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    try {
      await api.delete('/products', { data: { id: deleteTarget } });
      setProducts(prev => prev.filter(p => p.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (e) { alert(e.response?.data?.message || 'Xóa thất bại'); setDeleteTarget(null); }
  };

  const handleEditCategory = async () => {
    const currentCategory = categories.find(c => c.id === parseInt(form.categoryId));
    if (!currentCategory) return;

    const { value: newName } = await Swal.fire({
      title: 'Sửa tên danh mục',
      input: 'text',
      inputValue: currentCategory.name,
      showCancelButton: true,
      confirmButtonColor: '#C8A97E',
      inputValidator: (value) => {
        if (!value) return 'Tên danh mục không được để trống!';
      }
    });

    if (newName && newName !== currentCategory.name) {
      try {
        await api.put('/categories', { id: currentCategory.id, name: newName, isActive: true });
        Swal.fire('Thành công', 'Đã cập nhật tên danh mục.', 'success');
        await load();
      } catch (e) {
        Swal.fire('Lỗi', e.response?.data?.message || 'Không thể cập nhật.', 'error');
      }
    }
  };

  const handleDeleteCategory = async () => {
    const currentCategory = categories.find(c => c.id === parseInt(form.categoryId));
    if (!currentCategory) return;

    const result = await Swal.fire({
      title: 'Xóa danh mục?',
      text: `Bạn có chắc muốn xóa "${currentCategory.name}"? Các sản phẩm thuộc danh mục này sẽ không còn danh mục hệ thống.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await api.delete('/categories', { data: { id: currentCategory.id } });
        Swal.fire('Đã xóa', 'Danh mục đã được gỡ bỏ.', 'success');
        set('categoryId', '');
        await load();
      } catch (e) {
        Swal.fire('Lỗi', e.response?.data?.message || 'Không thể xóa.', 'error');
      }
    }
  };

  const handleAddNewCategory = async () => {
    const { value: newName } = await Swal.fire({
      title: 'Thêm danh mục mới',
      input: 'text',
      showCancelButton: true,
      confirmButtonColor: '#C8A97E',
      inputValidator: (value) => {
        if (!value) return 'Tên danh mục không được để trống!';
      }
    });

    if (newName) {
      try {
        const res = await api.post('/categories', { name: newName, isActive: true });
        Swal.fire('Thành công', 'Đã thêm danh mục mới.', 'success');
        await load();
        if (res.data && res.data.id) set('categoryId', res.data.id);
      } catch (e) {
        Swal.fire('Lỗi', e.response?.data?.message || 'Không thể thêm.', 'error');
      }
    }
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.name?.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      {deleteTarget && <ConfirmDialog message="Xóa sản phẩm này khỏi hệ thống? Hành động này không thể hoàn tác." onConfirm={deleteProduct} onCancel={() => setDeleteTarget(null)} />}
      {modal && (
        <Modal title={modal === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Tên sản phẩm" required><input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Nồi cơm điện Panasonic..." /></Field>
            <Field label="Danh mục" required>
              <div className="flex gap-2">
                <select value={form.categoryId || ''} onChange={e => {
                  if (e.target.value === 'NEW') {
                    handleAddNewCategory();
                  } else {
                    set('categoryId', e.target.value);
                  }
                }} className={inputCls}>
                  <option value="">— Chọn danh mục —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="NEW" className="text-beige-primary font-bold">+ Thêm mới...</option>
                </select>
                {form.categoryId && form.categoryId !== '' && (
                  <div className="flex gap-1">
                    <button onClick={handleEditCategory} type="button" className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Sửa tên danh mục">
                      <i className="bx bx-edit text-lg"></i>
                    </button>
                    <button onClick={handleDeleteCategory} type="button" className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Xóa danh mục">
                      <i className="bx bx-trash text-lg"></i>
                    </button>
                  </div>
                )}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Giá bán (VNĐ)" required><input type="number" value={form.price} onChange={e => set('price', e.target.value)} className={inputCls} placeholder="499000" /></Field>
              <Field label="Giá gốc (VNĐ)"><input type="number" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} className={inputCls} placeholder="599000" /></Field>
            </div>
            <Field label="Số lượng tồn kho"><input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className={inputCls} /></Field>
            <Field label="Mô tả"><textarea value={form.description} onChange={e => set('description', e.target.value)} className={inputCls} rows={3} /></Field>
            {/* Image Upload */}
            <Field label="Hình ảnh sản phẩm">
              <div className="space-y-2">
                <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-beige-primary transition-colors bg-gray-50 dark:bg-gray-900 ${uploadingImg ? 'opacity-50 pointer-events-none' : ''}`}>
                  <i className="bx bx-image-add text-2xl text-gray-400"></i>
                  <span className="text-sm text-gray-500">{uploadingImg ? 'Đang tải lên...' : 'Chọn file ảnh từ máy tính (jpg, png, webp)'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
                </label>
                {form.image && (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <img 
  src={
    p.image 
      ? (p.image.startsWith('http') ? p.image : `${window.location.origin}${p.image.replace('/images/', '/img/')}`)
      : 'https://placehold.co/100x100'
  } 
  alt={p.name} 
  className="w-full h-full object-contain" 
/>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 truncate">{form.image}</p>
                      <button type="button" onClick={() => set('image', '')} className="text-xs text-red-500 hover:underline mt-1">✕ Xóa hình</button>
                    </div>
                  </div>
                )}
                {!form.image && (
                  <input value={form.image} onChange={e => set('image', e.target.value)} className={inputCls} placeholder="Hoặc nhập URL hình ảnh..." />
                )}
              </div>
            </Field>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 rounded accent-beige-primary" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Đang bán</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 rounded accent-beige-primary" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Nổi bật</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-xl bg-beige-primary text-white font-bold hover:bg-beige-dark transition-colors disabled:opacity-50">
                {saving ? 'Đang lưu...' : modal === 'add' ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, danh mục..." className={`${inputCls} flex-1`} />
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 bg-beige-primary text-white rounded-xl font-bold hover:bg-beige-dark transition-colors whitespace-nowrap">
          <i className="bx bx-plus text-xl"></i> Thêm sản phẩm
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>{['#', 'Hình', 'Tên sản phẩm', 'Danh mục', 'Giá', 'Tồn', 'Trạng thái', 'Hành động'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginated.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-400">#{p.id}</td>
                    <td className="px-4 py-3"><div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden"><img 
  src={
    d.product?.image 
      ? (d.product.image.startsWith('http') ? d.product.image : `${window.location.origin}${d.product.image.replace('/images/', '/img/')}`)
      : 'https://placehold.co/100x100'
  } 
  alt={d.product?.name} 
  className="w-full h-full object-contain" 
/></div></td>
                    <td className="px-4 py-3"><p className="font-semibold text-gray-800 dark:text-gray-200 max-w-[150px] line-clamp-2">{p.name}</p>{p.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">Nổi bật</span>}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.category?.name || '---'}</td>
                    <td className="px-4 py-3 font-bold text-beige-primary whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3"><span className={`font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.isActive ? 'Đang bán' : 'Ẩn'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Sửa"><i className="bx bx-pencil text-lg"></i></button>
                        <button onClick={() => setDeleteTarget(p.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Xóa"><i className="bx bx-trash text-lg"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400">Không tìm thấy sản phẩm.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const EMPTY_USER = { fullname: '', email: '', password: '', phone: '', address: '', role: 'user', status: 'active' };

function CustomersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_USER);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { setCurrentPage(1); }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/users'); setUsers(Array.isArray(r.data) ? r.data : []); }
    catch { setUsers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY_USER); setModal('add'); };
  const openEdit = (u) => {
    setForm({ id: u.id, fullname: u.fullname, email: u.email, password: '', phone: u.phone || '', address: u.address || '', role: u.role, status: u.status });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.fullname || !form.email) {
      Swal.fire('Thông báo', 'Vui lòng điền đầy đủ họ tên và email.', 'warning');
      return;
    }
    if (modal === 'add' && form.password.length < 6) {
      Swal.fire('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự.', 'warning');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/users', form);
      } else {
        const body = { id: form.id, fullname: form.fullname, phone: form.phone, address: form.address, role: form.role, status: form.status };
        if (form.password) body.password = form.password;
        await api.put('/users', body);
      }
      await load();
      setModal(null);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã lưu thông tin khách hàng',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (e) {
      Swal.fire('Lỗi', e.response?.data?.message || 'Lưu thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    try {
      await api.delete('/users', { data: { id: deleteTarget } });
      setUsers(prev => prev.filter(u => u.id !== deleteTarget));
      setDeleteTarget(null);
      Swal.fire('Đã xóa', 'Người dùng đã được xóa.', 'success');
    } catch (e) {
      Swal.fire('Lỗi', e.response?.data?.message || 'Xóa thất bại', 'error');
      setDeleteTarget(null);
    }
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const filtered = users.filter(u => u.fullname?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      {deleteTarget && <ConfirmDialog message="Bạn có chắc muốn xóa người dùng này? Dữ liệu không thể khôi phục." onConfirm={deleteUser} onCancel={() => setDeleteTarget(null)} />}
      {modal && (
        <Modal title={modal === 'add' ? 'Thêm người dùng' : 'Chỉnh sửa thông tin'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Họ và tên" required><input value={form.fullname} onChange={e => set('fullname', e.target.value)} className={inputCls} placeholder="Nguyễn Văn A" /></Field>
            {modal === 'add' && <Field label="Email" required><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} placeholder="email@example.com" /></Field>}
            <Field label={modal === 'edit' ? 'Mật khẩu mới (bỏ trống để giữ nguyên)' : 'Mật khẩu'} required={modal === 'add'}>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className={inputCls} placeholder="••••••••" />
            </Field>
            <Field label="Số điện thoại"><input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} placeholder="0912 345 678" /></Field>
            <Field label="Địa chỉ"><input value={form.address} onChange={e => set('address', e.target.value)} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Vai trò">
                <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls}>
                  <option value="user">Khách hàng</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Trạng thái">
                <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Bị khóa</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-xl bg-beige-primary text-white font-bold hover:bg-beige-dark disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : modal === 'add' ? 'Thêm người dùng' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, email..." className={`${inputCls} flex-1`} />
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 bg-beige-primary text-white rounded-xl font-bold hover:bg-beige-dark transition-colors whitespace-nowrap">
          <i className="bx bx-plus text-xl"></i> Thêm người dùng
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>{['#', 'Họ và tên', 'Email', 'SĐT', 'Role', 'Trạng thái', 'Hành động'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginated.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-400">#{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-beige-secondary to-beige-primary rounded-full flex items-center justify-center font-bold text-beige-text text-xs flex-shrink-0">
                          {(u.fullname || 'A')[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{u.fullname}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.phone || '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>{u.role === 'admin' ? 'Admin' : 'Khách hàng'}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.status === 'active' ? 'Hoạt động' : 'Khóa'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Sửa"><i className="bx bx-pencil text-lg"></i></button>
                        {u.role !== 'admin' && (
                          <button onClick={() => setDeleteTarget(u.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Xóa"><i className="bx bx-trash text-lg"></i></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-gray-400">Không tìm thấy người dùng.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════════════════
// EMPLOYEES TAB (Admin Quản lý nhân viên)
// ═══════════════════════════════════════════════════════════════════════════════
function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState({ fullname: '', email: '', password: '', role: 'staff', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/users');
      // Chỉ lấy những người có role là 'staff' hoặc 'admin'
      const data = Array.isArray(r.data) ? r.data.filter(u => u.role === 'staff' || u.role === 'admin') : [];
      setEmployees(data);
    } catch { setEmployees([]); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.fullname || !form.email) {
      Swal.fire('Thông báo', 'Vui lòng điền họ tên và email.', 'warning');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/users', form);
      } else {
        const body = { id: form.id, fullname: form.fullname, role: form.role, status: form.status };
        if (form.password) body.password = form.password;
        await api.put('/users', body);
      }
      await load();
      setModal(null);
      Swal.fire('Thành công', 'Đã lưu thông tin nhân viên', 'success');
    } catch (e) {
      Swal.fire('Lỗi', e.response?.data?.message || 'Lưu thất bại', 'error');
    } finally { setSaving(false); }
  };

  const filtered = employees.filter(u => 
    u.fullname?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      {modal && (
        <Modal title={modal === 'add' ? 'Cấp tài khoản nhân viên' : 'Sửa thông tin nhân viên'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Họ và tên" required><input value={form.fullname} onChange={e => setForm({...form, fullname: e.target.value})} className={inputCls} /></Field>
            {modal === 'add' && <Field label="Email đăng nhập" required><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputCls} /></Field>}
            <Field label={modal === 'edit' ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu'} required={modal === 'add'}>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Vai trò">
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={inputCls}>
                  <option value="staff">Nhân viên (Staff)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </Field>
              <Field label="Trạng thái">
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={inputCls}>
                  <option value="active">Đang làm việc</option>
                  <option value="inactive">Tạm khóa</option>
                </select>
              </Field>
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl bg-beige-primary text-white font-bold hover:bg-beige-dark transition-all">
              {saving ? 'Đang xử lý...' : 'Xác nhận lưu'}
            </button>
          </div>
        </Modal>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm nhân viên..." className={`${inputCls} flex-1`} />
        <button onClick={() => { setForm({fullname:'', email:'', password:'', role:'staff', status:'active'}); setModal('add'); }} className="px-5 py-2 bg-beige-primary text-white rounded-xl font-bold hover:bg-beige-dark flex items-center gap-2">
          <i className="bx bx-user-plus text-xl"></i> Cấp tài khoản
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nhân viên</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Vai trò</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginated.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{u.fullname}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-xs uppercase font-black text-beige-primary">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.status === 'active' ? 'HOẠT ĐỘNG' : 'TẠM KHÓA'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setForm({...u, password: ''}); setModal('edit'); }} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                      <i className="bx bx-pencil text-lg"></i>
                    </button>
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
    }).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

const monthlyRevenue = orders.filter(o => {
  const orderDate = new Date(o.createdAt); // Sửa d thành orderDate hoặc tên khác tránh trùng
  const now = new Date();
  return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
}).reduce((s, o) => s + (o.totalAmount || 0), 0); // Sửa d thành o
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon="bx-dollar-circle" label="Tổng doanh thu" value={formatPrice(totalRevenue)} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon="bx-calendar" label="Doanh thu tháng này" value={formatPrice(monthlyRevenue)} color="bg-blue-100 text-blue-600" />
        <StatCard icon="bx-check-circle" label="Đơn đã thanh toán" value={orders.length} color="bg-beige-primary/10 text-beige-primary" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-5 text-lg">Lịch sử đơn đã thanh toán</h3>
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 dark:bg-gray-700/50">
                {['Mã ĐH', 'Khách hàng', 'Phương thức', 'Tổng tiền', 'Ngày'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.slice(0, 100).map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-bold text-beige-primary">#{o.id}</td>
                    <td className="px-4 py-3"><p className="font-semibold text-gray-800 dark:text-gray-200">{o.fullname}</p><p className="text-xs text-gray-400">{o.email}</p></td>
                    <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold uppercase">{o.paymentMethod}</span></td>
                    <td className="px-4 py-3 font-black text-emerald-600">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400">Chưa có đơn được thanh toán.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLASH SALE (DEALS) TAB
// ═══════════════════════════════════════════════════════════════════════════════
const EMPTY_DEAL = { productId: 0, discountPercent: 10, position: 1, isActive: true };

function DealsTab() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_DEAL);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dealsRes, prodRes] = await Promise.all([
        api.get('/deals/admin'),
        api.get('/products?limit=200')
      ]);
      setDeals(Array.isArray(dealsRes.data) ? dealsRes.data : []);
      setProducts(prodRes.data?.items || []);
    } catch { setDeals([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY_DEAL); setModal('add'); };
  const openEdit = (d) => {
    setForm({ id: d.id, productId: d.productId, discountPercent: d.discountPercent, position: d.position, isActive: d.isActive });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.productId || !form.discountPercent || !form.position) {
      Swal.fire('Thông báo', 'Vui lòng điền đầy đủ thông tin.', 'warning');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/deals', form);
      } else {
        await api.put('/deals', form);
      }
      await load();
      setModal(null);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã lưu chương trình Flash Sale',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (e) {
      Swal.fire('Lỗi', e.response?.data?.message || 'Lưu thất bại. Có thể vị trí này đã được sử dụng.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteDeal = async () => {
    try {
      await api.delete('/deals', { data: { id: deleteTarget } });
      setDeals(prev => prev.filter(d => d.id !== deleteTarget));
      setDeleteTarget(null);
      Swal.fire('Đã xóa', 'Deal Flash Sale đã được gỡ bỏ.', 'success');
    } catch (e) {
      Swal.fire('Lỗi', e.response?.data?.message || 'Xóa thất bại', 'error');
      setDeleteTarget(null);
    }
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: parseInt(v) || v }));

  return (
    <div>
      {deleteTarget && <ConfirmDialog message="Xóa sản phẩm này khỏi Flash Sale? Giá sản phẩm sẽ được khôi phục về giá gốc." onConfirm={deleteDeal} onCancel={() => setDeleteTarget(null)} />}

      {modal && (
        <Modal title={modal === 'add' ? 'Thêm sản phẩm Flash Sale' : 'Sửa Flash Sale'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Chọn sản phẩm" required>
              <select value={form.productId} onChange={e => set('productId', e.target.value)} className={inputCls} disabled={modal === 'edit'}>
                <option value={0}>— Chọn sản phẩm —</option>
                {products.filter(p => !deals.find(d => d.productId === p.id) || (modal === 'edit' && form.productId === p.id)).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Giảm giá (%)" required>
                <input type="number" min="1" max="99" value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Vị trí hiển thị (1-8)" required>
                <input type="number" min="1" max="8" value={form.position} onChange={e => set('position', e.target.value)} className={inputCls} />
              </Field>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 rounded accent-beige-primary" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Hoạt động</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 italic flex items-center gap-2">
            <i className='bx bxs-bolt text-yellow-400'></i> QUẢN LÝ FLASH SALE
          </h2>
          <p className="text-sm text-gray-500">Tối đa 8 sản phẩm hiển thị trên trang chủ.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 bg-yellow-400 text-black rounded-xl font-bold hover:bg-yellow-500 transition-colors">
          <i className="bx bx-plus text-xl"></i> Thêm khuyến mãi
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['VT', 'Hình', 'Sản phẩm', 'Giá gốc', 'Giảm giá', 'Giá FlashSale', 'Trạng thái', 'Hành động'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {deals.map(d => (
  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
    <td className="px-4 py-3 font-bold text-yellow-500">#{d.position}</td>
    <td className="px-4 py-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
        <img 
          src={
            d.product?.image 
              ? `${window.location.origin}${d.product.image.replace('/images/', '/img/')}` 
              : 'https://placehold.co/100x100'
          } 
          alt={d.product?.name || "Product"} 
          className="w-full h-full object-contain" 
        />
      </div>
    </td>
    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
      {d.product?.name}
    </td>
    <td className="px-4 py-3 text-gray-400 line-through text-xs">
      {formatPrice(d.product?.price / (1 - d.discountPercent / 100))}
    </td>
    <td className="px-4 py-3">
      <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-black">
        -{d.discountPercent}%
      </span>
    </td>
    <td className="px-4 py-3 font-black text-yellow-600 dark:text-yellow-400">
      {formatPrice(d.product?.price)}
    </td>
    <td className="px-4 py-3">
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {d.isActive ? 'Hoạt động' : 'Ẩn'}
      </span>
    </td>
    <td className="px-4 py-3">
      <div className="flex gap-2">
        <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
          <i className="bx bx-pencil"></i>
        </button>
        <button onClick={() => setDeleteTarget(d.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
          <i className="bx bx-trash"></i>
        </button>
      </div>
    </td>
  </tr>
))}
              {deals.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400">Chưa có sản phẩm flash sale nàd.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
function AuditLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs') // Bạn cần viết thêm API GET này ở Backend
      .then(r => setLogs(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold dark:text-white uppercase">Nhật ký hoạt động nhân viên</h2>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 font-bold">
            <tr>
              <th className="px-4 py-3">Nhân viên</th>
              <th className="px-4 py-3">Hành động</th>
              <th className="px-4 py-3">Đối tượng</th>
              <th className="px-4 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
{logs.map(log => (
  <tr key={log.id} className="...">
    <td className="px-4 py-3">
      {/* Sử dụng đúng tên StaffName bạn đã định nghĩa ở Backend */}
      <span className="font-bold text-beige-dark">{log.staffName}</span>
    </td>
    <td className="px-4 py-3">
      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
        {log.action}
      </span>
      {/* Lưu ý: Backend trả về 'Detail' (viết hoa chữ D) nếu không cấu hình camelCase */}
      <p className="text-xs mt-1 text-gray-500">{log.detail}</p>
    </td>
    <td className="px-4 py-3 text-gray-600">
       {log.targetType}
    </td>
    <td className="px-4 py-3 text-gray-400">
      {formatDate(log.createdAt)}
    </td>
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
  const { currentUser } = useAuth();
  const { user, logout } = useAuth();
  const role = currentUser?.user?.role?.toLowerCase(); 
  // Cho phép cả Admin và Staff vào, nếu không phải thì về trang chủ
  if (!currentUser || (role !== 'admin' && role !== 'staff')) {
    return navigate('/login') ;
  }

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setStats(r.data)).catch(() => setStats(null)).finally(() => setStatsLoading(false));
  }, []);

 const allTabs = [
  { id: 'dashboard', label: 'Tổng quan', icon: 'bx-home-alt', roles: ['admin', 'staff'] },
  { id: 'orders', label: 'Đơn hàng', icon: 'bx-receipt', roles: ['admin', 'staff'] },
  { id: 'products', label: 'Sản phẩm', icon: 'bx-box', roles: ['admin', 'staff'] },
  { id: 'flashsale', label: 'Flash Sale', icon: 'bxs-bolt', roles: ['admin'] },
  { id: 'customers', label: 'Khách hàng', icon: 'bx-group', roles: ['admin'] },
  { id: 'employees', label: 'Nhân viên', icon: 'bx-user-pin', roles: ['admin'] },
  { id: 'logs', label: 'Lịch sử hệ thống', icon: 'bx-history', roles: ['admin'] }, // Tab mới cho Admin quản lý nhân viên
  { id: 'revenue', label: 'Doanh thu', icon: 'bx-dollar-circle', roles: ['admin'] },
];

// Lọc tabs theo role của người đang đăng nhập
const tabs = allTabs.filter(t => t.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2"><i className='bx bx-shield-quarter text-beige-primary text-2xl'></i> Admin Panel</h2>
          <p className="text-xs text-slate-400 mt-1 truncate">{currentUser.user?.fullname}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium ${activeTab === t.id ? 'bg-beige-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <i className={`bx ${t.icon} text-lg`}></i> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-colors font-medium">
            <i className="bx bx-log-out text-lg"></i> Về Trang Chủ
          </Link>
        </div>
      </aside>

      {/* Mobile bottom tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 flex z-40 border-t border-slate-700">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-[10px] transition-colors ${activeTab === t.id ? 'text-beige-primary' : 'text-slate-400'}`}>
            <i className={`bx ${t.icon} text-xl`}></i>{t.label}
          </button>
        ))}
        <Link to="/" className="flex-1 py-3 flex flex-col items-center gap-0.5 text-[10px] text-slate-400">
          <i className="bx bx-home text-xl"></i>Trang chủ
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <i className={`bx ${tabs.find(t => t.id === activeTab)?.icon} text-beige-primary`}></i>
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <Link to="/" className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-beige-primary transition-colors">
            <i className="bx bx-home text-lg"></i> Trang chủ
          </Link>
        </div>
        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardTab stats={stats} loading={statsLoading} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'flashsale' && <DealsTab />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'employees' && <EmployeesTab />} 
          {activeTab === 'logs' && <AuditLogsTab />}
          {activeTab === 'revenue' && <RevenueTab />}
        </div>
      </main>
    </div>
  );
}
