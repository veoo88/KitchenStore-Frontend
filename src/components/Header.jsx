import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setMobileMenuOpen(false);
    }
  };

  const isAdmin = currentUser?.user?.role === 'admin' || currentUser?.user?.role === 'Admin';
  const userName = currentUser?.user?.fullname || currentUser?.user?.name || '';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/about', label: 'Giới thiệu' },
    { to: '/products', label: 'Danh mục sản phẩm' },
    { to: '/news', label: 'Tin Tức' },
    { to: '/contact', label: 'Liên Hệ' },
  ];

  return (
    <>
      <header className="glass-effect shadow-sm text-beige-text p-3 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          {/* 1. Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-beige-text dark:text-gray-100">
              <i className="bx bx-restaurant text-2xl text-beige-secondary"></i>
              <span className="hidden lg:block">KitchenStore</span>
            </Link>
          </div>

          {/* 2. Search bar */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearch} className="flex w-full gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-full outline-none text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-beige-primary/30 bg-white border border-beige-primary/80 dark:border-gray-600 dark:placeholder-gray-400"
                placeholder="Tìm kiếm sản phẩm..."
              />
              <button type="submit" className="bg-beige-secondary text-gray-800 p-2 rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition-all duration-300">
                <i className="bx bx-search text-sm"></i>
              </button>
            </form>
          </div>

          {/* 3. Navigation */}
          <nav className="hidden md:block flex-shrink-0">
            <ul className="flex justify-center gap-5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={`transition-all duration-300 text-sm font-medium pb-1 ${isActive ? 'text-beige-primary border-b-2 border-beige-primary' : 'text-beige-text dark:text-gray-100 hover:text-beige-dark dark:hover:text-beige-primary hover:underline'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 4. User actions */}
          <div className="flex gap-3 items-center flex-shrink-0">
            {/* User Dropdown (logged in) */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-beige-secondary to-beige-primary rounded-full flex items-center justify-center font-bold text-beige-text text-sm">
                    {userInitial}
                  </div>
                  <span className="font-medium hidden sm:block text-sm text-beige-text dark:text-gray-100 max-w-[80px] truncate">{userName.split(' ').slice(-1)[0]}</span>
                  <i className="bx bx-chevron-down text-xs"></i>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                    {/* User info */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-beige-secondary to-beige-primary rounded-full flex items-center justify-center font-bold text-beige-text">
                          {userInitial}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{userName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.user?.email}</div>
                        </div>
                      </div>
                    </div>
                    {/* Menu items */}
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200">
                        <i className="bx bx-user-circle text-lg"></i>
                        <span>Thông tin người dùng</span>
                      </Link>
                      <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200 border-t border-gray-50 dark:border-gray-700/50">
                        <i className="bx bx-history text-lg"></i>
                        <span>Đơn hàng của tôi</span>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-beige-primary/10 transition-colors text-beige-primary font-bold border-l-4 border-beige-primary">
                          <i className="bx bx-user-shield text-lg"></i>
                          <span>Quản trị viên</span>
                        </Link>
                      )}
                    </div>
                    {/* Logout */}
                    <div className="border-t border-gray-100 dark:border-gray-700 p-1">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors rounded-b-2xl">
                        <i className="bx bx-log-out"></i>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-beige-primary text-beige-text px-5 py-2 rounded-full font-medium hover:bg-beige-dark hover:text-white transition-all duration-300 text-sm hover:scale-105">
                Đăng nhập
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center hover:scale-110"
              title="Chuyển chế độ Sáng/Tối"
            >
              <i className={`bx ${isDark ? 'bx-sun' : 'bx-moon'} text-sm`}></i>
            </button>

            {/* Cart */}
            <Link to="/cart" className="bg-beige-primary p-2 rounded-full relative hover:scale-105 transition-transform">
              <i className="bx bx-cart text-sm text-beige-text"></i>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden bg-beige-secondary text-beige-text p-2 rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition-all duration-300 ml-1"
            >
              <i className={`bx ${mobileMenuOpen ? 'bx-x' : 'bx-menu'} text-xl`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-gray-900 shadow-2xl z-[60] transform transition-transform duration-300 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-beige-secondary dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Menu</h2>
          <button onClick={() => setMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-300 hover:text-red-500 text-2xl">
            <i className='bx bx-x'></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <ul className="space-y-4">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} onClick={() => setMobileMenuOpen(false)} className="block text-gray-800 dark:text-gray-200 font-medium hover:text-beige-primary text-lg border-b border-gray-100 dark:border-gray-700 pb-2">
                  {link.label}
                </Link>
              </li>
            ))}
            {currentUser && (
              <li>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-gray-800 dark:text-gray-200 font-medium hover:text-beige-primary text-lg border-b border-gray-100 dark:border-gray-700 pb-2">
                  Thông tin người dùng
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 z-[55]" onClick={() => setMobileMenuOpen(false)} />
      )}
    </>
  );
}
