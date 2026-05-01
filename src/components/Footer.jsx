import { Link } from 'react-router-dom';

export default function Footer() {
  // Định nghĩa class chung để đảm bảo 3 icon đồng bộ tuyệt đối về kích thước và viền
  const iconClass = "flex items-center justify-center w-10 h-10 rounded-full border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-beige-primary hover:border-beige-primary transition-all duration-300 hover:scale-110";

  return (
    <footer className="bg-beige-secondary dark:bg-gray-950 border-t border-white/50 dark:border-gray-800 text-beige-text dark:text-gray-300 py-10 mt-10 text-sm transition-colors">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Hỗ trợ */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4 uppercase text-xs tracking-wider">Tổng đài hỗ trợ</h4>
            <ul className="space-y-3">
              {/* Thay text-beige-primary bằng text-amber-900 hoặc text-orange-900 */}
              <li>Gọi mua: <a href="tel:18001060" className="text-amber-900 font-bold hover:text-orange-700 hover:underline">1800.1060</a> (8:00 - 21:30)</li>
              <li>Khiếu nại: <a href="tel:18001062" className="text-amber-900 font-bold hover:text-orange-700 hover:underline">1800.1062</a> (8:00 - 21:30)</li>
              <li>Bảo hành: <a href="tel:18001064" className="text-amber-900 font-bold hover:text-orange-700 hover:underline">1800.1064</a> (8:00 - 21:00)</li>
            </ul>
          </div>
          
          {/* Col 2: Về công ty */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4 uppercase text-xs tracking-wider">Về KitchenStore</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="hover:text-beige-primary transition-colors">Giới thiệu công ty</Link></li>
              <li><Link to="#" className="hover:text-beige-primary transition-colors">Tuyển dụng</Link></li>
              <li><Link to="#" className="hover:text-beige-primary transition-colors">Gửi góp ý, khiếu nại</Link></li>
              <li><Link to="#" className="hover:text-beige-primary transition-colors">Tìm siêu thị (100+ shop)</Link></li>
            </ul>
          </div>
          
          {/* Col 3: Chính sách */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4 uppercase text-xs tracking-wider">Thông tin chính sách</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="hover:text-beige-primary transition-colors">Chính sách giao hàng</Link></li>
              <li><Link to="#" className="hover:text-beige-primary transition-colors">Chính sách bảo hành đổi trả</Link></li>
              <li><Link to="#" className="hover:text-beige-primary transition-colors">Hướng dẫn mua trả góp</Link></li>
              <li><Link to="#" className="hover:text-beige-primary transition-colors">Chính sách bảo mật thông tin</Link></li>
            </ul>
          </div>
          
          {/* Col 4: Cộng đồng & Thanh toán */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3 uppercase text-xs tracking-wider">Theo dõi & Thanh toán</h4>
            <div className="flex gap-4 mb-6">
              {/* Facebook - Dùng bxl-facebook để icon mảnh và cân đối */}
              <a href="https://www.facebook.com/share/16ocSGVTuA/?mibextid=wwXIfr" className={iconClass}>
                <i className='bx bxl-facebook text-xl'></i>
              </a>

              {/* YouTube - Dùng bxl-youtube */}
              <a href="https://www.youtube.com/watch?v=123456789" className={iconClass}>
                <i className='bx bxl-youtube text-xl'></i>
              </a>

              {/* Zalo - Chữ Z được tinh chỉnh font-size để khớp thị giác với icon */}
              <a href="https://chat.zalo.me/" className={iconClass}>
                <span className="text-[15px] font-black font-sans leading-none mt-[1px]">Z</span>
              </a>   
            </div>

            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3 uppercase text-xs tracking-wider">Phương thức thanh toán</h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <div className="bg-white border text-blue-800 px-2 py-1 rounded shadow-sm hover:scale-105 transition-transform cursor-default">SEPAY</div>
              <div className="bg-white border text-pink-600 px-2 py-1 rounded shadow-sm hover:scale-105 transition-transform cursor-default">COD</div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-300 dark:border-gray-700 gap-6 pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>&copy; 2026 KitchenStore. All rights reserved.</p>
          <p className="mt-2 text-gray-400">20 Ngô Quyền, Phường 10, Quận 5, TP.HCM. Điện thoại: <a href="tel:18001060">1800.1060</a>.</p>
        </div>
      </div>
    </footer>
  );
}