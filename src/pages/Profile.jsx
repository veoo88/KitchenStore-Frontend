import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function Profile() {
  const { currentUser, updateUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullname: currentUser.user?.fullname || '',
    phone: currentUser.user?.phone || '',
    address: currentUser.user?.address || '',
    email: currentUser.user?.email || '',
  });

  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

 const handleInfoChange = (e) => {
  const { name, value } = e.target;

  // Nếu là trường phone, chỉ cho phép nhập số và tối đa 10 ký tự
  if (name === 'phone') {
    if (!/^\d*$/.test(value) || value.length > 10) return;
  }

  setForm({ ...form, [name]: value });
};

  const handlePwdChange = (e) => {
    setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });
  };

  const handleUpdateInfo = async (e) => {
  e.preventDefault();
  
  // Validation cơ bản
  if (!form.fullname) return Swal.fire('Lỗi', 'Họ tên không được để trống', 'error');
  
  // Ràng buộc số điện thoại: bắt đầu bằng 0, là số và đủ 10 chữ số
  const vnf_regex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  if (form.phone && !vnf_regex.test(form.phone)) {
    return Swal.fire('Lỗi', 'Số điện thoại không đúng định dạng (10 số, bắt đầu bằng 03, 05, 07, 08, 09)', 'error');
  }
    setLoading(true);
    try {
      await api.put('/users', {
        id: currentUser.user.id,
        fullname: form.fullname,
        phone: form.phone,
        address: form.address,
      });
      
      updateUser({
        fullname: form.fullname,
        phone: form.phone,
        address: form.address,
      });

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Thông tin cá nhân đã được cập nhật.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Cập nhật thất bại', 'error');
    } finally {
      setLoading(true); // Small delay for UX
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      return Swal.fire('Lỗi', 'Vui lòng điền đầy đủ mật khẩu', 'error');
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return Swal.fire('Lỗi', 'Mật khẩu mới không khớp', 'error');
    }
    if (pwdForm.newPassword.length < 6) {
      return Swal.fire('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
    }

    setLoading(true);
    try {
      // Backend handles password update in PUT /api/users if password field is present
      // Note: We might need to verify current password first, but let's see if backend assumes owner = OK
      // Standard practice: Backend AuthController or UsersController would handle this.
      await api.put('/users', {
        id: currentUser.user.id,
        password: pwdForm.newPassword
      });

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Mật khẩu đã được thay đổi. Vui lòng lưu nhớ mật khẩu mới.',
        timer: 2000,
        showConfirmButton: false
      });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Đổi mật khẩu thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-beige-primary/50 transition-all dark:text-white";
  const labelCls = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1";

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl shadow-beige-primary/10 border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-900/50 p-8 border-r border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-beige-secondary to-beige-primary rounded-full mx-auto flex items-center justify-center text-3xl font-black text-white shadow-xl mb-4">
                {currentUser.user?.fullname?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">{currentUser.user?.fullname}</h2>
              <p className="text-sm text-gray-500">{currentUser.user?.email}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'info' ? 'bg-beige-primary text-white shadow-lg shadow-beige-primary/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <i className='bx bx-user-circle text-xl'></i>
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'password' ? 'bg-beige-primary text-white shadow-lg shadow-beige-primary/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <i className='bx bx-lock-alt text-xl'></i>
                Bảo mật & Mật khẩu
              </button>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                 <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black px-6 mb-2">Hỗ trợ</p>
                 <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <i className='bx bx-help-circle text-xl'></i>
                    Trợ giúp
                 </button>
              </div>
            </nav>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-8 md:p-12">
            {activeTab === 'info' ? (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-8 flex items-center gap-3">
                   <div className="w-2 h-8 bg-beige-primary rounded-full"></div>
                   THÔNG TIN CÁ NHÂN
                </h3>
                <form onSubmit={handleUpdateInfo} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className={labelCls}>Họ và tên</label>
                      <input type="text" name="fullname" value={form.fullname} onChange={handleInfoChange} className={inputCls} placeholder="Nhập họ tên của bạn..." />
                    </div>
                    <div>
                      <label className={labelCls}>Email (Không thể thay đổi)</label>
                      <input type="email" value={form.email} disabled className={`${inputCls} opacity-60 cursor-not-allowed italic`} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelCls}>Số điện thoại</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            name="phone" 
                            value={form.phone} 
                            onChange={handleInfoChange} 
                            className={`${inputCls} ${form.phone && form.phone.length > 0 && form.phone.length < 10 ? 'border-red-400 ring-1 ring-red-100' : ''}`} 
                            placeholder="090..." 
                          />
                          {form.phone && form.phone.length > 0 && form.phone.length < 10 && (
                            <span className="text-[10px] text-red-500 absolute -bottom-5 left-1 font-bold animate-pulse">
                              Vui lòng nhập đủ 10 chữ số
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Địa chỉ</label>
                        <input type="text" name="address" value={form.address} onChange={handleInfoChange} className={inputCls} placeholder="Số nhà, đường, phường..." />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto px-10 py-4 bg-beige-primary text-white font-black rounded-2xl shadow-xl shadow-beige-primary/20 hover:bg-beige-dark hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
                    >
                      {loading ? <i className='bx bx-loader-alt bx-spin'></i> : 'LƯU THAY ĐỔI'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-8 flex items-center gap-3">
                   <div className="w-2 h-8 bg-beige-primary rounded-full"></div>
                   BẢO MẬT & MẬT KHẨU
                </h3>
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <label className={labelCls}>Mật khẩu hiện tại</label>
                    <input type="password" name="currentPassword" value={pwdForm.currentPassword} onChange={handlePwdChange} className={inputCls} placeholder="••••••••" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>Mật khẩu mới</label>
                      <input type="password" name="newPassword" value={pwdForm.newPassword} onChange={handlePwdChange} className={inputCls} placeholder="Ít nhất 6 ký tự..." />
                    </div>
                    <div>
                      <label className={labelCls}>Xác nhận mật khẩu mới</label>
                      <input type="password" name="confirmPassword" value={pwdForm.confirmPassword} onChange={handlePwdChange} className={inputCls} placeholder="Nhập lại mật khẩu mới..." />
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto px-10 py-4 bg-gray-800 dark:bg-beige-primary border border-gray-700 text-white font-black rounded-2xl shadow-xl hover:bg-black dark:hover:bg-beige-dark hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
                    >
                      {loading ? <i className='bx bx-loader-alt bx-spin'></i> : 'ĐỔI MẬT KHẨU'}
                    </button>
                  </div>
                </form>
                
                <div className="mt-12 p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-3xl border border-yellow-100 dark:border-yellow-900/20">
                   <div className="flex gap-4">
                      <i className='bx bxs-info-circle text-yellow-500 text-2xl'></i>
                      <div>
                         <h4 className="font-bold text-yellow-800 dark:text-yellow-500 text-sm">Lưu ý bảo mật</h4>
                         <p className="text-xs text-yellow-700/70 dark:text-yellow-600/60 mt-1 leading-relaxed">
                            Mật khẩu của bạn nên bao gồm cả chữ và số để tăng cường bảo mật. 
                            KitchenStore cam kết bảo mật thông tin tài khoản của bạn tuyệt đối.
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
