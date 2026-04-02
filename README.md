<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# THE_SECURE_PORTFOLIO // SARIF TACHAMO
> **STATUS**: SYSTEM_SECURE // **VERSION**: 4.0.0

A high-intensity, futuristic developer portfolio designed with a "Cyber-Security" aesthetic. This project features a triple-layered terminal boot sequence, an AI-driven cryptic assistant ("THE_ORACLE"), a robust admin dashboard, and comprehensive frontend enhancements including contact management, blog platform, advanced visualizations, and search functionality.

## ⚡ Core Features

### Frontend (v4.0.0 - NEW)
- **Phase 1: Content Management**
  - 📝 **Functional Contact Form** - Full-featured contact submission with validation and notifications
  - 📖 **Blog Detail Page** - Complete blog reader with markdown rendering and related posts
  
- **Phase 2: Data Visualization**
  - 📊 **Skills Radar Chart** - Interactive Recharts visualization of proficiency by category
  - 📈 **Timeline Component** - Beautiful animated timeline for experience/education entries
  - 🎯 **Project Detail Modal** - Comprehensive project showcase with tech stack details

- **Phase 3: User Experience**
  - 🔍 **Global Search** - Multi-content search across projects, posts, and skills
  - 🌙 **Dark Mode Toggle** - Persistent dark/light mode with system preference detection
  - 📬 **Newsletter Signup** - Email subscription with validation and feedback

### Existing Features
- **Phase Sequence Loading**: A cinematic triple-stage intro featuring character-reveal animations and a terminal boot-up simulation.
- **THE_ORACLE**: An integrated Gemini-powered AI assistant specialized in mysterious hacker-style interactions.
- **Crypto Lab**: Interactive Asymmetric Cryptography (RSA) simulator for educational payloads.
- **Secure Admin Core**: Role-based access control (RBAC) to manage projects, skills, education, and blog posts.
- **Neon-Cyber UI**: Premium dark-mode interface with glassmorphism, scanlines, and high-intensity neon glow accents.

## 📁 Project Structure

```
src/
├── components/
│   ├── SearchBar.tsx              # Global search with modal
│   ├── DarkModeToggle.tsx          # Theme switcher
│   ├── NewsletterSignup.tsx        # Email subscription
│   ├── SkillsChart.tsx             # Radar chart visualization
│   ├── Timeline.tsx                # Experience/Education timeline
│   ├── ProjectModal.tsx            # Project detail modal
│   ├── MatrixBackground.tsx
│   ├── Terminal.tsx
│   ├── ActivityLog.tsx
│   ├── ThreatMap.tsx
│   └── ... other components
├── pages/
│   ├── Portfolio.tsx               # Main portfolio with all features
│   ├── BlogDetail.tsx              # Blog post detail viewer
│   ├── Admin.tsx                   # Admin dashboard
│   ├── Login.tsx
│   └── Cryptography.tsx
├── contexts/
│   └── DarkModeContext.tsx         # Dark mode state management
├── hooks/
│   ├── useKeyboardSound.ts
│   ├── useMechanicalClick.ts
│   └── useAmbientSound.ts
└── types.ts                        # TypeScript interfaces
```

## 🛡️ Security Layers

- **Brute-Force Protection**: Rate limiting on all high-risk API endpoints.
- **CSRF Defense**: Custom header validation (`X-Security-Signal`) for all data mutations.
- **Admin Honey-Pot**: Fake login pathways to distract and trace unauthorized breach attempts.
- **Hardened Headers**: Automated security headers via `Helmet.js`.
- **Input Validation**: Contact form and newsletter email validation with regex patterns.

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with cyber aesthetic
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization (radar, bar, pie charts)
- **Lucide Icons** - Icon library
- **React Router v7** - Client-side routing
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

### Backend
- **Express.js** - Web server
- **TypeScript** - Backend type safety
- **SQLite/Better-SQLite3** - Database
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Multer** - File uploads
- **Helmet.js** - Security headers
- **Express Rate Limit** - DDoS protection

## 🛠️ Setup & Deployment

### Prerequisites
- **Node.js** (v18+ recommended)
- **Git**

### Installation
1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/sariftachamo-9/Portfolio-Hacker-Web.git
    cd Portfolio-Hacker-Web
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Configuration**:
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    JWT_SECRET=your_complex_secret_here
    GEMINI_API_KEY=your_gemini_api_key_here
    ADMIN_USERNAME=your_admin_username
    ADMIN_PASSWORD=your_complex_password
    ```

### Development
```bash
npm run dev
```
Server runs at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Code Quality
```bash
npm run lint        # TypeScript checking
```

## 📋 Available Routes

| Route | Description |
|-------|-------------|
| `/` | Main portfolio (home page) |
| `/blog/:id` | Individual blog post viewer |
| `/cryptography` | Cryptography lab & RSA simulator |
| `/login` | Admin login portal |
| `/admin/*` | Admin dashboard (protected) |

## 🎯 Feature Details

### Contact Form (Phase 1)
- Real-time validation (name, email, subject, message)
- Secure submission with CSRF token (`X-Security-Signal` header)
- Toast notifications for user feedback
- Data stored in SQLite database
- Accessible in admin dashboard

### Blog Platform (Phase 1)
- Full markdown rendering support
- Related posts recommendations
- Dynamic URL routing with `/blog/:id`
- Meta information (date, category, reading time)
- Responsive image handling

### Skills Visualization (Phase 2)
- Interactive radar chart showing proficiency by category
- Animated bars showing skill levels (0-100%)
- Hover effects and transitions
- Category-based filtering

### Timeline Component (Phase 2)
- Beautiful animated timeline for career/education
- Timeline markers with icons (briefcase, graduation cap)
- Connecting vertical lines
- Status indicators ("MISSION_LOGGED", "CREDENTIALS_SECURED")

### Project Modal (Phase 2/3)
- Click any project card to view full details
- Technology tag display
- Direct links to GitHub & live demos
- One-click link copying
- Smooth animations and transitions

### Global Search (Phase 3)
- Search across projects, posts, and skills
- Modal-based UI with keyboard support (ESC to close)
- Real-time results with up to 8 matches
- Type filtering (project/post/skill)
- Direct navigation to results

### Dark Mode (Phase 3)
- System preference detection
- Persistent storage (localStorage)
- Smooth icon animation (sun ↔ moon)
- Easy CSS customization hook
- Applied globally via `dark` class

### Newsletter Signup (Phase 3)
- Email validation with regex
- Form state management
- Success/error feedback
- Terminal-style design
- Responsive on all devices

## 📊 Component Hierarchy

```
App (with DarkModeProvider)
├── LoadingScreen
├── Router
│   └── Portfolio
│       ├── Navbar
│       │   ├── SearchBar
│       │   └── DarkModeToggle
│       ├── MatrixBackground
│       ├── CustomCursor
│       ├── Hero Section
│       ├── About Section
│       ├── Skills Section (with SkillsChart)
│       ├── Experience Section (with Timeline)
│       ├── Projects Section
│       │   └── ProjectModal (on click)
│       ├── Blog Section
│       ├── Contact Form
│       ├── Newsletter Section (with NewsletterSignup)
│       └── Footer
│   ├── BlogDetail
│   ├── Admin
│   ├── Login
│   └── Cryptography
```

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

## 📝 Recent Updates (v4.0.0)

- ✨ Added comprehensive contact form with database storage
- ✨ Implemented full blog platform with detail pages
- ✨ Created interactive skills radar chart visualization
- ✨ Added animated timeline for experience/education
- ✨ Implemented project detail modal with rich information
- ✨ Added global search across all content
- ✨ Implemented dark mode toggle with persistence
- ✨ Added newsletter subscription section
- 🔧 Full TypeScript migration (zero errors)
- 🔒 Enhanced form validation and security
- 📊 Improved visual feedback and animations

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
Licensed under the [MIT License](LICENSE).

---
© 2026 **SARIF TACHAMO** // SECURING_THE_FUTURE

**Latest Release**: v4.0.0 (April 2, 2026)
