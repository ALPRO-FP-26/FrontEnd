'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { FileText, Bot, ChevronRight, Droplet, HeartPulse, Scale, ActivitySquare, BookOpen, Clock, CircleUserRound } from "lucide-react";
import { getCurrentUser, getBloodSugarLogs, getBloodPressureLogs, getWeightLogs, getDocuments, type Article } from '@/lib/api';
import Button from '@/components/button';
import Image from 'next/image';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [vitals, setVitals] = useState<{
    bs: any[];
    bp: any[];
    weight: any[];
    docsCount: number;
  }>({ bs: [], bp: [], weight: [], docsCount: 0 });
  const [articles, setArticles] = useState<Article[]>([]);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const { getArticles } = await import('@/lib/api');
      const [bs, bp, w, docs, arts] = await Promise.all([
        getBloodSugarLogs(token),
        getBloodPressureLogs(token),
        getWeightLogs(token),
        getDocuments(token),
        getArticles()
      ]);

      const user = await getCurrentUser(token);
      setUser(user);

      setVitals({
        bs: bs || [],
        bp: bp || [],
        weight: w || [],
        docsCount: (docs.results || docs.documents || []).length
      });

      setArticles((arts || []).filter((a: Article) => a.status === 'published').slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latestBP = vitals.bp[0] ? `${vitals.bp[0].systolic}/${vitals.bp[0].diastolic}` : "---/--";
  const latestGlucose = vitals.bs[0] ? vitals.bs[0].glucose_value : "--";
  const latestWeight = vitals.weight[0] ? vitals.weight[0].weight_kg : "--.-";

  // Build mini sparkline data per metric
  const glucoseTrend = [...vitals.bs].reverse().slice(-7).map(v => v.glucose_value);
  const bpTrend = [...vitals.bp].reverse().slice(-7).map(v => v.systolic);
  const weightTrend = [...vitals.weight].reverse().slice(-7).map(v => v.weight_kg);

  // Mini sparkline SVG component
  const Sparkline = ({
    data,
    color,
    thresholdHigh,
  }: {
    data: number[];
    color: string;
    thresholdHigh?: number;
  }) => {
    const points = data.length > 0 ? data : [0, 0, 0, 0, 0];
    const min = Math.min(...points);
    const max = Math.max(...points) || 1;
    const w = 100;
    const h = 40;
    const pad = 4;

    const coords = points.map((v, i) => {
      const x = pad + (i / (points.length - 1 || 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
      return `${x},${y}`;
    });

    const polyline = coords.join(" ");
    const area = `${pad},${h} ${polyline} ${w - pad},${h}`;

    const lastX = parseFloat(coords[coords.length - 1].split(",")[0]);
    const lastY = parseFloat(coords[coords.length - 1].split(",")[1]);
    const isHigh = thresholdHigh !== undefined && points[points.length - 1] > thresholdHigh;
    const dotColor = isHigh ? "#f59e0b" : color;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#grad-${color.replace("#", "")})`} />
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={lastX} cy={lastY} r="2.5" fill={dotColor} />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-300 text-foreground font-sans pb-20">

      <header className="w-full max-w-6xl mt-6 px-6 flex justify-between items-center" style={{ animation: "fadeUp 0.3s ease-out" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 squircle bg-richcerulean flex items-center justify-center shadow-md shadow-richcerulean/20">
            <HeartPulse className="text-background" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-foreground">Dashboard</h1>
            <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">Welcome back {user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            href="/profile"
            title="profile"
            bgClass="bg-richcerulean text-background"
            hoverClass="hover:bg-foreground hover:text-background"
          >
            <CircleUserRound size={20} />
          </Button>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 mt-8">
        <div className="lg:col-span-4 flex flex-col gap-6" style={{ animation: "fadeUp 0.4s ease-out" }}>
          <div className="bg-transparent relative group">
            <div className="px-3 py-1.5 squircle text-foreground text-5xl font-mono font-bold tracking-wide">
              Your Health Overview
            </div>
            <div className="relative w-full aspect-square overflow-hidden">
              <Image
                src="/images/health-shield.png"
                alt="Health Illustration"
                fill
                sizes="100vw"
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-8" style={{ animation: "fadeUp 0.5s ease-out" }}>

          <div className="flex md:flex-row flex-col gap-4">

            {/* Tracking Data Grid — 1:1 on desktop, full width on mobile */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-mono font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">Body Conditions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Blood Pressure */}
                <div className="w-full sm:aspect-square squircle bg-background p-6 border border-foreground/10 shadow-sm flex flex-col gap-3 hover:border-red-500/30 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 squircle bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                      <HeartPulse size={20} className="text-red-500" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-foreground/30 uppercase tracking-[0.2em]">Blood Pressure</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-foreground/50 uppercase tracking-widest block mb-1">Latest</span>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-foreground tracking-tight">{latestBP}</span>
                      <span className="text-[11px] font-mono text-foreground/40 mb-1.5 font-bold uppercase">mmHg</span>
                    </div>
                  </div>
                  {/* Mini sparkline */}
                  <div className="mt-auto h-10 w-full opacity-70 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={bpTrend} color="#ef4444" thresholdHigh={130} />
                  </div>
                  <p className="text-[9px] font-mono text-foreground/30 uppercase tracking-widest">Last 7 readings</p>
                </div>

                {/* Glucose */}
                <div className="w-full sm:aspect-square squircle bg-background p-6 border border-foreground/10 shadow-sm flex flex-col gap-3 hover:border-richcerulean/30 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 squircle bg-richcerulean/10 flex items-center justify-center group-hover:bg-richcerulean/20 transition-colors">
                      <Droplet size={20} className="text-richcerulean" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-foreground/30 uppercase tracking-[0.2em]">Glucose</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-foreground/50 uppercase tracking-widest block mb-1">Latest</span>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-foreground tracking-tight">{latestGlucose}</span>
                      <span className="text-[11px] font-mono text-foreground/40 mb-1.5 font-bold uppercase">mg/dL</span>
                    </div>
                  </div>
                  <div className="mt-auto h-10 w-full opacity-70 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={glucoseTrend} color="#0a84c8" thresholdHigh={120} />
                  </div>
                  <p className="text-[9px] font-mono text-foreground/30 uppercase tracking-widest">Last 7 readings</p>
                </div>

                {/* Weight */}
                <div className="w-full sm:aspect-square squircle bg-background p-6 border border-foreground/10 shadow-sm flex flex-col gap-3 hover:border-amber-500/30 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 squircle bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <Scale size={20} className="text-amber-500" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-foreground/30 uppercase tracking-[0.2em]">Weight</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-foreground/50 uppercase tracking-widest block mb-1">Latest</span>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-foreground tracking-tight">{latestWeight}</span>
                      <span className="text-[11px] font-mono text-foreground/40 mb-1.5 font-bold uppercase">kg</span>
                    </div>
                  </div>
                  <div className="mt-auto h-10 w-full opacity-70 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={weightTrend} color="#f59e0b" />
                  </div>
                  <p className="text-[9px] font-mono text-foreground/30 uppercase tracking-widest">Last 7 readings</p>
                </div>

                {/* Lab Records */}
                <div className="w-full sm:aspect-square squircle bg-background p-6 border border-foreground/10 shadow-sm flex flex-col gap-3 hover:border-green-500/30 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 squircle bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <FileText size={20} className="text-green-500" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-foreground/30 uppercase tracking-[0.2em]">Records</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-foreground/50 uppercase tracking-widest block mb-1">Stored</span>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-foreground tracking-tight">{vitals.docsCount}</span>
                      <span className="text-[11px] font-mono text-foreground/40 mb-1.5 font-bold uppercase">Documents</span>
                    </div>
                  </div>
                  {/* Static bar fill to indicate storage used — decorative */}
                  <div className="mt-auto flex flex-col gap-1.5">
                    <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500/50 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((vitals.docsCount / 20) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400/30 rounded-full transition-all duration-700 delay-75"
                        style={{ width: `${Math.min((vitals.docsCount / 20) * 70, 100)}%` }}
                      />
                    </div>
                    <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-300/20 rounded-full transition-all duration-700 delay-150"
                        style={{ width: `${Math.min((vitals.docsCount / 20) * 45, 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[9px] font-mono text-foreground/30 uppercase tracking-widest">Storage usage</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-mono font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">Quick Actions</h2>
              <div className="flex flex-col squircle bg-background border border-foreground/10 shadow-sm overflow-hidden divide-y divide-foreground/10">
                
                <Link href="/documents" className="group flex items-center p-4 hover:bg-richcerulean/5 transition-all">
                  <div className="w-10 h-10 squircle bg-richcerulean/10 flex items-center justify-center mr-4 group-hover:bg-richcerulean/20 transition-colors shrink-0">
                    <FileText size={18} className="text-richcerulean" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-richcerulean transition-colors">Upload PDF</h3>
                    <p className="text-[9px] font-mono text-foreground/40 uppercase tracking-widest mt-0.5">Automated extraction</p>
                  </div>
                  <ChevronRight size={16} className="text-foreground/20 group-hover:text-richcerulean transition-colors" />
                </Link>

                <Link href="/chatbot" className="group flex items-center p-4 hover:bg-richcerulean/5 transition-all">
                  <div className="w-10 h-10 squircle bg-richcerulean/10 flex items-center justify-center mr-4 group-hover:bg-richcerulean/20 transition-colors shrink-0">
                    <Bot size={18} className="text-richcerulean" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-richcerulean transition-colors">Health Chat</h3>
                    <p className="text-[9px] font-mono text-foreground/40 uppercase tracking-widest mt-0.5">AI Consultation</p>
                  </div>
                  <ChevronRight size={16} className="text-foreground/20 group-hover:text-richcerulean transition-colors" />
                </Link>

                <Link href="/documents" className="group flex items-center p-4 hover:bg-richcerulean/5 transition-all">
                  <div className="w-10 h-10 squircle bg-richcerulean/10 flex items-center justify-center mr-4 group-hover:bg-richcerulean/20 transition-colors shrink-0">
                    <ActivitySquare size={18} className="text-richcerulean" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-richcerulean transition-colors">Manual Entry</h3>
                    <p className="text-[9px] font-mono text-foreground/40 uppercase tracking-widest mt-0.5">Log today's vitals</p>
                  </div>
                  <ChevronRight size={16} className="text-foreground/20 group-hover:text-richcerulean transition-colors" />
                </Link>
                
              </div>
            </div>
          </div>
        
          {/* Articles */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-mono font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">Health Library</h2>
            
            <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {articles.map((art, i) => (
                <Link 
                  key={i} 
                  href={`/article/${art.id}`} 
                  className="group flex flex-col justify-between p-4 squircle bg-background border border-foreground/10 hover:border-foreground/30 transition-all shadow-sm cursor-pointer aspect-square w-36 shrink-0 snap-start"
                >
                  <div className="w-10 h-10 squircle bg-richcerulean/5 flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-richcerulean" />
                  </div>
                  <div className="mt-2 flex-1 flex items-end">
                    <h3 className="font-semibold text-foreground text-[13px] leading-snug line-clamp-3">
                      {art.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            {/* Browse More Button dipisah dari flex row scroll */}
            <Link href="/article" className="p-4 squircle bg-richcerulean/5 border border-richcerulean/20 flex items-center justify-between group cursor-pointer hover:bg-richcerulean/10 transition-colors">
              <span className="text-[10px] font-bold text-richcerulean uppercase tracking-widest">Browse all articles</span>
              <ChevronRight size={14} className="text-richcerulean/60 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}