'use client';

import { useState, useRef, useEffect } from "react";
import {  MessageCirclePlus, SendHorizontal } from "lucide-react";
import Chip from "@/components/chip";
import Button from "@/components/button";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const MOCK_RESPONSES = [
  "That's a fascinating question! Let me think through it carefully.\n\nContext matters enormously here. The key insight is that **multiple perspectives** exist, and each one reveals something different about the problem.",
  "Great point! Here's how I'd break this down:\n\n1. **First**, consider the underlying structure\n2. **Second**, account for edge cases\n3. **Finally**, validate your assumptions\n\nDoes that help clarify things?",
  "Absolutely — and this is where it gets interesting.\n\nThe short answer is *yes, it's possible*. The longer answer involves a few nuances worth understanding before you proceed.",
  "This reminds me of a concept in systems thinking: the whole is often greater than the sum of its parts. What you're describing is essentially an **emergent property** of the system.",
];

let mockIdx = 0;

const SUGGESTIONS = [
  "Explain quantum computing",
  "Write a Python function",
  "Help me brainstorm ideas",
  "What's the meaning of life?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "Hello! I'm Aether, your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [date, setDate] = useState<string>("");
  const [hasMounted, setHasMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedText]);

  useEffect(() => {
    setDate(new Date().toLocaleDateString());
    setHasMounted(true);
  }, []);

  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const simulateStream = (text: string, onDone: (full: string) => void) => {
    const words = text.split(" ");
    let current = "";
    let i = 0;
    const iv = setInterval(() => {
      if (i >= words.length) {
        clearInterval(iv);
        onDone(current.trim());
        setStreamedText("");
        return;
      }
      current += (i === 0 ? "" : " ") + words[i];
      setStreamedText(current);
      i++;
    }, 38);
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    const response = MOCK_RESPONSES[mockIdx % MOCK_RESPONSES.length];
    mockIdx++;

    await new Promise((r) => setTimeout(r, 550));

    simulateStream(response, (full) => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: full,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const renderContent = (text: string) =>
    text.split("\n").map((line, i, arr) => {
      const html = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: html }} />
          {i < arr.length - 1 && <br />}
        </span>
      );
    });

  const resetChat = () => {
    setMessages([
      {
        id: "0",
        role: "assistant",
        content: "Hello! I'm Aether, your AI assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setStreamedText("");
    setIsTyping(false);
    mockIdx = 0;
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-300 text-foreground">

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,132,200,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(10,132,200,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* ── Header ── */}
      <header className="w-[70%] mt-5 z-10 flex -space-x-2.75 items-center">
        <Button
          onClick={resetChat}
          title="New chat"
          bgClass="bg-richcerulean text-background"
          hoverClass="hover:bg-foreground hover:text-background"
        >
          <MessageCirclePlus size={20}/>
        </Button>
        <span className="w-7 h-7 rotate-135 -my-5 bg-background scoop-70-30 -z-1"/>
        <div className="flex flex-col w-full px-6 py-4 squircle bg-background">
          <h1 className="text-xl font-semibold text-foreground">AI Assistant</h1>
          <p className="text-[12px] font-mono">ask AI about your health</p>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="relative w-[70%] z-1 flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-background [&::-webkit-scrollbar-thumb]:rounded-full">

        {/* Date divider */}
        <div className="flex items-center justify-center my-1">
          <span className="text-[11px] font-mono text-foreground/50 tracking-widest uppercase">
            Today — {date}
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            style={{ animation: "fadeUp 0.25s ease-out" }}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wider shrink-0 mt-0.5 ${
                msg.role === "assistant"
                  ? "bg-linear-to-br bg-richcerulean text-background"
                  : "bg-linear-to-br bg-taupe text-background"
              }`}
            >
              {msg.role === "assistant" ? "AI" : "ME"}
            </div>

            {/* Bubble + time */}
            <div className={`flex flex-col gap-1 max-w-[72%] ${msg.role === "user" ? "items-end" : ""}`}>
              <div
                className={`px-4 py-3 squircle text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-richcerulean text-background"
                    : "bg-taupe text-background"
                }`}
              >
                {renderContent(msg.content)}
              </div>
              <span className="text-[11px] font-mono text-foreground/50 tracking-wide">
                {hasMounted ? formatTime(msg.timestamp) : ""}
              </span>
            </div>
          </div>
        ))}

        {/* Typing dots */}
        {isTyping && streamedText === "" && (
          <div className="flex gap-3" style={{ animation: "fadeUp 0.25s ease-out" }}>
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-richcerulean to-richcerulean/50 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              AI
            </div>
            <div className="bg-richcerulean/10 squircle px-4 py-3.5 flex gap-1.5 items-center">
              {[0, 200, 400].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-richcerulean animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Streamed text */}
        {streamedText && (
          <div className="flex gap-3" style={{ animation: "fadeUp 0.25s ease-out" }}>
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-richcerulean to-richcerulean/50 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              AI
            </div>
            <div className="max-w-[72%] bg-richcerulean/10 squircle px-4 py-3 text-sm leading-relaxed text-foreground">
              {renderContent(streamedText)}
              <span
                className="inline-block w-0.5 h-[1em] bg-richcerulean ml-0.5 align-text-bottom"
                style={{ animation: "blink 0.8s step-end infinite" }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggestion chips ── */}
      {messages.length <= 1 && !isTyping && (
        <div className="relative z-10 flex flex-wrap gap-2 px-6 pb-3">
          {SUGGESTIONS.map((s) => (
            <Chip key={s} label={s} onClick={() => sendMessage(s)} />
          ))}
        </div>
      )}

      {/* ── Input area ── */}
      <div className="w-[70%] z-10 mb-10 flex items-center -space-x-2.75">
        <div className="flex flex-col w-[95%] squircle bg-background">
          <div className="flex w-full items-center gap-2.5 p-4">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                resizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything…"
              className="flex-1 mr-5 bg-transparent border-none outline-none text-foreground text-sm leading-relaxed resize-none min-h-6.5 max-h-40 placeholder:text-foreground/40 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-richcerulean/20 [&::-webkit-scrollbar-thumb]:rounded-full"
            />
          </div>
          <p className="text-center text-[11px] font-mono text-foreground/35 tracking-wider my-2 px-5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
        <span className="w-7 h-7 rotate-135 bg-background scoop-70-30 -z-1"/>
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isTyping}
          title="Send (Enter)"
          className="z-1"
          bgClass={!input.trim() || isTyping ? "bg-gray-300 text-foreground/70" : "bg-richcerulean text-background"}
          hoverClass={!input.trim() || isTyping ? "hover:bg-gray-300 hover:text-foreground/70" : "hover:bg-foreground hover:text-background"}
        >
          <SendHorizontal size={20}/>
        </Button>
      </div>
    </div>
  );
}