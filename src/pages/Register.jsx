import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { GoogleLogin } from '@react-oauth/google';
import Swal from 'sweetalert2';

export default function Register() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const { syncCart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      Swal.fire('Thông báo', 'Mật khẩu xác nhận không khớp.', 'warning');
      return;
    }

    // KIỂM TRA SỐ ĐIỆN THOẠI (Nếu có nhập thì phải đúng định dạng)
    if (phone.length > 0) {
      const vnf_regex = /^(0[3|5|7|8|9])[0-9]{8}$/;
      if (!vnf_regex.test(phone)) {
        return Swal.fire({
          icon: 'error',
          title: 'Số điện thoại không hợp lệ',
          text: 'Vui lòng nhập đủ 10 số bắt đầu bằng 03, 05, 07, 08, 09',
          confirmButtonColor: '#C8A97E'
        });
      }
    }

    setLoading(true);

    try {
      await register(fullname, email, password, phone, address);

      Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công!',
        text: 'Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ.',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        navigate('/login');
      });
    } catch (err) {
      Swal.fire('Lỗi đăng ký', err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const userData = await googleLogin(credentialResponse.credential);

      // Sync cart
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        await syncCart(localCart);
      }

      if (userData.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Đăng nhập Google thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số và tối đa 10 ký tự
    if (!/^\d*$/.test(value) || value.length > 10) return;
    setPhone(value);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-beige-bg dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      {/* Left side Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 z-10 flex flex-col justify-end px-16 pb-20 text-white">
          <h1 className="text-5xl font-black mb-4 tracking-tight drop-shadow-lg">TẠO TÀI KHOẢN MỚI</h1>
          <p className="text-lg text-gray-200 drop-shadow max-w-lg leading-relaxed">Trở thành thành viên của KitchenStore để nhận mức giá ưu đãi và dịch vụ bảo hành trọn đời.</p>
        </div>
        <img src="/img/banner3.jpg" alt="Thế giới nhà bếp" className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-[10s] ease-in-out" />
      </div>

      {/* Right side Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md animate-[fade-in-up_0.5s_ease-out] py-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-beige-text dark:text-gray-100 uppercase tracking-tight mb-2">Đăng Ký</h2>
            <p className="text-sm text-gray-500">Tạo tài khoản KitchenStore của bạn</p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-beige-primary group-focus-within:text-beige-dark transition-colors">
                <i className='bx bx-user text-xl'></i>
              </div>
              <input type="text" required value={fullname} onChange={(e) => setFullname(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:border-beige-primary focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-medium dark:text-gray-100"
                placeholder="Họ và tên" />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-beige-primary group-focus-within:text-beige-dark transition-colors">
                <i className='bx bx-envelope text-xl'></i>
              </div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:border-beige-primary focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-medium dark:text-gray-100"
                placeholder="Email của bạn" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-beige-primary group-focus-within:text-beige-dark transition-colors">
                  <i className='bx bx-lock-alt text-xl'></i>
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:border-beige-primary focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-medium dark:text-gray-100"
                  placeholder="Mật khẩu" />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-beige-primary group-focus-within:text-beige-dark transition-colors">
                  <i className='bx bx-check-shield text-xl'></i>
                </div>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:border-beige-primary focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-medium dark:text-gray-100"
                  placeholder="Xác nhận MK" />
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-beige-primary group-focus-within:text-beige-dark transition-colors">
                <i className='bx bx-phone text-xl'></i>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange} // Dùng hàm mới ở đây
                className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-medium dark:text-gray-100
      ${phone && phone.length > 0 && phone.length < 10
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-gray-100 dark:border-gray-700 focus:border-beige-primary'}`}
                placeholder="Số điện thoại (Tuỳ chọn)"
              />
              {/* Thông báo nhỏ khi nhập dở dang */}
              {phone && phone.length > 0 && phone.length < 10 && (
                <span className="text-[10px] text-red-500 absolute -bottom-5 left-4 font-bold animate-pulse">
                  Nhập đủ 10 chữ số
                </span>
              )}
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-beige-primary group-focus-within:text-beige-dark transition-colors">
                <i className='bx bx-map text-xl'></i>
              </div>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:border-beige-primary focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-medium dark:text-gray-100"
                placeholder="Địa chỉ giao hàng (Tuỳ chọn)" />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 px-6 border border-transparent rounded-xl text-sm font-bold text-white bg-beige-primary hover:bg-[#A1887F] shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-primary transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex justify-center items-center"
            >
              {loading ? <i className="bx bx-loader-alt bx-spin text-xl"></i> : 'ĐĂNG KÝ TÀI KHOẢN'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 font-medium">Hoặc đăng nhập bằng</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Đăng nhập Google thất bại')}
                useOneTap
                shape="pill"
                theme="outline"
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-beige-primary hover:text-beige-dark hover:underline transition-colors ml-1">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
