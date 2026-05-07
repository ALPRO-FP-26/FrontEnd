'use client';

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Activity } from "lucide-react";
import Button from "@/components/button";
import { ArrowLeft } from "lucide-react";

function FieldInput({
  label, value, type = "text", placeholder, icon: Icon, onChange,
}: {
  label: string; value: string; type?: string; placeholder?: string;
  icon?: any;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative flex items-center squircle border border-foreground/15 bg-background focus-within:border-richcerulean transition-all duration-200">
        {Icon && (
          <div className="pl-4 text-foreground/40">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/25"
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login", { email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300 text-foreground p-4">
      <div 
        className="w-full max-w-md squircle bg-background p-8 sm:p-10 border border-foreground/10 shadow-xl relative overflow-hidden"
        style={{ animation: "fadeUp 0.35s ease-out" }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-richcerulean/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-foreground/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <Link 
          href="/" 
          className="absolute top-6 left-6 z-20 w-10 h-10 squircle bg-background border border-foreground/10 flex items-center justify-center text-foreground/60 shadow-sm cursor-pointer hover:text-richcerulean hover:border-richcerulean/40 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 squircle bg-richcerulean/10 flex items-center justify-center mb-2">
              <Activity className="text-richcerulean" size={26} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-[12px] font-mono text-foreground/50">
              Enter your details to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FieldInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={setEmail}
            />
            
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest">
                  Password
                </label>
                <Link href="#" className="text-[10px] font-mono text-richcerulean hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center squircle border border-foreground/15 bg-background focus-within:border-richcerulean transition-all duration-200">
                <div className="pl-4 text-foreground/40">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/25"
                />
              </div>
            </div>

            <Button
              className="mt-4 w-full flex justify-center py-3.5 !border-none"
              bgClass="bg-richcerulean text-background"
              hoverClass="hover:bg-foreground hover:text-background"
              title="Sign In"
            >
              <div className="flex items-center gap-2 px-2">
                <span className="font-medium text-[15px]">Sign In</span>
                <ArrowRight size={18} />
              </div>
            </Button>
          </form>

          <div className="flex flex-col items-center gap-5 mt-2">
            <div className="flex items-center gap-3 w-full">
              <div className="h-px flex-1 bg-foreground/10" />
              <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">
                OR
              </span>
              <div className="h-px flex-1 bg-foreground/10" />
            </div>

            <p className="text-[12px] font-mono text-foreground/60">
              Don't have an account?{" "}
              <Link href="/register" className="text-richcerulean font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
