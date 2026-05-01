import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function News() {
  const articles = [
    { id: 1, title: 'Bí quyết chọn mua bếp từ phù hợp cho gia đình', image: '/img/bepdien.jpg', date: '15/03/2026', category: 'Kinh nghiệm', desc: 'Bếp từ đang trở thành xu hướng thay thế bếp gas nhờ tính ưu việt về độ an toàn và tốc độ nấu nướng vượt trội...' },
    { id: 2, title: '5 Lý do máy ép chậm là thiết bị không thể thiếu', image: '/img/mayepcham.jpg', date: '10/03/2026', category: 'Sức khỏe', desc: 'Khác biệt hoàn toàn so với máy ép nhanh, máy ép chậm giữ lại đến 90% lượng vitamin và dưỡng chất tinh khiết...' },
    { id: 3, title: 'Cách bảo quản nồi chảo chống dính siêu bền', image: '/img/chaochongdinh.jpg', date: '05/03/2026', category: 'Cẩm nang', desc: 'Bạn đã thực sự biết cách rửa và bảo quản lớp chống dính trên chảo? Cùng KitchenStore tìm hiểu bí quyết...' },
    { id: 4, title: 'Lò nướng nhiệt phân vs Lò nướng thuỷ phân', image: '/img/lonuong.jpg', date: '01/03/2026', category: 'Công nghệ', desc: 'Xu hướng chọn lò nướng thông minh với chức năng tự vệ sinh đang được nhiều bà nội trợ hiện đại yêu thích...' },
    { id: 5, title: 'Giải đáp: Có nên mua máy rửa bát không?', image: '/img/may-rua-chen.jpg', date: '25/02/2026', category: 'Gia dụng', desc: 'Việc sở hữu một chiếc máy rửa chén không chỉ giúp tiết kiệm thời gian mà còn bảo vệ đôi tay của bạn...' },
    { id: 6, title: 'Hướng dẫn pha cà phê chuẩn vị Barista tại nhà', image: '/img/mayphacaphe.jpg', date: '20/02/2026', category: 'Lối sống', desc: 'Sở hữu một chiếc máy pha cà phê thông minh giúp bạn có ngay ly Espresso hay Cappuccino hoàn hảo chỉ trong 1 phút...' },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Đăng ký thành công!',
      text: 'Cảm ơn bạn đã quan tâm đến bản tin của KitchenStore.',
      icon: 'success',
      confirmButtonColor: '#C8A97E',
    });
    e.target.reset();
  };

  const handleArticleClick = (article) => {
    Swal.fire({
      title: article.title,
      text: article.desc,
      imageUrl: article.image,
      imageWidth: 400,
      imageHeight: 250,
      imageAlt: article.title,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#C8A97E',
    });
  };

  return (
    <div className="bg-[#FCFAFA] dark:bg-gray-900 min-h-screen font-sans">

      {/* ─── Magazine Hero ─── */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/img/banner15.jpg" alt="News Hero" className="w-full h-full object-cover transform scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent z-10"></div>
        </div>

        <div className="relative z-20 container mx-auto px-6 text-white" data-aos="fade-right">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-[2px] bg-beige-primary"></span>
            <span className="text-sm font-black uppercase tracking-[0.3em] text-beige-primary">Kitchen Journalism</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight max-w-3xl">
            Tạp Chí <br />
            Nhịp Sống <span className="text-beige-primary italic font-serif">Bep</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-xl font-light leading-relaxed mb-10">
            Khám phá xu hướng thiết kế, bí quyết ẩm thực và những giải pháp công nghệ mới nhất cho gian bếp hiện đại.
          </p>
        </div>
      </section>

      {/* ─── Featured Section ─── */}
      <section className="py-20 container mx-auto px-6 -mt-20 relative z-30">
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-gray-100 dark:border-gray-700" data-aos="fade-up">
          <div className="lg:w-3/5 h-[400px] lg:h-auto overflow-hidden">
            <img src="/img/banner13.jpg" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s]" alt="Featured" />
          </div>
          <div className="lg:w-2/5 p-12 flex flex-col justify-center">
            <span className="text-beige-primary text-xs font-black uppercase tracking-widest mb-4">Highlight Article</span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              Tương Lai Của Gian Bếp Thông Minh 2026
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-light leading-relaxed">
              Từ ứng dụng AI trong quản lý thực phẩm đến những thiết bị tiết kiệm năng lượng tối đa, cùng chúng tôi khám phá diện mạo mới của nhà bếp tương lai.
            </p>
            <button
              onClick={() => handleArticleClick({ title: 'Tương Lai Của Gian Bếp Thông Minh 2026', image: '/img/banner13.jpg', desc: 'Từ ứng dụng AI trong quản lý thực phẩm đến những thiết bị tiết kiệm năng lượng tối đa...' })}
              className="w-fit px-8 py-3 border-2 border-beige-primary text-beige-primary font-bold rounded-full hover:bg-beige-primary hover:text-white transition-all">
              ĐỌC BÀI VIẾT NÀY
            </button>
          </div>
        </div>
      </section>

      {/* ─── Article Grid ─── */}
      <section className="py-20 container mx-auto px-6">
        <div className="flex items-end justify-between mb-16 px-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase">Bản Tin Mới Nhất</h2>
            <p className="text-gray-400 font-light mt-2">Cập nhật hàng tuần</p>
          </div>
          <div className="hidden md:flex gap-4">
            {['Tất cả', 'Kinh nghiệm', 'Lối sống', 'Sức khỏe'].map(cat => (
              <button key={cat} className="text-sm font-bold text-gray-400 hover:text-beige-primary transition-colors uppercase tracking-widest px-4 py-2">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((article, idx) => (
            <article
              key={article.id}
              className="group cursor-pointer"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
              onClick={() => handleArticleClick(article)}
            >
              <div className="relative h-72 rounded-[2rem] overflow-hidden mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md dark:bg-gray-900/90 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm text-gray-800 dark:text-gray-200">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="px-2">
                <div className="flex items-center gap-3 text-xs text-gray-400 font-bold mb-3 uppercase tracking-widest">
                  <span>{article.date}</span>
                  <span className="w-1.5 h-1.5 bg-beige-primary rounded-full"></span>
                  <span>5 Phút Đọc</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-4 group-hover:text-beige-primary transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-light line-clamp-2 leading-relaxed mb-6">
                  {article.desc}
                </p>
                <div className="w-0 group-hover:w-full h-[2px] bg-beige-primary transition-all duration-500 opacity-50"></div>
              </div>
            </article>
          ))}
        </div>

        {/* ─── Pagination ─── */}
        <div className="mt-20 flex justify-center pt-10 border-t border-gray-100 dark:border-gray-800">
          <button className="px-12 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black rounded-full hover:bg-beige-primary dark:hover:bg-beige-primary dark:hover:text-white transition-all transform hover:-translate-y-1">
            XEM THÊM BÀI VIẾT
          </button>
        </div>
      </section>

      {/* ─── Premium Newsletter ─── */}
      <section className="py-32 bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-6 relative overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-beige-primary opacity-10 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] bg-orange-400 opacity-10 rounded-full blur-[120px]"></div>

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2" data-aos="fade-right">
              <span className="text-beige-primary font-black uppercase tracking-[0.4em] text-xs mb-6 block">Stay Inspired</span>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Bản Tin <br /> Kitchen Excellence</h2>
              <p className="text-gray-400 font-light text-lg leading-relaxed">
                Đăng ký bản tin để nhận những cập nhật độc quyền về thiết bị nhà bếp, mẹo vặt nghệ thuật sống và ưu đãi VIP mỗi tháng.
              </p>
            </div>
            <div className="w-full md:w-1/2" data-aos="fade-left">
              <form className="space-y-4" onSubmit={handleSubscribe}>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Địa chỉ email của bạn..."
                    className="w-full bg-white/5 border border-white/10 px-6 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beige-primary transition-all"
                    required
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl -z-10 blur-sm"></div>
                </div>
                <button type="submit" className="w-full bg-beige-primary hover:bg-beige-dark py-5 rounded-2xl font-black tracking-widest transition-all">
                  ĐĂNG KÝ NGAY
                </button>
                <p className="text-[10px] text-gray-500 text-center font-bold tracking-widest mt-4">CHÚNG TÔI CAM KẾT KHÔNG SPAM</p>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

