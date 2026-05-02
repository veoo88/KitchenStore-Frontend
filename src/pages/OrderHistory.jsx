import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import { formatPrice, formatDate } from '../utils/format';
import { useCart } from '../contexts/CartContext';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'confirmed', label: 'Đang xử lý' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'delivered', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' }
];

export default function OrderHistory() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Xác nhận hủy đơn?',
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C8A97E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý hủy',
      cancelButtonText: 'Quay lại'
    });

    if (result.isConfirmed) {
      try {
        await api.patch('/orders/cancel', { id: orderId });
        Swal.fire(
          'Đã hủy!',
          'Đơn hàng của bạn đã được hủy thành công.',
          'success'
        );
        fetchOrders();
      } catch (error) {
        Swal.fire(
          'Lỗi!',
          error.response?.data?.message || 'Không thể hủy đơn hàng này.',
          'error'
        );
      }
    }
  };

  const getStatusInfo = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending': return { text: 'Chờ xác nhận', color: 'text-orange-500', icon: 'bx-time-five', bg: 'bg-orange-50' };
      case 'confirmed': return { text: 'Đang xử lý', color: 'text-blue-500', icon: 'bx-package', bg: 'bg-blue-50' };
      case 'shipping': return { text: 'Đang giao hàng', color: 'text-indigo-500', icon: 'bx-truck', bg: 'bg-indigo-50' };
      case 'delivered': return { text: 'Hoàn thành', color: 'text-green-500', icon: 'bx-check-double', bg: 'bg-green-50' };
      case 'cancelled': return { text: 'Đã hủy', color: 'text-red-500', icon: 'bx-x-circle', bg: 'bg-red-50' };
      default: return { text: status, color: 'text-gray-500', icon: 'bx-receipt', bg: 'bg-gray-50' };
    }
  };
  const handleReorder = async (orderItems) => {
    orderItems.forEach(item => {
      addToCart({
        id: item.productId, // Đảm bảo key này khớp với cấu trúc item trong CartContext
        name: item.productName,
        price: item.price,
        image: item.productImage,
        quantity: 1
      });
    });

    await Swal.fire({
      icon: 'success',
      title: 'Đã thêm vào giỏ hàng',
      text: 'Các sản phẩm đã được chuẩn bị trong giỏ hàng của bạn.',
      confirmButtonColor: '#C8A97E',
    });
    navigate('/cart');
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status?.toLowerCase() === activeTab;
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12" data-aos="fade-down">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter mb-2">Đơn hàng <span className="text-beige-primary">của tôi</span></h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium italic">Theo dõi hành trình đơn hàng tại KitchenStore</p>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-beige-primary hover:text-black dark:hover:text-white transition-all">
            <i className='bx bx-plus-circle text-xl'></i>
            Mua sắm thêm
          </Link>
        </div>

        {/* Tabs - Shopee Style */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 overflow-x-auto no-scrollbar sticky top-24 z-30" data-aos="fade-up">
          <div className="flex min-w-max p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'text-beige-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-beige-primary rounded-full animate-[tab-slide_0.3s_ease-out]"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <i className='bx bx-loader-alt bx-spin text-5xl text-beige-primary'></i>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Đang tải đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-20 text-center border border-gray-100 dark:border-gray-800" data-aos="zoom-in">
              <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <i className='bx bx-receipt text-6xl text-gray-200 dark:text-gray-700'></i>
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter mb-2">Chưa có đơn hàng</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium italic">Có vẻ như bạn chưa đặt mua sản phẩm nào trong mục này.</p>
              <Link to="/products" className="inline-block bg-beige-primary text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl">
                Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            filteredOrders.map((order, idx) => {
              const status = getStatusInfo(order.status);
              return (
                <div key={order.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-2xl hover:shadow-beige-primary/5 transition-all duration-500" data-aos="fade-up" data-aos-delay={idx * 50}>
                  {/* Card Header */}
                  <div className="p-6 md:px-8 border-b border-gray-50 dark:border-gray-800 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black">
                        <i className='bx bxs-store text-xl'></i>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">KitchenStore</span>
                      <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                      <span className="text-[10px] items-center gap-1 text-gray-400 font-bold uppercase">#{order.id}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${status.color} font-black text-[10px] uppercase tracking-widest ${status.bg} px-4 py-2 rounded-full`}>
                      <i className={`bx ${status.icon} text-lg`}></i>
                      {status.text}
                    </div>
                  </div>

                  {/* Card Body - Items */}
                  <div className="p-6 md:p-8 space-y-6">
                    {order.orderItems?.map(item => (
                      <div key={item.id} className="flex gap-6 items-start">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 shrink-0 border border-gray-100 dark:border-gray-700">
                         // Logic này sẽ "gọt" bỏ mọi đường dẫn sai và ép về thư mục /img/
                          <img 
                            src={
                              item.productImage 
                                ? `/img/${item.productImage.split('/').pop()}` 
                                : "https://placehold.co/100x100"
                            }
                            className="w-full h-full object-contain"
                            alt={item.productName}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight line-clamp-2 mb-1">{item.productName}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Số lượng: x{item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-beige-primary">{formatPrice(item.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 md:px-8 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-widest italic">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                      {order.paymentStatus === 'paid' && (
                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Đã thanh toán</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-8">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Thành tiền</span>
                        <span className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">{formatPrice(order.totalAmount)}</span>
                      </div>
                      <div className="flex gap-2">
                        {/* 1. Nút Đánh giá: Chỉ hiện khi trạng thái là 'delivered' (Hoàn thành) */}
                        {order.status?.toLowerCase() === 'delivered' && (
                          <button
                            onClick={() => {
                              // Giả sử bạn lấy sản phẩm đầu tiên trong đơn hàng để đánh giá
                              const firstProductId = order.orderItems[0]?.productId;
                              if (firstProductId) {
                                navigate(`/product/${firstProductId}#reviews`);
                              }
                            }}
                            className="bg-white border border-beige-primary text-beige-primary px-6 py-4 rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest hover:bg-beige-primary hover:text-white transition-all active:scale-95"
                          >
                            Đánh giá
                          </button>
                        )}

                        {/* Logic hiển thị nút thứ 2 */}
                        {(() => {
                          const status = order.status?.toLowerCase();
                          const method = order.paymentMethod?.toLowerCase();

                          // Nếu đơn hàng đã bị Hủy hoặc Hoàn tiền thì không hiện thêm nút gì nữa
                          if (status === 'cancelled' || status === 'refunded') return null;

                          // Nếu là COD và đang chờ duyệt -> Hiện nút Hủy
                          if (method === 'cod' && status === 'pending') {
                            return (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="border border-red-500/50 text-red-500 px-6 py-3 rounded-xl font-bold uppercase text-[11px] tracking-wider hover:bg-red-500 hover:text-white transition-all"
                              >
                                Hủy đơn
                              </button>
                            );
                          }

                          // TẤT CẢ CÁC TRƯỜNG HỢP CÒN LẠI (Sepay, đã thanh toán, hoặc đang xử lý)
                          // Hiện nút Liên hệ để an toàn cho chủ shop
                          return (
                            <a
                              href="https://zalo.me/0328441162"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="border border-blue-500/50 text-blue-400 px-6 py-3 rounded-xl font-bold uppercase text-[11px] tracking-wider hover:bg-blue-500 hover:text-white transition-all flex items-center"
                            >
                              Liên hệ hỗ trợ
                            </a>
                          );
                        })()}


                        {(order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'cancelled') && (
                          <button
                            onClick={() => handleReorder(order.orderItems)}
                            className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest hover:bg-beige-primary hover:text-white transition-all shadow-xl active:scale-95"
                          >
                            Mua lại
                          </button>
                        )}

                        {/* 4. Nút Chi tiết: Giữ nguyên logic của bạn */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-4 rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest hover:bg-gray-300 transition-all active:scale-95"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-[scale-in_0.3s_ease-out] border border-gray-100 dark:border-gray-800">
              <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Chi tiết đơn hàng</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{selectedOrder.id} — {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all">
                  <i className='bx bx-x text-3xl'></i>
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-beige-primary">Thông tin vận chuyển</h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{selectedOrder.fullname}</p>
                      <p className="text-gray-500">{selectedOrder.phone}</p>
                      <p className="text-gray-500 leading-relaxed">{selectedOrder.address}</p>
                      {selectedOrder.note && <p className="text-xs italic text-orange-500 mt-2">Ghi chú: {selectedOrder.note}</p>}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-beige-primary">Thanh toán</h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-bold text-gray-900 dark:text-gray-100 uppercase">{selectedOrder.paymentMethod}</p>
                      <p className="flex items-center gap-2">
                        Trạng thái:
                        <span className={`font-black uppercase text-[10px] tracking-widest ${selectedOrder.paymentStatus === 'paid' ? 'text-green-500' : 'text-orange-500'}`}>
                          {selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-beige-primary">Danh sách sản phẩm</h4>
                  <div className="space-y-4">
                    {selectedOrder.orderItems?.map(item => (
                      <div key={item.id} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-xl p-2 shrink-0 overflow-hidden border border-gray-100 dark:border-gray-800">
                          // Logic này sẽ "gọt" bỏ mọi đường dẫn sai và ép về thư mục /img/
                          <img 
                            src={
                              item.productImage 
                                ? `/img/${item.productImage.split('/').pop()}` 
                                : "https://placehold.co/100x100"
                            }
                            className="w-full h-full object-contain"
                            alt={item.productName}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight line-clamp-1">{item.productName}</h5>
                          <p className="text-[10px] text-gray-400">Số lượng: x{item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-beige-primary">{formatPrice(item.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tổng cộng</p>
                    <p className="text-3xl font-black text-beige-primary tracking-tighter">{formatPrice(selectedOrder.totalAmount)}</p>
                  </div>
                  <div className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest ${getStatusInfo(selectedOrder.status).bg} ${getStatusInfo(selectedOrder.status).color}`}>
                    {getStatusInfo(selectedOrder.status).text}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
