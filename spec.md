# Shortcut — Next-Gen CapCut Redesign Specification (`spec.md`)

## 1. Executive Summary & Vision
**Shortcut** is an ultra-fast, clutter-free, privacy-first web redesign of CapCut. CapCut became popular because of its ease of use, magnetic timeline, auto-captions, and viral effects, but has progressively degraded with aggressive monetisation popups ("Pro" paywalls on basic transitions), heavy CPU/RAM bloat, cloud-sync friction, and awkward desktop UI layout.

**Shortcut** reimagines the desktop/web video editing experience with:
- **Clean Professional Studio UI**: Glassmorphic dark theme, ultra-compact toolbar, zero promotional popups, zero mandatory logins.
- **Client-Side First & High Performance**: Runs entirely in the browser using HTML5 Canvas 2D/WebGL, Web Audio API, and local WebCodecs.
- **Magnetic Multi-Track Timeline**: Fluid clip dragging, ripple trimming, snap alignment, razor split tool (`C`), visual waveforms, and multi-track layering (Video, Text/Subtitles, Audio/SFX).
- **Creator Toolset**: Aspect ratio switcher (16:9 Landscape, 9:16 Shorts/Reels/TikTok, 1:1 Square), Safe-area overlay guides, animated viral captions, LUT color grading, audio equalizer, and instant 4K export simulator.

---

## 2. User Stories
- **US-1 (Fast Timeline Editing)**: As a short-form video creator, I want to drag media clips onto a magnetic timeline, scrub smoothly at 60 FPS, split clips with shortcut `C`, trim heads/tails, and reorder clips with automatic ripple positioning.
- **US-2 (Viral Subtitles & Dynamic Text)**: As a TikTok/Reels creator, I want one-click viral animated caption templates (e.g., Hormozi yellow glow, kinetic bounce, minimalist clean) that render directly over the canvas.
- **US-3 (Safe Zone Preview)**: As a content creator, I want to toggle a TikTok/Instagram safe-zone overlay on the canvas preview to ensure titles and subjects aren't blocked by platform UI elements.
- **US-4 (Real-Time Transforms & Filters)**: As an editor, I want to scale, position, rotate, adjust opacity, and apply color grading (Exposure, Contrast, Saturation, Temperature, Vignette) with instant live preview.
- **US-5 (No Paywalls or Watermarks)**: As an independent user, I want full access to all transitions, filters, and export presets without artificial paywalls or forced watermark clips.

---

## 3. Architecture & Functional Components

### 3.1 Layout Anatomy
```
+-----------------------------------------------------------------------------------+
|  [Logo: Shortcut]  Project Title  | 16:9 v | Zoom v | Undo Redo | [Play] [Export] |
+-----------+-----------------------------------------------+-----------------------+
| Activity  |  Asset Library / Left Drawer                  |  Inspector Panel      |
| Bar       |  - Media (Files, Samples)                     |  - Video Transform    |
| [Media]   |  - Audio (BGM, SFX)                           |  - Color Grading      |
| [Text]    |  - Text (Viral Subtitles, Headings)           |  - Audio Controls     |
| [FX]      |  - Effects & LUTs                             |  - Speed Ramp         |
| [Trans]   |  - AI Tools (Auto-captions, Silence Remover)  |  - Keyframes          |
| [AI]      +-----------------------------------------------+                       |
|           |  Canvas Video Player / Safe-Area Overlay      |                       |
|           |  - Timecode Display, Scrub Bar, Controls      |                       |
+-----------+-----------------------------------------------+-----------------------+
| Timeline Toolbar: [Select (V)] [Split (C)] [Delete] [Magnet] [Snap] [Zoom Slider] |
+-----------------------------------------------------------------------------------+
| Multi-Track Timeline (Ruler + Playhead + Tracks V2, V1, Text T1, Audio A1, A2)    |
+-----------------------------------------------------------------------------------+
```

### 3.2 Key Technical Specifications
1. **Rendering Engine**: HTML5 Canvas with hardware acceleration, compositing video frames, image overlays, animated text, and color filter matrices.
2. **Timeline Engine**: Virtualized time ruler calibrated in seconds & frames (`HH:MM:SS:FF`), synchronized playhead, magnetic snapping with collision resolution.
3. **Audio Pipeline**: Web Audio API with GainNode, AnalyserNode for live decibel meters and waveforms.
4. **State Management**: Reactive state store with undo/redo history stack, clip selection management, and real-time inspector bindings.

---

## 4. Definition of Done (DoD)
- [x] Application compiles cleanly and launches on a local HTTP port.
- [x] Full UI matches the modernized CapCut aesthetic (dark studio theme, responsive panels).
- [x] Playback engine runs play/pause/scrub with interactive timecode display.
- [x] Timeline allows clip addition, selection, trimming, splitting, and track switching.
- [x] Canvas supports aspect ratio changes (16:9, 9:16, 1:1) and safe-zone overlay toggles.
- [x] Inspector panel updates selected clip properties (scale, position, opacity, color grading).
- [x] Sample media pre-loaded for immediate zero-friction evaluation.
