import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import Swal from 'sweetalert2';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { addToCart } = useCart();

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Đã thêm vào giỏ hàng',
      showConfirmButton: false,
      timer: 1500,
      customClass: { popup: 'rounded-2xl shadow-xl border border-gray-100' }
    });
  };

  const getCategoryBg = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('bếp') || n.includes('từ')) return '/img/banner15.jpg';
    if (n.includes('hút') || n.includes('mùi')) return '/img/banner2.jpg';
    if (n.includes('nồi') || n.includes('chảo') || n.includes('dụng cụ')) return '/img/banner1.jpg';
    return '/img/banner4.jpg'; // fallback
  };

  const banners = [
    { id: 1, image: '/img/banner2.jpg', title: 'Thiết kế bếp hiện đại', sub: 'Nâng tầm không gian sống với thiết bị cao cấp' },
    { id: 2, image: '/img/banner15.jpg', title: 'Công nghệ nấu nướng mới', sub: 'Tiết kiệm 30% thời gian với bếp từ thông minh' },
    { id: 3, image: '/img/banner1.jpg', title: 'Ưu đãi hè rực rỡ', sub: 'Giảm giá cực sốc lên đến 50% toàn bộ phụ kiện' },
  ];

  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, dealRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=50'),
          api.get('/deals')
        ]);
        
        const prodItems = prodRes.data?.items || [];
        
        if (Array.isArray(catRes.data)) {
          const catsWithImages = catRes.data.slice(0, 6).map(cat => {
            // Sau khi chuẩn hóa DB, p.categoryId là int FK thay vì chuỗi tên
            const product = prodItems.find(p => p.categoryId === cat.id || p.category?.id === cat.id);
            return {
              ...cat,
              displayImage: product?.image || cat.image || null
            };
          });
          setCategories(catsWithImages);
        }
        
        setFeaturedProducts(prodItems.slice(0, 8));
        setFlashSaleProducts(dealRes.data || []);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Banner interval
    const bannerTimer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else {
          s = 59;
          if (m > 0) m--;
          else {
            m = 59;
            if (h > 0) h--;
          }
        }
        return { h, m, s };
      });
    }, 1000);

    return () => {
      clearInterval(bannerTimer);
      clearInterval(countdownTimer);
    };
  }, [banners.length]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* ─── Premium Dynamic Banner ─── */}
      <section className="relative h-[400px] md:h-[550px] overflow-hidden rounded-[2.5rem] mt-4 mx-4 shadow-2xl">
        {banners.map((banner, idx) => (
          <div 
            key={banner.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out flex items-center ${idx === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
          >
            <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10"></div>
            
            <div className="relative z-20 container mx-auto px-12 text-white max-w-4xl" data-aos={idx === currentBanner ? "fade-right" : ""}>
              <span className="inline-block px-4 py-1 rounded-full border border-beige-primary text-beige-primary text-xs font-bold uppercase tracking-widest mb-6">Premium Kitchen</span>
              <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight drop-shadow-lg uppercase tracking-tighter">
                {banner.title.split(' ').map((word, i) => i === 2 ? <span key={i} className="text-beige-primary block">{word} </span> : word + ' ')}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-10 font-light opacity-80">{banner.sub}</p>
              <Link to="/products" className="bg-beige-primary text-white px-10 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:bg-white hover:text-beige-primary transition-all duration-300 shadow-xl inline-block">
                Khám Phá Ngay
              </Link>
            </div>
          </div>
        ))}
        
        {/* Banner Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {banners.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentBanner(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentBanner ? 'w-12 bg-beige-primary' : 'w-4 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </section>

      {/* ─── Flashsale Section (Topzone Style) ─── */}
      <section className="container mx-auto px-4 max-w-7xl">
        <div className="bg-gray-950 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(33,33,33,0.5)]">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <i className='bx bxs-bolt-circle text-[15rem] text-yellow-400 animate-pulse'></i>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 relative z-10 gap-8">
            <div className="flex items-center gap-6">
              <div className="bg-yellow-400 text-black px-6 py-2 rounded-2xl font-black text-2xl uppercase skew-x-[-10deg] flex items-center gap-2 shadow-lg animation-bounce">
                 <i className='bx bxs-bolt text-3xl'></i> FLASH SALE
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="text-gray-500 text-sm font-bold uppercase tracking-widest mr-2">Kết thúc sau:</span>
                <div className="flex gap-2">
                  {[timeLeft.h, timeLeft.m, timeLeft.s].map((t, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border border-white/5">
                        {String(t).padStart(2, '0')}
                      </div>
                      {i < 2 && <span className="font-bold text-yellow-400">:</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/products" className="text-white border-b-2 border-yellow-400 pb-1 font-black text-sm uppercase tracking-widest hover:text-yellow-400 transition-colors">
              Xem tất cả deal hời
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {flashSaleProducts.length > 0 ? flashSaleProducts.map((p) => {
              const prod = p.product || p; // Handle both deal object and direct product object for safety
              const originalPrice = prod.originalPrice || (prod.price / (1 - (p.discountPercent || 20) / 100));
              return (
              <div key={p.id} className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-all duration-500 group">
                <div className="relative aspect-square mb-6 overflow-hidden rounded-2xl bg-white/5 flex items-center justify-center p-4">
                  <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-black px-2 py-1 rounded uppercase z-10">Tiết kiệm {formatPrice(originalPrice - prod.price)}</span>
                  <Link to={`/product/${prod.id}`} className="w-full h-full flex items-center justify-center">
                    <img 
  src={
    prod.image && prod.image.startsWith('http') 
      ? prod.image 
      : (prod.image 
          ? `${window.location.origin}${prod.image.replace('/images/', '/img/')}` 
          : "https://placehold.co/300x300?text=Kitchen")
  } 
  alt={prod.name} 
  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
/>
                  </Link>
                </div>
                <h3 className="text-white font-bold text-sm mb-4 line-clamp-2 min-h-[40px] leading-snug tracking-tight opacity-90 group-hover:opacity-100 transition-opacity">
                  <Link to={`/product/${prod.id}`}>{prod.name}</Link>
                </h3>
                <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 line-through mb-1">{formatPrice(originalPrice)}</span>
                    <span className="text-yellow-400 font-black text-lg">{formatPrice(prod.price)}</span>
                  </div>
                  <button onClick={(e) => handleAddToCart(prod, e)} className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors tooltip relative group/btn z-20">
                    <i className='bx bx-plus text-xl'></i>
                  </button>
                </div>
              </div>
              );
            }) : (
              <div className="col-span-full border-2 border-dashed border-white/10 rounded-3xl py-12 flex flex-col items-center justify-center text-gray-500">
                <i className='bx bx-purchase-tag text-5xl mb-4'></i>
                <p>Đang chuẩn bị các deal mới...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Highlights Categories ─── */}
      <section className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Danh Mục Cốt Lõi</h2>
            <p className="text-gray-400 font-light mt-1">Lựa chọn hàng đầu cho căn bếp 2026</p>
          </div>
          <div className="w-24 h-[2px] bg-beige-primary hidden md:block"></div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10"><i className="bx bx-loader-alt bx-spin text-4xl text-beige-primary"></i></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, idx) => (
              <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`} className="group" data-aos="fade-up" data-aos-delay={idx * 50}>
                 <div className="relative overflow-hidden rounded-[2rem] aspect-square shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-500 bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 flex items-center justify-center p-6">
                    <img 
  src={
    cat.displayImage && cat.displayImage.startsWith('http') 
      ? cat.displayImage 
      : (cat.displayImage 
          ? `${window.location.origin}${cat.displayImage.replace('/images/', '/img/')}` 
          : getCategoryBg(cat.name))
  } 
  alt={cat.name} 
  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500 drop-shadow-xl" 
/>
                 </div>
                 <h3 className="mt-4 text-center font-black text-sm uppercase tracking-widest text-gray-700 dark:text-gray-300 group-hover:text-beige-primary transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── Modern Featured Products (Topzone Style Grid) ─── */}
      <section className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-end mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Sản Phẩm Đẳng Cấp</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-8 h-1 bg-beige-primary rounded-full"></span>
              <p className="text-gray-400 font-light text-sm uppercase tracking-[0.2em]">Curated Selection</p>
            </div>
          </div>
          <Link to="/products" className="text-beige-primary font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">
            Khám phá trọn bộ <i className='bx bx-right-arrow-alt text-xl'></i>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><i className="bx bx-loader-alt bx-spin text-4xl text-beige-primary"></i></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {featuredProducts.map((product, idx) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden group" data-aos="fade-up" data-aos-delay={idx * 50}>
                <div className="relative p-6 h-[250px] flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50">
                   <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                      <span className="bg-black text-white text-[9px] font-black uppercase px-2 py-1.5 leading-none rounded drop-shadow-md">New 2026</span>
                      {product.isFeatured && <span className="bg-beige-primary text-white text-[9px] font-black uppercase px-2 py-1.5 leading-none rounded drop-shadow-md">Editor's Choice</span>}
                   </div>
                   <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center z-10 cursor-pointer">
                    <img 
  src={
    product.image && product.image.startsWith('http') 
      ? product.image 
      : (product.image 
          ? `${window.location.origin}${product.image.replace('/images/', '/img/')}` 
          : "https://placehold.co/300x300?text=Equip")
  } 
  alt={product.name} 
  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
/>
                   </Link>
                </div>
                
                <div className="p-6">
                  <span className="text-[10px] font-black text-beige-primary uppercase tracking-[0.2em] mb-2 block">{product.category?.name || 'Kitchenware'}</span>
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2 leading-tight tracking-tighter line-clamp-2 min-h-[50px] hover:text-beige-primary transition-colors cursor-pointer capitalize">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  <div className="flex items-center gap-1 mb-4 opacity-60">
                    {[1,2,3,4,5].map(s => <i key={s} className='bx bxs-star text-yellow-400 text-[10px]'></i>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-beige-primary">{formatPrice(product.price)}</p>
                    <button onClick={(e) => handleAddToCart(product, e)} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all relative z-20 group-hover:shadow-md">
                      <i className='bx bx-shopping-bag text-lg'></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Premium Call to Action ─── */}
      <section className="container mx-auto px-4 max-w-7xl pt-10">
        <div className="bg-beige-primary rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 max-w-2xl text-center md:text-left">
             <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter">Kiến Tạo Gian Bếp <br/> Đẳng Cấp Thượng Lưu</h2>
             <p className="text-xl font-light opacity-90 mb-10 leading-relaxed text-beige-bg">Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn lựa chọn những thiết bị tối ưu nhất.</p>
             <div className="flex flex-col sm:flex-row gap-4">
               <Link to="/contact" className="bg-white text-beige-primary px-10 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-all shadow-xl text-center">Liên hệ tư vấn</Link>
               <Link to="/about" className="bg-transparent border-2 border-white/30 text-white px-10 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-all text-center">Câu chuyện của chúng tôi</Link>
             </div>
          </div>
          
          <div className="relative z-10 hidden lg:block">
             <div className="w-64 h-64 border-4 border-white/20 rounded-[4rem] rotate-12 flex items-center justify-center overflow-hidden">
                <img src="/img/banner4.jpg" className="w-full h-full object-cover scale-125" alt="CTA" />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

