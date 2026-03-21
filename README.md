<div align="center">
  <img src="https://raw.githubusercontent.com/luciodale/swipe-bar/main/packages/docs/public/logo-accent.svg" alt="swipe-bar logo" width="120" height="120" />
  <h1>swipe-bar</h1>
  <p>Native swipe sidebars and bottom sheets for React. Zero dependencies.</p>

  [Documentation](https://koolcodez.com/projects/swipe-bar) &nbsp;&middot;&nbsp; [NPM](https://www.npmjs.com/package/@luciodale/swipe-bar) &nbsp;&middot;&nbsp; [GitHub](https://github.com/luciodale/swipe-bar)

</div>

## Install

```bash
npm install @luciodale/swipe-bar
```

## Quick Start

```tsx
import { SwipeBarProvider, SwipeBarLeft } from "@luciodale/swipe-bar";

function App() {
  return (
    <SwipeBarProvider>
      <SwipeBarLeft className="bg-gray-900 text-white">
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/settings">Settings</a>
        </nav>
      </SwipeBarLeft>

      <main>Your app content</main>
    </SwipeBarProvider>
  );
}
```

Swipe from the left edge on mobile or click the toggle on desktop. That's it.

## Features

- **Zero dependencies** &mdash; just React
- **Left, right, and bottom** &mdash; all three directions with the same API
- **Native touch gestures** &mdash; edge swipe detection, drag tracking, velocity commit/cancel
- **Multi-instance** &mdash; multiple sidebars per direction with independent state via `id` prop
- **Bottom sheets with mid-anchor** &mdash; swipe to a halfway stop, then again to fully open
- **Typed sidebar metadata** &mdash; attach a generic type map and get compile-time safety
- **Programmatic control** &mdash; open, close, and read state from anywhere via context hook
- **Cross-direction locking** &mdash; one direction at a time, no gesture conflicts
- **Accessibility** &mdash; focus trap, Escape to close, aria attributes, keyboard navigation
- **Runtime configuration** &mdash; change any prop at runtime via `setGlobalOptions`

## Programmatic Control

```tsx
import { useSwipeBarContext } from "@luciodale/swipe-bar";

function Header() {
  const { openSidebar, closeSidebar, isLeftOpen } = useSwipeBarContext();

  return (
    <header>
      <button onClick={() => openSidebar("left")}>Menu</button>
    </header>
  );
}
```

## Bottom Sheets

```tsx
import { SwipeBarBottom } from "@luciodale/swipe-bar";

<SwipeBarBottom sidebarHeightPx={400} isAbsolute midAnchorPoint>
  <div>Sheet content</div>
</SwipeBarBottom>
```

## Multi-Instance

Give each sidebar a unique `id`. Each instance operates independently.

```tsx
<SwipeBarLeft id="nav" isAbsolute>
  <nav>Navigation</nav>
</SwipeBarLeft>

<SwipeBarLeft
  id="settings"
  isAbsolute
  swipeToOpen={false}
  showToggle={false}
  swipeBarZIndex={70}
  overlayZIndex={65}
>
  <div>Settings panel</div>
</SwipeBarLeft>
```

```tsx
const { openSidebar, leftSidebars } = useSwipeBarContext();

openSidebar("left", { id: "settings" });
const isSettingsOpen = leftSidebars.settings?.isOpen ?? false;
```

## Docs

Full documentation, configuration reference, and live examples at **[koolcodez.com/projects/swipe-bar](https://koolcodez.com/projects/swipe-bar)**.

## License

MIT
