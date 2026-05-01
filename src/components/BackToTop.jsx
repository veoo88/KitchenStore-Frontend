import { useEffect, useState } from 'react';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 bg-beige-primary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl hover:bg-beige-dark transition-all duration-300 z-50 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      aria-label="Về đầu trang"
    >
      <i className='bx bx-up-arrow-alt text-2xl'></i>
    </button>
  );
};

export default BackToTop;
