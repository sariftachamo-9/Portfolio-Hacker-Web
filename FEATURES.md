# Features Documentation

## Phase 1: Content Management (v4.0.0)

### Contact Form
**File**: `src/pages/Portfolio.tsx`

#### Functionality
- Real-time form validation for name, email, subject, and message
- Email format validation using regex pattern
- Submit to `/api/contact` endpoint with CSRF protection
- Toast notifications for success/error feedback
- Form auto-clears on successful submission
- Loading state during submission

#### Technical Implementation
```typescript
const handleContactSubmit = async (e: React.FormEvent) => {
  // Validation
  // Fetch with X-Security-Signal header (CSRF)
  // Toast notification
  // Form reset
}
```

#### User Experience
- Disabled state while submitting
- Clear error messages
- Success confirmation message
- Form readily accessible on homepage

---

### Blog Detail Page
**File**: `src/pages/BlogDetail.tsx`

#### Features
- **Full Blog Post Display**
  - Title, date, category, featured image
  - Complete markdown rendering support
  - Tags and metadata display
  
- **Navigation**
  - Back button to main portfolio
  - Related posts suggestions (same category)
  - Next/Previous navigation (future)
  
- **Content Rendering**
  - Markdown support via React Markdown
  - Syntax highlighting for code blocks
  - Responsive images with scanline effects
  - Styled quotes and lists

#### Route
- Path: `/blog/:id`
- Fetches post from `/api/posts` by ID
- 404 handling for missing posts

#### Related Posts
- Shows up to 3 related posts from same category
- Clickable cards for navigation
- Scrolls to top on navigation

---

## Phase 2: Data Visualization (v4.0.0)

### Skills Radar Chart
**File**: `src/components/SkillsChart.tsx`

#### Implementation
- Uses Recharts `RadarChart` component
- Groups skills by category
- Displays proficiency levels (0-100%)
- Animated on scroll

#### Features
- **Visual Design**
  - Green neon styling matching cyber aesthetic
  - Grid and axis styling customized
  - Smooth animations
  
- **Interactivity**
  - Hover tooltips with proficiency values
  - Real-time proficiency percentage display
  - Smooth transitions

#### Data Structure
```typescript
chartData = [
  { category: "Frontend", proficiency: 90, fullMark: 100 },
  { category: "Backend", proficiency: 85, fullMark: 100 },
  // ...
]
```

---

### Timeline Component
**File**: `src/components/Timeline.tsx`

#### Features
- **Visual Timeline**
  - Timeline markers with icons (briefcase, graduation cap)
  - Vertical connecting lines
  - Hover effects on entries
  
- **Content Display**
  - Title and organization/institution
  - Duration/timeframe
  - Description with green styling
  - Status indicators ("MISSION_LOGGED", etc)

#### Usage
```typescript
<Timeline items={experience} type="experience" />
<Timeline items={education} type="education" />
```

#### Animations
- Staggered entrance animations
- Hover scale effects
- Line animations on scroll

---

### Project Detail Modal
**File**: `src/components/ProjectModal.tsx`

#### Features
- **Modal Display**
  - Click any project card to open
  - Semi-transparent backdrop
  - Smooth scale animations
  - Click-outside to close
  
- **Content**
  - Featured project image
  - Full description
  - Technology tags
  - Deploy year and status
  
- **Actions**
  - Direct GitHub link
  - Live demo link
  - Copy link to clipboard button
  - All with confirmation feedback

#### Implementation
```typescript
const handleProjectClick = (project: Project) => {
  setSelectedProject(project);
  setIsProjectModalOpen(true);
}
```

---

## Phase 3: User Experience (v4.0.0)

### Global Search Bar
**File**: `src/components/SearchBar.tsx`

#### Features
- **Search Functionality**
  - Searches across projects, posts, and skills
  - Project search: title, description, technologies
  - Post search: title, excerpt, category
  - Skill search: name, category
  - Returns up to 8 results

- **UI/UX**
  - Search button in navbar
  - Modal dialog on search
  - Real-time results as user types
  - Result type badges (project/post/skill)
  - Click result to navigate

#### Usage
- Click search icon in navbar
- Type search query
- Results display in modal
- Click result to navigate
- ESC to close, or click backdrop

#### Result Navigation
- Projects: Navigate to projects section
- Posts: Navigate to `/blog/:id`
- Skills: Navigate to skills section

---

### Dark Mode Toggle
**File**: `src/contexts/DarkModeContext.tsx` + `src/components/DarkModeToggle.tsx`

#### Features
- **State Management**
  - React Context for global state
  - localStorage persistence
  - System preference detection
  - Applied to document root

- **UI**
  - Sun/Moon icon toggle
  - Smooth icon rotation animation
  - Tooltip on hover
  - Magnetic effect on hover

#### Usage
```typescript
const { isDark, toggleDarkMode } = useDarkMode();
```

#### Storage
- Key: `darkMode`
- Value: `"true"` or `"false"`
- Persists across sessions

#### CSS Integration
- Adds/removes `dark` class on `<html>`
- Updates `colorScheme` CSS property
- CSS variables can be updated in themes

---

### Newsletter Signup
**File**: `src/components/NewsletterSignup.tsx`

#### Features
- **Form Validation**
  - Email-only input
  - Regex validation for email format
  - Required field validation
  - Clear error messages

- **User Feedback**
  - Loading state during submission
  - Success message with icon
  - Toast notifications
  - Auto-reset after 3 seconds

- **Design**
  - Terminal-style input
  - Inline mail icon
  - Submit button with icon
  - Compact responsive design

#### Usage
- User enters email
- Click SUBSCRIBE button
- Form validates
- Success message displayed
- Form resets

---

## Integration Points

### Navbar Components
- SearchBar (right side)
- DarkModeToggle (right side)
- Both in `Portfolio.tsx` navbar

### Contact Flow
- Contact section in Portfolio
- Form submission to backend
- Messages viewable in Admin dashboard

### Blog Flow
- Blog posts listed in Portfolio
- Click [DECRYPT_FULL_BRIEF] to view detail
- Blog detail page at `/blog/:id`

### Project Flow
- Projects grid in Portfolio
- Click project card to open modal
- Modal shows full details, links, tech stack

### Search Flow
- Click search icon in navbar
- Modal opens with search input
- Type to search
- Click result to navigate to content

### Theme Flow
- Click dark mode toggle
- Theme immediately switches
- Preference saved to localStorage
- Applied on next visit

### Newsletter Flow
- Enter email in newsletter section
- Click SUBSCRIBE
- Form validates
- Success confirmation shown
- Email would be stored (demo mode)

---

## Component Dependencies

### SearchBar
- Dependencies: useNavigate (react-router)
- Data: projects[], posts[], skills[]

### DarkModeToggle
- Dependencies: DarkModeContext

### TimelineComponent
- Dependencies: None (props-based)
- Props: items, type

### ProjectModal
- Dependencies: None (controlled component)
- Props: project, isOpen, onClose, onGithubClick

### SkillsChart
- Dependencies: Recharts
- Props: skills[]

### NewsletterSignup
- Dependencies: sonner (toasts)
- Internal state: email, loading, subscribed

---

## Performance Considerations

- **Animations**: Using Motion/Framer for GPU-accelerated animations
- **Search**: Client-side search (no API calls) for instant results
- **Dark Mode**: CSS-based, no reflow needed
- **Charts**: Recharts handles SVG optimization
- **Code Splitting**: Each page/component is modular

---

## Accessibility

- ✅ Keyboard navigation (ESC for search/modal close)
- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Color contrast maintained
- ✅ Form labels and validation messages
- ✅ Clickable areas properly sized

---

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

**Last Updated**: April 2, 2026  
**Version**: 4.0.0
