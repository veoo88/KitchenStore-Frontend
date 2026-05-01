import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { GoogleLogin } from '@react-oauth/google';
import Swal from 'sweetalert2';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const { syncCart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const userData = await login(email, password);
    
    // Sync cart after login
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (localCart.length > 0) {
      await syncCart(localCart);
    }

    // HIỂN THỊ POPUP THÀNH CÔNG
    Swal.fire({
      title: 'Đăng nhập thành công!',
      text: `Chào mừng ${userData.user?.fullname} trở lại KitchenStore!`,
      icon: 'success',
      confirmButtonColor: '#C8A97E',
      timer: 1500,
      showConfirmButton: false
    });

    const role = userData.user?.role?.toLowerCase();

    setTimeout(() => {
      if (role === 'admin' || role === 'staff') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      }, 100);
  } catch (err) {
    Swal.fire('Lỗi đăng nhập', err.response?.data?.message || 'Vui lòng kiểm tra lại email và mật khẩu.', 'error');
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

    // HIỂN THỊ POPUP THÀNH CÔNG
    Swal.fire({
      title: 'Đăng nhập Google thành công!',
      icon: 'success',
      confirmButtonColor: '#C8A97E',
      timer: 1500,
      showConfirmButton: false
    });

    const role = userData.user?.role?.toLowerCase(); // Chuyển về chữ thường để tránh lỗi so khớp

    // Sử dụng setTimeout nhẹ để đảm bảo Context đã kịp cập nhật dữ liệu mới trước khi navigate
    setTimeout(() => {
      if (role === 'admin' || role === 'staff') {
        navigate('/admin', { replace: true }); 
      } else {
        navigate('/', { replace: true });
      }
    }, 100);
  } catch (err) {
    Swal.fire('Lỗi', err.response?.data?.message || 'Đăng nhập Google thất bại.', 'error');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex h-[calc(100vh-80px)] bg-beige-bg dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      {/* Left side Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 z-10 flex flex-col justify-end px-16 pb-20 text-white">
          <h1 className="text-5xl font-black mb-4 tracking-tight drop-shadow-lg">KITCHEN STORE</h1>
          <p className="text-lg text-gray-200 drop-shadow max-w-lg leading-relaxed">Bộ sưu tập thiết bị nhà bếp thông minh, hiện đại, mang lại nguồn cảm hứng bất tận cho mỗi bữa ăn gia đình.</p>
        </div>
        <img src="/img/banner2.jpg" alt="Thế giới nhà bếp" className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-[10s] ease-in-out" />
      </div>

      {/* Right side Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md animate-[fade-in-up_0.5s_ease-out]">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-beige-text dark:text-gray-100 uppercase tracking-tight mb-2">Đăng Nhập</h2>
            <p className="text-gray-500">Chào mừng bạn trở lại</p>
          </div>


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
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 items-center dark:border-gray-700 rounded-xl focus:outline-none focus:border-beige-primary focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-sm font-medium dark:text-gray-100"
                placeholder="Email của bạn"
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-beige-primary group-focus-within:text-beige-dark transition-colors">
                <i className='bx bx-lock-alt text-xl'></i>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:border-beige-primary focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-sm font-medium dark:text-gray-100"
                placeholder="Mật khẩu"
              />
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center text-gray-600 dark:text-gray-400 cursor-pointer group">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-beige-primary border-gray-300 rounded focus:ring-beige-primary cursor-pointer" />
                <span className="ml-2 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">Nhớ tài khoản</span>
              </label>
              <Link to="/forgot-password" className="text-beige-primary font-bold hover:text-beige-dark transition-colors hover:underline">Quên mật khẩu?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 border border-transparent rounded-xl text-sm font-bold text-white bg-beige-primary hover:bg-[#A1887F] shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-primary transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-2"
            >
              {loading ? <i className="bx bx-loader-alt bx-spin text-xl"></i> : 'ĐĂNG NHẬP'}
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
                 theme="filled_blue"
              />
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bạn chưa có tài khoản?{' '}
              <Link to="/register" className="font-bold text-beige-primary hover:text-beige-dark hover:underline transition-colors ml-1">
                Tạo tài khoản mới
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
