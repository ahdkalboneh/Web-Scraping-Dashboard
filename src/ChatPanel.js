import { useState } from 'react';
import { Send, Database } from 'lucide-react';

function ChatPanel({ isRagMode, selectedModelName, onSendMessage }){ 
  const [messages, setMessages] = useState([{ id: 1, text: "Welcome! How can I assist you today?", sender: "system" }]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newUserMessage = { id: messages.length + 1, text: inputMessage, sender: "user" };
      setMessages([...messages, newUserMessage]);


      onSendMessage(inputMessage, selectedModelName, isRagMode, (responseText) => { 
         setTimeout(() => {
            const systemResponse = { id: messages.length + 2, text: responseText, sender: "system"};
             setMessages(prev => [...prev, systemResponse]);
         }, 500);
      });

      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {isRagMode && ( 
        <div className="bg-indigo-900 bg-opacity-80 px-4 py-2 flex items-center border-b border-indigo-700">
          <Database size={16} className="text-green-400 mr-2" />
          <span className="text-green-300 text-sm">
            RAG active: AI responses will incorporate recently scraped content.
          </span>
        </div>
      )}

      <div className="flex-1 p-4 overflow-auto">
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-4 max-w-3xl ${message.sender === 'user' ? 'ml-auto' : ''}`}
          >
            <div
              className={`p-3 rounded-lg shadow-md ${
                message.sender === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-indigo-800 bg-opacity-70 text-purple-100'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-purple-800 bg-opacity-70 border-t border-purple-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isRagMode ? "Ask about scraped content..." : "Type your message here..."} // Use isRagMode
            className="flex-1 p-3 rounded-lg bg-purple-700 text-white placeholder-purple-300 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatPanel;