// src/components/ChatInterface.tsx
"use client"; // Mark as a Client Component

import React, { useState, useRef, useEffect } from 'react';

// Define message structure
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  data?: any[]; // Optional: To hold structured data (not used with OpenRouter backend)
}

interface ChatInterfaceProps {
  apiUrl: string; // Base API URL passed from parent (e.g., http://localhost:5001/api)
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ apiUrl }) => {
  const [isOpen, setIsOpen] = useState(false); // State for chat window visibility
  const [message, setMessage] = useState(''); // Current user input
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]); // Array of messages
  const [isLoading, setIsLoading] = useState(false); // Loading state for bot response
  const chatBodyRef = useRef<HTMLDivElement>(null); // Ref to scroll chat body

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Function to toggle chat window open/closed
  const toggleChat = () => setIsOpen(!isOpen);

  // Function to handle sending a message
  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault(); // Prevent form submission if called from form
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return; // Don't send empty messages

    const userMessage: ChatMessage = { sender: 'user', text: trimmedMessage };
    setChatHistory(prev => [...prev, userMessage]); // Add user message immediately
    setMessage(''); // Clear input
    setIsLoading(true); // Show loading indicator

    try {
      // Send the message to the backend chat endpoint
      const response = await fetch(`${apiUrl}/chat/query`, { // Use the specific endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedMessage }), // Send the message text
      });

      // Check if the response from the backend is okay
      if (!response.ok) {
        let errorMsg = `Request failed with status ${response.status}`;
        try {
             // Try to parse error details from the backend response
             const errorData = await response.json();
             errorMsg = errorData.response || errorData.message || errorMsg;
        } catch (_) { /* Ignore if response body is not JSON */ }
        throw new Error(errorMsg);
      }

      // Parse the JSON response from the backend
      const data = await response.json();

      // Add bot response to history
      // Note: The OpenRouter backend route now only sends back { response: "text" }
      const botMessage: ChatMessage = { sender: 'bot', text: data.response };
      setChatHistory(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Chat API error:", error);
      // Display error message in the chat window
      const errorText = error instanceof Error ? error.message : 'Sorry, I encountered an error.';
      const errorMessage: ChatMessage = { sender: 'bot', text: errorText };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    // Fixed position container at bottom right using Tailwind CSS
    <div className="fixed bottom-4 right-4 z-20">
      {/* Chat Window (conditionally rendered based on isOpen state) */}
      {isOpen && (
        <div className="w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col border border-gray-300 dark:border-gray-600">
          {/* Header Section */}
          <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Chat Query</h3>
            {/* Close Button */}
            <button
              onClick={toggleChat}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Close chat"
            >
              {/* Close Icon (X) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Body (Scrollable) */}
          <div ref={chatBodyRef} className="flex-grow p-3 overflow-y-auto space-y-3 text-sm">
            {/* Map through chat history and display messages */}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white' // User message style
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100' // Bot message style
                  }`}
                >
                  <p>{msg.text}</p>
                  {/* Removed optional data display as OpenRouter backend doesn't send it */}
                </div>
              </div>
            ))}
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input Area Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask the AI..." // Updated placeholder
              className="flex-grow px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md disabled:opacity-50"
              disabled={isLoading || !message.trim()} // Disable if loading or input is empty
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Chat Toggle Button (always visible) */}
      <button
        onClick={toggleChat}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Chat Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
};

export default ChatInterface;

