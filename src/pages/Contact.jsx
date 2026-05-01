import { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    message: '',
    subject: 'Yêu cầu tư vấn'
  });
  const [loading, setLoading] = useState(false);

  const contactInfo = [
    { icon: 'bx-map', title: 'Showroom Chính', detail: '20 Ngô Quyền, Phường 10, Quận 5, TP.HCM', sub: 'Mở cửa: 8:00 - 21:00' },
    { icon: 'bx-phone-call', title: 'Hotline 24/7', detail: '1800.1060', sub: 'Hỗ trợ kỹ thuật & Bảo hành' },
    { icon: 'bx-envelope', title: 'Email Business', detail: 'cskh@kitchenstore.vn', sub: 'Phản hồi trong 24h' }
  ];
  // ZaloIcon.jsx
  const ZaloIcon = ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.047 11.242c0-3.692-3.6-6.692-8.03-6.692-4.43 0-8.03 3-8.03 6.692 0 3.691 3.6 6.691 8.03 6.691.918 0 1.797-.13 2.61-.37l3.207 2.14a.395.395 0 0 0 .595-.395V16.32c1.04-1.39 1.618-3.15 1.618-5.078Z" />
      <path
        fill="#000" /* Màu chữ Z bên trong khi chưa hover */
        d="M10.25 9.5h3.5v1l-2.1 2.5h2.1v1h-3.5v-1l2.1-2.5h-2.1v-1Z"
        className="group-hover:fill-white" /* Nếu bạn dùng group hover */
      />
    </svg>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ràng buộc riêng cho ô số điện thoại
    if (name === 'phone') {
      // Chỉ cho phép nhập số và tối đa 10 ký tự
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      await api.post('/contacts', formData);
      Swal.fire({
        title: 'Đã gửi yêu cầu!',
        text: 'Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.',
        icon: 'success',
        confirmButtonColor: '#C8A97E',
        timer: 3000,
        timerProgressBar: true
      });
      setFormData({
        fullname: '',
        email: '',
        phone: '',
        message: '',
        subject: 'Yêu cầu tư vấn'
      });
    } catch (error) {
      console.error('Contact submit error:', error);
      Swal.fire('Lỗi', error.response?.data?.message || 'Không thể gửi liên hệ lúc này. Vui lòng thử lại sau.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FCFAFA] dark:bg-gray-900 min-h-screen font-sans">

      {/* ─── Premium Header ─── */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/img/banner4.jpg" alt="Contact Hero" className="w-full h-full object-cover transform scale-110 blur-[2px]" />
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] z-10"></div>
        </div>
        <div className="relative z-20 text-center px-6" data-aos="zoom-out">
          <span className="inline-block py-2 px-4 rounded-full bg-beige-primary/20 backdrop-blur-md border border-beige-primary/30 text-beige-primary text-[10px] font-black tracking-[0.4em] uppercase mb-6">
            Contact Us
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase">Kết Nối Với <br /> <span className="italic font-serif lowercase text-beige-primary">KitchenStore</span></h1>
          <p className="text-gray-300 max-w-xl mx-auto font-light text-lg">Chúng tôi luôn lắng nghe để mang đến giải pháp hoàn hảo nhất cho gian bếp của bạn.</p>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="py-24 container mx-auto px-6 -mt-24 relative z-30">
        <div className="flex flex-col lg:flex-row gap-12 items-stretch">

          {/* Left: Contact Form */}
          <div className="w-full lg:w-[60%] bg-white dark:bg-gray-800 p-12 md:p-16 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-700" data-aos="fade-up">
            <div className="mb-12">
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-tighter">Gửi Yêu Cầu Tư Vấn</h2>
              <p className="text-gray-400 font-light">Vui lòng điền thông tin bên dưới, chuyên viên của chúng tôi sẽ liên hệ lại ngay.</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Họ và tên</label>
                  <input
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-none px-6 py-4 rounded-2xl focus:ring-2 focus:ring-beige-primary outline-none transition-all dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Số điện thoại</label>
                  <div className="relative">
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      type="tel"
                      placeholder="09xx xxx xxx"
                      className={`w-full bg-gray-50 dark:bg-gray-900/50 px-6 py-4 rounded-2xl focus:ring-2 outline-none transition-all dark:text-white border-2 
                      ${formData.phone && formData.phone.length > 0 && formData.phone.length < 10
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-transparent focus:ring-beige-primary'}`}
                      required
                    />
                    {/* Cảnh báo nhỏ rung nhẹ khi chưa đủ số */}
                    {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                      <span className="text-[9px] text-red-500 absolute -bottom-5 left-4 font-black uppercase animate-pulse">
                        Vui lòng nhập đủ 10 chữ số
                      </span>
                    )}
                  </div>
                </div>
              </div> {/* Đóng hàng grid-cols-2 */}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email liên hệ</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="example@domain.com"
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-none px-6 py-4 rounded-2xl focus:ring-2 focus:ring-beige-primary outline-none transition-all dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Lời nhắn của bạn</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tôi muốn tìm hiểu về bộ thiết bị bếp Bosch..."
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-none px-6 py-4 rounded-2xl focus:ring-2 focus:ring-beige-primary outline-none transition-all dark:text-white resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full md:w-fit px-12 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:bg-beige-primary dark:hover:bg-beige-primary dark:hover:text-white transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? 'ĐANG GỬI...' : 'GỬI TIN NHẮN'}
                  <i className="bx bx-right-arrow-alt text-2xl group-hover:translate-x-1 transition-transform"></i>
                </button>
            </form>
          </div>

          {/* Right: Info Cards */}
          <div className="w-full lg:w-[40%] flex flex-col gap-8">

            <div className="flex-1 bg-gray-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden" data-aos="fade-left">
              <div className="absolute top-0 right-0 w-40 h-40 bg-beige-primary opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <h3 className="text-2xl font-black mb-10 tracking-tight uppercase">Thông Tin Liên Hệ</h3>

              <div className="space-y-10">
                {contactInfo.map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-beige-primary group-hover:text-white transition-all duration-500">
                      <i className={`bx ${item.icon}`}></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-beige-primary uppercase tracking-[0.3em] mb-1">{item.title}</p>
                      <p className="text-lg font-bold mb-1">{item.detail}</p>
                      <p className="text-sm text-gray-400 font-light">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 pt-10 border-t border-white/10 flex gap-6">
                {['facebook', 'zalo', 'youtube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
                  >
                    {social === 'zalo' ? (
                      <span className="font-bold text-[15px] leading-none mb-[2px]">Z</span>
                    ) : (
                      <i className={`bx bxl-${social} text-xl`}></i>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Map Placeholder Visual */}
            <div className="h-64 rounded-[3rem] overflow-hidden relative group cursor-pointer shadow-xl border border-gray-100 dark:border-gray-700" data-aos="fade-up" data-aos-delay="200">
              <img src="/img/banner_chinh.jpg" className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000" alt="Map View" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl text-center scale-90 group-hover:scale-100 transition-transform">
                  <i className="bx bxs-map text-red-500 text-2xl mb-1"></i>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Xem bản đồ</p>
                  <p className="text-sm font-black text-gray-900">Showroom Q5, TP.HCM</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Frequently Asked ─── */}
      <section className="py-24 container mx-auto px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/3">
            <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase leading-tight">Bạn Cần <br /> Hỗ Trợ Gấp?</h2>
            <p className="text-gray-400 font-light mt-4 text-lg">Hệ thống Live Chat và Hotline luôn hoạt động 24/7 để giải quyết các vấn đề cấp bách.</p>
          </div>
          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-beige-secondary/30 rounded-[2rem] border border-beige-secondary/50">
              <h4 className="font-black text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-tight">Trung Tâm Bảo Hành</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Mọi vấn đề kỹ thuật sẽ được chuyên viên của chúng tôi xử lý trong vòng 4h làm việc.</p>
            </div>
            <div className="p-8 bg-blue-50/50 dark:bg-gray-800 rounded-[2rem] border border-blue-100/50 dark:border-gray-700">
              <h4 className="font-black text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-tight">Chính Sách Hoàn Tiền</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Cam kết hoàn tiền 100% nếu sản phẩm không đúng cam kết hoặc phát hiện lỗi nhà sản xuất.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

