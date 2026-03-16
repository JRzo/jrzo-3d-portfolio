# JRzo — 3D Developer Room Portfolio

An interactive 3D developer room portfolio built with **React Three Fiber**.

## Features

- **Triple-monitor setup** — live GitHub API fetches your 3 latest repos; click any screen to enter a full desktop overlay browsing all repos
- **WASD character movement** — walk your avatar around the room
- **Holographic career terminal** — floating HUD showing experience and LinkedIn link
- **Bookshelf** — 20 books reflecting AI/Data Engineering skillset
- **Bed + sliding closet** — fully modelled bedroom furniture
- **Sports corner** — basketball, baseball bat, soccer ball
- **Wall décor** — NBA, Baseball & Soccer posters + Dominican Republic flag
- **Neon/RGB aesthetic** — bloom post-processing, RectAreaLight monitor glow, per-key keyboard LEDs, glass-panel PC with visible RGB fans

## Tech Stack

| | |
|---|---|
| Framework | React 18 + Vite 5 |
| 3D Engine | Three.js 0.165 |
| React bindings | @react-three/fiber · @react-three/drei |
| Post-processing | @react-three/postprocessing (Bloom) |
| Fonts/UI | Canvas API (procedural textures) |

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
```

## Controls

| Input | Action |
|---|---|
| Drag | Orbit camera |
| Scroll | Zoom |
| W A S D / Arrow keys | Move character |
| Click monitor | Enter GitHub desktop overlay |
| Click terminal | Open LinkedIn |
| ESC | Exit computer overlay |

## Adding Your Avatar

1. Build a character at [readyplayer.me](https://readyplayer.me) (6'1" Afro-Latino, tech-wear hoodie)
2. Download the `.glb` → place at `/public/avatar.glb`
3. Get an idle/typing animation from [mixamo.com](https://mixamo.com)
4. Set `AVATAR_READY = true` in `src/components/Avatar.jsx`

## Personalising

| File | What to update |
|---|---|
| `src/components/Terminal.jsx` | LinkedIn URL, company names, bullet points |
| `src/hooks/useGitHub.js` | GitHub username (default: `JRzo`) |
| `src/components/Avatar.jsx` | Swap placeholder for your `.glb` |
