# Hacker Mechanical Button Click Effect

This project includes a hacker-themed mechanical button click effect that provides both visual and audio feedback when buttons are clicked.

## Features

- **Visual Feedback**: Buttons scale down with glitch animations, neon glows, and cyberpunk effects
- **Audio Feedback**: Multiple sound types including mechanical clicks, glitch sounds, and electric zaps
- **Multiple Intensity Levels**: Four levels of click effects (normal, strong, glitch, and zap)
- **Hacker Aesthetics**: Glitch animations, hue shifts, and neon green color scheme
- **Easy Integration**: Simple CSS classes and React hooks for quick implementation

## Usage

### CSS Classes

Three main CSS classes are available for different button types:

#### 1. `.mechanical-btn`
Basic mechanical button effect with subtle press animation.

```html
<button className="mechanical-btn">
  Click Me
</button>
```

#### 2. `.mechanical-btn-strong`
Stronger mechanical button effect with more pronounced press animation.

```html
<button className="mechanical-btn-strong">
  Strong Click
</button>
```

#### 3. `.btn-mechanical`
Full mechanical button with border, hover effects, and press animation.

```html
<button className="btn-mechanical">
  Styled Button
</button>
```

#### 4. `.icon-btn-mechanical`
Mechanical effect for icon buttons (44x44px).

```html
<button className="icon-btn-mechanical">
  <Icon />
</button>
```

### React Hook

The `useMechanicalClick` hook provides programmatic control over the click effects:

```tsx
import { useMechanicalClick } from '../hooks/useMechanicalClick';

function MyComponent() {
  const { handleClick, handleClickStrong, handleClickGlitch, handleClickZap } = useMechanicalClick();

  return (
    <button onClick={handleClick}>
      Normal Click
    </button>
    
    <button onClick={handleClickStrong}>
      Strong Click
    </button>
    
    <button onClick={handleClickGlitch}>
      Glitch Click
    </button>
    
    <button onClick={handleClickZap}>
      Zap Click
    </button>
  );
}
```

## Implementation Details

### Visual Effects

- **Scale**: Buttons scale down to 95% (normal) or 92% (strong) on click
- **Shadow**: Inset shadows create a "pressed in" effect
- **Glow**: Neon green border glow on click with multiple layers
- **Gradient**: Radial gradient overlay expands on click
- **Glitch Animation**: Hue rotation and position jitter for cyberpunk effect
- **Brightness Flash**: Brightness increase for zap effect

### Audio Effects

- **Normal Click**: Uses existing `playKeySound()` for mechanical click
- **Strong Click**: Uses `playHeavyKeySound()` for deeper, more pronounced sound
- **Glitch Sound**: Custom sawtooth oscillator with bandpass filter for cyberpunk effect
- **Zap Sound**: Square wave with rapid frequency sweep for electric zap

## Examples

### In Portfolio Page

```tsx
// Hero section buttons
<motion.a
  href="#projects"
  onClick={handleClickStrong}
  className="btn-mechanical"
>
  [ VIEW_PROGRAMS ]
</motion.a>

// Project filter buttons
<button
  onClick={(e) => { handleClick(e); setProjectFilter(cat); }}
  className="mechanical-btn"
>
  [{cat}]
</button>

// Icon buttons
<a
  href={project.github_link}
  onClick={handleClick}
  className="icon-btn-mechanical"
>
  <Github size={18} />
</a>
```

### In Login Page

```tsx
<button
  onClick={handleClickStrong}
  className="btn-mechanical"
>
  [ SIGN_IN ]
</button>
```

### In Admin Page

```tsx
// Tab buttons
<button
  onClick={(e) => { handleClick(e); setActiveTab(tab.id); }}
  className="mechanical-btn"
>
  {tab.label}
</button>

// Action buttons
<button
  onClick={(e) => { handleClick(e); handleEdit(item); }}
  className="icon-btn-mechanical"
>
  <Edit size={16} />
</button>
```

## Customization

### Adjusting Press Intensity

Modify the transform values in `src/index.css`:

```css
.mechanical-btn:active {
  transform: scale(0.95) translateY(2px); /* Adjust these values */
}

.mechanical-btn-strong:active {
  transform: scale(0.92) translateY(3px); /* Adjust these values */
}
```

### Changing Colors

The effect uses the project's neon green color scheme. To customize:

```css
.mechanical-btn:active {
  box-shadow: 0 0 0 2px rgba(0, 255, 65, 0.8), /* Change color here */
              inset 0 2px 4px rgba(0, 0, 0, 0.5);
}
```

### Adjusting Sound

Modify the sound parameters in `src/hooks/useMechanicalClick.ts`:

```typescript
// Change frequency range
oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
oscillator.frequency.exponentialRampToValueAtTime(200, audioContextRef.current.currentTime + 0.05);

// Change volume
gainNode.gain.setValueAtTime(0.15, audioContextRef.current.currentTime);
```

## Browser Compatibility

- Modern browsers with Web Audio API support
- Gracefully degrades if audio is not supported
- Touch devices: Uses `-webkit-tap-highlight-color: transparent` for better mobile experience

## Notes

- Sound effects require user interaction to initialize (browser autoplay policy)
- Effects are optimized for performance with CSS transitions
- Works seamlessly with existing Tailwind CSS classes
- Compatible with Framer Motion animations
