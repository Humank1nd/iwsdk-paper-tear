# iwsdk-paper-tear

Interactive paper tearing mechanic for **Meta Immersive Web SDK (IWSDK)** + Three.js.

CPU-side progressive mesh splitting with:
- Two-handed XR grab handles (`OneHandGrabbable`)
- Progressive row-by-row tear with jagged seam and duplicated edge vertices
- Vertex curling toward the hands
- Procedural Web Audio fiber-snap synthesis
- Haptic pulses on each new torn row (Quest controllers)
- Vertex-color fibrous edge treatment
- Clean half separation when fully torn

## Quick Start

```bash
git clone https://github.com/Humank1nd/iwsdk-paper-tear.git
cd iwsdk-paper-tear
npm install
npm run dev
```

Serve over HTTPS (Vite is configured for it). Open in Quest Browser or desktop Chrome with the Meta Immersive Web Emulator.

## Project Structure

```
src/
  components.ts          # TearablePaper + TearHandle
  systems/PaperTearSystem.ts  # Tear logic, haptics, seam rebuild
  audio/ProceduralRipAudio.ts
  index.ts               # World setup
vite.config.ts
tsconfig.json
index.html
```

## Controls

- Pinch both red corner handles with Quest hands or controllers
- Pull apart and downward to tear
- Faster pulls increase crackle intensity and haptic strength

## Extending to GPU

The current solver is intentionally CPU so tearing, haptics, and audio stay simple. For large environmental cloth, swap the position update for a WebGPU compute Verlet/PBD pass and only read back the particles near the grab points.

MIT License — use freely.
