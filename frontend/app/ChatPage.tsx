"use client";
import { useEffect, useState, useRef } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  // Use a Ref for the socket to persist it across renders without triggering re-renders
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket("ws://localhost:8000/ws/Asad");

      ws.onopen = () => {
        console.log("Connected to Backend");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        setMessages((prev) => [...prev, event.data]);
      };

      ws.onclose = () => {
        console.log("Disconnected. Attempting to reconnect...");
        setIsConnected(false);
        // Optional: Add a timeout to reconnect
        // setTimeout(connect, 3000);
      };

      socketRef.current = ws;
    };

    connect();

    // Cleanup on component unmount
    return () => {
      socketRef.current?.close();
    };
  }, []);

  const sendMessage = () => {
    const socket = socketRef.current;
    // Check if socket exists and is in the OPEN state (1)
    if (socket && socket.readyState === WebSocket.OPEN && input.trim()) {
      socket.send(input);
      setInput("");
    } else {
      console.error("WebSocket is not open. Current state:", socket?.readyState);
    }
  };

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">FastAPI + Next.js Chat</h1>
      <p className="mb-2">
        Status: {isConnected ? <span className="text-green-500">Online</span> : <span className="text-red-500">Offline</span>}
      </p>
      
      <div className="border h-80 overflow-y-auto p-4 mb-4 bg-gray-50 text-black rounded shadow-inner">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2 p-2 bg-white rounded shadow-sm border-l-4 border-blue-500">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          className="border p-2 flex-1 text-black rounded"
          placeholder="Type a message..."
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage} 
          disabled={!isConnected}
          className={`px-4 py-2 rounded text-white font-bold ${isConnected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
        >
          Send
        </button>
      </div>
    </div>
  );
}