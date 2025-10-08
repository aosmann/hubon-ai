import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! 👋 I\'m here to help you with the app or gather your feedback. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: getBotResponse(input)
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();

    if (input.includes('template') || input.includes('how to')) {
      return 'To use templates: Go to Templates → Select a template → Fill in the fields → Click "Generate image". You can customize your brand style in the Brand Style section!';
    }

    if (input.includes('brand') || input.includes('logo')) {
      return 'You can set up your brand style by going to Brand Style in the sidebar. Upload your logo, set fonts, colors, and brand guidelines. These will be applied to all your generations!';
    }

    if (input.includes('feedback') || input.includes('suggestion')) {
      return 'Thank you for your feedback! We appreciate your input. Please share your thoughts and we\'ll work on improving the app.';
    }

    if (input.includes('help') || input.includes('support')) {
      return 'I can help you with:\n• Using templates\n• Setting up brand styles\n• Generating images\n• Managing your account\n\nWhat would you like to know more about?';
    }

    return 'Thanks for your message! Is there anything specific about the app you\'d like help with, or would you like to share feedback?';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <h3>Hubon Assistant</h3>
              <p className="chatbot-subtitle">How can we help?</p>
            </div>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map(message => (
              <div
                key={message.id}
                className={`chatbot-message ${message.type === 'user' ? 'chatbot-message-user' : 'chatbot-message-bot'}`}
              >
                <div className="chatbot-message-content">
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chatbot-input"
            />
            <button
              type="button"
              className="chatbot-send"
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
