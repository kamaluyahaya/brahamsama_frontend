'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag, Share2, Sparkles, BookOpen } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  image_url?: string;
  images?: string | string[];
  summary: string;
  content: string;
  created_at: string;
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog/public/${params.slug}`);
        if (!res.ok) {
          throw new Error('Post not found');
        }
        const data = await res.json();
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.slug]);

  if (loading) {
    return (
      <div style={{ background: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontWeight: 800 }}>
        Loading Article...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ background: '#020617', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#ffffff' }}>
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>Article Not Found</h2>
        <Link href="/welcome#blog" style={{ color: '#fbbf24', textDecoration: 'underline' }}>Back to Welcome Page</Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#020617', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* HEADER */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, padding: '16px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/welcome#blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#fbbf24', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            <ArrowLeft size={18} /> Back to Blog Posts
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.jpeg" alt="BS Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
            <span style={{ fontWeight: 900, color: '#ffffff', fontSize: 16 }}>Braham Sama Nig Ltd</span>
          </div>
        </div>
      </header>

      {/* ARTICLE HERO */}
      <main style={{ maxWidth: 840, margin: '0 auto', padding: '60px 24px 100px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>
          <Tag size={12} /> {post.category}
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#ffffff', lineHeight: 1.25, marginBottom: 24 }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, color: '#94a3b8', fontSize: 14, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={16} style={{ color: '#fbbf24' }} /> {post.author}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} style={{ color: '#fbbf24' }} /> {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {(() => {
          let gallery: string[] = [];
          if (post.images) {
            try {
              gallery = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
            } catch (e) {
              gallery = [];
            }
          }
          if (gallery.length === 0 && post.image_url) {
            gallery = [post.image_url];
          }

          if (gallery.length === 1) {
            return (
              <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 40, maxHeight: 450 }}>
                <img src={gallery[0]} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              </div>
            );
          } else if (gallery.length > 1) {
            return (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  {gallery.map((imgUrl, i) => (
                    <div key={i} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', height: 260, background: 'rgba(255,255,255,0.02)' }}>
                      <img src={imgUrl} alt={`${post.title} photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10, fontStyle: 'italic' }}>
                  Photo gallery: {gallery.length} event photos attached
                </div>
              </div>
            );
          }
          return null;
        })()}

        <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid #f59e0b', padding: '20px 24px', borderRadius: '0 16px 16px 0', fontSize: 18, fontStyle: 'italic', color: '#e2e8f0', marginBottom: 36, lineHeight: 1.7 }}>
          {post.summary}
        </div>

        <div style={{ color: '#cbd5e1', fontSize: 17, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: 32, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
        <p>© {new Date().getFullYear()} Braham Sama Nig Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
