'use client';

import React, { useEffect, useState } from 'react';
import { Newspaper, Plus, Trash2, Edit2, CheckCircle, XCircle, FileText, Image as ImageIcon } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  category: string;
  author: string;
  image_url?: string;
  summary: string;
  content: string;
  published: boolean;
  created_at: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Company News');
  const [author, setAuthor] = useState('Braham Sama Team');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPosts = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const res = await fetch('/api/blog/admin', {
        headers: {
          'Authorization': `Bearer ${currentUser.token || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching admin blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openAddModal = () => {
    setEditingPost(null);
    setTitle('');
    setCategory('Company News');
    setAuthor('Braham Sama Team');
    setSummary('');
    setContent('');
    setPublished(true);
    setImageFile(null);
    setMessage('');
    setShowModal(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setCategory(post.category);
    setAuthor(post.author);
    setSummary(post.summary);
    setContent(post.content);
    setPublished(post.published);
    setImageFile(null);
    setMessage('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('author', author);
      formData.append('summary', summary);
      formData.append('content', content);
      formData.append('published', String(published));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = editingPost ? `/api/blog/${editingPost.id}` : '/api/blog';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${currentUser.token || ''}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchPosts();
      } else {
        setMessage(data.message || 'Error saving post');
      }
    } catch (err: any) {
      setMessage('Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const res = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token || ''}`
        }
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-xs uppercase tracking-widest">
            <Newspaper className="w-4 h-4" /> Content & Communications
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Blog & News Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Post announcements and articles to display on the company welcome page.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-5 h-5" /> Post New Article
        </button>
      </div>

      {/* POSTS LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading blog posts...</div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-slate-400 opacity-60" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No blog posts found</p>
            <p className="text-xs text-slate-500">Click "Post New Article" above to add your first company update.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <div key={post.id} className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {post.image_url && (
                    <div className="h-40 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md">
                      {post.category}
                    </span>
                    <span className={`text-[11px] font-semibold flex items-center gap-1 ${post.published ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {post.published ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">{post.summary}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(post)} className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingPost ? 'Edit Blog Article' : 'Post New Article'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                ✕
              </button>
            </div>

            {message && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Braham Sama Launches New Operations Branch"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Company News / Fleet / Investment"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Author Name</label>
                  <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Braham Sama Team"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cover Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-600 dark:file:text-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Brief Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Short description displayed on article cards..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Article Content *</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                  placeholder="Write the full news post or article details here..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="published-check"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                />
                <label htmlFor="published-check" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Publish Article Immediately on Welcome Page
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-md hover:bg-amber-600 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingPost ? 'Update Post' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
