'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCirclePlus, SendHorizontal, History, Trash2, ChevronRight, Clock } from "lucide-react";
import Chip from "@/components/chip";
import Button from "@/components/button";
import { sendChatMessage, getChatSessions, getChatHistory, clearChatHistory, type ChatSession } from "@/lib/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const SUGGESTIONS = [
  "What are my latest health metrics?",
  "Explain my cholesterol results",
  "Am I at risk for diabetes?",
  "What does my HbA1c mean?",
];

const GREETING = "Hello! I'm Aether, your AI health assistant. Ask me anything about your health records or lab results!";

export default function Chatbot() {
  const nextMessageId = useRef(1);
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "assistant", content: GREETING, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [date, setDate] = useState<string>("");
  const [hasMounted, setHasMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedText]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDate(new Date().toLocaleDateString());
      setHasMounted(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const fetchSessions = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const result = await getChatSessions(token);
      setSessions(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  }, []);

  useEffect(() => {
    if (sidebarOpen) fetchSessions();
  }, [sidebarOpen, fetchSessions]);

  const loadSession = async (sid: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setLoadingHistory(true);
    try {
      const result = await getChatHistory(token, sid);
      const loaded: Message[] = result.messages.map((m, i) => ({
        id: String(i),
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(),
      }));
      nextMessageId.current = loaded.length;
      setMessages(loaded.length > 0 ? loaded : [{ id: "0", role: "assistant", content: GREETING, timestamp: new Date() }]);
      setSessionId(sid);
      setActiveSessionId(sid);
      setStreamedText("");
      setIsTyping(false);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

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
      id: String(nextMessageId.current++),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");

      const response = await sendChatMessage(token, content, sessionId);

      if (response.session_id) {
        setSessionId(response.session_id);
        setActiveSessionId(response.session_id);
      }

      simulateStream(response.reply, (full) => {
        setMessages((prev) => [
          ...prev,
          { id: String(nextMessageId.current++), role: "assistant", content: full, timestamp: new Date() },
        ]);
        setIsTyping(false);
        if (sidebarOpen) fetchSessions();
      });
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: String(nextMessageId.current++),
          role: "assistant",
          content: "Sorry, I encountered an error while communicating with the server. Please try again.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatSessionDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

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
    setMessages([{ id: "0", role: "assistant", content: GREETING, timestamp: new Date() }]);
    setStreamedText("");
    setIsTyping(false);
    setSessionId(undefined);
    setActiveSessionId(undefined);
    nextMessageId.current = 1;
  };

  const handleClearAll = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      await clearChatHistory(token);
      setSessions([]);
      resetChat();
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-300 text-foreground overflow-hidden">

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,132,200,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(10,132,200,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center min-w-0 relative z-10">
        {/* ── Header ── */}
        <header className="w-[70%] mt-5 z-10 flex -space-x-2.75 items-center">
          <Button
            onClick={resetChat}
            title="New chat"
            bgClass="bg-richcerulean text-background"
            hoverClass="hover:bg-foreground hover:text-background"
          >
            <MessageCirclePlus size={20} />
          </Button>
          <span className="w-7 h-7 rotate-135 -my-5 bg-background scoop-70-30 -z-1" />
          <div className="flex flex-col w-full px-6 py-4 squircle bg-background">
            <h1 className="text-xl font-semibold text-foreground">AI Assistant</h1>
            <p className="text-[12px] font-mono text-foreground/50">
              {activeSessionId ? `Session · ${activeSessionId.slice(0, 8)}…` : "ask AI about your health"}
            </p>
          </div>
        </header>

        {/* ── Messages ── */}
        <div className="relative w-[70%] mb-45 z-1 flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-background [&::-webkit-scrollbar-thumb]:rounded-full">

          {/* Date divider */}
          <div className="flex items-center justify-center my-1">
            <span className="text-[11px] font-mono text-foreground/50 tracking-widest uppercase">
              Today — {date}
            </span>
          </div>

          {/* Loading overlay */}
          {loadingHistory && (
            <div className="flex flex-col items-center gap-3 py-12 text-center" style={{ animation: "fadeUp 0.2s ease-out" }}>
              <div className="w-8 h-8 rounded-full bg-richcerulean/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-richcerulean border-t-transparent animate-spin" />
              </div>
              <p className="text-[11px] font-mono text-foreground/40">Loading conversation…</p>
            </div>
          )}

          {!loadingHistory && messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              style={{ animation: "fadeUp 0.25s ease-out" }}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wider shrink-0 mt-0.5 ${
                  msg.role === "assistant"
                    ? "bg-richcerulean text-background"
                    : "bg-taupe text-background"
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
              <div className="w-8 h-8 rounded-full bg-richcerulean flex items-center justify-center text-[11px] font-bold text-white shrink-0">
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
              <div className="w-8 h-8 rounded-full bg-richcerulean flex items-center justify-center text-[11px] font-bold text-white shrink-0">
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

        <div className="fixed z-10 bottom-0 left-0 right-0 flex flex-col items-center pb-10">

          {/* ── Suggestion chips ── */}
          {messages.length <= 1 && !isTyping && (
            <div className="flex flex-row overflow-x-auto items-center max-w-[70%] gap-2 px-6 pb-3 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-richcerulean/20 [&::-webkit-scrollbar-thumb]:rounded-full">
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
            <span className="w-7 h-7 rotate-135 bg-background scoop-70-30 -z-1" />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              title="Send (Enter)"
              className="z-1"
              bgClass={!input.trim() || isTyping ? "bg-gray-300 text-foreground/70" : "bg-richcerulean text-background"}
              hoverClass={!input.trim() || isTyping ? "hover:bg-gray-300 hover:text-foreground/70" : "hover:bg-foreground hover:text-background"}
            >
              <SendHorizontal size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Backdrop (click to close) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px]"
          onClick={() => setSidebarOpen(false)}
          style={{ animation: "fadeIn 0.2s ease-out" }}
        />
      )}

      {/* ── Sidebar overlay ── */}
      <aside
        className={`fixed top-6 bottom-6 right-6 z-30 flex flex-col bg-background squircle overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-72 opacity-100 translate-x-0" : "w-72 opacity-0 translate-x-4 pointer-events-none"
        }`}
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-foreground/10 shrink-0">
          <div className="flex items-center gap-2">
            <History size={16} className="text-richcerulean" />
            <span className="text-sm font-semibold text-foreground">Chat History</span>
          </div>
          <button
            onClick={handleClearAll}
            title="Clear all history"
            className="w-7 h-7 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/40 hover:border-red-400 hover:text-red-500 transition-all duration-150"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto py-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-foreground/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
              <Clock size={28} className="text-foreground/20" />
              <p className="text-[11px] font-mono text-foreground/40">No previous chats</p>
            </div>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSession(s.id)}
                className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 transition-all duration-150 border-r-2 ${
                  activeSessionId === s.id
                    ? "bg-richcerulean/8 border-r-richcerulean"
                    : "border-r-transparent hover:bg-foreground/5"
                }`}
              >
                <p className="text-[13px] font-medium text-foreground truncate">{s.title || "Untitled chat"}</p>
                <p className="text-[10px] font-mono text-foreground/40">{formatSessionDate(s.updated_at)}</p>
              </button>
            ))
          )}
        </div>
      </aside>
      {/* Sidebar toggle button — fixed, floats over layout */}
      <div
        className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
            sidebarOpen ? "md:right-85 -right-20" : "right-5"
          }`}
      >
        <Button
          onClick={() => setSidebarOpen((p) => !p)}
          title={sidebarOpen ? "Close history" : "Open history"}
        >
          {sidebarOpen ? <ChevronRight size={16} /> : <History size={16} />}
        </Button>
      </div>
    </div>
  );
}