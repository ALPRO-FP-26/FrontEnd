'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { 
  FileText, Bot, User, ChevronRight, Droplet, HeartPulse, Scale, ActivitySquare 
} from "lucide-react";
import { getBloodSugarLogs, getBloodPressureLogs, getWeightLogs, getDocuments } from '@/lib/api';

export default function Dashboard() {
  const [sex, setSex] = useState("male");
  const [vitals, setVitals] = useState<{
    bs: any[];
    bp: any[];
    weight: any[];
    docsCount: number;
  }>({ bs: [], bp: [], weight: [], docsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"glucose" | "bp" | "weight">("glucose");

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const [bs, bp, w, docs] = await Promise.all([
        getBloodSugarLogs(token),
        getBloodPressureLogs(token),
        getWeightLogs(token),
        getDocuments(token)
      ]);

      setVitals({
        bs: bs || [],
        bp: bp || [],
        weight: w || [],
        docsCount: (docs.results || docs.documents || []).length
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latestBP = vitals.bp[0] ? `${vitals.bp[0].systolic}/${vitals.bp[0].diastolic}` : "---/--";
  const latestGlucose = vitals.bs[0] ? vitals.bs[0].glucose_value : "--";
  const latestWeight = vitals.weight[0] ? vitals.weight[0].weight_kg : "--.-";

  const getTrendData = () => {
    switch (chartType) {
      case "bp":
        return [...vitals.bp].reverse().slice(-7).map(v => ({
          day: new Date(v.recorded_at).toLocaleDateString('en-US', { weekday: 'short' }),
          val: v.systolic,
          subVal: v.diastolic,
          unit: "mmHg",
          label: "BP"
        }));
      case "weight":
        return [...vitals.weight].reverse().slice(-7).map(v => ({
          day: new Date(v.recorded_at).toLocaleDateString('en-US', { weekday: 'short' }),
          val: v.weight_kg,
          unit: "kg",
          label: "Weight"
        }));
      default:
        return [...vitals.bs].reverse().slice(-7).map(v => ({
          day: new Date(v.recorded_at).toLocaleDateString('en-US', { weekday: 'short' }),
          val: v.glucose_value,
          unit: "mg/dL",
          label: "Glucose"
        }));
    }
  };

  const glucoseTrend = getTrendData();

  const displayTrend = glucoseTrend.length > 0 ? glucoseTrend : [
    { day: 'Mon', val: 0, unit: "", label: "" }, { day: 'Tue', val: 0, unit: "", label: "" }, { day: 'Wed', val: 0, unit: "", label: "" },
    { day: 'Thu', val: 0, unit: "", label: "" }, { day: 'Fri', val: 0, unit: "", label: "" }, { day: 'Sat', val: 0, unit: "", label: "" }, { day: 'Sun', val: 0, unit: "", label: "" }
  ];

  const maxVal = Math.max(...displayTrend.map(d => d.val), chartType === "bp" ? 200 : chartType === "weight" ? 100 : 150);
  const avgVal = glucoseTrend.length > 0 
    ? Math.round(glucoseTrend.reduce((acc, curr: any) => acc + curr.val, 0) / glucoseTrend.length) 
    : 0;

  const chartTitle = chartType === "glucose" ? "Glucose Trend" : chartType === "bp" ? "Blood Pressure (Systolic)" : "Weight Trend";
  const unitLabel = chartType === "glucose" ? "mg/dL" : chartType === "bp" ? "mmHg" : "kg";

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-300 text-foreground font-sans pb-20">
      
      <header className="w-full max-w-5xl mt-6 px-6 flex justify-between items-center" style={{ animation: "fadeUp 0.3s ease-out" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 squircle bg-richcerulean flex items-center justify-center shadow-md shadow-richcerulean/20">
            <HeartPulse className="text-background" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-foreground">Dashboard</h1>
            <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">Welcome back, {sex === 'male' ? 'Mr.' : sex === 'female' ? 'Ms.' : 'User'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/profile" className="w-10 h-10 squircle bg-background border border-foreground/10 flex items-center justify-center text-foreground/60 shadow-sm cursor-pointer hover:border-richcerulean/40 hover:text-richcerulean transition-colors">
            <User size={18} />
          </Link>
        </div>
      </header>

      <main className="w-full max-w-5xl flex flex-col gap-6 px-6 mt-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" style={{ animation: "fadeUp 0.4s ease-out" }}>
          
          <div className="squircle bg-background p-5 border border-foreground/10 shadow-sm flex flex-col gap-3 hover:border-richcerulean/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 squircle bg-red-500/10 flex items-center justify-center">
                <HeartPulse size={16} className="text-red-500" />
              </div>
              <span className="text-[10px] font-mono font-semibold text-foreground/60 uppercase tracking-widest">Blood Pressure</span>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{latestBP}</span>
              <span className="text-[10px] font-mono text-foreground/50 mb-1">mmHg</span>
            </div>
          </div>

          <div className="squircle bg-background p-5 border border-foreground/10 shadow-sm flex flex-col gap-3 hover:border-richcerulean/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 squircle bg-richcerulean/10 flex items-center justify-center">
                <Droplet size={16} className="text-richcerulean" />
              </div>
              <span className="text-[10px] font-mono font-semibold text-foreground/60 uppercase tracking-widest">Last Glucose</span>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{latestGlucose}</span>
              <span className="text-[10px] font-mono text-foreground/50 mb-1">mg/dL</span>
            </div>
          </div>

          <div className="squircle bg-background p-5 border border-foreground/10 shadow-sm flex flex-col gap-3 hover:border-richcerulean/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 squircle bg-amber-500/10 flex items-center justify-center">
                <Scale size={16} className="text-amber-500" />
              </div>
              <span className="text-[10px] font-mono font-semibold text-foreground/60 uppercase tracking-widest">Weight</span>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{latestWeight}</span>
              <span className="text-[10px] font-mono text-foreground/50 mb-1">kg</span>
            </div>
          </div>

          <div className="squircle bg-background p-5 border border-foreground/10 shadow-sm flex flex-col gap-3 hover:border-richcerulean/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 squircle bg-green-500/10 flex items-center justify-center">
                <FileText size={16} className="text-green-500" />
              </div>
              <span className="text-[10px] font-mono font-semibold text-foreground/60 uppercase tracking-widest">Lab Records</span>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{vitals.docsCount}</span>
              <span className="text-[10px] font-mono text-foreground/50 mb-1">docs</span>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ animation: "fadeUp 0.5s ease-out" }}>
          
          <div className="md:col-span-2 squircle bg-background border border-foreground/10 shadow-sm p-6 sm:p-8 flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-foreground">{chartTitle}</h2>
                <p className="text-[10px] font-mono text-foreground/50 mt-1 uppercase tracking-widest">Average: {avgVal} {unitLabel}</p>
              </div>
              <select 
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="bg-gray-300 border border-foreground/15 text-xs font-mono squircle px-3 py-1.5 outline-none text-foreground focus:border-richcerulean transition-colors cursor-pointer"
              >
                <option value="glucose">Glucose</option>
                <option value="bp">Blood Pressure</option>
                <option value="weight">Weight</option>
              </select>
            </div>
            
            <div className="flex-1 flex items-end justify-between h-full gap-2 sm:gap-4 mt-auto">
              {displayTrend.map((d: any, i) => {
                const heightPct = d.val > 0 ? (d.val / maxVal) * 100 : 5;
                const isHigh = chartType === "glucose" ? d.val > 120 : chartType === "bp" ? d.val > 130 : false;
                return (
                  <div key={i} className="flex flex-col items-center gap-3 flex-1 group h-full justify-end">
                    <div className="w-full relative flex justify-center items-end h-[200px]">
                      {d.val > 0 && (
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-mono py-1.5 px-2.5 squircle pointer-events-none z-10 whitespace-nowrap shadow-lg">
                          {d.val}{d.subVal ? `/${d.subVal}` : ''} {d.unit}
                        </div>
                      )}
                      <div 
                        className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 ease-out ${
                          d.val === 0 ? 'bg-foreground/5' :
                          isHigh ? 'bg-amber-400 group-hover:bg-amber-500' : 
                          'bg-richcerulean group-hover:bg-richcerulean/80'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-foreground/50">{d.day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="squircle bg-background border border-foreground/10 shadow-sm p-6 sm:p-8 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-foreground mb-2">Quick Actions</h2>
            
            <Link href="/documents" className="group flex items-center p-4 squircle border border-foreground/15 hover:border-richcerulean/40 hover:bg-richcerulean/5 transition-all cursor-pointer">
              <div className="w-10 h-10 squircle bg-richcerulean/10 flex items-center justify-center mr-4 group-hover:bg-richcerulean/20 transition-colors shrink-0">
                <FileText size={18} className="text-richcerulean" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">Upload Lab Report</h3>
                <p className="text-[10px] font-mono text-foreground/50 truncate uppercase tracking-widest mt-0.5">Extract new PDF data</p>
              </div>
              <ChevronRight size={18} className="text-foreground/30 group-hover:text-richcerulean transition-colors shrink-0" />
            </Link>

            <Link href="/chatbot" className="group flex items-center p-4 squircle border border-foreground/15 hover:border-richcerulean/40 hover:bg-richcerulean/5 transition-all cursor-pointer">
              <div className="w-10 h-10 squircle bg-richcerulean/10 flex items-center justify-center mr-4 group-hover:bg-richcerulean/20 transition-colors shrink-0">
                <Bot size={18} className="text-richcerulean" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">AI Health Chat</h3>
                <p className="text-[10px] font-mono text-foreground/50 truncate uppercase tracking-widest mt-0.5">Ask about your records</p>
              </div>
              <ChevronRight size={18} className="text-foreground/30 group-hover:text-richcerulean transition-colors shrink-0" />
            </Link>

            <Link href="/documents" className="group flex items-center p-4 squircle border border-foreground/15 hover:border-richcerulean/40 hover:bg-richcerulean/5 transition-all cursor-pointer mt-auto">
              <div className="w-10 h-10 squircle bg-richcerulean/10 flex items-center justify-center mr-4 group-hover:bg-richcerulean/20 transition-colors shrink-0">
                <ActivitySquare size={18} className="text-richcerulean" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">Log Vitals</h3>
                <p className="text-[10px] font-mono text-foreground/50 truncate uppercase tracking-widest mt-0.5">Add today&apos;s measurements</p>
              </div>
              <ChevronRight size={18} className="text-foreground/30 group-hover:text-richcerulean transition-colors shrink-0" />
            </Link>

          </div>
        </div>

      </main>
    </div>
  );
}
