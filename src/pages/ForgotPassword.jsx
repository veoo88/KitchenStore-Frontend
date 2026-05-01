import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Mật khẩu mới đã được gửi vào email của bạn.');
      Swal.fire('Thành công', res.data.message || 'Mật khẩu mới đã được gửi vào email của bạn.', 'success');
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-beige-bg dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      {/* Left side Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-black/40 z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-black mb-4 tracking-tight drop-shadow-md">KHÔI PHỤC TÀI KHOẢN</h1>
          <p className="text-lg text-gray-200 drop-shadow max-w-md">Lấy lại quyền truy cập để tiếp tục mua sắm những thiết bị nhà bếp thông minh và tiện ích nhất.</p>
        </div>
        <img src="/img/banner8.jpg" alt="Kitchen setup" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Right side Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-beige-text dark:text-gray-100 uppercase tracking-tight mb-2">Quên Mật Khẩu</h2>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              Nhập email để nhận mật khẩu mới
            </p>
          </div>


          {message ? (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-6 rounded-2xl text-center border border-green-200 dark:border-green-800 shadow-sm">
              <i className="bx bx-check-circle text-5xl mb-3"></i>
              <h3 className="text-lg font-bold mb-2">Thành công!</h3>
              <p className="text-sm">{message}</p>
              <Link to="/login" className="mt-6 inline-block w-full py-3 bg-beige-primary text-white font-bold rounded-xl hover:bg-beige-dark transition-colors">
                Trở về Đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-beige-primary group-focus-within:text-beige-dark transition-colors">
                  <i className='bx bx-envelope text-xl'></i>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:border-beige-primary focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-sm font-medium dark:text-gray-100"
                  placeholder="Nhập email đã đăng ký..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 border border-transparent rounded-xl text-sm font-bold text-white bg-beige-primary hover:bg-[#A1887F] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-primary transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2"
              >
                {loading ? <i className="bx bx-loader-alt bx-spin text-xl"></i> : <><i className="bx bx-paper-plane text-lg"></i> GỬI YÊU CẦU</>}
              </button>
            </form>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-beige-primary hover:underline transition-colors inline-flex items-center gap-1">
              <i className="bx bx-left-arrow-alt text-lg"></i> Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
