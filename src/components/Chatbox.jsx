import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const BOT_AVATAR = '🤖';
const USER_AVATAR = '🧑';

const QUICK_REPLIES = [
  'Gợi ý nồi cơm điện tốt',
  'Bếp từ giá rẻ',
  'Chính sách bảo hành',
  'Hỗ trợ đặt hàng',
];

export default function Chatbox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Xin chào! Tôi là trợ lý KitchenStore 🍳\nTôi có thể giúp bạn tư vấn thiết bị nhà bếp, tìm sản phẩm phù hợp hoặc hỗ trợ đặt hàng!',
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const [lastSentTime, setLastSentTime] = useState(0);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, messages]);

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const sendMessage = async (text) => {
    const now = Date.now();
    if (now - lastSentTime < 3000 && !text) {
      // Chỉ báo lỗi nếu người dùng tự gõ quá nhanh, không chặn nếu click quick reply lần đầu
      const waitTime = Math.ceil((3000 - (now - lastSentTime)) / 1000);
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'warning',
        title: `Vui lòng đợi ${waitTime}s để gửi tin tiếp theo`,
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    const msg = text || input.trim();
    if (!msg || loading) return;

    setLastSentTime(now);
    setInput('');

    const userMsg = { role: 'user', text: msg, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: msg });
      const reply = res.data?.reply || 'Xin lỗi, tôi chưa hiểu ý bạn. Bạn có thể hỏi lại không?';

      // Kiểm tra nếu là tin nhắn fallback (thường bắt đầu bằng icon hoặc có dấu hiệu đặc biệt)
      const isFallback = reply.includes('[GEMINI]') || reply.startsWith('🤖') || reply.includes('Hệ thống tự động');

      setMessages((prev) => [...prev, {
        role: 'bot',
        text: reply,
        time: new Date(),
        isFallback: isFallback
      }]);

      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '⚠️ Không thể kết nối đến AI lúc này. Vui lòng thử lại sau.', time: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'bot',
        text: 'Xin chào! Tôi là trợ lý KitchenStore 🍳\nTôi có thể giúp bạn tư vấn thiết bị nhà bếp, tìm sản phẩm phù hợp hoặc hỗ trợ đặt hàng!',
        time: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[998] w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group"
        title="Chat với trợ lý AI"
      >
        <i className={`bx ${open ? 'bx-x text-2xl' : 'bx-message-dots text-2xl'} transition-all`}></i>
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
            {unread}
          </span>
        )}
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-amber-400 opacity-40 animate-ping pointer-events-none"></span>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-[999] w-[360px] max-w-[95vw] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
          }`}
        style={{ maxHeight: '520px' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
            🍳
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-sm leading-tight">Trợ lý KitchenStore AI</p>
            <p className="text-amber-100 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full inline-block"></span>
              Trực tuyến · Powered by Gemini
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="text-white/70 hover:text-white transition-colors"
              title="Xóa lịch sử chat"
            >
              <i className="bx bx-trash text-lg"></i>
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <i className="bx bx-minus text-xl"></i>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50 dark:bg-gray-900" style={{ minHeight: 0 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${msg.role === 'bot' ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                {msg.role === 'bot' ? BOT_AVATAR : USER_AVATAR}
              </div>
              {/* Bubble */}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[78%]`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                      ? 'bg-amber-500 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm'
                    }`}
                >
                  {msg.isFallback && (
                    <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                      <i className="bx bx-Revision animate-spin-slow"></i> Hệ thống dự phòng
                    </div>
                  )}
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTime(msg.time)}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2 items-center">
              <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-sm">{BOT_AVATAR}</div>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && !loading && (
          <div className="px-4 pt-2 pb-1 flex gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Nhập câu hỏi... (Enter để gửi)"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 transition-all placeholder-gray-400 overflow-hidden leading-relaxed disabled:opacity-60"
            style={{ maxHeight: '100px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 hover:scale-105"
          >
            <i className="bx bx-send text-lg"></i>
          </button>
        </div>
      </div>
    </>
  );
}
