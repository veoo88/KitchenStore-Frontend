import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function Checkout() {
  const { cart, cartTotal, clearCart, cartCount } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: currentUser?.user?.fullname || '', // Thêm .user vào giữa
    email: currentUser?.user?.email || '',       // Thêm .user vào giữa
    phone: currentUser?.user?.phone || '',       // Thêm .user vào giữa
    address: currentUser?.user?.address || '',   // Thêm .user vào giữa
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('null');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Polling for SePay payment status
  useEffect(() => {
    let interval;
    if (orderSuccess && paymentMethod === 'sepay' && !paymentConfirmed) {
      interval = setInterval(async () => {
        try {
          const response = await api.get(`/sepay/check/${orderSuccess.id}`);
          if (response.data.paymentStatus === 'paid') {
            setPaymentConfirmed(true);
            clearInterval(interval);
            Swal.fire({
              title: 'Thanh toán thành công!',
              text: 'Chúng tôi đã nhận được thanh toán của bạn.',
              icon: 'success',
              confirmButtonColor: '#C8A97E',
              timer: 3000
            });
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000); // Poll every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderSuccess, paymentMethod, paymentConfirmed]);

  useEffect(() => {
    if (cartCount === 0 && !orderSuccess) {
      navigate('/cart');
    }
  }, [cartCount, navigate, orderSuccess]);
  useEffect(() => {
  if (currentUser && currentUser.user) {
    const { user } = currentUser; // Lấy object user ra
    setFormData(prev => ({
      ...prev,
      fullname: user.fullname || prev.fullname,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      address: user.address || prev.address,
    }));
  }
}, [currentUser]);
  const handleChange = (e) => {
  const { name, value } = e.target;

  // Ràng buộc riêng cho ô số điện thoại
  if (name === 'phone') {
    // Chỉ cho phép nhập số và tối đa 10 ký tự
    if (!/^\d*$/.test(value) || value.length > 10) return;
  }

  setFormData({ ...formData, [name]: value });
};
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Kiểm tra phương thức thanh toán đã chọn chưa
  if (paymentMethod === 'null') {
    return Swal.fire('Lỗi', 'Vui lòng chọn phương thức thanh toán', 'error');
  }

  // KIỂM TRA SỐ ĐIỆN THOẠI (10 số, bắt đầu bằng 0)
  const vnf_regex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  if (!vnf_regex.test(formData.phone)) {
    return Swal.fire({
      icon: 'error',
      title: 'Số điện thoại không hợp lệ',
      text: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng các đầu số Việt Nam (03, 05, 07, 08, 09).',
      confirmButtonColor: '#C8A97E'
    });
  }
    setLoading(true);

    try {
      const orderData = {
        userId: currentUser?.id || 0,
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        note: formData.note,
        paymentMethod: paymentMethod,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      };

      const response = await api.post('/orders', orderData);
      const { order_id } = response.data;

      if (paymentMethod === 'cod') {
        Swal.fire({
          title: 'Đặt hàng thành công!',
          text: 'Đơn hàng của bạn đang được xử lý.',
          icon: 'success',
          confirmButtonColor: '#C8A97E'
        }).then(() => {
          clearCart();
          navigate('/orders');
        });
      } else {
        // SePay QR Flow
        setOrderSuccess({ id: order_id, total: cartTotal });
        clearCart();
      }
    } catch (error) {
      console.error("Checkout error:", error);
      Swal.fire('Lỗi', error.response?.data?.message || 'Không thể tạo đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    const bankId = "MBBank";
    const accNum = "0328441162";
    const qrUrl = `https://qr.sepay.vn/img?bank=${bankId}&acc=${accNum}&amount=${orderSuccess.total}&des=DH${orderSuccess.id}&template=compact`;

    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen py-20 flex items-center justify-center animate-[fade-in_0.5s_ease-out]">
        <div className="max-w-2xl w-full mx-4 bg-gray-50 dark:bg-gray-800 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
          {paymentConfirmed && (
            <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 z-20 flex flex-col items-center justify-center animate-[fade-in_0.3s_ease-out]">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 text-white text-5xl shadow-2xl animate-bounce">
                <i className='bx bx-check'></i>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter mb-4">Thanh toán hoàn tất!</h2>
              <p className="text-gray-500 mb-8 font-bold">Cảm ơn bạn đã tin tưởng KitchenStore.</p>
              <div className="flex gap-4">
                <Link to="/" className="bg-gray-200 dark:bg-gray-700 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Trang chủ</Link>
                <Link to="/orders" className="bg-beige-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Đơn hàng</Link>
              </div>
            </div>
          )}

          <div className="w-20 h-20 bg-beige-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white text-4xl shadow-lg ring-8 ring-beige-primary/10">
            <i className='bx bx-receipt'></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-tighter">Đơn hàng đã được tạo!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium italic">Vui lòng thanh toán để hoàn tất đơn hàng #DH{orderSuccess.id}</p>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 mb-8 border-2 border-beige-primary/10 shadow-inner relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Đang chờ thanh toán...</span>
            </div>

            <p className="text-[10px] font-black text-beige-primary uppercase tracking-[0.25em] mb-6">Quét mã QR để xác nhận ngay lập tức</p>
            <div className="bg-white p-6 rounded-[2rem] inline-block mb-6 border-4 border-beige-primary/5 shadow-2xl">
              <img src={qrUrl} alt="QR Payment" className="w-[280px] h-auto" />
            </div>

            <div className="space-y-4 text-left max-w-sm mx-auto bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-widest">Số tiền</span>
                <span className="text-2xl font-black text-beige-primary">{formatPrice(orderSuccess.total)}</span>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400 font-bold uppercase">Ngân hàng</span>
                <span className="text-gray-900 dark:text-gray-100 font-black">{bankId}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400 font-bold uppercase">Nội dung</span>
                <span className="text-beige-primary font-black">DH{orderSuccess.id}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed font-bold uppercase tracking-tight">
                <i className='bx bx-info-circle mr-1'></i>
                Hệ thống sẽ tự động xác nhận sau khi nhận được tiền. Vui lòng không đóng trang này.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/" className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-300 transition-all">
                Hủy & Về trang chủ
              </Link>
              <Link to="/orders" className="flex-1 bg-black text-white dark:bg-white dark:text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl">
                Quản lý đơn hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-5xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter mb-4">
            Thanh <span className="text-beige-primary">Toán</span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <span>Giỏ hàng</span>
            <i className='bx bx-chevron-right text-lg'></i>
            <span className="text-beige-primary border-b-2 border-beige-primary pb-1">Thông tin vận chuyển</span>
            <i className='bx bx-chevron-right text-lg'></i>
            <span>Hoàn tất</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8" data-aos="fade-right">
            <section className="bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter mb-8 flex items-center gap-3">
                <i className='bx bx-map-pin text-beige-primary text-3xl'></i>
                Địa chỉ nhận hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Họ & Tên</label>
                  <input
                    required
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 focus:border-beige-primary rounded-2xl p-4 text-gray-900 dark:text-gray-100 outline-none transition-all font-bold placeholder:font-medium text-sm"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Số điện thoại</label>
                  <div className="relative">
                    <input
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full bg-white dark:bg-gray-900 border-2 focus:border-beige-primary rounded-2xl p-4 text-gray-900 dark:text-gray-100 outline-none transition-all font-bold placeholder:font-medium text-sm
                        ${formData.phone && formData.phone.length > 0 && formData.phone.length < 10 ? 'border-red-400 ring-1 ring-red-100' : 'border-gray-100 dark:border-gray-700'}`}
                      placeholder="09xx xxx xxx"
                    />
                    {/* Cảnh báo nhỏ khi chưa đủ 10 số */}
                    {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                      <span className="text-[9px] text-red-500 absolute -bottom-5 left-2 font-black uppercase tracking-tighter animate-pulse">
                        Nhập đủ 10 chữ số
                      </span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 focus:border-beige-primary rounded-2xl p-4 text-gray-900 dark:text-gray-100 outline-none transition-all font-bold placeholder:font-medium text-sm"
                    placeholder="email@vidu.com"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Địa chỉ giao hàng</label>
                  <textarea
                    required
                    rows="3"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 focus:border-beige-primary rounded-2xl p-4 text-gray-900 dark:text-gray-100 outline-none transition-all font-bold placeholder:font-medium resize-none text-sm"
                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Ghi chú đơn hàng (Tùy chọn)</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 focus:border-beige-primary rounded-2xl p-4 text-gray-900 dark:text-gray-100 outline-none transition-all font-bold placeholder:font-medium resize-none text-sm"
                    placeholder="Lưu ý cho người giao hàng..."
                  />
                </div>
              </div>
            </section>

            <section className="bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter mb-8 flex items-center gap-3">
                <i className='bx bx-credit-card text-beige-primary text-3xl'></i>
                Phương thức thanh toán
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`cursor-pointer group relative bg-white dark:bg-gray-900 p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-beige-primary shadow-lg ring-4 ring-beige-primary/5' : 'border-gray-100 dark:border-gray-700 hover:border-beige-primary/20'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${paymentMethod === 'cod' ? 'bg-beige-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <i className='bx bx-package'></i>
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight text-sm">Ship COD</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Thanh toán khi nhận hàng</p>
                    </div>
                    {paymentMethod === 'cod' && <i className='bx bxs-check-circle text-beige-primary text-2xl ml-auto'></i>}
                  </div>
                </label>

                <label className={`cursor-pointer group relative bg-white dark:bg-gray-900 p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'sepay' ? 'border-beige-primary shadow-lg ring-4 ring-beige-primary/5' : 'border-gray-100 dark:border-gray-700 hover:border-beige-primary/20'}`}>
                  <input type="radio" name="payment" value="sepay" checked={paymentMethod === 'sepay'} onChange={() => setPaymentMethod('sepay')} className="hidden" />
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${paymentMethod === 'sepay' ? 'bg-beige-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <i className='bx bx-qr-scan'></i>
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight text-sm">QR Ngân Hàng</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tự động x2 tốc độ xác nhận</p>
                    </div>
                    {paymentMethod === 'sepay' && <i className='bx bxs-check-circle text-beige-primary text-2xl ml-auto'></i>}
                  </div>
                  <div className="absolute -top-3 -right-2 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest animate-pulse">Khuyên dùng</div>
                </label>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 sticky top-24" data-aos="fade-left">
            <div className="bg-black text-white dark:bg-white dark:text-black rounded-[3.5rem] p-10 shadow-3xl shadow-beige-primary/20 relative overflow-hidden">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 relative z-10">Đơn hàng của bạn</h2>

              <div className="max-h-[250px] overflow-y-auto pr-4 mb-8 custom-scrollbar relative z-10">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 mb-6 group border-b border-white/5 dark:border-black/5 pb-6 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-2xl p-2 shrink-0 border border-white/10 overflow-hidden shadow-lg">
                      <img
                        src={item.image && item.image.startsWith('http') ? item.image : (item.image ? `http://localhost:5256${item.image}` : "https://placehold.co/100x100")}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-tight truncate mb-1">{item.name}</h4>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] opacity-60">x {item.quantity}</p>
                        <span className="font-black text-sm text-beige-primary">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-white/10 dark:border-black/10 pt-8 mb-8 relative z-10">
                <div className="flex justify-between items-center opacity-60 text-xs font-bold uppercase tracking-widest">
                  <span>Tạm tính</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center opacity-60 text-xs font-bold uppercase tracking-widest">
                  <span>Vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-sm font-bold uppercase tracking-[0.2em] mb-1">Tổng cộng</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-beige-primary block tabular-nums tracking-tighter">{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              </div>

              <button
                disabled={loading || cartCount === 0}
                className={`w-full py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 relative z-10 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-beige-primary text-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white'}`}
              >
                {loading ? (
                  <><i className='bx bx-loader-alt bx-spin'></i> Đang xử lý...</>
                ) : (
                  <>Xác nhận đặt hàng <i className='bx bx-check-double text-2xl'></i></>
                )}
              </button>
            </div>

            <div className="mt-8 bg-beige-primary/5 rounded-[2rem] p-6 border border-beige-primary/10">
              <div className="flex items-center gap-3 text-beige-primary mb-2">
                <i className='bx bxs-lock-alt text-xl'></i>
                <h4 className="text-[10px] font-black uppercase tracking-widest">Cam kết bảo mật</h4>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">KitchenStore sử dụng công nghệ mã hóa SSL 256-bit để bảo vệ thông tin cá nhân và dữ liệu thanh toán của khách hàng.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
