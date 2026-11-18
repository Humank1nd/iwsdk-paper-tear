# iwsdk-paper-tear

Interactive paper tearing mechanic for **Meta Immersive Web SDK (IWSDK)** + Three.js.

CPU-side Verlet-inspired progressive mesh splitting with:
- Two-handed XR grab handles (OneHandGrabbable)
- Progressive row-by-row tear with jagged seam
- Vertex curling toward the hands
- Procedural Web Audio fiber-snap synthesis
- Clean half separation when fully torn

## Quick Start

```bash
npm create @iwsdk@latest iwsdk-paper-tear
cd iwsdk-paper-tear
# then copy the src/ files from this repo over the generated ones
npm install
npm run dev
```

Open in Quest Browser or Chrome with Meta Immersive Web Emulator.

## Architecture

- `TearablePaper` + `TearHandle` components
- `PaperTearSystem` reads handle world positions, drives `tearProgress`, rebuilds geometry
- ProceduralRipAudio reacts to pull velocity
- Bottom edge stays anchored until the tear completes

## Extending to GPU

The current solver is intentionally CPU so tearing, haptics, and audio stay simple. For large environmental cloth, swap the position update for a WebGPU compute Verlet/PBD pass and only read back the particles near the grab points.

## Controls

- Pinch both red corner handles with Quest hands or controllers
- Pull apart and downward to tear
- Faster pulls increase crackle intensity

MIT — use freely.
