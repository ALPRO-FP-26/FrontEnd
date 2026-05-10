'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Clock, ChevronLeft, FileText, Image as ImageIcon, Save, X, Send } from 'lucide-react';
import { getArticles, createArticle, updateArticle, deleteArticle, publishArticle, type Article } from '@/lib/api';
import { useAuthGuard } from '@/lib/useAuthGuard';

export default function AdminArticles() {
    const isChecked = useAuthGuard(true, 'admin');

    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
    const [formValues, setFormValues] = useState({
        title: '',
        content: '',
        cover_image_url: '',
        status: 'draft',
        author_id: '',
        published_at: ''
    });

    useEffect(() => {
        if (isChecked) {
            fetchArticles();
        }
    }, [isChecked]);

    const fetchArticles = async () => {
        try {
            const data = await getArticles();
            setArticles(data || []);
        } catch (err) {
            console.error("Failed to fetch articles:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (article?: Article) => {
        if (article) {
            setEditingArticle(article);
            setFormValues({
                title: article.title || '',
                content: article.content || '',
                cover_image_url: article.cover_image_url || '',
                status: article.status || 'draft',
                author_id: article.author_id || '',
                published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : ''
            });
        } else {
            setEditingArticle(null);
            setFormValues({
                title: '',
                content: '',
                cover_image_url: '',
                status: 'draft',
                author_id: '',
                published_at: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const payload: any = { ...formValues };
            if (!payload.published_at) {
                delete payload.published_at;
            } else {
                payload.published_at = new Date(payload.published_at).toISOString();
            }

            if (!payload.author_id) {
                delete payload.author_id;
            }

            if (editingArticle?.id) {
                await updateArticle(token, editingArticle.id, payload);
            } else {
                await createArticle(token, payload);
            }
            fetchArticles();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save article:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return;
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            await deleteArticle(token, id);
            fetchArticles();
        } catch (err) {
            console.error("Failed to delete article:", err);
        }
    };

    const handlePublish = async (id: string) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            await publishArticle(token, id);
            fetchArticles();
        } catch (err) {
            console.error("Failed to publish article:", err);
        }
    };

    if (!isChecked) {
        return null;
    }

    const filteredArticles = articles.filter(a =>
        (a.title || '').toLowerCase().includes((search || '').toLowerCase()) ||
        (a.content || '').toLowerCase().includes((search || '').toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-300 text-foreground font-sans">

            <header className="w-full bg-background border-b border-foreground/10 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="w-10 h-10 squircle border border-foreground/10 flex items-center justify-center text-foreground/40 hover:text-richcerulean hover:border-richcerulean transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight text-foreground">Admin Dashboard</h1>
                        <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">Manage your health articles</p>
                    </div>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-2.5 squircle bg-richcerulean text-background font-bold text-sm flex items-center gap-2 hover:bg-foreground transition-all shadow-md shadow-richcerulean/10"
                >
                    <Plus size={18} /> New Article
                </button>
            </header>

            <main className="w-full max-w-6xl mx-auto p-6 sm:p-10 flex flex-col gap-8">

                {/* Search & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background border border-foreground/10 squircle pl-12 pr-4 py-3 outline-none focus:border-richcerulean transition-all text-sm"
                        />
                    </div>
                    <div className="squircle bg-background border border-foreground/10 p-3 flex items-center justify-between px-6">
                        <span className="text-[10px] font-mono font-bold text-foreground/30 uppercase tracking-widest">Total</span>
                        <span className="text-xl font-bold text-foreground">{articles.length}</span>
                    </div>
                </div>

                {/* Articles List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-foreground/30 gap-4">
                            <div className="w-8 h-8 border-2 border-richcerulean/30 border-t-richcerulean rounded-full animate-spin" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Loading articles...</span>
                        </div>
                    ) : filteredArticles.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-foreground/20 gap-4 bg-background/50 squircle border border-dashed border-foreground/10">
                            <FileText size={48} />
                            <span className="text-sm font-medium">No articles found.</span>
                        </div>
                    ) : (
                        filteredArticles.map((article) => (
                            <div
                                key={article.id}
                                className="squircle bg-background border border-foreground/10 p-5 flex flex-col sm:flex-row items-center gap-6 hover:border-richcerulean/40 transition-all group"
                            >
                                <div className="w-full sm:w-24 h-24 squircle bg-gray-300 overflow-hidden shrink-0">
                                    {article.cover_image_url ? (
                                        <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-foreground/20">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${article.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                                            }`}>
                                            {article.status}
                                        </span>
                                        <span className="text-[10px] font-mono text-foreground/30 uppercase flex items-center gap-1.5">
                                            <Clock size={12} /> {new Date(article.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground truncate">{article.title}</h3>
                                    <p className="text-xs text-foreground/50 line-clamp-1 mt-1">{(article.content || '').substring(0, 150)}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {article.status !== 'published' && (
                                        <button
                                            onClick={() => handlePublish(article.id)}
                                            className="p-2.5 squircle bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                            title="Publish"
                                        >
                                            <Send size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleOpenModal(article)}
                                        className="p-2.5 squircle bg-richcerulean/10 text-richcerulean hover:bg-richcerulean hover:text-white transition-all shadow-sm"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="p-2.5 squircle bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Editor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
                    <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    <div className="relative w-full max-w-4xl bg-background squircle shadow-2xl flex flex-col max-h-[90vh]" style={{ animation: "fadeUp 0.3s ease-out" }}>
                        <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{editingArticle ? 'Edit Article' : 'New Article'}</h2>
                                <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest mt-1">Compose your health insight</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 squircle hover:bg-foreground/5 flex items-center justify-center transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest ml-1">Article Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formValues.title}
                                    onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                                    placeholder="Enter a compelling title..."
                                    className="w-full bg-gray-300 border border-foreground/10 squircle px-6 py-4 text-lg font-bold outline-none focus:border-richcerulean transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest ml-1">Cover Image URL</label>
                                    <input
                                        type="url"
                                        value={formValues.cover_image_url}
                                        onChange={(e) => setFormValues({ ...formValues, cover_image_url: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full bg-gray-300 border border-foreground/10 squircle px-4 py-3 text-sm outline-none focus:border-richcerulean transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        value={formValues.status}
                                        onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
                                        className="w-full bg-gray-300 border border-foreground/10 squircle px-4 py-3 text-sm outline-none focus:border-richcerulean transition-all appearance-none"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest ml-1">Author ID</label>
                                    <input
                                        type="text"
                                        value={formValues.author_id}
                                        onChange={(e) => setFormValues({ ...formValues, author_id: e.target.value })}
                                        placeholder="Leave blank for auto-assign..."
                                        className="w-full bg-gray-300 border border-foreground/10 squircle px-4 py-3 text-sm outline-none focus:border-richcerulean transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest ml-1">Published At</label>
                                    <input
                                        type="datetime-local"
                                        value={formValues.published_at}
                                        onChange={(e) => setFormValues({ ...formValues, published_at: e.target.value })}
                                        className="w-full bg-gray-300 border border-foreground/10 squircle px-4 py-3 text-sm outline-none focus:border-richcerulean transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 flex-1">
                                <label className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-widest ml-1">Content</label>
                                <textarea
                                    required
                                    value={formValues.content}
                                    onChange={(e) => setFormValues({ ...formValues, content: e.target.value })}
                                    placeholder="Write your article content here..."
                                    rows={12}
                                    className="w-full bg-gray-300 border border-foreground/10 squircle p-6 text-sm outline-none focus:border-richcerulean transition-all resize-none leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-3 squircle border border-foreground/10 text-foreground/40 font-bold text-sm hover:border-foreground/30 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-3 squircle bg-richcerulean text-background font-bold text-sm flex items-center gap-2 hover:bg-foreground transition-all shadow-lg shadow-richcerulean/20"
                                >
                                    <Save size={18} /> {editingArticle ? 'Update Article' : 'Create Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
