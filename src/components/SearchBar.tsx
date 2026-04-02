import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Project, Post, Skill } from '../types';
import { useNavigate } from 'react-router-dom';
import Magnetic from './Magnetic';

interface SearchProps {
  projects: Project[];
  posts: Post[];
  skills: Skill[];
}

interface SearchResult {
  type: 'project' | 'post' | 'skill';
  id: number;
  title: string;
  description: string;
  link?: string;
}

export default function SearchBar({ projects, posts, skills }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const foundResults: SearchResult[] = [];

    // Search projects
    projects.forEach(project => {
      if (
        project.title.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery) ||
        project.technologies?.toLowerCase().includes(lowerQuery)
      ) {
        foundResults.push({
          type: 'project',
          id: Number(project.id),
          title: project.title,
          description: project.description,
          link: '#projects'
        });
      }
    });

    // Search posts
    posts.forEach(post => {
      if (
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery) ||
        post.category?.toLowerCase().includes(lowerQuery)
      ) {
        foundResults.push({
          type: 'post',
          id: post.id,
          title: post.title,
          description: post.excerpt,
          link: `/blog/${post.id}`
        });
      }
    });

    // Search skills
    skills.forEach(skill => {
      if (
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.category.toLowerCase().includes(lowerQuery)
      ) {
        foundResults.push({
          type: 'skill',
          id: skill.id,
          title: skill.name,
          description: skill.category
        });
      }
    });

    setResults(foundResults.slice(0, 8));
  }, [projects, posts, skills]);

  const handleResultClick = (result: SearchResult) => {
    if (result.link?.startsWith('/')) {
      navigate(result.link);
    } else if (result.link?.startsWith('#')) {
      window.location.hash = result.link;
    }
    setIsOpen(false);
    setSearchQuery('');
    setResults([]);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Magnetic>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-neon-green/50 hover:text-neon-green transition-colors"
          title="Global Search"
        >
          <SearchIcon size={20} />
        </button>
      </Magnetic>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
                setResults([]);
              }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Search Dialog */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            >
              <div className="glass-card border-neon-green/30 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-neon-green/20">
                  <SearchIcon size={20} className="text-neon-green/50" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search projects, posts, skills..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsOpen(false);
                        setSearchQuery('');
                        setResults([]);
                      }
                    }}
                    className="flex-1 bg-transparent text-neon-green placeholder:text-neon-green/30 outline-none font-mono text-sm"
                  />
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setSearchQuery('');
                      setResults([]);
                    }}
                    className="p-2 hover:bg-neon-green/10 transition-colors"
                  >
                    <X size={18} className="text-neon-green/50" />
                  </button>
                </div>

                {/* Results */}
                {results.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {results.map((result, idx) => (
                      <motion.button
                        key={`${result.type}-${result.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-6 py-4 border-b border-neon-green/10 hover:bg-neon-green/5 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-neon-green/40 w-16">
                            [{result.type}]
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-neon-green text-sm truncate group-hover:underline">
                              {result.title}
                            </div>
                            <div className="text-neon-green/40 text-xs truncate font-mono">
                              {result.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="px-6 py-8 text-center text-neon-green/40 font-mono text-sm">
                    NO_RESULTS_FOUND
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-neon-green/30 font-mono text-xs">
                    START TYPING TO SEARCH...
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
