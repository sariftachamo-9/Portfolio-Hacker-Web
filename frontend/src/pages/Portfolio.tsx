import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Terminal,
  Cpu,
  Shield,
  Zap,
  Send,
  ChevronDown,
  Menu,
  X,
  BookOpen,
  Calendar,
  Lock
} from 'lucide-react';
import { Project, Skill, Experience, Post, Education, Certification } from '../types';
import MatrixBackground from '../components/MatrixBackground';
import CustomCursor from '../components/CustomCursor';
import Magnetic from '../components/Magnetic';
import TerminalComponent from '../components/Terminal';

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [projectFilter, setProjectFilter] = useState('All');
  const [terminalText, setTerminalText] = useState('');
  const fullTerminalText = "> INITIALIZING SYSTEM... [OK]\n> LOADING ASSETS... [OK]\n> DECRYPTING PORTFOLIO... [OK]\n> ACCESS GRANTED.";

  useEffect(() => {
    const fetchLocal = fetch('/api/projects').then(res => res.json());
    const fetchGitHub = fetch('/api/github/repos').then(res => res.json()).catch(() => []);

    Promise.all([fetchLocal, fetchGitHub]).then(([local, github]) => {
      setProjects([...local, ...github]);
    });

    fetch('/api/skills').then(res => res.json()).then(setSkills);
    fetch('/api/experience').then(res => res.json()).then(setExperience);
    fetch('/api/posts').then(res => res.json()).then(setPosts);
    fetch('/api/education').then(res => res.json()).then(setEducation);
    fetch('/api/certifications').then(res => res.json()).then(setCertifications);

    let i = 0;
    const interval = setInterval(() => {
      setTerminalText(fullTerminalText.slice(0, i));
      i++;
      if (i > fullTerminalText.length) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const sections = [
    { id: 'hero', label: 'ROOT' },
    { id: 'about', label: 'BIO' },
    { id: 'skills', label: 'STACK' },
    { id: 'experience', label: 'LOGS' },
    { id: 'projects', label: 'REPOS' },
    { id: 'blog', label: 'INTEL' },
    { id: 'contact', label: 'SIGNAL' }
  ];

  const filteredProjects = projectFilter === 'All'
    ? projects
    : projects.filter(p => p.technologies?.toLowerCase().includes(projectFilter.toLowerCase()));

  const categories = ['All', 'React', 'Node', 'TypeScript', 'Security'];

  return (
    <div className="relative crt-flicker">
      <div className="scanlines" />
      <MatrixBackground />
      <CustomCursor />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 border-b border-neon-green/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Magnetic>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold neon-text flex items-center gap-2 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Terminal size={20} /> [SYSTEM_OVERRIDE]
            </motion.div>
          </Magnetic>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6">
            {sections.map(s => (
              <Magnetic key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`text-xs font-mono transition-all hover:text-neon-green hover:tracking-widest ${activeSection === s.id ? 'text-neon-green underline underline-offset-8' : 'text-neon-green/50'}`}
                  onClick={(e) => {
                    if (s.id === 'cryptography') {
                      window.location.href = '/cryptography';
                    } else {
                      setActiveSection(s.id);
                    }
                  }}
                >
                  ./{s.label}
                </a>
              </Magnetic>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-neon-green" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-8 text-left font-mono">
              {sections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-2xl sm:text-3xl font-bold hover:text-neon-green flex items-center gap-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-neon-green/20 text-sm">0{sections.indexOf(s)}</span>
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 md:p-10 max-w-4xl w-full border-neon-green/50 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-neon-green/20" />

          <div className="mb-8">
            <TerminalComponent />
          </div>

          <h2 className="text-neon-green font-mono mb-2 tracking-widest uppercase text-xs">Computer Engineering | Cybersecurity Enthusiast | AI/ML | Web Dev</h2>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tighter glitch uppercase">
            <span className="neon-text">SARIF</span> <br />
            <span className="neon-text">TACHAMO</span>
          </h1>

          <div className="flex flex-wrap gap-4 justify-center">
            <Magnetic>
              <motion.a
                href="#projects"
                className="px-8 py-3 border border-neon-green text-neon-green font-bold hover:bg-neon-green hover:text-black transition-all uppercase tracking-widest text-xs"
              >
                [ VIEW_REPOS ]
              </motion.a>
            </Magnetic>
            <Magnetic>
              <motion.a
                href="#contact"
                className="px-8 py-3 border border-neon-green/30 text-neon-green/50 font-bold hover:border-neon-green hover:text-neon-green transition-all uppercase tracking-widest text-xs"
              >
                [ SEND_SIGNAL ]
              </motion.a>
            </Magnetic>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10"
        >
          <ChevronDown className="text-neon-green/30" />
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 border border-neon-green/20 animate-pulse" />
            <div className="glass-card p-2 relative group">
              <div className="absolute inset-0 bg-neon-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="/hacker-mask.png"
                alt="Sarif Tachamo"
                className="grayscale contrast-125 brightness-90 hover:grayscale-0 transition-all duration-700 w-full aspect-square object-cover shadow-[0_0_30px_rgba(0,255,65,0.2)]"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-8 flex items-center gap-4">
              <span className="text-neon-green/20">01.</span> BIO_DATA
            </h2>
            <div className="space-y-6 text-neon-green/70 text-sm leading-relaxed font-mono">
              <p className="border-l-2 border-neon-green/30 pl-4 uppercase">
                {">"} NAME: SARIF TACHAMO<br />
                {">"} ROLE: COMPUTER_ENGINEERING_UNDERGRADUATE<br />
                {">"} LOCATION: BHAKTAPUR, NEPAL<br />
                {">"} STATUS: SECURING_SYSTEMS
              </p>
              <p>
                Computer Engineering undergraduate with proven experience in full-stack development, AI/ML systems, and cybersecurity research. I build secure HR platforms, POS systems, and cryptographic tools with a focus on system automation and secure architecture.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="glass-card p-6 border-neon-green/10">
                  <div className="text-3xl font-bold neon-text">3+</div>
                  <div className="text-[10px] uppercase tracking-widest text-neon-green/40">PROD_APPS</div>
                </div>
                <div className="glass-card p-6 border-neon-green/10">
                  <div className="text-3xl font-bold neon-text">4+</div>
                  <div className="text-[10px] uppercase tracking-widest text-neon-green/40">CYBER_TOOLS</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Education & Certs */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 border-neon-green/10"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3 neon-text">
              <Cpu size={18} /> ACADEMIC_LOGS
            </h3>
            <div className="space-y-6">
              {education.map(edu => (
                <div key={edu.id} className="border-l-2 border-neon-green/30 pl-4 group hover:border-neon-green transition-all">
                  <div className="font-bold text-sm">{edu.degree}</div>
                  <div className="text-neon-green/40 text-xs">{edu.institution}</div>
                  <div className="text-neon-green text-[10px] font-mono mt-1">[{edu.duration}]</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 border-neon-green/10"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3 neon-text">
              <Shield size={18} /> SECURITY_CERTS
            </h3>
            <div className="space-y-6">
              {certifications.map(cert => (
                <div key={cert.id} className="border-l-2 border-neon-green/30 pl-4 group hover:border-neon-green transition-all">
                  <div className="font-bold text-sm">{cert.title}</div>
                  <div className="text-neon-green/40 text-xs">{cert.issuer}</div>
                  <div className="text-neon-green text-[10px] font-mono mt-1">[{cert.year}]</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 md:py-32 px-6 bg-neon-green/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 glitch">TECH_STACK</h2>
            <p className="text-neon-green/40 text-xs uppercase tracking-widest">Core competencies and specialized tools</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skills.map((skill, idx) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 flex flex-col items-start gap-4 hover:neon-glow transition-all cursor-crosshair group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 text-[8px] text-neon-green/20 font-mono">0x{idx.toString(16)}</div>
                <Zap className="text-neon-green group-hover:scale-125 transition-transform" size={24} />
                <span className="font-bold text-xs tracking-widest uppercase">{skill.name}</span>
                <div className="w-full bg-neon-green/10 h-0.5 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.proficiency_level}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="bg-neon-green h-full shadow-[0_0_10px_#00FF41]"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-16 text-center glitch">MISSION_LOGS</h2>
        <div className="space-y-4">
          {experience.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 flex flex-col md:flex-row gap-8 items-start hover:bg-neon-green/5 transition-all border-l-4 border-l-neon-green"
            >
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <h3 className="text-xl font-bold neon-text uppercase tracking-tighter">{exp.role}</h3>
                  <span className="text-neon-green font-mono text-[10px] bg-neon-green/10 px-2 py-1">[{exp.duration}]</span>
                </div>
                <h4 className="text-neon-green/60 text-xs mb-6 font-bold uppercase tracking-widest">{exp.organization}</h4>
                <p className="text-neon-green/50 text-xs leading-relaxed font-mono italic">
                  // {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 md:py-32 px-6 bg-neon-green/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center glitch">CODE_REPOS</h2>

          <div className="flex flex-wrap justify-center gap-2 mb-16">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setProjectFilter(cat)}
                className={`px-4 py-1 text-[10px] font-mono uppercase tracking-widest transition-all ${projectFilter === cat ? 'bg-neon-green text-black font-bold' : 'border border-neon-green/20 text-neon-green/40 hover:border-neon-green hover:text-neon-green'}`}
              >
                [{cat}]
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card group overflow-hidden border-neon-green/10"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={project.image || `https://picsum.photos/seed/${project.id}/600/400`}
                      alt={project.title}
                      className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-neon-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <Magnetic>
                        <a href={project.github_link} className="p-3 bg-black border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all">
                          <Github size={18} />
                        </a>
                      </Magnetic>
                      <Magnetic>
                        <a href={project.live_link} className="p-3 bg-black border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all">
                          <ExternalLink size={18} />
                        </a>
                      </Magnetic>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 neon-text uppercase tracking-tighter">{project.title}</h3>
                    <p className="text-neon-green/40 text-[10px] mb-4 line-clamp-2 font-mono">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.split(',').map(tech => (
                        <span key={tech} className="text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 border border-neon-green/20 text-neon-green/40">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-16 text-center glitch">INTEL_FEED</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 group hover:neon-glow transition-all border-neon-green/10"
            >
              <div className="flex items-center gap-4 mb-4 text-[10px] font-mono text-neon-green/40 uppercase tracking-widest">
                <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}
                <span className="text-neon-green/10">|</span>
                <BookOpen size={12} /> {post.category}
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-neon-green transition-colors uppercase tracking-tighter">{post.title}</h3>
              <p className="text-neon-green/50 text-xs mb-6 leading-relaxed font-mono">{post.excerpt}</p>
              <button className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all text-neon-green">
                [ READ_MORE ] <ExternalLink size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold mb-6 glitch">ESTABLISH_SIGNAL</h2>
            <p className="text-neon-green/50 mb-12 text-sm font-mono leading-relaxed">
              {">"} ENCRYPTED CHANNEL OPEN...<br />
              {">"} AWAITING INPUT...<br />
              {">"} SECURE CONNECTION READY.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 glass-card border-neon-green/10">
                <Mail className="text-neon-green" size={20} />
                <div>
                  <div className="text-[8px] text-neon-green/40 uppercase tracking-widest">Secure_Mail</div>
                  <div className="font-bold text-xs uppercase">sariftachamo.job@gmail.com</div>
                </div>
              </div>
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center gap-4 p-4 glass-card border-neon-green/20 hover:border-neon-green hover:neon-glow transition-all cursor-pointer"
              >
                <Linkedin className="text-neon-green" size={20} />
                <div>
                  <div className="text-[8px] text-neon-green/40 uppercase tracking-widest">Net_ID</div>
                  <a href="https://www.linkedin.com/in/sarif-tachamo-06b9b9248/" target="_blank" rel="noopener noreferrer" className="font-bold text-xs uppercase hover:text-neon-green">linkedin.com/in/sarif-tachamo</a>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center gap-4 p-4 glass-card border-neon-green/20 hover:border-neon-green hover:neon-glow transition-all cursor-pointer"
              >
                <Github className="text-neon-green" size={20} />
                <div>
                  <div className="text-[8px] text-neon-green/40 uppercase tracking-widest">Repo_Log</div>
                  <a href="https://github.com/sariftachamo-9" target="_blank" rel="noopener noreferrer" className="font-bold text-xs uppercase hover:text-neon-green">github.com/sariftachamo-9</a>
                </div>
              </motion.div>
              <div className="flex items-center gap-4 p-4 glass-card border-neon-green/10">
                <Shield className="text-neon-green" size={20} />
                <div>
                  <div className="text-[8px] text-neon-green/40 uppercase tracking-widest">Secure_Line</div>
                  <div className="font-bold text-xs uppercase">+977-9840531722</div>
                </div>
              </div>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 space-y-6 border-neon-green/30"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());

              try {
                const res = await fetch('/api/contact', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Security-Signal': 'active'
                  },
                  body: JSON.stringify({
                    name: data.Sender_ID,
                    email: data.Return_Addr,
                    subject: data.Frequency,
                    message: data.Payload
                  })
                });

                if (res.ok) {
                  alert('SIGNAL TRANSMITTED: SECURE_CHANNEL_ESTABLISHED.');
                  (e.target as HTMLFormElement).reset();
                } else {
                  alert('TRANSMISSION_FAILED: INTERFERENCE_DETECTED.');
                }
              } catch (err) {
                alert('CRITICAL_ERROR: UPLINK_LOST.');
              }
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neon-green/40">Sender_ID</label>
                <input type="text" className="terminal-input w-full text-xs" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-neon-green/40">Return_Addr</label>
                <input type="email" className="terminal-input w-full text-xs" required />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neon-green/40">Frequency</label>
              <input type="text" className="terminal-input w-full text-xs" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neon-green/40">Payload</label>
              <textarea rows={4} className="terminal-input w-full text-xs resize-none" required></textarea>
            </div>
            <Magnetic>
              <button className="w-full py-4 bg-neon-green text-black font-bold uppercase tracking-widest text-xs neon-glow hover:scale-[1.02] transition-all">
                [ TRANSMIT_SIGNAL ]
              </button>
            </Magnetic>
          </motion.form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-neon-green/20 bg-black/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex justify-center gap-6 md:gap-10 mb-8">
            <Magnetic>
              <a href="https://github.com/sariftachamo-9" target="_blank" rel="noopener noreferrer" className="text-neon-green/40 hover:text-neon-green hover:drop-shadow-[0_0_8px_#00FF41] transition-all transform hover:scale-125">
                <Github size={24} />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="https://www.linkedin.com/in/sarif-tachamo-06b9b9248/" target="_blank" rel="noopener noreferrer" className="text-neon-green/40 hover:text-neon-green hover:drop-shadow-[0_0_8px_#00FF41] transition-all transform hover:scale-125">
                <Linkedin size={24} />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="mailto:sariftachamo.job@gmail.com" className="text-neon-green/40 hover:text-neon-green hover:drop-shadow-[0_0_8px_#00FF41] transition-all transform hover:scale-125">
                <Mail size={24} />
              </a>
            </Magnetic>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="h-0.5 w-12 bg-neon-green/20 mb-4" />
            <p className="text-neon-green font-mono text-[10px] tracking-[0.4em] uppercase opacity-60">
              SYSTEM_VERSION: 3.0.1 // encrypted_connection_active
            </p>
            <p className="text-neon-green/30 font-mono text-[8px] uppercase tracking-widest mt-2">
              © 2026 SARIF TACHAMO // NO_RIGHTS_OBSCURED
            </p>
          </motion.div>
        </div>
      </footer>

      {/* Login Portal Sign */}
      <div className="fixed bottom-6 right-6 z-50">
        <Magnetic>
          <motion.a
            href="/login"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className="glass-card p-3 border-neon-green/40 flex items-center gap-3 group hover:border-neon-green transition-all"
          >
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neon-green/60 group-hover:text-neon-green">
              [ ACCESS_PORTAL ]
            </span>
            <Lock size={12} className="text-neon-green/40 group-hover:text-neon-green" />
          </motion.a>
        </Magnetic>
      </div>
    </div>
  );
}
