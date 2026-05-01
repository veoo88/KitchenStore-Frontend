import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        // Thoroughly refresh/re-init AOS on every route change
        if (window.AOS) {
            window.AOS.init({ 
                duration: 800, 
                once: false, 
                offset: 100 
            });
            window.AOS.refresh();
        }
    }, [pathname]);

    return null;
};

export default ScrollToTop;
