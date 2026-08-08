import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader } from 'lucide-react';
import client from '../api/client';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! 👋 I can help you analyze government schemes. Try asking me:\n• "How is PMAY performing?"\n• "Compare MGNREGS and NRLM"\n• "Show top performing states"\n• "What are the latest trends?"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await client.post('/chatbot/query', { query: input });
      const responseData = response.data.data;
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: responseData?.message || responseData?.response || 'I didn\'t understand that. Could you rephrase?',
        data: responseData,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: `Sorry, I encountered an error: ${error.response?.status === 429 ? 'Too many requests. Please wait a moment.' : error.message}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center text-white z-40 animate-pulse"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 h-[32rem] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-white font-bold">Analytics Assistant 🤖</h3>
              <p className="text-blue-100 text-xs">Ask me about scheme performance</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-gray-100 border border-white/20'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  {msg.data && msg.type === 'bot' && (
                    <div className="mt-2 text-xs bg-black/20 p-2 rounded space-y-1">
                      {msg.data.type && <p className="font-semibold text-blue-300">Type: {msg.data.type}</p>}
                      {msg.data.scheme && <p className="text-gray-300">Scheme: {msg.data.scheme}</p>}
                      {msg.data.overall_completion && <p className="text-green-300">Completion: {msg.data.overall_completion}%</p>}
                      {msg.data.status && <p className="text-yellow-300">Status: {msg.data.status}</p>}
                      {msg.data.key_metrics && Array.isArray(msg.data.key_metrics) && (
                        <div className="text-gray-300">
                          <p className="font-semibold">Metrics:</p>
                          {msg.data.key_metrics.slice(0, 3).map((m, i) => (
                            <p key={i} className="text-xs">{m}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg">
                  <Loader size={20} className="text-blue-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-4 bg-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
