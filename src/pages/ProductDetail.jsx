import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // Thêm dòng này ở các câu lệnh import phía trên




export default function ProductDetail() {

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [selectedSpec, setSelectedSpec] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, relatedRes, reviewsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/related?id=${id}`),
          api.get(`/reviews?productId=${id}`)
        ]);
        setProduct(prodRes.data);
        setRelatedProducts(relatedRes.data || []);
        setReviews(reviewsRes.data || []);
        // Refresh AOS after content is rendered
        setTimeout(() => {
          if (window.AOS) window.AOS.refresh();
        }, 100);
      } catch (error) {
        console.error("Error fetching product details:", error);
        Swal.fire('Lỗi', 'Không thể tải thông tin sản phẩm', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      Swal.fire({
        title: 'Đã thêm vào giỏ!',
        text: `${product.name} đã được thêm vào giỏ hàng của bạn.`,
        icon: 'success',
        confirmButtonColor: '#C8A97E',
        timer: 2000
      });
    }
  };
  const handleBuyNow = () => {
    if (product) {
      addToCart(product); // Vẫn dùng hàm thêm vào giỏ từ Context
      navigate('/cart');  // Điều hướng thẳng đến trang giỏ hàng
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <i className="bx bx-loader-alt bx-spin text-5xl text-beige-primary mb-4"></i>
      <p className="text-gray-500 font-medium">Đang tải tuyệt phẩm...</p>
    </div>
  );

  if (!product) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h2>
      <Link to="/products" className="text-beige-primary font-bold underline">Quay lại danh mục</Link>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="py-6 text-sm text-gray-400 flex items-center gap-2">
          <Link to="/" className="hover:text-beige-primary">Trang chủ</Link>
          <i className='bx bx-chevron-right'></i>
          <Link
            to={`/products?categoryId=${product.categoryId}`}
            className="hover:text-beige-primary"
          >
            Danh mục {product.categoryId} {/* Hiển thị tạm ID hoặc chữ "Sản phẩm" */}
          </Link>
          <i className='bx bx-chevron-right'></i>
          <span className="text-gray-900 dark:text-gray-200 font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
          {/* Left: Product Image Gallery */}
          <div className="lg:col-span-7">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-[3rem] p-8 md:p-16 flex items-center justify-center shadow-inner relative group min-h-[400px]">
              <img
  src={
    product.image && product.image.startsWith('http') 
      ? product.image 
      : (product.image 
          ? `${window.location.origin}${product.image.replace('/images/', '/img/')}` 
          : "https://placehold.co/600x600?text=Kitchen+Premium")
  }
  className="w-full max-w-[500px] object-contain transform group-hover:scale-105 transition-transform duration-700"
  alt={product.name}
/>
              <div className="absolute top-8 right-8">
                <button className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center text-xl text-gray-400 hover:text-red-500 transition-colors">
                  <i className='bx bx-heart'></i>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-beige-primary cursor-pointer transition-all flex items-center justify-center p-2">
                  <img src={
                    product.image && product.image.startsWith('http')
                      ? product.image
                      : (product.image
                          ? `${window.location.origin}${product.image.replace('/images/', '/img/')}`
                          : "https://placehold.co/100x100")
                  } className="w-full h-full object-contain opacity-50 hover:opacity-100" alt="thumbnail" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">New Arrival</span>
                <span className="text-beige-primary text-sm font-bold uppercase">
                  ID: {product.categoryId}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-gray-100 leading-tight tracking-tighter mb-4 capitalize">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(s => <i key={s} className='bx bxs-star'></i>)}
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500 font-medium">128 Đã bán</span>
                <span className="text-gray-400">|</span>
                <span className="text-green-500 font-bold uppercase tracking-widest text-[10px]">Còn hàng</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl font-black text-beige-primary">{formatPrice(product.price)}</span>
                <span className="text-gray-400 line-through text-lg">{formatPrice(product.price * 1.2)}</span>
              </div>
              <p className="text-xs text-gray-500 italic">Giá đã bao gồm thuế VAT & Bảo hành chính hãng 24 tháng</p>
            </div>

            {/* Config Selection (Mock variants) */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Lựa chọn dòng sản phẩm</h3>
              <div className="flex gap-3">
                {['Tiêu chuẩn', 'Cao cấp'].map((opt, i) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedSpec(i)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${selectedSpec === i ? 'border-beige-primary bg-beige-primary/5 text-beige-primary' : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Promotions */}
            <div className="bg-beige-primary/5 rounded-3xl p-6 border border-beige-primary/20">
              <div className="flex items-center gap-2 mb-4 text-beige-primary">
                <i className='bx bxs-gift text-xl'></i>
                <h3 className="font-black uppercase tracking-widest text-xs">Khuyến mãi đặc biệt</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2"><i className='bx bx-check-circle text-beige-primary'></i> Giảm thêm 5% khi thanh toán qua SEPAY.</li>
                <li className="flex gap-2"><i className='bx bx-check-circle text-beige-primary'></i> Tặng voucher 200k cho đơn hàng tiếp theo.</li>
                <li className="flex gap-2"><i className='bx bx-check-circle text-beige-primary'></i> Miễn phí lắp đặt tại nội thành TP.HCM.</li>
              </ul>
            </div>

            {/* Summary Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleBuyNow} // THAY ĐỔI TẠI ĐÂY
                className="bg-black text-white dark:bg-white dark:text-black py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-beige-primary hover:text-white transition-all shadow-xl active:scale-95"
              >
                MUA NGAY
              </button>
              <button
                onClick={handleAddToCart} // Nút này vẫn giữ nguyên để hiện Swal thông báo
                className="border-2 border-black dark:border-white text-black dark:text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-all active:scale-95"
              >
                THÊM VÀO GIỎ
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">Hotline hỗ trợ: 1800 1060 (Miễn phí)</p>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-24 border-t border-gray-100 dark:border-gray-800 pt-16">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3">
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter mb-6">Đánh giá từ khách hàng</h2>
              <div className="bg-beige-primary/5 rounded-[2.5rem] p-10 text-center border border-beige-primary/10">
                <div className="text-6xl font-black text-beige-primary mb-2">
                  {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                </div>
                <div className="flex justify-center text-yellow-400 text-xl mb-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <i key={s} className={`bx ${s <= (reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0) ? 'bxs-star' : 'bx-star'}`}></i>
                  ))}
                </div>
                <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">Dựa trên {reviews.length} nhận xét</p>
              </div>

              {currentUser && (
                <div className="mt-12 p-8 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl">
                  <h3 className="font-black text-gray-900 dark:text-gray-100 mb-6 uppercase tracking-tight">Viết nhận xét của bạn</h3>
                  <div className="flex gap-2 mb-6 text-2xl text-yellow-400 cursor-pointer">
                    {[1, 2, 3, 4, 5].map(s => (
                      <i
                        key={s}
                        className={`bx ${s <= newReview.rating ? 'bxs-star' : 'bx-star'}`}
                        onClick={() => setNewReview({ ...newReview, rating: s })}
                      ></i>
                    ))}
                  </div>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows="4"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-none px-6 py-4 rounded-xl focus:ring-2 focus:ring-beige-primary outline-none transition-all dark:text-white resize-none mb-4 text-sm"
                  ></textarea>
                  <button
                    // Tìm đến hàm onClick của nút GỬI ĐÁNH GIÁ
                    onClick={async () => {
                      setSubmittingReview(true);
                      try {
                        await api.post('/reviews', { productId: parseInt(id), ...newReview });
                        Swal.fire('Thành công', 'Cảm ơn bạn đã đánh giá sản phẩm!', 'success');
                        // ... load lại reviews
                      } catch (err) {
                        // XỬ LÝ LỖI TẠI ĐÂY
                        let message = 'Không thể gửi đánh giá lúc này.';

                        if (err.response?.data === 'already_reviewed' || err.response?.data?.message === 'already_reviewed') {
                          message = 'Bạn đã đánh giá sản phẩm này rồi!';
                        } else if (err.response?.status === 400) {
                          message = 'Bạn cần mua và nhận hàng thành công mới có thể đánh giá.';
                        }

                        Swal.fire({
                          title: 'Thông báo',
                          text: message,
                          icon: 'warning',
                          confirmButtonColor: '#C8A97E'
                        });
                      } finally {
                        setSubmittingReview(false);
                      }
                    }}
                    disabled={submittingReview}
                    className="w-full py-4 bg-beige-primary text-white font-black rounded-xl hover:bg-beige-dark transition-all disabled:opacity-50"
                  >
                    {submittingReview ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
                  </button>
                </div>
              )}
            </div>

            <div className="lg:w-2/3 space-y-8">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={r.id} className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-800 animate-[fade-in-up_0.5s_ease-out]" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-beige-primary text-white rounded-full flex items-center justify-center font-black">
                          {r.userFullname?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-gray-100">{r.userFullname}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map(s => <i key={s} className={`bx ${s <= r.rating ? 'bxs-star' : 'bx-star'}`}></i>)}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light">{r.comment}</p>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                  <i className="bx bx-message-square-detail text-5xl text-gray-300 mb-4"></i>
                  <p className="text-gray-400 italic">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Detailed Specs Tab System */}
        <section className="mt-24 border-t border-gray-100 dark:border-gray-800 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Mô Tả Sản Phẩm</h2>
              <div className="prose dark:prose-invert font-light text-gray-500 dark:text-gray-400 leading-loose">
                <p>{product.description || "Đây là sản phẩm cao cấp được KitchenStore tuyển chọn kỹ lưỡng, mang lại trải nghiệm nấu nướng tuyệt vời nhất cho gia đình bạn. Thiết kế tinh tế kết hợp cùng công nghệ hàng đầu thế giới."}</p>
                <p className="mt-4">Được chế tác từ vật liệu bền bỉ, dễ dàng vệ sinh và tích hợp nhiều tính năng an toàn thông minh, sản phẩm này không chỉ là một thiết bị gia dụng mà còn là điểm nhấn thẩm mỹ cho không gian bếp hiện đại.</p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Thông Số Kỹ Thuật</h2>
              <div className="overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { k: 'Thương hiệu', v: 'Hafele (Đức)' },
                      { k: 'Công suất', v: '2000W - 3500W' },
                      { k: 'Kích thước', v: '770 x 450 x 68 mm' },
                      { k: 'Vật liệu', v: 'Kính Ceramic cao cấp' },
                      { k: 'Tính năng', v: 'Hẹn giờ, Khóa trẻ em, Booster' },
                      { k: 'Bảo hành', v: '24 tháng tại nhà' }
                    ].map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/30' : 'bg-white dark:bg-gray-900'}>
                        <td className="px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">{spec.k}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-gray-200 font-medium">{spec.v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Similar Products */}
        <section className="mt-24 pb-20">
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-12 uppercase tracking-tighter text-center">Có Thể Bạn Cũng Thích</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.length > 0 ? (
              relatedProducts.map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="group">
                  <div className="aspect-square bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] p-6 mb-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        p.image && p.image.startsWith('http')
                          ? p.image
                          : (p.image
                              ? `${window.location.origin}${p.image.replace('/images/', '/img/')}`
                              : "https://placehold.co/300x300?text=Product")
                      }
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                      alt={p.name}
                    />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-beige-primary transition-colors line-clamp-2 min-h-[40px]">{p.name}</h4>
                  <p className="text-beige-primary font-black mt-1">{formatPrice(p.price)}</p>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 italic">Chưa có sản phẩm liên quan.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
