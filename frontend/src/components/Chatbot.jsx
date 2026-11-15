import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader } from 'lucide-react';
import client from '../api/client';

export default function Chatbot({ embedded = false }) {
  const [isOpen, setIsOpen] = useState(embedded);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'I can answer supported questions from the records stored in this dashboard. Try:\n• "What indicators are available for PMAY-U?"\n• "Compare reported PMAY-G and MGNREGS values"\n• "Which states report the highest PMGSY values?"\n• "What is the latest NRLM source date?"',
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

    const query = input.trim();
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: query,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await client.post('/chatbot/query', { query });
      const responseData = response.data?.data || {};
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
        text: error.response?.status === 429
          ? 'Too many requests. Please wait a moment before trying again.'
          : 'I could not retrieve those source records. Try again in a moment.',
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
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open scheme data assistant"
          className={`app-chat-toggle ${embedded ? '' : 'fixed bottom-8 right-8 z-40'} transition flex items-center justify-center`}
        >
          <MessageCircle size={20} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={embedded
          ? 'app-chat-window-embedded flex h-[32rem] flex-col overflow-hidden rounded-xl border'
          : 'app-chat-window fixed bottom-8 right-8 z-50 flex h-[32rem] w-96 flex-col overflow-hidden rounded-2xl border shadow-2xl'}
        >
          {/* Header */}
          <div className="app-chat-header px-5 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-white font-bold">Scheme data assistant</h3>
              <p className="text-blue-100 text-xs">Ask about stored scheme records</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close scheme data assistant"
              className="app-chat-close p-2 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" role="log" aria-live="polite" aria-label="Assistant conversation">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'app-chat-user-message'
                      : 'app-chat-response-message'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  {msg.data && msg.type === 'bot' && (
                    <div className="app-chat-metadata mt-2 text-xs p-2 rounded space-y-1">
                      {msg.data.scheme && <p className="text-gray-300">Scheme: {msg.data.scheme}</p>}
                      {msg.data.key_metrics && Array.isArray(msg.data.key_metrics) && (
                        <div className="text-gray-300">
                          <p className="font-semibold">Reported indicators:</p>
                          {msg.data.key_metrics.slice(0, 4).map((metric, index) => (
                            <p key={`${metric.name || 'metric'}-${index}`} className="text-xs">
                              {typeof metric === 'string'
                                ? metric
                                : `${metric.name || 'Indicator'}: ${metric.value ?? 'Not reported'}${metric.unit ? ` ${metric.unit}` : ''}${metric.target == null ? '' : ` / target ${metric.target}`}${metric.state ? ` · ${metric.state}` : ''}${metric.date && !Number.isNaN(new Date(metric.date).getTime()) ? ` · ${new Date(metric.date).toLocaleDateString('en-IN')}` : ''}`}
                            </p>
                          ))}
                        </div>
                      )}
                      {Array.isArray(msg.data.comparison) && (
                        <div className="space-y-3 text-gray-300">
                          {msg.data.comparison.map((scheme) => (
                            <div key={scheme.scheme_code}>
                              <p className="font-semibold">{scheme.scheme_code} · {scheme.indicator_count} indicator(s) · latest {scheme.latest_report_date || 'date unavailable'}</p>
                              {scheme.indicators?.slice(0, 3).map((indicator) => (
                                <p key={indicator.kpi_name} className="text-xs">
                                  {indicator.kpi_name}: {indicator.observations?.slice(0, 2).map((item) => `${item.state || item.district || 'National'} ${Number(item.value).toLocaleString('en-IN')}`).join('; ') || 'No observations'}
                                </p>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                      {Array.isArray(msg.data.data) && (
                        <div className="space-y-1 text-gray-300">
                          {msg.data.data.slice(0, 5).map((item, index) => (
                            <p key={`${item.state_name || item.scheme_code || 'row'}-${index}`} className="text-xs">
                              {item.state_name || item.scheme_code || 'Record'}: {item.value == null ? 'Not reported' : Number(item.value).toLocaleString('en-IN')}
                              {msg.data.unit ? ` ${msg.data.unit}` : ''}
                              {item.source_date && !Number.isNaN(new Date(item.source_date).getTime()) ? ` · ${new Date(item.source_date).toLocaleDateString('en-IN')}` : ''}
                              {item.locations_covered > 1 ? ` · summed from ${item.locations_covered} districts` : ''}
                            </p>
                          ))}
                        </div>
                      )}
                      {msg.data.observation_count != null && (
                        <p className="text-xs text-gray-300">{msg.data.observation_count} observations · {msg.data.rated_observations || 0} rated against a configured target · {msg.data.unrated_observations || 0} without a target</p>
                      )}
                      {msg.data.latest_update && !Number.isNaN(new Date(msg.data.latest_update).getTime()) && (
                        <p className="text-xs text-gray-300">Latest source date: {new Date(msg.data.latest_update).toLocaleDateString('en-IN')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="app-chat-response-message border px-4 py-2 rounded-lg">
                  <Loader size={20} className="text-blue-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="app-chat-form border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about scheme records"
                aria-label="Ask about scheme records"
                className="app-chat-input flex-1 border rounded-lg px-4 py-2 transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                aria-label="Send question"
                className="app-chat-send p-2 rounded-lg transition disabled:opacity-50"
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
