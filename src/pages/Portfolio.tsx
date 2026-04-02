import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  BookOpen,
  Calendar,
  Award,
  Lock,
  Radio,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Project, Skill, Experience, Post, Education, Certification } from '../types';
import MatrixBackground from '../components/MatrixBackground';
import CustomCursor from '../components/CustomCursor';
import Magnetic from '../components/Magnetic';
import TerminalComponent from '../components/Terminal';
import ActivityLog from '../components/ActivityLog';
import ThreatMap from '../components/ThreatMap';
import SkillsChart from '../components/SkillsChart';
import Timeline from '../components/Timeline';
import ProjectModal from '../components/ProjectModal';
import SearchBar from '../components/SearchBar';
import DarkModeToggle from '../components/DarkModeToggle';
import NewsletterSignup from '../components/NewsletterSignup';
import { useKeyboardSound } from '../hooks/useKeyboardSound';
import { useMechanicalClick } from '../hooks/useMechanicalClick';
import { useAmbientSound } from '../hooks/useAmbientSound';
import { Toaster, toast } from 'sonner';

export default function Portfolio() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Project Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeSection, setActiveSection] = useState('hero');
  const [projectFilter, setProjectFilter] = useState('All');
  const [terminalText, setTerminalText] = useState('');
  const fullTerminalText = "> INITIALIZING SYSTEM... [OK]\n> LOADING ASSETS... [OK]\n> DECRYPTING PORTFOLIO... [OK]\n> ACCESS GRANTED.";
  const { playHackerSound } = useKeyboardSound();
  const { handleClick, handleClickStrong } = useMechanicalClick();
  const { playAccessPing, playTransmissionSound } = useAmbientSound();

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(setProjects);

    fetch('/api/skills').then(res => res.json()).then(setSkills);
    fetch('/api/experience').then(res => res.json()).then(setExperience);
    fetch('/api/posts').then(res => res.json()).then(setPosts);
    fetch('/api/education').then(res => res.json()).then(setEducation);
    fetch('/api/certifications').then(res => res.json()).then(setCertifications);

    let i = 0;
    const interval = setInterval(() => {
      setTerminalText(fullTerminalText.slice(0, i));
      // Play hacker-style sound for each character
      playHackerSound();
      i++;
      if (i > fullTerminalText.length) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error('VALIDATION_ERROR: All fields required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast.error('INVALID_EMAIL: Format check failed');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Signal': 'SECURE_TRANSMISSION'
        },
        body: JSON.stringify(contactForm)
      });

      if (response.ok) {
        toast.success('SIGNAL_TRANSMITTED: Message received');
        setContactForm({ name: '', email: '', subject: '', message: '' });
        playTransmissionSound();
      } else {
        toast.error('TRANSMISSION_FAILED: Server error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('SYSTEM_ERROR: Unable to transmit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const sections = [
    { id: 'hero', label: 'ROOT' },
    { id: 'about', label: 'BIO' },
    { id: 'experience', label: 'LOGS' },
    { id: 'projects', label: 'PROGRAMS' },
    { id: 'blog', label: 'INTEL' }
  ];

  const filteredProjects = projectFilter === 'All'
    ? projects
    : projects.filter(p => p.technologies?.toLowerCase().includes(projectFilter.toLowerCase()));

  const categories = ['All', 'React', 'Node', 'TypeScript', 'Security'];

  return (
    <div className="relative crt-flicker">
      <div className="scanlines" />
      <MatrixBackground />
      <ActivityLog />
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
              <Terminal size={20} /> [SARIF TACHAMO]
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

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            <SearchBar projects={projects} posts={posts} skills={skills} />
            <DarkModeToggle />
          </div>

        </div>
      </nav>

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

          <h2 className="text-neon-green font-mono mb-2 tracking-widest uppercase text-xs">Cybersecurity Expert | Cybersecurity Researcher | AI/ML Enthusiast | Web Developer</h2>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tighter glitch uppercase">
            <span className="neon-text">SARIF</span> <br />
            <span className="neon-text">TACHAMO</span>
          </h1>

          <div className="flex flex-wrap gap-4 justify-center">
            <Magnetic>
              <motion.a
                href="#projects"
                onClick={handleClickStrong}
                className="px-8 py-3 border border-neon-green text-neon-green font-bold hover:bg-neon-green hover:text-black transition-all uppercase tracking-widest text-xs btn-mechanical"
              >
                [ VIEW_PROGRAMS ]
              </motion.a>
            </Magnetic>
            <Magnetic>
              <motion.a
                href="#contact"
                onClick={handleClick}
                className="px-8 py-3 border border-neon-green/30 text-neon-green/50 font-bold hover:border-neon-green hover:text-neon-green transition-all uppercase tracking-widest text-xs btn-mechanical"
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
          {/* Operator Biometric Dossier */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            onViewportEnter={playAccessPing}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass-card p-4 border-neon-green/30 relative overflow-hidden group">
              {/* Corner targeting brackets */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-neon-green/60" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-neon-green/60" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-neon-green/60" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-neon-green/60" />

              {/* Biometric scan header */}
              <div className="text-[9px] font-mono text-neon-green/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                BIOMETRIC_SCAN — OPERATOR_VERIFIED
              </div>

              {/* Biometric progress bar */}
              <div className="mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-0.5 bg-neon-green shadow-[0_0_8px_#00FF41]"
                />
              </div>

              {/* Photo with scanline sweep */}
              <div className="relative overflow-hidden">
                <img
                  src="/profile.JPG"
                  alt="Sarif Tachamo"
                  className="grayscale contrast-125 brightness-90 group-hover:grayscale-0 transition-all duration-700 w-full aspect-square object-cover shadow-[0_0_30px_rgba(0,255,65,0.2)]"
                  referrerPolicy="no-referrer"
                />
                {/* Scanline sweep on hover */}
                <motion.div
                  initial={{ top: '-10%' }}
                  animate={{ top: '110%' }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1 }}
                  className="absolute left-0 w-full h-[3px] bg-neon-green/40 pointer-events-none"
                  style={{ boxShadow: '0 0 12px rgba(0,255,65,0.8)' }}
                />
                {/* Scan overlay grid */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,255,65,0.3) 4px, rgba(0,255,65,0.3) 5px)',
                  pointerEvents: 'none'
                }} />
              </div>

              {/* Dossier data */}
              <div className="mt-3 space-y-1 font-mono">
                {[
                  { label: 'IDENTITY', value: 'SARIF TACHAMO' },
                  { label: 'CLEARANCE', value: 'ALPHA-7 [TOP_SECRET]' },
                  { label: 'STATUS', value: '◉ ONLINE | ACTIVE' },
                  { label: 'THREAT_LVL', value: '██░░░░░░░░ LOW' },
                ].map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + i * 0.15 }}
                    className="flex justify-between text-[9px]"
                  >
                    <span className="text-neon-green/40">{row.label}:</span>
                    <span className="text-neon-green font-bold">{row.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-8 flex items-center gap-4">
              <span className="text-neon-green/20">01.</span> ABOUT_ME
            </h2>
            <div className="space-y-6 text-neon-green/70 text-sm leading-relaxed font-mono">
              <p className="border-l-2 border-neon-green/30 pl-4 uppercase">
                {">"} NAME: SARIF TACHAMO<br />
                {">"} ROLE: CYBERSECURITY_EXPERT<br />
                {">"} LOCATION: BHAKTAPUR, NEPAL<br />
                {">"} STATUS: SECURING_SYSTEMS
              </p>
              <p>
                Cybersecurity-focused computer engineering undergraduate with hands-on experience in ethical hacking, penetration testing, cryptography, and secure web/app development. Skilled in designing encrypted platforms, cyber threat simulations, and system automation tools.
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

              {/* Languages & Interests */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-neon-green/10">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-neon-green/40 mb-3 flex items-center gap-2">
                    <Zap size={10} /> LANGUAGES
                  </h4>
                  <ul className="space-y-1 text-[10px] uppercase">
                    <li>{">"} Nepali (Native)</li>
                    <li>{">"} Newar (Native)</li>
                    <li>{">"} English (Fluent)</li>
                    <li>{">"} Hindi (Conversational)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-neon-green/40 mb-3 flex items-center gap-2">
                    <Zap size={10} /> INTERESTS
                  </h4>
                  <ul className="space-y-1 text-[10px] uppercase">
                    <li>{">"} Ethical Hacking</li>
                    <li>{">"} Cryptography</li>
                    <li>{">"} Open-Source</li>
                    <li>{">"} AI/ML Apps</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <div className="mt-16 pt-16 border-t border-neon-green/10">
          <h3 className="text-2xl font-bold mb-10 text-center glitch">MAJOR_ACHIEVEMENTS</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: "RESEARCH_PAPER", desc: "Published AI/ML paper at Kathmandu University (2023)" },
              { title: "CYBER_TOOLS", desc: "Developed 10+ specialized security & crypto tools" },
              { title: "PROD_APPS", desc: "Built 5+ production-ready web and mobile applications" },
              { title: "DB_ARCHITECT", desc: "Designed 10+ complex database models for EMS/HMS" }
            ].map((ach, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 border-neon-green/5 hover:border-neon-green/30 transition-all text-center"
              >
                <div className="text-neon-green mb-3 flex justify-center"><Award size={24} /></div>
                <div className="text-[10px] font-bold mb-2 tracking-widest text-neon-green uppercase">{ach.title}</div>
                <div className="text-[10px] text-neon-green/40 font-mono leading-tight">{ach.desc}</div>
              </motion.div>
            ))}
          </div>
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
            <div>
              {education.length > 0 ? (
                <Timeline items={education} type="education" />
              ) : (
                <div className="text-neon-green/40 text-xs font-mono italic">No education records available</div>
              )}
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

      {/* Skills Radar Section */}
      <section id="skills" className="py-16 md:py-32 px-6 bg-neon-green/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 glitch">TECH_STACK</h2>
            <p className="text-neon-green/40 text-xs uppercase tracking-widest">Core competencies and specialized tools</p>
          </div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 border-neon-green/20 mb-12"
          >
            <SkillsChart skills={skills} />
          </motion.div>

          {/* Skills Grid */}
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

      {/* Experience Timeline Section */}
      <section id="experience" className="py-16 md:py-32 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-16 text-center glitch">MISSION_LOGS</h2>
        <Timeline items={experience} type="experience" />
      </section>

      {/* Threat Map Section */}
      <ThreatMap />

      {/* Projects Section */}
      <section id="projects" className="py-16 md:py-32 px-6 bg-neon-green/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center glitch">CODE_PROGRAMS</h2>

          <div className="flex flex-wrap justify-center gap-2 mb-16">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={(e) => { handleClick(e); setProjectFilter(cat); }}
                className={`px-4 py-1 text-[10px] font-mono uppercase tracking-widest transition-all mechanical-btn ${projectFilter === cat ? 'bg-neon-green text-black font-bold' : 'border border-neon-green/20 text-neon-green/40 hover:border-neon-green hover:text-neon-green'}`}
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
                  <div className="relative h-40 overflow-hidden cursor-pointer" onClick={() => handleProjectClick(project)}>
                    <img
                      src={project.image || `https://picsum.photos/seed/${project.id}/600/400`}
                      alt={project.title}
                      className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-neon-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <Magnetic>
                        <a href={project.github_link} onClick={(e) => { e.stopPropagation(); handleClick(e); }} className="p-3 bg-black border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all icon-btn-mechanical">
                          <Github size={18} />
                        </a>
                      </Magnetic>
                      <Magnetic>
                        <a href={project.live_link} onClick={(e) => { e.stopPropagation(); handleClick(e); }} className="p-3 bg-black border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all icon-btn-mechanical">
                          <ExternalLink size={18} />
                        </a>
                      </Magnetic>
                    </div>
                  </div>
                  <div className="p-6 cursor-pointer hover:bg-neon-green/5 transition-colors" onClick={() => handleProjectClick(project)}>
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

      {/* INTEL_FEED Section */}
      <section id="blog" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 rounded-full bg-neon-red" />
          <h2 className="text-4xl font-bold glitch">INTEL_FEED</h2>
          <span className="text-[10px] font-mono text-neon-red border border-neon-red/40 px-2 py-0.5 animate-pulse">◉ LIVE</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card border-neon-green/10 group hover:border-neon-green/30 transition-all overflow-hidden"
            >
              {/* Decryption header */}
              <div className="bg-neon-green/5 border-b border-neon-green/10 px-5 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-mono text-neon-green/50 uppercase tracking-widest">
                  <Radio size={10} />
                  <span>INCOMING_SIGNAL</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '40%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: idx * 0.1 + 0.3 }}
                  className="h-0.5 bg-neon-green/40"
                />
                <span className="text-[9px] font-mono text-neon-green/30">DECRYPTING...</span>
              </div>

              <div className="p-6">
                {/* Priority + classification */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[8px] font-mono font-bold px-2 py-0.5 border ${
                    idx === 0 ? 'border-neon-red/60 text-neon-red bg-neon-red/10' :
                    idx === 1 ? 'border-yellow-400/60 text-yellow-400 bg-yellow-400/10' :
                    'border-neon-cyan/60 text-neon-cyan bg-neon-cyan/10'
                  } uppercase`}>
                    {idx === 0 ? '▶ PRIORITY: HIGH' : idx === 1 ? '▶ PRIORITY: MED' : '▶ PRIORITY: LOW'}
                  </span>
                  <span className="text-[8px] font-mono text-neon-green/30 flex items-center gap-1">
                    <Eye size={8} />
                    THREAT_CLASS: [{post.category?.toUpperCase() || 'RESEARCH'}]
                  </span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-3 text-[9px] font-mono text-neon-green/30">
                  <span><Calendar size={9} className="inline mr-1" />{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="text-neon-green/10">|</span>
                  <span>SOURCE: SARIF.LAB</span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold mb-3 group-hover:text-neon-green transition-colors uppercase tracking-tight leading-snug">
                  {post.title}
                </h3>

                {/* Separator */}
                <div className="border-t border-dashed border-neon-green/10 my-3" />

                {/* Excerpt */}
                <p className="text-neon-green/40 text-[10px] mb-5 leading-relaxed font-mono">
                  {'>'} {post.excerpt}
                </p>

                <button
                  onClick={(e) => {
                    handleClick(e);
                    navigate(`/blog/${post.id}`);
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all text-neon-green mechanical-btn"
                >
                  [ DECRYPT_FULL_BRIEF ] <ExternalLink size={12} />
                </button>
              </div>

              {/* Bottom scan bar */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: idx * 0.1 + 0.5 }}
                className="h-px bg-neon-green/20"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-32 px-6 bg-neon-green/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 glitch">ESTABLISH_CONNECTION</h2>
          <p className="text-neon-green/50 text-xs mb-12 font-mono uppercase tracking-widest">
            // Ready to collaborate on security projects or discuss opportunities
          </p>

          <div className="glass-card p-8 md:p-12 border-neon-green/20">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="NAME"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  disabled={isSubmitting}
                  className="terminal-input disabled:opacity-50"
                />
                <input
                  type="email"
                  placeholder="EMAIL"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  disabled={isSubmitting}
                  className="terminal-input disabled:opacity-50"
                />
              </div>
              <input
                type="text"
                placeholder="SUBJECT"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                disabled={isSubmitting}
                className="terminal-input w-full disabled:opacity-50"
              />
              <textarea
                placeholder="MESSAGE"
                rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                disabled={isSubmitting}
                className="terminal-input w-full resize-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  handleClickStrong(e as any);
                }}
                className="w-full py-3 bg-neon-green text-black font-bold uppercase tracking-widest hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2 btn-mechanical disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} /> {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT_SIGNAL'}
              </button>
            </form>
          </div>

          <div className="flex justify-center gap-6 mt-12">
            <Magnetic>
              <a href="https://github.com" onClick={handleClick} className="p-4 border border-neon-green/30 text-neon-green/50 hover:border-neon-green hover:text-neon-green transition-all icon-btn-mechanical">
                <Github size={20} />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="https://linkedin.com" onClick={handleClick} className="p-4 border border-neon-green/30 text-neon-green/50 hover:border-neon-green hover:text-neon-green transition-all icon-btn-mechanical">
                <Linkedin size={20} />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="mailto:sarif@example.com" onClick={handleClick} className="p-4 border border-neon-green/30 text-neon-green/50 hover:border-neon-green hover:text-neon-green transition-all icon-btn-mechanical">
                <Mail size={20} />
              </a>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 px-6 bg-neon-green/5 border-y border-neon-green/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-2 glitch">SUBSCRIBE_TO_INTEL</h3>
              <p className="text-neon-green/50 text-sm font-mono mb-4">
                Get notified about new projects, research papers, and security insights delivered to your inbox.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <NewsletterSignup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-neon-green/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-neon-green/30 text-[10px] font-mono uppercase tracking-widest">
            // SECURE_TRANSMISSION_COMPLETE
          </div>
          <div className="text-neon-green/30 text-[10px] font-mono">
            © {new Date().getFullYear()} SARIF TACHAMO. ALL_RIGHTS_RESERVED.
          </div>
        </div>
      </footer>

      {/* Admin Login Portal Button */}
      <Magnetic>
        <motion.a
          href="/login"
          onClick={handleClick}
          className="fixed bottom-6 right-6 z-40 p-3 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all rounded-none shadow-[0_0_15px_rgba(0,255,65,0.3)] icon-btn-mechanical"
          whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(0,255,65,0.6)' }}
          whileTap={{ scale: 0.95 }}
          title="Admin Login Portal"
        >
          <Lock size={20} />
        </motion.a>
      </Magnetic>

      {/* Toast Notifications */}
      <Toaster position="top-center" theme="dark" />

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onGithubClick={() => handleClickStrong({} as any)}
      />
    </div>
  );
}
