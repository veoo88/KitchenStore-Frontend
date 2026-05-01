import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import Swal from 'sweetalert2';
import Pagination from '../components/Pagination';
import { formatPrice } from '../utils/format';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const keyword = searchParams.get('keyword');
  const sort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products?${categoryId ? `category=${encodeURIComponent(categoryId)}&` : ''}${keyword ? `keyword=${encodeURIComponent(keyword)}&` : ''}sort=${sort}&page=${currentPage}&limit=${itemsPerPage}`)
        ]);
        
        if (Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
        
        setProducts(prodRes.data?.items || []);
        setTotalItems(prodRes.data?.total || 0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, currentPage, keyword, sort]);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    params.set('page', 1); // Reset to page 1 on sort
    setSearchParams(params);
  };

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Danh Mục Sản Phẩm</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className={`block px-3 py-2 rounded-lg transition-colors ${!categoryId ? 'bg-beige-primary/10 text-beige-primary font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-beige-primary'}`}>
                  Tất cả sản phẩm
                </Link>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className={`block px-3 py-2 rounded-lg transition-colors ${categoryId === cat.name ? 'bg-beige-primary/10 text-beige-primary font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-beige-primary'}`}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                {keyword ? (
                  <>Tìm kiếm cho: <span className="text-beige-primary">"{keyword}"</span></>
                ) : categoryId ? (
                  `Danh mục: ${categoryId}`
                ) : (
                  'Tất cả sản phẩm'
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Tìm thấy {totalItems} sản phẩm phù hợp</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Sắp xếp:</span>
              <select 
                value={sort} 
                onChange={handleSortChange}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-beige-primary/30"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
                <option value="name_asc">Tên: A - Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><i className="bx bx-loader-alt bx-spin text-4xl text-beige-primary"></i></div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
              <i className="bx bx-box text-5xl mb-3 text-gray-300"></i>
              <p>Chưa có sản phẩm nào trong danh mục này.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden group">
                    <div className="relative p-4 h-[250px] flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50">
                      <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center cursor-pointer">
                     
<img 
  src={
    product.image && product.image.startsWith('http') 
      ? product.image 
      : (product.image 
          ? `${window.location.origin}${product.image.replace('/images/', '/img/')}` 
          : "https://placehold.co/300x300")
  } 
  alt={product.name}
  className="w-full h-full object-contain"
/>
                      </Link>
                    </div>
                    <div className="p-5">
                      <span className="px-2 py-1 text-[10px] font-black text-beige-primary bg-gray-100 dark:bg-gray-700/50 rounded uppercase tracking-widest inline-flex items-center gap-1 mb-2">
                        {product.category?.icon && <i className={`bx ${product.category.icon}`}></i>}
                        {product.category?.name || product.category || 'Không phân loại'}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 min-h-[56px] hover:text-beige-primary transition-colors cursor-pointer">
                        <Link to={`/product/${product.id}`}>{product.name}</Link>
                      </h3>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xl font-black text-beige-primary">{formatPrice(product.price)}</p>
                        </div>
                        <button onClick={(e) => handleAddToCart(product, e)} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group-hover:shadow-md relative z-20">
                          <i className='bx bx-shopping-bag text-lg'></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-4">
                <Pagination 
                  totalItems={totalItems} 
                  itemsPerPage={itemsPerPage} 
                  currentPage={currentPage} 
                  onPageChange={handlePageChange} 
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

