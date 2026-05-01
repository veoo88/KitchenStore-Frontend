import React from 'react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6">
      <div className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
        Hiển thị <span className="font-medium text-gray-900 dark:text-white">{Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}</span> đến{' '}
        <span className="font-medium text-gray-900 dark:text-white">{Math.min(totalItems, currentPage * itemsPerPage)}</span> trong{' '}
        <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span> sản phẩm
      </div>
      
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => {
            onPageChange(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={currentPage === 1}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-gray-100 dark:border-gray-700"
          title="Trang trước"
        >
          <i className="bx bx-chevron-left text-2xl text-gray-600 dark:text-gray-300"></i>
        </button>

        <div className="flex items-center gap-1 mx-2">
          {[...Array(totalPages)].map((_, i) => {
            const p = i + 1;
            // Only show first, last, and pages around current
            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
              return (
                <button
                  key={p}
                  onClick={() => {
                    onPageChange(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 ${
                    currentPage === p 
                      ? 'bg-beige-primary text-white shadow-lg shadow-beige-primary/30 scale-110' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  {p}
                </button>
              );
            }
            if (p === currentPage - 2 || p === currentPage + 2) {
              return <span key={p} className="w-8 flex justify-center text-gray-400">...</span>;
            }
            return null;
          })}
        </div>

        <button
          onClick={() => {
            onPageChange(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-gray-100 dark:border-gray-700"
          title="Trang sau"
        >
          <i className="bx bx-chevron-right text-2xl text-gray-600 dark:text-gray-300"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
