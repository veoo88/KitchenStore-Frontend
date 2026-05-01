const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-8xl font-black text-beige-primary mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Trang không tồn tại</h1>
      <p className="text-gray-500 mb-8">Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <a href="/" className="bg-beige-primary text-white px-8 py-3 rounded-full font-bold hover:bg-beige-dark transition-colors">Về trang chủ</a>
    </div>
  );
};

export default NotFound;
