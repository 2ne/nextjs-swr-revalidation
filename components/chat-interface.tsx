"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import useSWR from "swr";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [username, setUsername] = useState(() => {
    // Initialize username from localStorage if available
    if (typeof window !== "undefined") {
      return localStorage.getItem("username") || "";
    }
    return "";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    data: messages,
    mutate,
    error,
  } = useSWR<Message[]>("/api/messages", fetcher, {
    refreshInterval: 1000,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = useCallback(async () => {
    if (message.trim() && username) {
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: username,
        timestamp: Date.now(),
      };

      mutate([...(messages || []), newMessage], false);

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        mutate();
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        mutate();
      }
    }
  }, [message, username, messages, mutate]);

  const handleSetUsername = () => {
    const trimmedUsername = tempUsername.trim();
    if (trimmedUsername) {
      setUsername(trimmedUsername);
      localStorage.setItem("username", trimmedUsername);
    }
  };

  const handleLogout = () => {
    setUsername("");
    localStorage.removeItem("username");
  };

  const [showPopover, setShowPopover] = useState(false);

  if (error) return <div className="p-4 text-red-500">Failed to load messages</div>;
  if (!messages) return <div className="p-4 text-gray-400">Loading...</div>;

  if (!username) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="p-8 bg-gray-900 rounded-lg">
          <h2 className="mb-4 text-2xl font-bold text-white">Enter your username</h2>
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSetUsername();
              }
            }}
            className="w-full px-4 py-2 mb-4 text-white bg-gray-800 rounded"
            placeholder="Username"
          />
          <button onClick={handleSetUsername} className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600" disabled={!tempUsername.trim()}>
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="flex items-center justify-between p-4 bg-gray-900">
        <h1 className="text-xl font-bold">Chat</h1>
        <div className="flex items-center">
          <div className="relative">
            <button
              onClick={() => setShowPopover(!showPopover)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500"][username.toLowerCase().charCodeAt(0) % 7]
              }`}
              title={username}
            >
              {username.charAt(0).toUpperCase()}
            </button>
            {showPopover && (
              <div className="fixed inset-0 z-10" onClick={() => setShowPopover(false)}>
                <div className="absolute right-0 z-20 w-48 py-1 mt-2 bg-gray-800 rounded-md shadow-lg top-10" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowPopover(false);
                    }}
                    className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700 focus:outline-none"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages?.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === username ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] px-4 py-2 rounded-3xl ${msg.sender === username ? "bg-blue-500 text-white" : "bg-gray-700 text-white"}`}>
              <div className="mb-1 text-xs font-semibold">{msg.sender}</div>
              <div>{msg.text}</div>
              <div
                className="mt-1 text-xs opacity-75"
                title={new Date(msg.timestamp).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              >
                {new Date(msg.timestamp).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-gray-900">
        <div className="flex items-center bg-gray-800 rounded-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            className="flex-1 px-6 py-3 text-white placeholder-gray-400 bg-transparent focus:outline-none"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="px-6 py-3 font-semibold text-blue-500 focus:outline-none" disabled={!message.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
