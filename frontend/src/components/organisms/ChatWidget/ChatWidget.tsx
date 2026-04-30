import { useEffect, useRef, useState } from "react";
import "./ChatWidget.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const updated: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.data.reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Error: could not reach the server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-widget" ref={widgetRef}>
      {isOpen && (
        <div className="chat-widget__window">
          <div className="chat-widget__header">Chat</div>
          <div className="chat-widget__messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-widget__message chat-widget__message--${msg.role}`}
              >
                {msg.content}
              </div>
            ))}
            {loading && <div className="chat-widget__thinking">Thinking...</div>}
          </div>

          <div className="chat-widget__input-row">
            <input
              className="chat-widget__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
            />
            <button
              className="chat-widget__send"
              onClick={sendMessage}
              disabled={loading}
              type="button"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className="chat-widget__toggle"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        Chat
      </button>
    </div>
  );
};

export default ChatWidget;
