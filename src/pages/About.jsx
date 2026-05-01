import { Link } from 'react-router-dom';

export default function About() {
  const values = [
    { icon: 'bx-shield-quarter', title: 'Chất Lượng Vượt Trội', desc: '100% sản phẩm nhập khẩu chính hãng, qua kiểm duyệt khắt khe từ các thương hiệu hàng đầu.' },
    { icon: 'bx-heart', title: 'Tận Tâm Tận Lực', desc: 'Dịch vụ chăm sóc khách hàng 24/7, luôn đồng hành cùng gia đình bạn trong suốt quá trình sử dụng.' },
    { icon: 'bx-diamond', title: 'Thiết Kế Đẳng Cấp', desc: 'Sản phẩm không chỉ tiện dụng mà còn là tác phẩm nghệ thuật tôn vinh không gian sống.' }
  ];

  const partners = [
    { name: 'Hafele', logo: '/img/hafele-logo.jpg' },
    { name: 'Panasonic', logo: '/img/panasonic-logo.jpg' },
    { name: 'Electrolux', logo: '/img/electrolux-logo.jpg' },
    { name: 'Samsung', logo: '/img/samsung-logo.jpg' },
    { name: 'Philips', logo: '/img/philips-logo.jpg' }
  ];

  return (
    <div className="bg-[#FCFAFA] dark:bg-gray-900 min-h-screen font-sans selection:bg-beige-primary/30">
      
      {/* ─── Hero Section (Full Viewport) ─── */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-10"></div>
          <img 
            src="/img/banner2.jpg" 
            alt="Premium Kitchen" 
            className="w-full h-full object-cover transform scale-105"
          />
        </div>
        
        <div className="relative z-20 container mx-auto px-6 text-center text-white" data-aos="zoom-out">
          <span className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold tracking-widest uppercase mb-8">
            Established 2015
          </span>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
            Kitchen<span className="text-beige-primary">Store</span><br/>
            <span className="text-4xl md:text-5xl font-light italic lowercase tracking-normal">Premium Lifestyle</span>
          </h1>
          <p className="text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed opacity-90 mb-12">
            Nơi hội tụ những tinh hoa công nghệ và nghệ thuật thiết kế dành riêng cho trái tim của ngôi nhà Việt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#story" className="px-10 py-4 bg-beige-primary text-white font-bold rounded-full hover:bg-beige-dark transition-all transform hover:-translate-y-1 shadow-xl">
              KHÁM PHÁ CÂU CHUYỆN
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <i className="bx bx-chevron-down text-4xl text-white/50"></i>
        </div>
      </section>

      {/* ─── Story Section (Asymmetric Grid) ─── */}
      <section id="story" className="py-32 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          
          <div className="w-full lg:w-1/2 relative" data-aos="fade-right">
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] aspect-[4/5]">
              <img src="/img/banner1.jpg" alt="Về KitchenStore" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[3s]" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-beige-secondary rounded-full -z-10 blur-3xl opacity-50"></div>
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-100 rounded-full -z-10 blur-3xl opacity-30 dark:opacity-10"></div>
            
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl z-20 border border-gray-100 dark:border-gray-700 hidden md:block" data-aos="fade-up" data-aos-delay="300">
              <p className="text-4xl font-black text-beige-primary mb-1">9+</p>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Năm Kinh Nghiệm</p>
            </div>
          </div>

          <div className="w-full lg:w-1/2" data-aos="fade-left">
            <h2 className="text-sm font-black text-beige-primary uppercase tracking-[0.3em] mb-6">Our Legacy</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 mb-8 leading-tight">
              Định Nghĩa Lại<br/>
              Khái Niệm <span className="text-transparent bg-clip-text bg-gradient-to-r from-beige-primary to-orange-400 font-serif italic">Tiện Nghi</span>
            </h3>
            <div className="space-y-6 text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-light">
              <p>
                KitchenStore được thành lập với tầm nhìn trở thành biểu tượng của sự sang trọng và tiện nghi trong mọi gian bếp Việt. Chúng tôi không chỉ cung cấp thiết bị, mà còn mang đến những giải pháp đột phá giúp nâng tầm chất lượng cuộc sống cho từng gia đình.
              </p>
              <p>
                Mỗi sản phẩm tại KitchenStore đều được lựa chọn kỹ lưỡng từ những thương hiệu trứ danh toàn cầu, nơi công nghệ đỉnh cao gặp gỡ thẩm mỹ tinh tế. Chúng tôi tin rằng một gian bếp đẳng cấp là nền tảng cho một tổ ấm hạnh phúc.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-6">
              <img src="/img/banner5.jpg" className="w-20 h-20 rounded-2xl object-cover shadow-lg grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Detail" />
              <img src="/img/banner10.jpg" className="w-20 h-20 rounded-2xl object-cover shadow-lg grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Detail" />
              <img src="/img/banner7.jpg" className="w-20 h-20 rounded-2xl object-cover shadow-lg grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Detail" />
            </div>
          </div>

        </div>
      </section>

      {/* ─── Core Values (Glassmorphism) ─── */}
      <section className="py-32 bg-[#F3EFEE] dark:bg-gray-800/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-20 uppercase tracking-tighter">Giá Trị Cốt Lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div key={i} className="group relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-12 rounded-[2.5rem] border border-white/40 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-beige-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-[3] transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto bg-beige-primary/10 text-beige-primary rounded-2xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-12 transition-transform">
                    <i className={`bx ${v.icon} text-3xl`}></i>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-4">{v.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Partners Section ─── */}
      <section className="py-24 overflow-hidden border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-12">Đối tác chiến lược</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-700">
            {partners.map((p, i) => (
              <img key={i} src={p.logo} alt={p.name} className="h-8 md:h-12 w-auto object-contain cursor-help transition-transform hover:scale-110" title={p.name} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer CTA ─── */}
      <section className="py-32 container mx-auto px-6">
        <div className="relative rounded-[3rem] overflow-hidden p-16 md:p-24 text-center">
          <div className="absolute inset-0 z-0">
            <img src="/img/banner15.jpg" className="w-full h-full object-cover" alt="Join us" />
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
          </div>
          <div className="relative z-10 max-w-2xl mx-auto" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">Sẵn sàng trải nghiệm sự đẳng cấp?</h2>
            <p className="text-lg text-gray-300 mb-12 font-light">Tư vấn viên của chúng tôi luôn sẵn sàng hỗ trợ bạn kiến tạo không gian bếp mơ ước.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="px-10 py-5 bg-beige-primary text-white font-black rounded-full hover:bg-beige-dark transition-all transform hover:-translate-y-1">
                KHÁM PHÁ CỬA HÀNG
              </Link>
              <Link to="/contact" className="px-10 py-5 bg-white text-gray-900 font-black rounded-full hover:bg-gray-100 transition-all transform hover:-translate-y-1">
                LIÊN HỆ TƯ VẤN
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

