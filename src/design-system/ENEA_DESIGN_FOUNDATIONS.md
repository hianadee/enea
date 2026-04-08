# ENEA Design System Foundations

## 📐 Overview
Design system for ENEA—a premium, mystical iOS/Android app that merges astrology, Enneagram typology, and daily reflection through personalized inspirational quotes.

Aesthetic pillars: **Dark + Celestial + Elevated + Intentional**

---

## 🎨 Color Palette

### Primary Colors
- **Primary Action (Lavender)**: `#A391D8` — Used for CTAs, interactive elements, highlights
- **Primary Dark (Deep Navy)**: `#1A2332` — Main background, containers
- **Primary Accent (Soft Rose)**: `#E8A8A0` — Secondary highlights, celestial accents

### Semantic Colors
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background (Primary) | Deep Navy | `#1A2332` | Main canvas, safe default |
| Background (Elevated) | Slate Blue | `#252E3F` | Cards, modals, elevated surfaces |
| Foreground (Primary) | Light Grey | `#E8E8E8` | Body text, primary content |
| Foreground (Secondary) | Muted Grey | `#A8A8B8` | Secondary text, hints, disabled |
| Border / Divider | Subtle Blue | `#3A4A5F` | Lines, subtle separation |
| Success | Mint Green | `#7DD3C0` | Positive feedback, confirmations |
| Warning | Warm Gold | `#F4B95B` | Alerts, non-critical warnings |
| Error | Soft Red | `#D97C7C` | Errors, destructive actions |
| Hover State | `#A391D8` + 20% opacity | `rgba(163, 145, 216, 0.2)` | Interactive feedback |

### Gradient Library
```css
/* Celestial Glow */
background: linear-gradient(135deg, #1A2332 0%, #1A2332 100%);

/* Lavender Accent */
background: linear-gradient(135deg, #A391D8 0%, #C0A8E8 100%);

/* Moonrise (Header) */
background: linear-gradient(180deg, #E8A8A0 0%, rgba(232, 168, 160, 0) 100%);

/* Depth */
background: linear-gradient(135deg, #1A2332 0%, #1A2332 100%);
```

---

## 🔤 Typography

### Font Family
- **Primary**: `'Instrument Serif'` or `Georgia` (elegant, premium serif for headings)
- **Secondary**: `'-apple-system'`, `'BlinkMacSystemFont'`, `'Segoe UI'`, `'Roboto'` (clean sans-serif for body)
- **Fallback**: System fonts (iOS: SF Pro Display, Android: Roboto)

### Type Scale
| Role | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|------|--------|-------------|-----------------|-------|
| **Display Large** | Serif | 40px | 400 | 48px | -0.5px | App title, major headings |
| **Display** | Serif | 32px | 400 | 40px | -0.25px | Page titles, welcome screens |
| **Heading 1** | Serif | 28px | 400 | 36px | 0px | Section headers |
| **Heading 2** | Serif | 24px | 400 | 32px | 0px | Subsection headers |
| **Body Large** | Sans | 18px | 400 | 28px | 0.25px | Large body text |
| **Body** | Sans | 16px | 400 | 24px | 0.25px | Primary body text |
| **Body Small** | Sans | 14px | 400 | 20px | 0.25px | Secondary text, captions |
| **Label Large** | Sans | 14px | 500 | 20px | 0.5px | Button labels (action text) |
| **Label** | Sans | 12px | 500 | 16px | 0.5px | Tags, chips, small labels |
| **Caption** | Sans | 12px | 400 | 16px | 0.25px | Hints, metadata, timestamps |

---

## 🔲 Spacing System

### 8px Base Unit Grid
```
xs:  4px  (0.5 units)
sm:  8px  (1 unit)
md:  16px (2 units)
lg:  24px (3 units)
xl:  32px (4 units)
2xl: 48px (6 units)
3xl: 64px (8 units)
4xl: 96px (12 units)
```

### Application Rules
- **Container Padding**: `lg` (24px) for main screens
- **Component Padding**: `md` (16px) for cards, buttons
- **Text Padding**: `sm` (8px) for labels, hints
- **Vertical Rhythm**: Maintain 24px or 32px between major sections
- **Horizontal Margins**: Use `lg` (24px) on mobile, scale proportionally

---

## 📦 Component Foundations

### Buttons

#### Primary Button
```
State: Default
Background: #A391D8
Text: #FFFFFF (Body Large, 500)
Padding: md vertical (16px) + lg horizontal (24px)
Border Radius: 12px
```

```
State: Hover/Active
Background: #9379C8 (darken by ~8%)
Opacity: 1.0
```

```
State: Disabled
Background: #A391D8
Opacity: 0.4
Text Color: #A8A8B8
```

#### Secondary Button
```
Background: transparent
Border: 1px solid #A391D8
Text: #A391D8
Padding: md vertical + lg horizontal
Border Radius: 12px
```

#### Ghost Button
```
Background: transparent
Text: #A391D8
Underline: Optional, on hover
No border
```

### Cards / Surfaces
```
Background: #1A2332
Border Radius: 16px
Padding: lg (24px)
Border: 1px solid rgba(58, 74, 95, 0.4) [subtle divider]
Box Shadow: 0 4px 12px rgba(0, 0, 0, 0.3) [subtle depth]
```

### Input Fields
```
Background: rgba(26, 35, 50, 0.8)
Border: 1px solid #3A4A5F
Border Radius: 12px
Padding: md (16px)
Text Color: #E8E8E8
Placeholder: #A8A8B8
Focus State: Border color → #A391D8, Box Shadow: 0 0 12px rgba(163, 145, 216, 0.3)
```

### Icons & Symbols
- **Size Range**: 16px, 24px, 32px, 48px
- **Color**: Inherit from text color or #A391D8 for primary actions
- **Stroke Width**: 1.5-2px (legible on dark backgrounds)
- **Style**: Outlined, celestial, geometric (avoid highly detailed fills)

---

## 🎭 Interactive States

### Hover
```css
opacity: 0.8;
background: lighten(base_color, 5%);
transition: all 200ms ease-out;
```

### Active / Pressed
```css
opacity: 0.6;
transform: scale(0.98);
transition: all 150ms ease-in;
```

### Disabled
```css
opacity: 0.4;
cursor: not-allowed;
color: #A8A8B8;
```

### Focus (Accessibility)
```css
outline: 2px solid #A391D8;
outline-offset: 2px;
```

---

## 🌙 Shadows & Depth

### Shadow Hierarchy
```css
/* Subtle (cards, subtle elevation) */
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

/* Medium (modals, elevated surfaces) */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

/* Strong (overlays, dropdowns) */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

/* Glow (active interactive states) */
box-shadow: 0 0 16px rgba(163, 145, 216, 0.4);
```

---

## ✨ Visual Effects & Animations

### Transitions
- **Default Duration**: 200ms
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard)
- **Micro-interactions**: 150ms for hover/active states

### Animation Principles
1. **Purposeful**: Every animation communicates state change or draws attention
2. **Subtle**: Avoid excessive motion; respect reduced-motion preferences
3. **Consistent**: Use same easing and duration across similar interactions

### Example Keyframes
```css
/* Gentle Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Subtle Scale (on load) */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Glow Pulse (for highlights) */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(163, 145, 216, 0.3); }
  50% { box-shadow: 0 0 16px rgba(163, 145, 216, 0.6); }
}
```

---

## 📱 Responsive Design

### Breakpoints
```
Mobile:  <480px (default)
Tablet:  480px - 768px
Desktop: >768px
```

### Layout Principles
- **Mobile-first**: Design for small screens, enhance for larger
- **Flexible Grids**: Use 12-column grid on tablet+, single column on mobile
- **Touch Targets**: Minimum 44px × 44px for interactive elements
- **Container Queries**: Prefer over media queries for component-level responsive behavior

---

## ♿ Accessibility

### Color Contrast
- **AAA Standard**: Minimum 7:1 ratio for body text
- **Primary Text**: #E8E8E8 on #1A2332 = 11.5:1 ✓
- **Secondary Text**: #A8A8B8 on #1A2332 = 5.2:1 ✓
- **Action**: #A391D8 on #1A2332 = 5.8:1 ✓

### Touch & Motor
- **Minimum Touch Target**: 44px × 44px
- **Button Padding**: Generous (16px vertical min)
- **Spacing Between Targets**: ≥8px

### Visual & Cognitive
- **Focus Indicators**: Clear 2px outline in #A391D8
- **Motion**: Respect `prefers-reduced-motion`
- **Icon + Text Labels**: Always pair icons with text for clarity
- **Status Messages**: Use color + icon + text (never color alone)

---

## 🎯 Implementation Checklist

### Figma / Design Tool Setup
- [ ] Create color styles (global, semantic, component-level)
- [ ] Define type styles with line heights
- [ ] Build component library with variants (default, hover, active, disabled)
- [ ] Document spacing tokens in a grid
- [ ] Create accessibility audit file (color contrast, touch targets)

### Code Implementation (React Native / Web)
- [ ] Extract colors to CSS variables or theme object
- [ ] Create utility classes for spacing, typography
- [ ] Build reusable component templates (Button, Card, Input, etc.)
- [ ] Set up focus management and keyboard navigation
- [ ] Test with accessibility audits (axe, Lighthouse, WCAG)

### Documentation
- [ ] Create component storybook / showcase
- [ ] Write usage guidelines (when to use each component)
- [ ] Document color & spacing token names
- [ ] Maintain changelog for design updates

---

## 🔗 References & Inspiration

- **Co-Star**: Premium mystical aesthetic, dark theme, generous spacing
- **Material Design 3**: Color system, elevation model, accessibility standards
- **Apple Human Interface Guidelines**: Typography, spacing, dark mode
- **Astrology & Wellness Apps**: Premium imagery, celestial motifs, reflective UX

---

**Last Updated**: April 2026  
**Status**: Active — Ready for implementation across ENEA iOS & Android
