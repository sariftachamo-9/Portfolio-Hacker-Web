import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Github, ExternalLink, Copy, Check } from 'lucide-react';
import { Project } from '../types';
import Magnetic from './Magnetic';
import { toast } from 'sonner';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onGithubClick?: () => void;
}

export default function ProjectModal({
  project,
  isOpen,
  onClose,
  onGithubClick
}: ProjectModalProps) {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyLink = () => {
    if (project?.live_link) {
      navigator.clipboard.writeText(project.live_link);
      setCopiedLink(true);
      toast.success('LINK_COPIED: Ready to share');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && project && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card border-neon-green/30 rounded-none">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-black/80 border-b border-neon-green/20 px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-neon-green uppercase tracking-tight glitch">
                    {project.title}
                  </h2>
                </div>
                <Magnetic>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-neon-green/10 transition-colors"
                  >
                    <X size={20} className="text-neon-green" />
                  </button>
                </Magnetic>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Featured Image */}
                {project.image && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="overflow-hidden border-2 border-neon-green/30 aspect-video"
                  >
                    <img
                      src={project.image || `https://picsum.photos/seed/${project.id}/800/450`}
                      alt={project.title}
                      className="w-full h-full object-cover grayscale brightness-50 hover:brightness-75 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                )}

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-neon-green/50 uppercase tracking-widest mb-2">
                      PROJECT_BRIEF
                    </h3>
                    <p className="text-neon-green/70 text-sm leading-relaxed font-mono">
                      {project.description}
                    </p>
                  </div>
                </motion.div>

                {/* Technologies */}
                {project.technologies && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    <h3 className="text-sm font-bold text-neon-green/50 uppercase tracking-widest">
                      TECH_STACK
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.split(',').map((tech, idx) => (
                        <motion.span
                          key={tech}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + idx * 0.05 }}
                          className="px-3 py-1.5 bg-neon-green/5 border border-neon-green/30 text-neon-green/70 text-xs font-mono uppercase tracking-wider hover:border-neon-green hover:text-neon-green transition-all"
                        >
                          {tech.trim()}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Project Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="p-4 bg-neon-green/5 border border-neon-green/20">
                    <div className="text-xs font-mono text-neon-green/40 uppercase mb-2">
                      STATUS
                    </div>
                    <div className="text-sm font-mono text-neon-green flex items-center gap-2">
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-1.5 h-1.5 rounded-full bg-neon-green"
                      />
                      {project.is_visible ? 'DEPLOYED' : 'ARCHIVED'}
                    </div>
                  </div>
                  <div className="p-4 bg-neon-green/5 border border-neon-green/20">
                    <div className="text-xs font-mono text-neon-green/40 uppercase mb-2">
                      DEPLOYED
                    </div>
                    <div className="text-sm font-mono text-neon-green">
                      {new Date(project.created_at).getFullYear()}
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3 pt-4 border-t border-neon-green/10"
                >
                  <Magnetic>
                    <a
                      href={project.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onGithubClick}
                      className="flex-1 px-4 py-3 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest"
                    >
                      <Github size={16} />
                      SOURCE_CODE
                    </a>
                  </Magnetic>
                  {project.live_link && (
                    <Magnetic>
                      <a
                        href={project.live_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-3 bg-neon-green/10 border border-neon-green/50 text-neon-green hover:bg-neon-green/20 transition-all flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest"
                      >
                        <ExternalLink size={16} />
                        VIEW_LIVE
                      </a>
                    </Magnetic>
                  )}
                  {project.live_link && (
                    <Magnetic>
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-3 bg-neon-green/5 border border-neon-green/30 text-neon-green hover:border-neon-green/50 transition-all flex items-center justify-center font-bold uppercase text-xs tracking-widest"
                      >
                        {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </Magnetic>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
