"use client";

import { useState } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";

const ChatBotUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      sender: "bot",
      time: "09:00",
    },
  ]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Giả lập bot trả lời
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        text: "Đây là câu trả lời giả lập.",
        sender: "bot",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);

    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Nút mở Chatbot */}
      <button
        onClick={toggleChat}
        className="bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-700 transition-all duration-300 transform hover:scale-110 focus:outline-none cursor-pointer"
        aria-label="Open Chatbot"
      >
        <FaRobot className="w-6 h-6" />
      </button>

      {/* Khung Chatbot */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-slide-up">
          {/* Header */}
          <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">CourseBot</h3>
            <button
              onClick={toggleChat}
              className="text-white hover:text-slate-300 focus:outline-none"
              aria-label="Close Chatbot"
            >
              <FaTimes className="w-5 h-5 cursor-pointer" />
            </button>
          </div>

          {/* Khung tin nhắn */}
          <div className="h-80 p-4 overflow-y-auto bg-slate-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <div className="flex flex-col space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.sender === "user"
                      ? "bg-slate-800 text-white self-end"
                      : "bg-slate-200 text-slate-800 self-start"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.text}
                    <span className="text-xs text-gray-500 ml-2">
                      {msg.time}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ô nhập */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSend}>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Nhập câu hỏi của bạn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700"
                />
                <button
                  type="submit"
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                >
                  Gửi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotUI;
