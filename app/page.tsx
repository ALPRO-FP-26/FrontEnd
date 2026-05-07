'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, FileText, Bot, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, HeartPulse, LineChart, AlertTriangle, Stethoscope } from "lucide-react";
import Button from "@/components/button";

const slides = [
  {
    title: "Upload & Extract Data",
    desc: "Upload a lab result PDF (even photos or scans). We extract values into a clean table and provide a plain-English summary of your results.",
    icon: FileText
  },
  {
    title: "Track Daily Vitals",
    desc: "Manually log your daily vitals—blood pressure, blood sugar, weight, heart rate—and visualize 30-day trend lines to stay on track.",
    icon: LineChart
  },
  {
    title: "Chat With Your Data",
    desc: "Ask natural language questions like 'What was my cholesterol trend over the past three months?' Our AI answers using only your uploaded data.",
    icon: Bot
  },
  {
    title: "Prepare For Doctor Visits",
    desc: "Review flagged lab values and get auto-generated, relevant questions to bring to your next doctor's appointment.",
    icon: Stethoscope
  },
  {
    title: "Emergency Guidance",
    desc: "If critical keywords like 'chest pain' are detected, the AI is bypassed to immediately show you emergency contact numbers.",
    icon: AlertTriangle
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-300 text-foreground font-sans selection:bg-richcerulean/20 pb-20">
      
      <header className="w-full max-w-5xl mt-6 px-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 squircle bg-richcerulean flex items-center justify-center shadow-md shadow-richcerulean/20">
            <HeartPulse className="text-background" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Health<span className="text-richcerulean">Companion</span>
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-[12px] font-mono font-semibold text-foreground/60 hover:text-foreground transition-colors uppercase tracking-widest">
            Sign In
          </Link>
          <Link href="/register" className="px-6 py-2.5 squircle bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
            Sign Up
          </Link>
        </div>
      </header>

      <main className="w-full max-w-5xl flex flex-col gap-16 px-6 mt-32 z-10">
        
        <section className="flex flex-col items-center text-center gap-6" style={{ animation: "fadeUp 0.5s ease-out" }}>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground leading-[1.15] tracking-tight max-w-3xl">
            Making Sense of Your <br className="hidden sm:block" />
            <span className="text-richcerulean">Medical Lab Results</span>
          </h1>
          <p className="text-lg text-foreground/60 leading-relaxed max-w-2xl">
            A personal health workspace designed to help you organize, read, and truly understand your medical records—empowering you to take control of your health.
          </p>
          <div className="mt-4">
            <Button
              href="/register"
              className="px-8 py-4 bg-richcerulean hover:bg-foreground text-background !border-none shadow-lg shadow-richcerulean/20 squircle transition-all"
              title="Getting Started"
            >
              <div className="flex items-center justify-center gap-2 px-2">
                <span className="font-medium text-[15px]">Getting Started</span>
                <ArrowRight size={18} />
              </div>
            </Button>
          </div>
        </section>

        <section className="mt-10" style={{ animation: "fadeUp 0.6s ease-out" }} id="Introduction">
          <div className="squircle bg-background p-10 sm:p-14 border border-foreground/10 shadow-sm flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 squircle bg-richcerulean/10 text-richcerulean text-[10px] font-mono font-semibold uppercase tracking-widest">
                <Activity size={14} /> Our Mission
              </div>
              <h2 className="text-3xl font-bold text-foreground leading-tight">
                Why we built HealthCompanion
              </h2>
              <div className="space-y-4 text-foreground/60 leading-relaxed text-sm">
                <p>
                  Every day, patients managing chronic conditions like hypertension or diabetes need to meticulously log their blood sugar or blood pressure—sometimes up to three times a day. To prevent these crucial records from getting lost and to visualize health trends over time, we created HealthCompanion.
                </p>
                <p>
                  The healthcare system generates enormous amounts of personal health data, but almost none of it is accessible in plain language. People rely entirely on their doctor to interpret results, often going months without understanding their own health status. HealthCompanion bridges this gap by acting as your personal <strong>"health translator"</strong>—turning lab PDFs and daily vitals into a structured, searchable, and conversational health history.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-full max-w-[240px] aspect-[3/4] bg-gray-300 border border-foreground/10 squircle shadow-inner p-6 flex flex-col gap-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-1/2 h-3 bg-foreground/15 squircle" />
                <div className="w-3/4 h-3 bg-foreground/15 squircle" />
                <div className="w-full h-px bg-foreground/10 my-2" />
                <div className="flex justify-between items-center">
                  <div className="w-1/3 h-2 bg-foreground/15 squircle" />
                  <div className="w-8 h-4 bg-green-500/20 squircle" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-1/2 h-2 bg-foreground/15 squircle" />
                  <div className="w-8 h-4 bg-red-500/20 squircle" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-1/4 h-2 bg-foreground/15 squircle" />
                  <div className="w-8 h-4 bg-yellow-500/20 squircle" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6" style={{ animation: "fadeUp 0.7s ease-out" }}>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground">What You Can Do</h2>
            <div className="h-px flex-1 bg-foreground/10" />
          </div>

          <div className="relative w-full overflow-hidden squircle bg-background border border-foreground/10 shadow-sm p-8 sm:p-12 min-h-[350px] flex items-center justify-center">
            <div className="flex flex-col items-center text-center max-w-lg gap-4 relative z-20">
              <div 
                key={`icon-${currentSlide}`}
                className="w-16 h-16 squircle bg-richcerulean/10 flex items-center justify-center mb-2 animate-in fade-in zoom-in duration-500"
              >
                {(() => {
                  const Icon = slides[currentSlide].icon;
                  return <Icon className="text-richcerulean" size={32} />;
                })()}
              </div>
              <h3 
                key={`title-${currentSlide}`}
                className="text-2xl font-bold text-foreground animate-in slide-in-from-bottom-2 fade-in duration-500"
              >
                {slides[currentSlide].title}
              </h3>
              <p 
                key={`desc-${currentSlide}`}
                className="text-foreground/60 leading-relaxed text-sm animate-in slide-in-from-bottom-3 fade-in duration-500 delay-100"
              >
                {slides[currentSlide].desc}
              </p>
            </div>

            <button 
              onClick={prevSlide}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 squircle bg-gray-300 flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-colors z-20"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 squircle bg-gray-300 flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-colors z-20"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2.5 h-2.5 squircle transition-all duration-300 ${
                    idx === currentSlide ? "bg-richcerulean w-8" : "bg-foreground/15 hover:bg-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
