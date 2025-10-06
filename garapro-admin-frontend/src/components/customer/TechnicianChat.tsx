'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  sender?: string;
  from?: string;
  timestamp?: string;
  time?: string;
  text?: string;
  content?: string;
}

interface TechnicianChatProps {
  messages?: Message[];
  isOpen: boolean;
  onClose?: () => void;
  technicianName?: string;
  initialMessages?: Message[];
  accentColor?: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'slate';
  sendMessage?: (msg: string) => void;
}

const TechnicianChat: React.FC<TechnicianChatProps> = ({
  messages = [],
  isOpen,
  onClose = () => {},
  technicianName,
  initialMessages = [],
  accentColor = 'blue',
  sendMessage = () => {},
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    scrollToBottom();
  }, [messages, initialMessages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  // Định dạng thời gian
  const formatTime = (value: string): string => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return '';
    }
  };

  // Xác định loại tin nhắn và style tương ứng
  const getMessageStyle = (sender: string): string => {
    switch (sender) {
      case 'user':
        return 'bg-blue-600 text-white ml-auto';
      case 'technician':
        return 'bg-gray-200 text-gray-800 mr-auto';
      case 'system':
        return 'bg-yellow-100 text-yellow-800 mx-auto text-xs';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const normalizeMessage = (msg: Message) => {
    const senderRaw = msg.sender ?? msg.from;
    const sender =
      senderRaw === 'me'
        ? 'user'
        : senderRaw === 'tech'
        ? 'technician'
        : senderRaw || 'system';
    const timestamp = msg.timestamp || msg.time || new Date().toISOString();
    const text = msg.text ?? msg.content ?? '';
    return { sender, timestamp, text };
  };

  const computedMessages = (messages && messages.length > 0 ? messages : initialMessages).map(normalizeMessage);

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-600',
    slate: 'bg-slate-600',
  };
  const headerColorClass = colorMap[accentColor] || colorMap.blue;

  return (
    <div className={`${isOpen ? 'block' : 'hidden'} fixed bottom-4 right-4 z-50 w-96`}>
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col w-full h-96 border border-gray-200">
        <div className={`p-4 ${headerColorClass} text-white font-semibold flex justify-between items-center`}>
          <span>Chat với {technicianName || 'kỹ thuật viên'}</span>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 
                1.414L11.414 10l4.293 4.293a1 1 0 
                01-1.414 1.414L10 11.414l-4.293 
                4.293a1 1 0 01-1.414-1.414L8.586 
                10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3 flex flex-col">
            {computedMessages.map((msg, index) => (
              <div key={index} className={`max-w-[80%] rounded-lg p-3 ${getMessageStyle(msg.sender)}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-xs">
                    {msg.sender === 'user'
                      ? 'Bạn'
                      : msg.sender === 'technician'
                      ? 'Kỹ thuật viên'
                      : 'Hệ thống'}
                  </span>
                  <span className="text-xs opacity-75">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-sm">{msg.text}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Gửi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechnicianChat;
