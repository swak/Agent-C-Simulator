# Technical Feasibility Assessment: 3D Browser Game with Three.js + Next.js on Vercel

**Project**: Agent-C Simulator — Autonomous Bot Collection Game
**Date**: 2026-02-10
**Verdict**: Feasible. The stack is mature enough for production.

---

## 1. Three.js + Next.js Integration

### React Three Fiber (R3F)

R3F is the React renderer for Three.js, maintained by the [pmndrs](https://github.com/pmndrs) collective. It has an estimated install base of ~300,000 and is the de facto standard for using Three.js in React apps.

**Maturity assessment:**
- No performance overhead -- R3F components render outside of React's reconciler, and it can actually outperform raw Three.js at scale thanks to React's scheduling abilities.
- As of Three.js r171 (September 2025), WebGPU is production-ready with zero-config: `import * as THREE from 'three/webgpu'` with automatic WebGL 2 fallback. R3F supports this via the async `gl` prop factory.
- WebGPU is now available in Chrome, Edge, Firefox, and Safari (including iOS since Safari 26, September 2025). Browser coverage is ~70%+ and climbing.
- R3F is actively evolving toward first-class game support. Kris Baumgartner's talk ["From Websites to Games: The Future of React Three Fiber"](https://gitnation.com/contents/from-websites-to-games-the-future-of-react-three-fiber) outlines the roadmap.

### @react-three/drei

[Drei](https://github.com/pmndrs/drei) is the companion helper library:

| Category | Examples |
|----------|----------|
| Camera controls | `OrbitControls`, `MapControls`, `PointerLockControls` |
| Loaders | `useGLTF`, `useTexture`, `useFont` |
| Text | `Text`, `Text3D` with customizable font/size/color |
| Abstractions | `Billboard`, `Environment`, `Sky`, `Stars`, `Cloud` |
| Performance | `useDetectGPU` (GPU tier detection), `Instances`, `Merged` |
| Debug | `Stats` panel, `GizmoHelper` |
| Interaction | `Html` (DOM overlays in 3D), `Float`, `MeshPortalMaterial` |

Documentation: [drei.docs.pmnd.rs](https://drei.docs.pmnd.rs/)

### @react-three/rapier (Physics)

[React Three Rapier](https://github.com/pmndrs/react-three-rapier) wraps the Rapier physics engine (written in Rust, compiled to WASM). Latest version is **2.2.0** (published ~November 2025).

**Why Rapier over cannon-es:**
- Significantly more performant (Rust/WASM vs pure JS)
- Better collision detection, more solver types
- Active maintenance by pmndrs
- Declarative API -- wrap objects in `<RigidBody>` and `<Physics>` components

cannon-es is viable for simpler needs but is less actively maintained and slower for complex scenes.

### Next.js App Router Integration

**The critical pattern:** Three.js requires browser APIs (WebGL, canvas, window). In Next.js App Router, all R3F code must be in Client Components:

```tsx
// components/GameCanvas.tsx
'use client'

import { Canvas } from '@react-three/fiber'

export function GameCanvas() {
  return <Canvas>{ /* scene */ }</Canvas>
}
```

**SSR considerations:**
- The `<Canvas>` component and everything inside it must be in files marked with `'use client'`
- Keep the R3F tree as a "client island" -- server components handle layout, metadata, data fetching; the game canvas is a leaf-level client component
- No SSR for the 3D scene itself (correct and expected -- nothing to server-render for WebGL)
- Next.js dynamic imports with `ssr: false` are an alternative for lazy-loading the game component

**Known gotchas:**
1. **Tree-shaking**: Three.js does not tree-shake well. Stat size ~1.23 MB, parsed ~658 KB, gzipped ~155 KB. Use `next.config.js` `optimizePackageImports` and code splitting
2. **Re-renders**: Never use React `useState` in animation loops. Use `useFrame` for mutations, Zustand for shared state
3. **Strict Mode**: React strict mode double-invokes effects -- use `miniplex` 2.0+ which handles this, or disable strict mode for the game canvas
4. **Memory leaks**: Always dispose geometries, materials, and textures in cleanup. R3F handles most of this, but custom Three.js objects need manual disposal

---

## 2. Vercel Deployment Considerations

### Static vs Dynamic Rendering

A 3D game is almost entirely **client-side rendered**:

- **Static Shell**: Page layout, metadata, and loading screen are statically generated at build time
- **Client Island**: The `<Canvas>` and game logic run entirely in the browser
- **API Routes**: Next.js Route Handlers for save/load, leaderboards, auth -- serverless functions

This is an ideal fit for Vercel. The static shell gets edge-cached globally, and game assets load from CDN.

### Asset Loading and CDN

- Place 3D models (`.glb`/`.gltf`), textures, and audio in `public/` -- Vercel serves these directly from its CDN
- Use Draco compression for models and KTX2 for textures to reduce asset sizes
- For large asset collections, consider an external CDN (S3 + CloudFront) to avoid Vercel bandwidth costs

### WebSocket Support

**Vercel does not support native WebSockets**, even with Fluid Compute. If multiplayer is needed later:

| Option | Notes |
|--------|-------|
| [Rivet for Vercel Functions](https://www.rivet.dev/blog/2025-10-20-how-we-built-websocket-servers-for-vercel-functions/) | New (Oct 2025), enables WS on Vercel |
| Pusher / Ably | Third-party pub/sub, reliable |
| Liveblocks | Designed for collaborative apps |
| PartyKit / Cloudflare Durable Objects | Self-hosted WS alternative |
| SpacetimeDB | Purpose-built for multiplayer games |

For single-player with autonomous bots, this is a non-issue initially.

### Bundle Size

| Library | Gzipped Size (approx) |
|---------|----------------------|
| three | ~155 KB |
| @react-three/fiber | ~40 KB |
| @react-three/drei (partial) | ~20-60 KB depending on imports |
| @react-three/rapier (WASM) | ~200-300 KB |
| **Total** | **~400-550 KB** |

Mitigation: Code-split the game behind a dynamic import so the initial page load is fast. The game loads on user interaction (e.g., "Start Game" button).

### Edge Functions

Not relevant for a game. Edge functions are for request-time logic (auth, redirects, geo-routing). The game runs entirely client-side.

---

## 3. Cross-Platform (Desktop / Tablet / Mobile)

### Touch Controls

- **Drei controls**: `OrbitControls` already handles touch (pinch-to-zoom, two-finger-rotate)
- **Nipple.js**: Virtual joystick library, lightweight, commonly used for mobile game controls
- **Pointer Events API**: Unified mouse/touch API -- the modern recommended approach
- For an automation/collection game, virtual joystick + tap-to-interact is likely sufficient

### Mobile Performance

- **Target**: 30-60 FPS on mid-range devices (2023+ phones), 60 FPS on flagship
- **Key bottleneck**: Draw calls. Keep under 100 for mobile
- **`useDetectGPU`** from Drei: Detect GPU tier at runtime and adjust quality
- **Pixel ratio**: Cap at `Math.min(window.devicePixelRatio, 2)`
- **Memory**: Mobile browsers have stricter memory limits. Texture atlases and shared materials are essential
- **Loading**: Target <3 seconds initial load on average US mobile connections

### Responsive 3D Viewport

```tsx
<Canvas
  style={{ width: '100%', height: '100vh' }}
  camera={{ fov: 75, near: 0.1, far: 1000 }}
  dpr={[1, 2]} // auto pixel ratio clamping
>
```

R3F's `<Canvas>` automatically handles resize events. No manual `window.resize` listener needed.

### Input Abstraction

```typescript
interface GameInput {
  move: { x: number; y: number }  // joystick or WASD
  interact: boolean                // click or tap
  camera: { dx: number; dy: number } // mouse delta or touch drag
}
```

Drei's `useKeyboardControls` hook handles keyboard mapping declaratively. Combine with a touch layer for mobile.

### LOD Strategies

- **Three.js `LOD` class**: Swap meshes at distance thresholds
- **Instanced LOD**: Separate `InstancedMesh` per LOD tier -- can nearly double frame rate
- **Texture LOD**: Mipmaps (automatic in Three.js) and smaller texture atlases for mobile
- **Adaptive quality**: Use `useDetectGPU` to select quality presets at startup
- LOD can reduce rendering load by ~40% in busy scenes

---

## 4. Game State Management

### Zustand (Recommended Primary State Store)

[Zustand](https://github.com/pmndrs/zustand) is the standard choice for R3F games (same pmndrs collective):

- Designed for high-frequency updates without triggering React re-renders
- Subscribable outside React (in `useFrame` loops)
- Tiny (~1 KB gzipped)
- Middleware for persistence, devtools, immer

```typescript
import { create } from 'zustand'

interface GameState {
  resources: Record<string, number>
  bots: Bot[]
  addResource: (type: string, amount: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  resources: {},
  bots: [],
  addResource: (type, amount) =>
    set((state) => ({
      resources: {
        ...state.resources,
        [type]: (state.resources[type] ?? 0) + amount,
      },
    })),
}))
```

### ECS Pattern: Miniplex (Recommended) vs bitECS

| Library | Approach | R3F Integration | Performance |
|---------|----------|-----------------|-------------|
| [Miniplex](https://github.com/hmans/miniplex) | Developer-friendly, entities are plain JS objects | Excellent -- `miniplex-react` bindings | Good for hundreds of entities |
| [bitECS](https://github.com/NateTheGreatt/bitECS) | Data-oriented, TypedArrays | Manual | Excellent for thousands of entities |

**Recommendation:** Start with Miniplex for developer ergonomics. If you hit performance walls with 1000+ bots, migrate hot paths to bitECS.

### Saving / Loading Game State

| Method | Use Case |
|--------|----------|
| `localStorage` | Quick save, offline-capable, ~5-10 MB limit |
| `IndexedDB` (via idb-keyval) | Larger saves, structured data |
| Next.js API Routes + database | Cloud saves, cross-device sync |
| Zustand `persist` middleware | Auto-save to localStorage with minimal code |

Hybrid approach: auto-save to localStorage every N seconds, with optional cloud save via API route.

---

## 5. Performance Benchmarks

| Metric | Desktop | Mobile (mid-range) |
|--------|---------|-------------------|
| Draw calls for 60fps | <200-300 | <100 |
| Polygon count (smooth) | 1-5M triangles | 100K-500K triangles |
| InstancedMesh objects | 10,000+ at 60fps | 1,000-5,000 at 30fps |
| Physics bodies (Rapier) | 500-1000 active | 100-300 active |
| Texture memory | 512MB+ available | 128-256MB safe |

For an automation game with ~50-200 bots, moderate terrain, and collection mechanics, these limits are well within range.

### Key Optimization Strategies

- Target under 100 draw calls for mobile 60fps
- Use `InstancedMesh` for repeated objects (1000 bots = 1 draw call)
- Avoid React state in animation loops -- use `useFrame` for mutations
- Share materials between meshes
- Use on-demand rendering (`frameloop="demand"`) for static scenes
- Monitor with `r3f-perf` and `stats-gl`

---

## 6. Recommended Tech Stack

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.x | Framework, routing, API routes |
| `react` / `react-dom` | 19.x | UI framework |
| `three` | 0.172+ | 3D rendering engine |
| `@react-three/fiber` | 9.x | React renderer for Three.js |
| `@react-three/drei` | 9.x | Helper components and hooks |

### Physics & Simulation

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-three/rapier` | 2.2+ | Physics engine (Rust/WASM) |
| `miniplex` + `miniplex-react` | 2.x | ECS for bot entity management |

### State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | 5.x | Global game state (resources, UI, settings) |
| `immer` | 10.x | Immutable state updates (Zustand middleware) |

### UI Overlay (HUD / Menus)

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-three/drei` `Html` | (included) | In-world UI labels |
| `tailwindcss` | 4.x | HUD and menu styling |

### Visual Effects & Audio

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-three/postprocessing` | 3.x | Bloom, SSAO, vignette, tone mapping |
| `howler` | 2.2+ | Sound effects and music (~7 KB gzipped) |

### Development Tools

| Package | Version | Purpose |
|---------|---------|---------|
| `leva` | 0.10+ | Runtime debug UI (tweak parameters live) |
| `r3f-perf` | 7.x | Performance monitor (FPS, draw calls, memory) |
| `@react-three/test-renderer` | 9.x | Unit testing for R3F components |

### Testing Approach

| Layer | Tool | What to Test |
|-------|------|-------------|
| Unit | Vitest + `@react-three/test-renderer` | Component rendering, scene graph structure |
| Game Logic | Vitest | ECS systems, state transitions, bot AI logic (pure functions) |
| Integration | Playwright | Full game loading, interaction flows |
| Visual | Manual + Screenshot regression | Scene appearance across devices |

**Key principle:** Separate game logic from rendering. Bot AI, resource calculations, and state machines should be pure functions testable without any 3D context.

---

## 7. Architecture

```
+--------------------------------------------------+
|  Next.js App (Vercel)                            |
|                                                  |
|  +-- Server Components (layout, metadata) -----+ |
|  |   - Static shell                             | |
|  |   - SEO metadata                             | |
|  |   - Loading screen                           | |
|  +---------------------------------------------+ |
|                                                  |
|  +-- Client Island ('use client') -------------+ |
|  |                                              | |
|  |  Canvas (R3F)                                | |
|  |  +-- Physics (Rapier) ---------------------+ | |
|  |  |  +-- World Terrain                      | | |
|  |  |  +-- Bot Entities (Miniplex ECS)        | | |
|  |  |  +-- Resource Nodes                     | | |
|  |  |  +-- Player Controls                    | | |
|  |  +----------------------------------------+ | |
|  |  +-- PostProcessing (Bloom, etc.) ---------+ | |
|  |                                              | |
|  |  Zustand Store (game state)                  | |
|  |  HUD Overlay (React + Tailwind)              | |
|  |  Audio Engine (Howler.js)                    | |
|  +---------------------------------------------+ |
|                                                  |
|  +-- API Routes (serverless) ------------------+ |
|  |   - Save/Load game state                    | |
|  |   - Leaderboards                            | |
|  |   - Auth (if needed)                        | |
|  +---------------------------------------------+ |
+--------------------------------------------------+
```

---

## 8. Known Limitations and Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | Three.js bundle size (~155 KB gzipped) | Medium | Code-split behind "Start Game" button |
| 2 | No native WebSockets on Vercel | Low (single-player) | PartyKit or SpacetimeDB if multiplayer added |
| 3 | Mobile performance ceiling | Medium | Adaptive quality via `useDetectGPU`, LOD, instancing |
| 4 | Three.js tree-shaking | Low | Bundle analyzer, import aliasing |
| 5 | ECS + React mental model | Low | Miniplex eases this; team needs both paradigms |
| 6 | WebGPU maturity | Low | Default to WebGL, progressive enhancement to WebGPU |
| 7 | 3D game visual testing | Medium | Unit tests for logic, `test-renderer` for scene graph, manual QA for visuals |

---

## 9. Conclusion

This stack is production-viable for a 3D browser game with autonomous bots and automation mechanics. The R3F ecosystem (maintained by pmndrs) provides a cohesive set of libraries that work well together. The combination of Miniplex for entity management, Rapier for physics, and Zustand for state gives a solid architectural foundation.

The main technical risks are mobile performance (manageable with adaptive quality) and future multiplayer (requires additional infrastructure beyond Vercel). Neither is a dealbreaker.

**Recommended next step:** Build a vertical slice -- a single scene with terrain, 5-10 bots with basic AI, resource collection, and a simple HUD -- to validate performance assumptions on target devices before committing to the full scope.

---

## Sources

- [React Three Fiber Documentation](https://r3f.docs.pmnd.rs/)
- [From Websites to Games: The Future of R3F](https://gitnation.com/contents/from-websites-to-games-the-future-of-react-three-fiber)
- [Drei GitHub](https://github.com/pmndrs/drei)
- [React Three Rapier](https://github.com/pmndrs/react-three-rapier)
- [Scaling Performance - R3F Docs](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- [100 Three.js Tips (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [Three.js 2026: WebGPU & Beyond](https://www.utsubo.com/blog/threejs-2026-what-changed)
- [WebGPU Migration Guide](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
- [WebGPU 2026: 70% Browser Support](https://byteiota.com/webgpu-2026-70-browser-support-15x-performance-gains/)
- [Building Efficient Three.js Scenes (Codrops)](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)
- [Vercel WebSocket FAQ](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections)
- [Rivet WebSocket Servers for Vercel](https://www.rivet.dev/blog/2025-10-20-how-we-built-websocket-servers-for-vercel-functions/)
- [Interactive WebGL in Next.js - Vercel Blog](https://vercel.com/blog/building-an-interactive-webgl-experience-in-next-js)
- [Simplifying R3F with ECS (Miniplex)](https://douges.dev/blog/simplifying-r3f-with-ecs)
- [Miniplex GitHub](https://github.com/hmans/miniplex)
- [bitECS + R3F Starter](https://github.com/raaaahman/r3f-bitecs-starter)
- [Vibe Coder 3D](https://github.com/jonit-dev/vibe-coder-3d)
- [ECS Architecture for Web Games](https://www.webgamedev.com/code-architecture/ecs)
- [Awesome React Three Fiber](https://github.com/gsimone/awesome-react-three-fiber)
- [Howler.js](https://howlerjs.com/)
- [Mobile Performance for Three.js](https://moldstud.com/articles/p-optimize-mobile-performance-in-threejs-for-developers)
- [Three.js LOD Implementation](https://waelyasmina.net/articles/enhancing-three-js-app-performance-with-lod/)
