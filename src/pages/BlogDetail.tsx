import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Tag, Share2, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Post } from '../types';
import MatrixBackground from '../components/MatrixBackground';
import CustomCursor from '../components/CustomCursor';
import Magnetic from '../components/Magnetic';
import { useMechanicalClick } from '../hooks/useMechanicalClick';
import { useKeyboardSound } from '../hooks/useKeyboardSound';

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const { handleClick } = useMechanicalClick();
  const { playHackerSound } = useKeyboardSound();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts`);
        const posts: Post[] = await response.json();
        
        // Find the post by ID
        const foundPost = posts.find(p => p.id === parseInt(id || '0'));
        setPost(foundPost || null);

        // Get related posts by category
        if (foundPost) {
          const related = posts
            .filter(p => p.category === foundPost.category && p.id !== foundPost.id)
            .slice(0, 3);
          setRelatedPosts(related);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <MatrixBackground />
        <CustomCursor />
        <div className="text-neon-green font-mono text-center">
          <div className="text-2xl mb-4 glitch">DECRYPTING_BRIEF...</div>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                className="w-2 h-2 rounded-full bg-neon-green"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <MatrixBackground />
        <CustomCursor />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center glass-card p-12 border-neon-green/30"
        >
          <h1 className="text-4xl font-bold text-neon-green mb-4 glitch">404_NOT_FOUND</h1>
          <p className="text-neon-green/50 mb-8 font-mono">Signal interrupted. Brief not located in database.</p>
          <Magnetic>
            <button
              onClick={(e) => {
                handleClick(e);
                navigate('/');
              }}
              className="px-6 py-3 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all uppercase tracking-widest text-xs btn-mechanical"
            >
              [ RETURN_TO_MAIN ]
            </button>
          </Magnetic>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neon-green font-mono">
      <MatrixBackground />
      <CustomCursor />
      <div className="scanlines" />

      {/* Header Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 border-b border-neon-green/30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Magnetic>
            <button
              onClick={(e) => {
                handleClick(e);
                navigate('/');
              }}
              className="flex items-center gap-2 text-neon-green/50 hover:text-neon-green transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-xs uppercase tracking-widest">BACK</span>
            </button>
          </Magnetic>
          <div className="text-xs font-mono text-neon-green/30 truncate max-w-xs text-center">
            [{post.category?.toUpperCase()}] - SECURE_BRIEFING
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            {/* Meta Info Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-neon-green/20">
              <div className="flex items-center gap-2 text-[11px] text-neon-green/50 font-mono uppercase tracking-widest">
                <Calendar size={14} />
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <span className="text-neon-green/20">|</span>
              <div className="flex items-center gap-2 text-[11px] text-neon-green/50 font-mono uppercase tracking-widest">
                <Tag size={14} />
                THREAT_CLASS: [{post.category?.toUpperCase() || 'RESEARCH'}]
              </div>
              <span className="text-neon-green/20 ml-auto">|</span>
              <Magnetic>
                <button
                  onClick={(e) => {
                    handleClick(e);
                  }}
                  className="flex items-center gap-1 text-[11px] text-neon-green/50 hover:text-neon-green transition-colors font-mono uppercase tracking-widest"
                  title="Share this brief"
                >
                  <Share2 size={14} />
                </button>
              </Magnetic>
            </div>

            {/* Title */}
            <h1 className="text-5xl font-bold mb-6 leading-tight glitch">
              {post.title}
            </h1>

            {/* Featured Image */}
            {post.image && (
              <div className="relative overflow-hidden mb-12 border-2 border-neon-green/30">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-96 object-cover grayscale brightness-50 hover:brightness-75 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,255,65,0.1) 4px, rgba(0,255,65,0.1) 5px)',
                  pointerEvents: 'none'
                }} />
              </div>
            )}

            {/* Excerpt */}
            <p className="text-lg text-neon-green/60 italic mb-8 font-mono border-l-4 border-neon-green/40 pl-6">
              {post.excerpt}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert max-w-none mb-16"
            style={{
              '--tw-prose-body': 'rgba(0, 255, 65, 0.7)',
              '--tw-prose-headings': 'rgba(0, 255, 65, 1)',
              '--tw-prose-links': 'rgba(0, 255, 65, 1)',
              '--tw-prose-code': 'rgba(0, 255, 65, 1)',
              '--tw-prose-hr': 'rgba(0, 255, 65, 0.2)',
            } as any}
          >
            <div className="text-neon-green/70 leading-relaxed font-mono text-sm space-y-4">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-neon-green glitch border-t border-neon-green/20 pt-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-neon-green/90">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2 text-neon-green/80">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-neon-green/70">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-neon-green/70">{children}</ol>,
                  li: ({ children }) => <li className="text-neon-green/70">{">"} {children}</li>,
                  code: ({ children }) => <code className="bg-neon-green/10 px-2 py-1 rounded text-neon-green font-mono text-xs border border-neon-green/20">{children}</code>,
                  pre: ({ children }) => (
                    <div className="bg-neon-green/5 border border-neon-green/30 rounded p-4 overflow-x-auto mb-4">
                      <pre className="text-neon-green/80">{children}</pre>
                    </div>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-neon-green/40 pl-4 italic text-neon-green/60 my-4">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-green hover:underline hover:text-neon-green/80 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4 }}
            className="h-px bg-gradient-to-r from-transparent via-neon-green/40 to-transparent my-12"
          />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="text-neon-green/40">///</span> RELATED_BRIEFS
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {relatedPosts.map((relPost) => (
                  <motion.div
                    key={relPost.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      handleClick(e as any);
                      navigate(`/blog/${relPost.id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="glass-card p-4 border-neon-green/20 cursor-pointer hover:border-neon-green/50 transition-all"
                  >
                    <div className="text-[9px] text-neon-green/40 font-mono mb-2 uppercase tracking-widest">
                      {new Date(relPost.created_at).toLocaleDateString()}
                    </div>
                    <h3 className="font-bold text-sm mb-2 line-clamp-2 hover:text-neon-green transition-colors">
                      {relPost.title}
                    </h3>
                    <p className="text-[10px] text-neon-green/50 line-clamp-2 font-mono">
                      {relPost.excerpt}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 pt-12 border-t border-neon-green/10 text-center"
          >
            <p className="text-neon-green/50 text-sm mb-6 font-mono">
              More insights coming soon. Subscribe for updates.
            </p>
            <Magnetic>
              <button
                onClick={(e) => {
                  handleClick(e);
                  navigate('/#contact');
                }}
                className="px-8 py-3 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all uppercase tracking-widest text-xs btn-mechanical"
              >
                [ GET_IN_TOUCH ]
              </button>
            </Magnetic>
          </motion.div>
        </article>
      </main>
    </div>
  );
}
