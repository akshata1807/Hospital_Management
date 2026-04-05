import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendChatMessage } from "@/lib/n8n";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! 👋 I'm your MediCare health assistant. How can I help you today? You can ask me about symptoms, medications, appointment info, or general health questions." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session-${Date.now()}`);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await sendChatMessage(msg, sessionId.current);
      const botReply = res?.output || res?.text || res?.message || res?.response || JSON.stringify(res);
      setMessages(prev => [...prev, { role: "bot", content: botReply }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="page-title">AI Health Assistant</h1>
          <p className="page-subtitle">Ask me anything about your health</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto form-section mb-4 space-y-4">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "bot" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}>
              {m.role === "bot" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{m.content}</p>
              )}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="chat-bubble-bot">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Type your health question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          disabled={loading}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
