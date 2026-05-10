'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Clock, ArrowRight,Calendar, User as UserIcon, ArrowLeft } from 'lucide-react';
import { getArticles, type Article } from '@/lib/api';
import Button from '@/components/button';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const data = await getArticles();
      const published = (data || []).filter(a => a.status === 'published');
      setArticles(published);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(a => 
    (a.title || '').toLowerCase().includes((search || '').toLowerCase()) ||
    (a.content || '').toLowerCase().includes((search || '').toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-300 text-foreground font-sans pb-20">
      
      <header className="w-[70%] mt-5 z-10 flex -space-x-2.75 items-center mx-auto">
        <Button
          href="/dashboard"
          title="Back"
          bgClass="bg-richcerulean text-background"
          hoverClass="hover:bg-foreground hover:text-background"
        >
          <ArrowLeft size={20} />
        </Button>

        <span className="w-7 h-7 rotate-135 -my-5 bg-background scoop-70-30 -z-1" />

        <div className="flex flex-col w-full px-6 py-4 squircle bg-background">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">Health Library</h1>
              <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest mt-1">
                Explore medical insights
              </p>
            </div>

            <div className="relative flex-1 max-w-md md:ml-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
              <input 
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-100 border border-foreground/5 squircle pl-10 pr-4 py-2 outline-none focus:border-richcerulean/30 transition-all text-xs"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col gap-4 animate-pulse">
                <div className="aspect-video bg-background/50 squircle" />
                <div className="h-4 bg-background/50 rounded w-1/3" />
                <div className="h-8 bg-background/50 rounded w-full" />
                <div className="h-4 bg-background/50 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-foreground/20 gap-4">
            <BookOpen size={64} />
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground/40">No articles found</h3>
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Link 
                key={article.id} 
                href={`/article/${article.id}`}
                className="group flex flex-col bg-background border border-foreground/10 squircle overflow-hidden hover:border-richcerulean/40 hover:-translate-y-1 transition-all shadow-sm"
              >
                <div className="aspect-video w-full bg-gray-300 relative overflow-hidden">
                  {article.cover_image_url ? (
                    <img 
                      src={article.cover_image_url} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/20">
                      <BookOpen size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-foreground  pointer-events-none" />
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest"><Calendar size={12} /> {new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                  
                  <h2 className="text-xl font-bold text-foreground mb-3 leading-tight group-hover:text-richcerulean transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  
                  <p className="text-sm text-foreground/50 line-clamp-3 mb-6 leading-relaxed">
                    {(article.content || '').substring(0, 160)}...
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-foreground/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-richcerulean/10 flex items-center justify-center">
                        <UserIcon size={12} className="text-richcerulean" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest">Medical Staff</span>
                    </div>
                    <div className="flex items-center gap-1 text-richcerulean font-bold text-[11px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Read More <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
