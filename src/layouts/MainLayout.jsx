import Header from '../components/Header';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import ScrollToTop from '../components/ScrollToTop';
import Chatbox from '../components/Chatbox';

const MainLayout = ({ children, useContainer = true }) => {
  return (
    <div className="flex flex-col min-h-screen bg-beige-bg dark:bg-gray-900 transition-colors duration-300">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        {useContainer ? (
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
      <Chatbox />
      <BackToTop />
    </div>
  );
};

export default MainLayout;
