/**
 * Format a number as VND currency
 * @param {number} price 
 * @returns {string}
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(price || 0);
};

/**
 * Format a date string to Vietnamese locale
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Simple safe JSON parse
 * @param {string} str 
 * @param {any} fallback 
 */
export const safeJsonParse = (str, fallback = null) => {
    try {
        return str ? JSON.parse(str) : fallback;
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return fallback;
    }
};
