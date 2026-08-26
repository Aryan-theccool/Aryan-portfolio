# Technical Specifications — Bold Impact Edition

## 🎨 Design System

### Color Palette
- **Primary Brand**: #0070ff (Blue)
- **Secondary Brand**: #00d4ff (Cyan) — **NOW DOMINANT**
- **Background**: #010204 (Near black)
- **Text Primary**: #FFFFFF (White, 95% opacity)
- **Text Secondary**: rgba(255, 255, 255, 0.7) (70% opacity)

### Typography
- **Headlines**: Plus Jakarta Sans, weight 900, -0.05em letter-spacing
- **Body**: Plus Jakarta Sans, weight 400-500, -0.02em letter-spacing
- **Monospace**: JetBrains Mono, weight 600-800, 2.5-3.5px letter-spacing

## 📐 Component Specifications

### 3D Particle Sanctuary Container
```css
Dimensions:       680px height × 100% width
Max Width:        1200px
Border Radius:    32px
Margin:           140px auto
Border:           2px solid rgba(0, 112, 255, 0.4)
Background:       Linear gradient (3 layers)
Blur:             20px backdrop-filter
Box Shadow:       Triple shadow (120px outer + inset + depth)
```

### Particle System
```
Count:            300 particles
Size Range:       2.5px - 4px
Color:            Blue-Cyan spectrum (HSL: hue 50-90%, sat 70-100%, light 55%)
Opacity:          0.85 (high visibility)
Velocity:         0.02-0.04 per frame
Wave Amplitude:   0.2, 0.18, 0.25 (large movements)
Rotation Speed:   X: 0.0002, Y: 0.0004, Z: 0.0003 per frame
```

### Section Header
```css
Eyebrow
├─ Font Size:      13px
├─ Font Weight:    800
├─ Letter Spacing: 3.5px
├─ Color:          #00d4ff
├─ Text Shadow:    0 0 15px rgba(0, 212, 255, 0.4)
└─ Transform:      translateY(-15px) on mount

Heading
├─ Font Size:      clamp(52px, 7vw, 72px)
├─ Font Weight:    900
├─ Letter Spacing: -0.05em
├─ Gradient:       #fff → rgba(0, 212, 255, 0.95)
├─ Line Height:    1.05
└─ Transform:      translateY(30px) on mount

Descriptor
├─ Font Size:      19px
├─ Font Weight:    500
├─ Line Height:    1.85
├─ Color:          rgba(255, 255, 255, 0.85)
└─ Transform:      translateY(20px) on mount
```

### Narrative Vignette
```css
Dimensions:       380px max-width
Position:         Fixed bottom-left (50px, 50px)
Padding:          32px
Border:           2px solid rgba(0, 112, 255, 0.4)
Border Radius:    20px
Background:       Linear gradient (0.25 → 0.18 opacity)
Blur:             20px backdrop-filter
Box Shadow:       20px 60px shadow + inset border
Z-Index:          40
```

## ⚡ Animation Specifications

### Section Header Entrance
```
Eyebrow:      0.0s delay, 1.0s duration
Heading:      0.1s delay, 1.1s duration
Descriptor:   0.2s delay, 1.2s duration
Easing:       cubic-bezier(0.16, 1, 0.3, 1) [smooth, punchy]
```

### Vignette Entrance
```
Delay:        Triggered by scroll
Duration:     0.6s
Transform:    translateY(40px) translateX(-40px) → 0,0
Easing:       cubic-bezier(0.16, 1, 0.3, 1)
```

### 3D Particle Animation
```
Entrance:     1.4s, scale(0.95) → scale(1)
Rotation:     Continuous, X/Y/Z rotation per frame
Wave Motion:  Continuous, amplitude 0.2/0.18/0.25
Pulsing:      Opacity 0.6-0.85 range
Hover:        Camera tracks, opacity +0.25
```

## 🎯 Interaction Specifications

### Hover Effects
```css
3D Container Hover:
├─ Label text-shadow: 0 0 30px rgba(0, 212, 255, 0.9)
├─ Subtitle text-shadow: 0 0 25px rgba(0, 212, 255, 0.8)
├─ Camera position: X/Y × 15 unit range
└─ Particle opacity: +0.25 additional

Section Title Hover:
├─ Underline animation: width 0 → 60px
└─ Color shift: More vibrant

Vignette Hover:
└─ (Static, no hover state)
```

### Scroll Triggers
```
Scroll Depth Indicator:
├─ Height:    3px
├─ Position:  Fixed top
├─ Gradient:  #0070ff → #00d4ff
└─ Width:     0% → 100% based on scroll

Narrative Vignettes:
├─ Trigger:   Section enters viewport
├─ Display:   Fixed position bottom-left
├─ Update:    New vignette every section
└─ Animation: Slide-in 0.6s when triggered
```

## 📱 Responsive Breakpoints

### Mobile (< 768px)
```css
3D Sanctuary:
├─ Height:       480px (down from 680px)
├─ Border Radius: 24px (down from 32px)
├─ Margin:       100px auto (down from 140px)
└─ Labels:       12px font (down from 14px)

Section Heading:
├─ Font Size:    clamp(40px, 6vw, 52px)
├─ Descriptor:   17px (down from 19px)
└─ Eyebrow:      12px (down from 13px)

Vignettes:
├─ Width:        320px (down from 380px)
├─ Padding:      24px (down from 32px)
├─ Position:     30px bottom/left (down from 50px)
└─ Font Size:    14px (down from 15px)
```

## 🎬 Performance Specifications

### Rendering
```
Canvas Renderer:    WebGL, antialias enabled
Pixel Ratio:        window.devicePixelRatio (high-DPI support)
Clear Color:        0x000000 with alpha: true
FPS Target:         60fps (requestAnimationFrame)
```

### Optimization
```
Geometry:           BufferGeometry (efficient)
Material:           PointsMaterial (optimized)
Attributes:         Position, Color, Size (per-particle)
Update Strategy:    Only position/size updated per frame
Event Listeners:    Passive scroll listeners
```

## 📊 CSS Classes & Structure

### Class Hierarchy
```
.section-header (container)
├─ .section-eyebrow (13px cyan label)
├─ .section-heading (52-72px bold heading)
└─ .section-descriptor (19px descriptive prose)

.narrative-vignette (fixed container)
├─ .vignette-label (12px cyan label)
└─ .vignette-text (15px bright text)

.three-js-wrapper (3D container)
├─ .three-js-label (14px label top-left)
└─ .three-js-subtitle (16px italic bottom-right)
```

### State Classes
```
.active:          Applied when element enters viewport
.visible:         Applied to visible vignettes
.exit:            Applied during vignette transition out
.hover:           Applied on hover (CSS :hover)
```

## 🔧 JavaScript Functionality

### Core Functions
```javascript
updateVignette()     // Updates narrative vignette based on scroll
animateParticles()   // Renders 3D particles each frame
initVignettes()      // Initializes vignette tracking
updateClock()        // Updates live clock in nav
handleScroll()       // Updates scroll depth indicator
```

### Event Listeners
```javascript
'scroll'            // Updates vignettes + scroll depth (passive)
'mousemove'         // Camera tracking in 3D (on hover)
'mouseenter'        // 3D hover state
'mouseleave'        // 3D hover state end
'resize'            // Responsive adjustments
```

## 📋 Browser Support

### Tested & Supported
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Requirements
- JavaScript enabled
- WebGL support (for 3D particles)
- CSS Grid & Flexbox support
- CSS Variables (custom properties)

## 🎁 Deliverables Checklist

- ✅ Bold 3D sanctuary (680px, 300 particles, glows)
- ✅ Font-weight 900 typography with text-shadow glows
- ✅ Large narrative vignettes (380px, 3x opacity)
- ✅ Fast animations (+60% speed)
- ✅ Cyan (#00d4ff) dominant color theme
- ✅ Mobile responsive design
- ✅ High-performance particle system
- ✅ Accessible & semantic HTML
- ✅ Zero console errors
- ✅ Full documentation

## 📞 Quick Reference

| Element | Key Spec |
|---------|----------|
| 3D Height | 680px |
| Particles | 300 |
| Particle Size | 2.5-4px |
| Font Weight | 900 |
| Heading Size | 52-72px |
| Vignette Width | 380px |
| Primary Color | #0070ff |
| Accent Color | #00d4ff |
| Animation Speed | +60% |
| Blur Amount | 20px |

