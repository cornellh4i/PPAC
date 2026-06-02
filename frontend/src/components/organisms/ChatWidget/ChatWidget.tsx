import { useEffect, useRef, useState } from "react";
import "./ChatWidget.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const renderMessageContent = (content: string) => {
  const cleaned = content
    .replace(/(\[([^\]]+)\]\([^\)]+\))\2/g, "$1")
    .replace(/(\[([^\]]+)\]\([^\)]+\))\s*https?:\/\/\S+/g, "$1");

  return cleaned.split("\n").map((line, lineIndex, allLines) => {
    // Tokenize each line into bold, links, and plain text
    const tokenRegex = /(\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\)]+)\))/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(line)) !== null) {
      // Push any plain text before this match
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>
            {line.slice(lastIndex, match.index)}
          </span>,
        );
      }

      if (match[0].startsWith("**")) {
        // Bold
        elements.push(<strong key={`bold-${match.index}`}>{match[2]}</strong>);
      } else {
        // Link
        elements.push(
          <a
            key={`link-${match.index}`}
            href={match[4]}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-widget__link"
          >
            {match[3]}
          </a>,
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Push any remaining plain text after last match
    if (lastIndex < line.length) {
      elements.push(
        <span key={`text-end-${lastIndex}`}>{line.slice(lastIndex)}</span>,
      );
    }

    return (
      <span key={lineIndex} style={{ display: "block", marginBottom: "4px" }}>
        {elements}
      </span>
    );
  });
};

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const prompts = [
    "I want resources on period cramps",
    "I want mental health resources",
    "I want to contact the admin",
    "I'm looking for events",
  ];

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const sendMessage = async (messageText?: string) => {
    const trimmed = (messageText || input).trim();
    if (!trimmed || loading) return;

    const updated: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
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
      setMessages([
        ...updated,
        { role: "assistant", content: data.data.reply },
      ]);
    } catch {
      setMessages([
        ...updated,
        { role: "assistant", content: "Error: could not reach the server." },
      ]);
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
                {/* CHANGED — was {msg.content}, now uses the render helper */}
                {renderMessageContent(msg.content)}
              </div>
            ))}
            {loading && (
              <div className="chat-widget__thinking">Thinking...</div>
            )}
          </div>

          <div className="chat-widget__prompts">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                className="chat-widget__prompt"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                type="button"
              >
                {prompt}
              </button>
            ))}
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
              onClick={() => sendMessage()}
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
