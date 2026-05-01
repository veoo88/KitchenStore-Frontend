import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/login?redirect=cart');
      return;
    }
    navigate('/checkout');
  };

  const handleRemove = async (id, name) => {
    const result = await Swal.fire({
      title: 'Xóa sản phẩm?',
      text: `Bạn có chắc muốn xóa "${name}" khỏi giỏ hàng?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#C8A97E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      removeFromCart(id);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã xóa sản phẩm',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen py-12 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
              <Link to="/" className="hover:text-beige-primary">Home</Link>
              <i className='bx bx-chevron-right'></i>
              <span className="text-beige-primary">Shopping Cart</span>
            </nav>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter leading-none">
              Giỏ Hàng <span className="text-beige-primary block md:inline">Của Bạn</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Số lượng</p>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{cartCount} <span className="text-sm font-medium text-gray-400">Sản phẩm</span></p>
             </div>
             <div className="w-[1px] h-10 bg-gray-200 dark:bg-gray-700 mx-2"></div>
             <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-beige-primary transition-colors">
               <i className='bx bx-left-arrow-alt text-xl group-hover:-translate-x-1 transition-transform'></i>
               Tiếp tục mua sắm
             </Link>
          </div>
        </div>

        {cartCount === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 animate-[fade-in-up_0.8s_ease-out]">
            <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <i className='bx bx-shopping-bag text-6xl text-beige-primary animate-bounce'></i>
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-tighter">Bạn chưa chọn được món nào?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">Đừng để giỏ hàng trống trải như vậy. Hãy khám phá hàng ngàn thiết bị nhà bếp cao cấp ngay bây giờ!</p>
            <Link to="/products" className="inline-block bg-black text-white dark:bg-white dark:text-black px-12 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-beige-primary hover:text-white transition-all shadow-xl active:scale-95">
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Products List */}
            <div className="lg:col-span-8 space-y-6">
              {cart.map((item, index) => (
                <div 
                  key={item.id} 
                  data-aos="fade-up" 
                  data-aos-delay={index * 100}
                  className="group bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-2xl hover:border-beige-primary/20 transition-all duration-500 flex flex-col md:flex-row items-center gap-8"
                >
                  <div className="h-40 w-40 shrink-0 overflow-hidden rounded-[2rem] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 transition-transform group-hover:scale-105">
                    <img 
  src={
    item.image && item.image.startsWith('http') 
      ? item.image 
      : (item.image 
          ? `${window.location.origin}${item.image.replace('/images/', '/img/')}` 
          : "https://placehold.co/300x300?text=Product")
  } 
  alt={item.name} 
  className="h-full w-full object-contain" 
/>
                  </div>

                  <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <Link to={`/product/${item.id}`} className="text-xl font-black text-gray-900 dark:text-gray-100 hover:text-beige-primary line-clamp-2 transition-colors uppercase tracking-tight">
                          {item.name}
                        </Link>
                        <p className="text-[10px] font-black text-beige-primary uppercase tracking-widest mt-1">In Stock & Ready to ship</p>
                      </div>
                      <div className="text-2xl font-black text-gray-900 dark:text-gray-100">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 pt-6 border-t border-gray-50 dark:border-gray-700/50">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-800">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-beige-primary hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all"
                        >
                          <i className='bx bx-minus'></i>
                        </button>
                        <span className="w-8 text-center font-black text-gray-900 dark:text-gray-100 text-lg">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-beige-primary hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all"
                        >
                          <i className='bx bx-plus'></i>
                        </button>
                      </div>

                      <button 
                        onClick={() => handleRemove(item.id, item.name)}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors group/del"
                      >
                        <i className='bx bx-trash text-lg group-hover/del:animate-bounce'></i>
                        Xóa khỏi giỏ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar: Summary & Checkout */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-black text-white dark:bg-white dark:text-black rounded-[3rem] p-10 shadow-3xl shadow-beige-primary/20 overflow-hidden relative">
                {/* Abstract pattern decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-beige-primary/20 blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-beige-primary/10 blur-2xl -ml-12 -mb-12"></div>
                
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-10 relative z-10">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-6 mb-12 relative z-10">
                  <div className="flex justify-between items-center opacity-70">
                    <span className="text-sm font-bold uppercase tracking-widest">Tạm tính</span>
                    <span className="text-lg font-bold">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-400 font-bold uppercase tracking-widest text-xs">
                    <span>Phí vận chuyển</span>
                    <span>Free</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/10 dark:bg-black/10"></div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] mb-1">Tổng cộng</span>
                    <div className="text-right">
                       <span className="text-4xl font-black text-beige-primary block">{formatPrice(cartTotal)}</span>
                       <span className="text-[10px] opacity-40 italic">Đã bao gồm VAT & công lắp đặt</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <button 
                    onClick={handleCheckout} 
                    className="w-full bg-beige-primary text-white py-6 rounded-[1.5rem] font-black uppercase text-sm tracking-[0.2em] hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all shadow-2xl transform active:scale-95 flex items-center justify-center gap-3 group"
                  >
                    Tiến hành đặt hàng
                    <i className='bx bx-right-arrow-alt text-2xl group-hover:translate-x-2 transition-transform'></i>
                  </button>
                  <p className="text-[10px] text-center opacity-40 font-bold uppercase tracking-widest">Đảm bảo thanh toán an toàn 100%</p>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 flex items-center gap-4 border border-gray-100 dark:border-gray-800">
                 <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center text-2xl text-beige-primary shadow-sm">
                   <i className='bx bx-check-shield'></i>
                 </div>
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">Chính sách bảo hành</h4>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Đổi trả trong 30 ngày nếu phát sinh lỗi từ nhà sản xuất.</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

