'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User as UserIcon,
  Share2, ArrowLeft, BookOpen, Check
} from 'lucide-react';
import { getArticle, type Article } from '@/lib/api';
import Button from '@/components/button';

export default function ArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string);
    }
  }, [params.id]);

  const fetchArticle = async (id: string) => {
    try {
      const data = await getArticle(id);
      setArticle(data);
    } catch (err) {
      console.error("Failed to fetch article:", err);
      setError("Article not found or failed to load.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin URL:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300 text-foreground">
        <div className="w-10 h-10 border-2 border-richcerulean border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/40">Opening article...</span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300 text-foreground gap-6">
        <div className="w-20 h-20 squircle bg-red-500/10 flex items-center justify-center text-red-500">
          <BookOpen size={40} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Oops! Article not found</h1>
          <p className="text-foreground/50 mt-2">The article you're looking for doesn't exist or was removed.</p>
        </div>
        <Link href="/article" className="px-8 py-3 squircle bg-richcerulean text-background font-bold text-sm hover:bg-foreground transition-all">
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-300 text-foreground font-sans pb-20">

      {/* Article Header & Cover */}
      <header className="w-[70%] mx-auto squircle mt-5  bg-background pb-12 relative overflow-hidden">
        {/* Navigation Bar */}
        <div className="w-full max-w-4xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
          <Link href="/article" className="flex items-center gap-2 text-foreground/40 hover:text-richcerulean transition-colors font-bold text-xs uppercase tracking-widest group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Articles
          </Link>

          <Button
            onClick={handleShare}
            icon={copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
            title={copied ? "Link Copied!" : "Share Article"}
            bgClass={copied ? "bg-green-50" : undefined}
          />
        </div>

        <div className="w-ful max-w-4xl mx-auto px-6 mt-8">
          <div className="flex flex-col gap-6">
            <span className="px-3 py-1 w-fit squircle bg-richcerulean/10 text-richcerulean text-[10px] font-mono font-bold uppercase tracking-widest">Medical Insight</span>

            <h1 className="text-4xl sm:text-5xl font-black text-foreground leading-[1.1] tracking-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                  <UserIcon size={18} className="text-foreground/40" />
                </div>
                <div>
                  <p className="text-[11px] font-mono font-bold text-foreground uppercase tracking-widest leading-none">Medical Editorial</p>
                  <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest mt-1">Verified Expert Content</p>
                </div>
              </div>
              <div className="h-8 w-px bg-foreground/10" />
              <div className="flex flex-col">
                <p className="text-[11px] font-mono font-bold text-foreground/40 uppercase tracking-widest leading-none">Published On</p>
                <p className="text-[10px] font-mono text-foreground uppercase tracking-widest mt-1 font-bold">
                  {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {article.cover_image_url && (
          <div className="w-full max-w-6xl mx-auto px-6 mt-12">
            <div className="aspect-21/9 w-full squircle overflow-hidden shadow-2xl border border-foreground/5 bg-gray-300">
              <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </header>

      {/* Article Content */}
      <main className="w-[70%] py-16 flex flex-col md:flex-row gap-12">
        <div className="flex-1 min-w-0">
          <div className="bg-background p-8 squircle prose prose-lg max-w-none prose-slate prose-headings:text-foreground prose-p:text-foreground/70 prose-strong:text-foreground prose-a:text-richcerulean text-md leading-[1.8] whitespace-pre-wrap">
            {article.content}
          </div>

          <div className="mt-16 pt-8 border-t border-foreground/10 flex flex-wrap items-center justify-between gap-6">
            <Link href="/article" className="text-sm font-bold text-richcerulean hover:underline flex items-center gap-2">
              Discover more articles <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>

        <aside className="w-full md:w-72 shrink-0">
          <div className="sticky top-24 flex flex-col gap-8">
            <div className="squircle bg-background border border-foreground/10 p-6 shadow-sm">
              <h3 className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4">Quick Insights</h3>
              <ul className="flex flex-col gap-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-richcerulean mt-1.5 shrink-0" />
                  <p className="text-xs text-foreground/60 leading-relaxed font-medium">Keep your health logs updated for more accurate AI insights.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-richcerulean mt-1.5 shrink-0" />
                  <p className="text-xs text-foreground/60 leading-relaxed font-medium">Always consult with a medical professional regarding changes to your health plan.</p>
                </li>
              </ul>
            </div>

            <div className="squircle bg-richcerulean p-6 shadow-lg shadow-richcerulean/20 text-background">
              <h3 className="text-lg font-bold mb-2">Need advice?</h3>
              <p className="text-xs text-background/80 leading-relaxed mb-6">Talk to our AI Health Assistant about the findings in your latest lab reports.</p>
              <Link href="/chatbot" className="block w-full py-3 squircle bg-background text-richcerulean text-center font-bold text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all">
                Start Chat
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}