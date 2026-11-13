# Shortcut — Implementation & Task Breakdown Plan (`plan.md`)

## Milestones & Phased Execution

### Phase 1: Environment & Project Foundation
- **Goal**: Scaffold the modern web frontend application with Vite, Tailwind CSS, Lucide icons, and modern tooling.
- **Tasks**:
  1. Initialize `package.json` with dependencies (`lucide-react` or SVG icons, styling, bundler).
  2. Setup HTML entry point, Tailwind styles, and base layout grid.
  3. Verify build & dev server launch.
- **Verification**: `npm run build` exits 0; dev server serves valid 200 HTTP response.

### Phase 2: Core Video Studio UI Layout
- **Goal**: Build the complete, polished CapCut redesign interface ("Shortcut").
- **Tasks**:
  1. Top Navigation Bar (Branding, aspect ratio selector, undo/redo, preview zoom, export CTA).
  2. Left Activity Bar & Media/Effects Drawer (Media library, Viral text presets, Video effects, AI Tools showcase).
  3. Canvas Player Viewport (Interactive video player with safe-area overlay, timecode, play/pause controls).
  4. Right Property Inspector (Transform, Color grade sliders, Audio levels, Speed curve).
  5. Magnetic Timeline Panel (Time ruler, playhead, multi-track channels, clip blocks, split & trim controls).
- **Verification**: Responsive rendering across widescreen and standard desktop resolutions.

### Phase 3: Interactive Timeline & Video Playback Engine
- **Goal**: Wire up state management, clip playback, scrubbing, trimming, and real-time inspector editing.
- **Tasks**:
  1. Multi-track playback loop syncing the Canvas renderer with timeline playhead.
  2. Clip selection logic binding selected clip to the Right Inspector panel.
  3. Split clip (`C`) and trim handle dragging.
  4. Aspect ratio switching (16:9 Landscape <-> 9:16 Vertical Shorts <-> 1:1 Square).
  5. Safe-area guide overlay (TikTok/Instagram UI overlay preview).
- **Verification**: Functional playback, timecode scrub, clip property manipulation in real time.

### Phase 4: AI & Creator Feature Simulation & Export Pipeline
- **Goal**: Provide the CapCut killer features: Auto-captions, Silence Remover, Viral Text styling, and clean Export dialog.
- **Tasks**:
  1. Auto-captions generator simulation with viral subtitle styling presets.
  2. Export dialog with 4K/1080p, 60fps/30fps, Bitrate, and format selection (no watermarks!).
  3. Sample media presets included out-of-the-box.
- **Verification**: End-to-end user flow from clip selection to effects tweaking and export triggering.

### Phase 5: Verification, Server Deployment & Documentation
- **Goal**: Run background web server, verify HTTP endpoints, document live link, and complete project registration.
- **Tasks**:
  1. Start production/preview server.
  2. Verify access via curl/browser.
  3. Update `README.md` and `AGENTS.md`.
- **Verification**: `curl -I http://localhost:<port>` returns HTTP 200 OK.
