export interface Project {
  id: number | string;
  title: string;
  description: string;
  technologies: string;
  github_link: string;
  live_link: string;
  image: string;
  is_visible: number;
  created_at: string;
}

export interface Skill {
  id: number;
  category: string;
  name: string;
  proficiency_level: number;
  is_visible: number;
}

export interface Experience {
  id: number;
  role: string;
  organization: string;
  duration: string;
  description: string;
  is_visible: number;
}

export interface Certification {
  id: number;
  title: string;
  issuer: string;
  year: string;
  credential_link: string;
  is_visible: number;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  duration: string;
  focus: string;
  is_visible: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;
  is_visible: number;
  created_at: string;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  duration: string;
  focus: string;
  is_visible: number;
}

export interface Certification {
  id: number;
  title: string;
  issuer: string;
  year: string;
  credential_link: string;
  is_visible: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}
