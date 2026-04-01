import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  History,
  MessageSquare,
  LogOut,
  Plus,
  Trash2,
  Edit,
  X,
  BookOpen,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  GraduationCap,
  Award,
  Terminal,
  Save
} from 'lucide-react';
import { Project, Skill, Experience, ContactMessage, Post, Education, Certification } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Toaster, toast } from 'sonner';

import MatrixBackground from '../components/MatrixBackground';
import CustomCursor from '../components/CustomCursor';
import { useMechanicalClick } from '../hooks/useMechanicalClick';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const navigate = useNavigate();
  const { handleClick, handleClickStrong } = useMechanicalClick();

  const token = localStorage.getItem('admin_token');

  const fetchData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [p, s, e, m, b, edu, cert] = await Promise.all([
        fetch('/api/projects').then(res => res.json()),
        fetch('/api/skills').then(res => res.json()),
        fetch('/api/experience').then(res => res.json()),
        fetch('/api/messages', { headers }).then(res => res.json()),
        fetch('/api/posts').then(res => res.json()),
        fetch('/api/education').then(res => res.json()),
        fetch('/api/certifications').then(res => res.json())
      ]);
      setProjects(p);
      setSkills(s);
      setExperience(e);
      setMessages(m);
      setPosts(b);
      setEducation(edu);
      setCertifications(cert);
    } catch (err) {
      toast.error('ACCESS_DENIED: DATA_FETCH_FAILED');
    }
  };

  useEffect(() => {
    if (!token) navigate('/login');
    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    toast.success('SESSION_TERMINATED');
    navigate('/login');
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm(`CONFIRM_DELETION: ${type.toUpperCase()}_ID_${id}?`)) return;

    try {
      const res = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Security-Signal': 'active'
        }
      });

      if (res.ok) {
        toast.success('ENTRY_PURGED');
        fetchData();
      } else {
        toast.error('DELETION_FAILED');
      }
    } catch (err) {
      toast.error('SYSTEM_ERROR');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'projects', label: 'PROJECTS', icon: FolderKanban },
    { id: 'skills', label: 'SKILLS', icon: Wrench },
    { id: 'experience', label: 'LOGS', icon: History },
    { id: 'blog', label: 'INTEL', icon: BookOpen },
    { id: 'education', label: 'ACADEMIC', icon: GraduationCap },
    { id: 'certifications', label: 'CERTS', icon: Award },
    { id: 'messages', label: 'SIGNALS', icon: MessageSquare },
  ];

  const skillData = skills.map(s => ({ name: s.name, value: s.proficiency_level }));
  const COLORS = ['#00FF41', '#003300', '#008F11', '#00FF41'];

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `/api/${activeTab}/${editingItem.id}` : `/api/${activeTab}`;

    // For file uploads (projects & posts), we'd need a different approach if we wanted to support them fully here.
    // For now, let's stick to JSON for simplicity unless it's a multipart form.
    const isMultipart = activeTab === 'projects' || activeTab === 'blog';

    let body: any = JSON.stringify(data);
    let headers: any = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Security-Signal': 'active'
    };

    if (isMultipart) {
      // If it's multipart, we use the formData directly
      body = formData;
      delete headers['Content-Type']; // Let the browser set it with boundary
    }

    // Ensure signal is always present even if multipart
    headers['X-Security-Signal'] = 'active';

    try {
      const res = await fetch(url, { method, headers, body });

      if (res.ok) {
        toast.success(editingItem ? 'ENTRY_UPDATED' : 'ENTRY_CREATED');
        setIsModalOpen(false);
        setEditingItem(null);
        fetchData();
      } else {
        toast.error('OPERATION_FAILED');
      }
    } catch (err) {
      toast.error('CONNECTION_LOST');
    }
  };

  return (
    <div className="min-h-screen flex bg-black text-neon-green font-mono selection:bg-neon-green selection:text-black">
      <MatrixBackground />
      <CustomCursor />
      <Toaster position="top-right" theme="dark" richColors />
      <div className="scanlines" />

      {/* Sidebar */}
      <aside className="w-64 glass-card m-6 mr-0 flex flex-col border-neon-green/20">
        <div className="p-8 border-b border-neon-green/20">
          <div className="text-xl font-bold neon-text flex items-center gap-2">
            <Terminal size={20} /> ROOT_ACCESS
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={(e) => { handleClick(e); setActiveTab(tab.id); }}
              className={`w-full flex items-center gap-4 p-3 text-xs tracking-widest transition-all mechanical-btn ${activeTab === tab.id ? 'bg-neon-green text-black font-bold' : 'hover:bg-neon-green/10 text-neon-green/60'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neon-green/20">
          <button
            onClick={(e) => { handleClick(e); handleLogout(); }}
            className="w-full flex items-center gap-4 p-3 text-xs tracking-widest text-red-500 hover:bg-red-500/10 transition-all mechanical-btn"
          >
            <LogOut size={16} />
            TERMINATE_SESSION
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto crt-flicker">
        <header className="flex justify-between items-center mb-12 border-b border-neon-green/20 pb-6">
          <h1 className="text-3xl font-bold tracking-tighter glitch">./{activeTab.toUpperCase()}</h1>
          {activeTab !== 'dashboard' && activeTab !== 'messages' && (
            <button
              onClick={(e) => { handleClick(e); setEditingItem(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-2 border border-neon-green text-neon-green font-bold hover:bg-neon-green hover:text-black transition-all text-xs tracking-widest btn-mechanical"
            >
              <Plus size={16} /> NEW_ENTRY
            </button>
          )}
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'REPOS', val: projects.length },
                { label: 'STACK', val: skills.length },
                { label: 'INTEL', val: posts.length },
                { label: 'SIGNALS', val: messages.length }
              ].map(stat => (
                <div key={stat.label} className="glass-card p-6 border-neon-green/10">
                  <div className="text-neon-green/40 text-[10px] uppercase tracking-widest mb-2">{stat.label}</div>
                  <div className="text-4xl font-bold neon-text">{stat.val}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card p-8 h-[400px] border-neon-green/10">
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2 neon-text tracking-widest uppercase">
                  <BarChartIcon size={16} /> STACK_DISTRIBUTION
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#003300" />
                    <XAxis dataKey="name" stroke="#00FF41" fontSize={10} />
                    <YAxis stroke="#00FF41" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #00FF41', borderRadius: '0px', fontSize: '10px' }}
                      itemStyle={{ color: '#00FF41' }}
                    />
                    <Bar dataKey="value" fill="#00FF41" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-8 h-[400px] border-neon-green/10">
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2 neon-text tracking-widest uppercase">
                  <PieChartIcon size={16} /> CONTENT_MIX
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Projects', value: projects.length },
                        { name: 'Skills', value: skills.length },
                        { name: 'Blog', value: posts.length },
                        { name: 'Messages', value: messages.length },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="#000"
                    >
                      {skillData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #00FF41', borderRadius: '0px', fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Generic List View for CRUD items */}
        {['projects', 'skills', 'experience', 'blog', 'education', 'certifications'].includes(activeTab) && (
          <div className="grid gap-4">
            {(activeTab === 'projects' ? projects :
              activeTab === 'skills' ? skills :
                activeTab === 'experience' ? experience :
                  activeTab === 'blog' ? posts :
                    activeTab === 'education' ? education :
                      certifications).map((item: any) => (
                        <div key={item.id} className="glass-card p-4 flex items-center justify-between border-neon-green/10 hover:bg-neon-green/5 transition-all">
                          <div className="flex items-center gap-6">
                            {activeTab === 'projects' && (
                              <div className="h-12 w-12 bg-black border border-neon-green/20 overflow-hidden">
                                <img src={item.image || ''} className="w-full h-full object-cover opacity-50" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-sm font-bold neon-text uppercase tracking-tighter">
                                {item.title || item.name || item.role || item.degree}
                              </h3>
                              <p className="text-neon-green/40 text-[10px] uppercase tracking-widest">
                                {item.technologies || item.category || item.organization || item.institution || item.issuer}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={(e) => { handleClick(e); handleEdit(item); }} className="p-2 hover:text-white transition-colors icon-btn-mechanical"><Edit size={16} /></button>
                            <button onClick={(e) => { handleClick(e); handleDelete(activeTab, item.id); }} className="p-2 hover:text-red-500 transition-colors icon-btn-mechanical"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className="glass-card p-6 border-l-4 border-l-neon-green">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold neon-text uppercase tracking-tighter">{msg.subject}</h3>
                    <p className="text-neon-green/60 text-[10px] uppercase tracking-widest">{msg.name} ({msg.email})</p>
                  </div>
                  <span className="text-neon-green/20 text-[8px] font-mono">{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-neon-green/50 text-xs leading-relaxed font-mono italic">// {msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="glass-card w-full max-w-2xl p-10 relative border-neon-green/50">
            <button onClick={(e) => { handleClick(e); setIsModalOpen(false); }} className="absolute top-6 right-6 text-neon-green/40 hover:text-neon-green icon-btn-mechanical"><X /></button>
            <h2 className="text-2xl font-bold mb-8 glitch uppercase tracking-widest">
              {editingItem ? 'UPDATE' : 'CREATE'}_ENTRY: <span className="neon-text">{activeTab.slice(0, -1)}</span>
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {activeTab === 'skills' && (
                <>
                  <input name="name" defaultValue={editingItem?.name} placeholder="SKILL_NAME" className="terminal-input w-full text-xs" required />
                  <input name="category" defaultValue={editingItem?.category} placeholder="CATEGORY" className="terminal-input w-full text-xs" required />
                  <input name="proficiency_level" type="number" defaultValue={editingItem?.proficiency_level} placeholder="PROFICIENCY_LEVEL (0-100)" className="terminal-input w-full text-xs" required />
                </>
              )}
              {activeTab === 'projects' && (
                <>
                  <input name="title" defaultValue={editingItem?.title} placeholder="PROJECT_TITLE" className="terminal-input w-full text-xs" required />
                  <textarea name="description" defaultValue={editingItem?.description} placeholder="DESCRIPTION" className="terminal-input w-full text-xs h-24 resize-none" required />
                  <input name="technologies" defaultValue={editingItem?.technologies} placeholder="TECH_STACK (COMMA_SEPARATED)" className="terminal-input w-full text-xs" required />
                  <input name="github_link" defaultValue={editingItem?.github_link} placeholder="GITHUB_URL" className="terminal-input w-full text-xs" />
                  <input name="live_link" defaultValue={editingItem?.live_link} placeholder="LIVE_URL" className="terminal-input w-full text-xs" />
                  <div className="space-y-1">
                    <label className="text-[8px] text-neon-green/40 uppercase">IMAGE_UPLOAD</label>
                    <input name="image" type="file" className="text-[10px] text-neon-green/60" />
                  </div>
                </>
              )}
              {activeTab === 'blog' && (
                <>
                  <input name="title" defaultValue={editingItem?.title} placeholder="POST_TITLE" className="terminal-input w-full text-xs" required />
                  <input name="category" defaultValue={editingItem?.category} placeholder="CATEGORY" className="terminal-input w-full text-xs" required />
                  <textarea name="excerpt" defaultValue={editingItem?.excerpt} placeholder="EXCERPT" className="terminal-input w-full text-xs h-20 resize-none" required />
                  <textarea name="content" defaultValue={editingItem?.content} placeholder="MARKDOWN_CONTENT" className="terminal-input w-full text-xs h-48 resize-none" required />
                  <div className="space-y-1">
                    <label className="text-[8px] text-neon-green/40 uppercase">COVER_IMAGE</label>
                    <input name="image" type="file" className="text-[10px] text-neon-green/60" />
                  </div>
                </>
              )}
              {activeTab === 'experience' && (
                <>
                  <input name="role" defaultValue={editingItem?.role} placeholder="ROLE" className="terminal-input w-full text-xs" required />
                  <input name="organization" defaultValue={editingItem?.organization} placeholder="ORGANIZATION" className="terminal-input w-full text-xs" required />
                  <input name="duration" defaultValue={editingItem?.duration} placeholder="DURATION (e.g. 2022 - PRESENT)" className="terminal-input w-full text-xs" required />
                  <textarea name="description" defaultValue={editingItem?.description} placeholder="DESCRIPTION" className="terminal-input w-full text-xs h-24 resize-none" required />
                </>
              )}
              {activeTab === 'education' && (
                <>
                  <input name="degree" defaultValue={editingItem?.degree} placeholder="DEGREE" className="terminal-input w-full text-xs" required />
                  <input name="institution" defaultValue={editingItem?.institution} placeholder="INSTITUTION" className="terminal-input w-full text-xs" required />
                  <input name="duration" defaultValue={editingItem?.duration} placeholder="DURATION" className="terminal-input w-full text-xs" required />
                  <input name="focus" defaultValue={editingItem?.focus} placeholder="FOCUS_AREA" className="terminal-input w-full text-xs" required />
                </>
              )}
              {activeTab === 'certifications' && (
                <>
                  <input name="title" defaultValue={editingItem?.title} placeholder="CERT_TITLE" className="terminal-input w-full text-xs" required />
                  <input name="issuer" defaultValue={editingItem?.issuer} placeholder="ISSUER" className="terminal-input w-full text-xs" required />
                  <input name="year" defaultValue={editingItem?.year} placeholder="YEAR" className="terminal-input w-full text-xs" required />
                  <input name="credential_link" defaultValue={editingItem?.credential_link} placeholder="CREDENTIAL_URL" className="terminal-input w-full text-xs" />
                </>
              )}

              <button onClick={handleClickStrong} className="w-full py-4 bg-neon-green text-black font-bold uppercase tracking-widest text-xs neon-glow transition-all flex items-center justify-center gap-2 btn-mechanical">
                <Save size={16} /> {editingItem ? 'COMMIT_CHANGES' : 'PUSH_ENTRY'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
