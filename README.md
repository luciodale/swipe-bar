# SwipeBar

<div align="center">
  <img src="https://raw.githubusercontent.com/luciodale/swipe-bar/main/packages/docs/public/logo.svg" alt="SwipeBar Logo" width="200" height="200" />
</div>

<div align="center">
  
  [📖 Documentation](#) • [🎮 Live Demo](#) • [📦 NPM Package](https://www.npmjs.com/package/@luciodale/swipe-bar)
  
</div>

## A native swipe bar experience

SwipeBar provides an intuitive, native-app-like experience for mobile and desktop sidebars. Swipe from the edge to open, drag to close, and enjoy smooth animations with full customization control.

## Features

- 📦 **Lightweight** - zero dependencies
- 📱 **Native Mobile Gestures** - Swipe from screen edges just like native apps
- 🖱️ **Desktop Support** - Works seamlessly with mouse interactions
- 🎨 **Fully Customizable** - Complete control over styling, animations, and behavior
- 🎯 **Smart Positioning** - Automatically adapts between absolute and relative positioning
- 🎭 **Custom Toggles** - Use built-in toggle icons or provide your own components
- ⚡ **Performant** - Relies on transform and opacity properties
- 🎚️ **Configurable Thresholds** - Fine-tune edge activation and drag sensitivity
- 🌓 **Overlay Support** - Optional backdrop overlay with customizable colors
- 📏 **Responsive** - Media query support for different screen sizes
- 🔧 **Programmatic Control** - Open and close sidebars from anywhere in your app

## Installation

```bash
npm install @luciodale/swipe-bar
# or
yarn add @luciodale/swipe-bar
# or
bun add @luciodale/swipe-bar
```

## Quick Start

### 1. Install

```bash
npm install @luciodale/swipe-bar
```

### 2. Add the Provider

Wrap your app with `SwipeBarProvider`:

```tsx
import { SwipeBarProvider } from "@luciodale/swipe-bar";

function App() {
  return (
    <SwipeBarProvider>
      {/* Your app content */}
    </SwipeBarProvider>
  );
}
```

### 3. Add Left Sidebar

```tsx
import { SwipeBarLeft } from "@luciodale/swipe-bar";

<SwipeBarLeft className="bg-blue-500 ...">
  <nav>Your sidebar content</nav>
</SwipeBarLeft>
```

### 4. Add Right Sidebar

```tsx
import { SwipeBarRight } from "@luciodale/swipe-bar";

<SwipeBarRight className="bg-blue-500 ...">
  <div>Settings panel</div>
</SwipeBarRight>
```

### 5. Programmatic Control

Use the context hook to control sidebars from anywhere:

```tsx
import { useSwipeBarContext } from "@luciodale/swipe-bar";

function MyComponent() {
  const { openSidebar, closeSidebar, isLeftOpen, isRightOpen } = useSwipeBarContext();
  
  return (
    <button onClick={() => openSidebar("left")}>
      Open Left Sidebar
    </button>
  );
}
```

## Props & Configuration

### Provider Props

Configure global defaults for all sidebars:

```tsx
<SwipeBarProvider
  sidebarWidthPx={320}
  transitionMs={200}
  edgeActivationWidthPx={40}
  dragActivationDeltaPx={20}
  showOverlay={true}
  closeSidebarOnOverlayClick={true}
  isAbsolute={false}
  overlayBackgroundColor="rgba(0, 0, 0, 0.5)"
  toggleIconColor="white"
  toggleIconSizePx={40}
  toggleIconEdgeDistancePx={40}
  showToggle={true}
  mediaQueryWidth={640}
>
  {children}
</SwipeBarProvider>
```

### Sidebar Props

Both `SwipeBarLeft` and `SwipeBarRight` accept the same props, which override provider defaults:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | CSS classes for the sidebar container |
| `ToggleComponent` | `ReactNode` | - | Custom toggle button component |
| `sidebarWidthPx` | `number` | `320` | Width of the sidebar in pixels |
| `transitionMs` | `number` | `200` | Animation duration in milliseconds |
| `edgeActivationWidthPx` | `number` | `40` | Touch zone width from screen edge to activate swipe |
| `dragActivationDeltaPx` | `number` | `20` | Minimum drag distance to activate sidebar |
| `showOverlay` | `boolean` | `true` | Show backdrop overlay when sidebar is open |
| `closeSidebarOnOverlayClick` | `boolean` | `true` | Close sidebar when clicking overlay |
| `isAbsolute` | `boolean` | `false` | Use absolute positioning (overlay mode) |
| `overlayBackgroundColor` | `string` | `"rgba(0, 0, 0, 0.5)"` | Overlay background color |
| `toggleIconColor` | `string` | `"white"` | Color of the built-in toggle icon |
| `toggleIconSizePx` | `number` | `40` | Size of the toggle icon |
| `toggleIconEdgeDistancePx` | `number` | `40` | Distance of toggle from screen edge |
| `showToggle` | `boolean` | `true` | Show the toggle button |
| `mediaQueryWidth` | `number` | `640` | Max screen width for swipe gestures (in pixels) |

### Context API

```tsx
const {
  isLeftOpen,           // boolean - is left sidebar open
  isRightOpen,          // boolean - is right sidebar open
  openSidebar,          // (side: "left" | "right") => void
  closeSidebar,         // (side: "left" | "right") => void
  globalOptions,        // current global options
  setGlobalOptions,     // update global options
} = useSwipeBarContext();
```

## Key Concepts

### isAbsolute Mode

By default, sidebars push content to the side. Set `isAbsolute={true}` to make sidebars overlay on top of content instead:

```tsx
<SwipeBarLeft isAbsolute={true}>
  {/* This sidebar will overlay content */}
</SwipeBarLeft>
```

**Note:** On mobile (below `mediaQueryWidth`), sidebars automatically switch to absolute positioning for a better mobile experience.

### Media Query Width

Control when swipe gestures are enabled based on screen size:

```tsx
<SwipeBarProvider mediaQueryWidth={640}>
  {/* Swipe gestures only work on screens ≤640px wide */}
</SwipeBarProvider>
```

This is useful if you want swipe interactions only on mobile/tablet devices.

### Toggle Button Behavior

The built-in toggle button automatically hides when:
- The sidebar is open AND `closeSidebarOnOverlayClick` is `true`
- The overlay is visible to handle closing instead

### Custom Toggles

Replace the default toggle with your own component:

```tsx
<SwipeBarLeft 
  ToggleComponent={
    <button className="my-custom-toggle">
      ☰
    </button>
  }
>
  {/* content */}
</SwipeBarLeft>
```

## Examples

### Basic Sidebar

```tsx
import { SwipeBarProvider, SwipeBarLeft } from "@luciodale/swipe-bar";

function App() {
  return (
    <SwipeBarProvider>
      <SwipeBarLeft className="bg-gray-800 text-white p-4">
        <h2>Navigation</h2>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </SwipeBarLeft>
      
      <main>
        {/* Your main content */}
      </main>
    </SwipeBarProvider>
  );
}
```

### Glassmorphism Sidebar

```tsx
<SwipeBarLeft 
  className="bg-white/10 backdrop-blur-2xl border-r border-white/20"
  overlayBackgroundColor="rgba(0, 0, 0, 0.3)"
>
  {/* Glass effect sidebar content */}
</SwipeBarLeft>
```

### Full-Width Mobile Sidebar

```tsx
<SwipeBarLeft 
  sidebarWidthPx={window.innerWidth}
  isAbsolute={true}
>
  {/* Full screen mobile menu */}
</SwipeBarLeft>
```

### Programmatic Control

```tsx
function Header() {
  const { openSidebar } = useSwipeBarContext();
  
  return (
    <header>
      <button onClick={() => openSidebar("left")}>Menu</button>
      <h1>My App</h1>
      <button onClick={() => openSidebar("right")}>Settings</button>
    </header>
  );
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 12+)
- Chrome Android (latest)

Touch events and smooth animations are supported across all modern browsers.

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

MIT
