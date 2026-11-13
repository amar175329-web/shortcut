// Shortcut — Next-Gen CapCut Redesign Interactive Engine
console.log('⚡ Shortcut Engine Initialized');

// App State
const state = {
  isPlaying: false,
  currentTime: 2.5, // seconds
  totalDuration: 15.0, // seconds
  playbackSpeed: 1.0,
  aspectRatio: '9:16',
  showSafeZone: true,
  isMuted: false,
  magnetMode: true,
  activePanel: 'media',
  activeInspectorTab: 'transform',
  selectedClipId: 'v1-1',
  timelineZoom: 2, // px per frame/second scale
  
  // Transform & Color parameters for selected clip
  clipProps: {
    'v1-1': {
      title: 'Cyberpunk City Night.mp4',
      track: 'V1',
      scale: 100,
      posX: 0,
      posY: 0,
      rotation: 0,
      opacity: 100,
      blendMode: 'normal',
      exposure: 0,
      contrast: 100,
      saturation: 100,
      temperature: 0,
      speed: 1.0,
      volume: 100,
      color: '#00f2fe',
      type: 'video'
    },
    'v1-2': {
      title: 'Ocean Sunset Drone.mp4',
      track: 'V1',
      scale: 100,
      posX: 0,
      posY: 0,
      rotation: 0,
      opacity: 100,
      blendMode: 'normal',
      exposure: 5,
      contrast: 110,
      saturation: 120,
      temperature: 15,
      speed: 1.0,
      volume: 80,
      color: '#3b82f6',
      type: 'video'
    },
    'text-1': {
      title: 'Viral Subtitle: "Wait for the end..."',
      track: 'T1',
      text: 'WAIT FOR THE END 😱',
      preset: 'hormozi',
      scale: 110,
      posX: 0,
      posY: 180,
      rotation: 0,
      opacity: 100,
      blendMode: 'normal',
      exposure: 0,
      contrast: 100,
      saturation: 100,
      temperature: 0,
      speed: 1.0,
      volume: 100,
      color: '#f59e0b',
      type: 'text'
    },
    'v2-1': {
      title: 'Cyber Glitch FX',
      track: 'V2',
      scale: 100,
      posX: 0,
      posY: 0,
      rotation: 0,
      opacity: 80,
      blendMode: 'screen',
      exposure: 0,
      contrast: 120,
      saturation: 140,
      temperature: -10,
      speed: 1.0,
      volume: 100,
      color: '#d946ef',
      type: 'overlay'
    },
    'a1-1': {
      title: 'Phonk Viral Beat.mp3',
      track: 'A1',
      scale: 100,
      posX: 0,
      posY: 0,
      rotation: 0,
      opacity: 100,
      blendMode: 'normal',
      exposure: 0,
      contrast: 100,
      saturation: 100,
      temperature: 0,
      speed: 1.0,
      volume: 100,
      color: '#10b981',
      type: 'audio'
    }
  }
};

// DOM References
const canvas = document.getElementById('video-canvas');
const ctx = canvas.getContext('2d');
const playerFrame = document.getElementById('player-frame');
const safeAreaOverlay = document.getElementById('safe-area-overlay');
const safeZoneBadge = document.getElementById('safe-zone-badge');
const currentTimecodeEl = document.getElementById('current-timecode');
const totalTimecodeEl = document.getElementById('total-timecode');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const stepBackBtn = document.getElementById('step-back-btn');
const stepFwdBtn = document.getElementById('step-fwd-btn');
const playheadNeedle = document.getElementById('playhead-needle');
const timelineRuler = document.getElementById('timeline-ruler');
const timelineScrollContainer = document.getElementById('timeline-scroll-container');
const exportModal = document.getElementById('export-modal');
const exportModalBtn = document.getElementById('export-modal-btn');
const closeExportModalBtn = document.getElementById('close-export-modal-btn');
const cancelExportBtn = document.getElementById('cancel-export-btn');
const startExportBtn = document.getElementById('start-export-btn');
const renderProgressBox = document.getElementById('render-progress-box');
const renderProgressBar = document.getElementById('render-progress-bar');
const renderPct = document.getElementById('render-pct');
const renderStatusText = document.getElementById('render-status-text');

// Format seconds into HH:MM:SS:FF
function formatTimecode(seconds) {
  const fps = 30;
  const totalFrames = Math.floor(seconds * fps);
  const ff = String(totalFrames % fps).padStart(2, '0');
  const ss = String(Math.floor(seconds) % 60).padStart(2, '0');
  const mm = String(Math.floor(seconds / 60) % 60).padStart(2, '0');
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  return `${hh}:${mm}:${ss}:${ff}`;
}

// Aspect Ratio Switching
const ratioDimensions = {
  '16:9': { w: 720, h: 405, canvasW: 1920, canvasH: 1080 },
  '9:16': { w: 337, h: 600, canvasW: 1080, canvasH: 1920 },
  '1:1': { w: 460, h: 460, canvasW: 1080, canvasH: 1080 }
};

document.querySelectorAll('.ratio-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const ratio = btn.dataset.ratio;
    setAspectRatio(ratio);
  });
});

function setAspectRatio(ratio) {
  state.aspectRatio = ratio;
  const dim = ratioDimensions[ratio];
  playerFrame.style.width = `${dim.w}px`;
  playerFrame.style.height = `${dim.h}px`;
  canvas.width = dim.canvasW;
  canvas.height = dim.canvasH;

  document.querySelectorAll('.ratio-btn').forEach(b => {
    if (b.dataset.ratio === ratio) {
      b.className = 'ratio-btn px-2.5 py-1 rounded bg-[#00f2fe] text-black font-semibold transition flex items-center gap-1.5';
    } else {
      b.className = 'ratio-btn px-2.5 py-1 rounded text-slate-400 hover:text-white transition flex items-center gap-1.5';
    }
  });

  // Safe area only applies to vertical 9:16 Shorts
  if (ratio !== '9:16') {
    safeAreaOverlay.style.opacity = '0';
  } else if (state.showSafeZone) {
    safeAreaOverlay.style.opacity = '1';
  }
}

// Toggle Safe Zone
const toggleSafeZoneBtn = document.getElementById('toggle-safe-zone');
toggleSafeZoneBtn.addEventListener('click', () => {
  state.showSafeZone = !state.showSafeZone;
  if (state.aspectRatio === '9:16') {
    safeAreaOverlay.style.opacity = state.showSafeZone ? '1' : '0';
  }
  safeZoneBadge.className = state.showSafeZone 
    ? 'w-2 h-2 rounded-full bg-emerald-400' 
    : 'w-2 h-2 rounded-full bg-slate-600';
});

// Left Activity Bar Navigation
document.querySelectorAll('.activity-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const panelName = tab.dataset.panel;
    document.querySelectorAll('.activity-tab').forEach(t => {
      t.className = 'activity-tab flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-400 hover:text-white hover:bg-[#161924] transition';
    });
    tab.className = 'activity-tab active flex flex-col items-center justify-center w-12 h-12 rounded-xl text-cyan-400 bg-[#191d2a] border border-cyan-500/20 transition';

    document.querySelectorAll('.drawer-panel').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(`panel-${panelName}`);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('flex');
    }
    state.activePanel = panelName;
  });
});

// Inspector Tabs
document.querySelectorAll('.inspector-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    document.querySelectorAll('.inspector-tab').forEach(t => {
      t.className = 'inspector-tab flex-1 py-2 text-center text-slate-400 hover:text-white';
    });
    tab.className = 'inspector-tab active flex-1 py-2 text-center text-cyan-400 border-b-2 border-cyan-400';

    document.querySelectorAll('.inspector-content').forEach(c => c.classList.add('hidden'));
    const target = document.getElementById(`inspector-tab-${tabName}`);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('flex');
    }
    state.activeInspectorTab = tabName;
  });
});

// Clip Selection & Inspector Two-way Binding
function selectClip(clipId) {
  state.selectedClipId = clipId;
  document.querySelectorAll('.timeline-clip').forEach(c => c.classList.remove('selected'));
  const el = document.getElementById(`clip-${clipId}`);
  if (el) el.classList.add('selected');

  const props = state.clipProps[clipId];
  if (!props) return;

  const badge = document.getElementById('active-clip-badge');
  badge.textContent = `${props.track}: ${props.title.slice(0, 16)}...`;

  // Update Transform values in UI
  document.getElementById('slider-scale').value = props.scale;
  document.getElementById('scale-val').textContent = `${props.scale}%`;
  document.getElementById('slider-posx').value = props.posX;
  document.getElementById('posx-val').textContent = `${props.posX}px`;
  document.getElementById('slider-posy').value = props.posY;
  document.getElementById('posy-val').textContent = `${props.posY}px`;
  document.getElementById('slider-rotate').value = props.rotation;
  document.getElementById('rotate-val').textContent = `${props.rotation}°`;
  document.getElementById('slider-opacity').value = props.opacity;
  document.getElementById('opacity-val').textContent = `${props.opacity}%`;
  document.getElementById('blend-mode-select').value = props.blendMode;

  // Update Color LUT values
  document.getElementById('slider-exposure').value = props.exposure;
  document.getElementById('exposure-val').textContent = props.exposure;
  document.getElementById('slider-contrast').value = props.contrast;
  document.getElementById('contrast-val').textContent = `${props.contrast}%`;
  document.getElementById('slider-saturation').value = props.saturation;
  document.getElementById('saturation-val').textContent = `${props.saturation}%`;
  document.getElementById('slider-temp').value = props.temperature;
  document.getElementById('temp-val').textContent = props.temperature;

  // Update Speed & Audio
  document.getElementById('slider-vol').value = props.volume;
  document.getElementById('vol-val').textContent = `${props.volume}%`;
  document.getElementById('speed-val').textContent = `${props.speed}x`;
}

// Bind Sliders to Selected Clip
function setupSlider(sliderId, valId, propKey, unit = '') {
  const slider = document.getElementById(sliderId);
  const valEl = document.getElementById(valId);
  slider.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    valEl.textContent = `${val}${unit}`;
    if (state.selectedClipId && state.clipProps[state.selectedClipId]) {
      state.clipProps[state.selectedClipId][propKey] = val;
    }
  });
}

setupSlider('slider-scale', 'scale-val', 'scale', '%');
setupSlider('slider-posx', 'posx-val', 'posX', 'px');
setupSlider('slider-posy', 'posy-val', 'posY', 'px');
setupSlider('slider-rotate', 'rotate-val', 'rotation', '°');
setupSlider('slider-opacity', 'opacity-val', 'opacity', '%');
setupSlider('slider-exposure', 'exposure-val', 'exposure', '');
setupSlider('slider-contrast', 'contrast-val', 'contrast', '%');
setupSlider('slider-saturation', 'saturation-val', 'saturation', '%');
setupSlider('slider-temp', 'temp-val', 'temperature', '');
setupSlider('slider-vol', 'vol-val', 'volume', '%');

document.getElementById('blend-mode-select').addEventListener('change', (e) => {
  if (state.selectedClipId && state.clipProps[state.selectedClipId]) {
    state.clipProps[state.selectedClipId].blendMode = e.target.value;
  }
});

// Speed ramp buttons
document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const s = Number(btn.dataset.speed);
    document.querySelectorAll('.speed-btn').forEach(b => {
      b.className = 'speed-btn py-1 rounded bg-[#181c28] border border-[#2b334a] hover:border-cyan-400 text-slate-300';
    });
    btn.className = 'speed-btn py-1 rounded bg-cyan-400 text-black font-bold';
    document.getElementById('speed-val').textContent = `${s}x`;
    if (state.selectedClipId && state.clipProps[state.selectedClipId]) {
      state.clipProps[state.selectedClipId].speed = s;
    }
    state.playbackSpeed = s;
  });
});

// Attach Clip Selection Clicks
document.querySelectorAll('.timeline-clip').forEach(clip => {
  clip.addEventListener('click', (e) => {
    e.stopPropagation();
    selectClip(clip.dataset.clipId);
  });
});

// Play / Pause Logic
function togglePlay() {
  state.isPlaying = !state.isPlaying;
  if (state.isPlaying) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    lastFrameTime = performance.now();
    requestAnimationFrame(renderLoop);
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
  }
}

playPauseBtn.addEventListener('click', togglePlay);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    togglePlay();
  }
  if (e.key === 'c' || e.key === 'C') {
    splitAtPlayhead();
  }
});

stepBackBtn.addEventListener('click', () => {
  state.currentTime = Math.max(0, state.currentTime - 1/30);
  updatePlayheadUI();
});

stepFwdBtn.addEventListener('click', () => {
  state.currentTime = Math.min(state.totalDuration, state.currentTime + 1/30);
  updatePlayheadUI();
});

// Timeline Ruler Generation
function renderRuler() {
  timelineRuler.innerHTML = '';
  const totalSeconds = Math.ceil(state.totalDuration) + 5;
  const pixelsPerSecond = 50 * (state.timelineZoom / 2);

  for (let i = 0; i < totalSeconds; i++) {
    const mark = document.createElement('div');
    mark.className = 'relative flex flex-col items-center shrink-0';
    mark.style.width = `${pixelsPerSecond}px`;
    mark.innerHTML = `
      <span class="text-[9px] font-mono text-slate-500">${String(i).padStart(2, '0')}:00</span>
      <div class="h-2 w-px bg-[#262b3c] mt-0.5"></div>
    `;
    timelineRuler.appendChild(mark);
  }
}
renderRuler();

// Timeline Scrubbing Click & Drag
let isScrubbing = false;
timelineScrollContainer.addEventListener('mousedown', (e) => {
  if (e.target.closest('.timeline-clip')) return;
  isScrubbing = true;
  handleScrub(e);
});

window.addEventListener('mousemove', (e) => {
  if (isScrubbing) handleScrub(e);
});

window.addEventListener('mouseup', () => {
  isScrubbing = false;
});

function handleScrub(e) {
  const rect = timelineScrollContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left + timelineScrollContainer.scrollLeft - 96; // 96px is track label column
  const pixelsPerSecond = 50 * (state.timelineZoom / 2);
  const time = Math.max(0, Math.min(state.totalDuration, clickX / pixelsPerSecond));
  state.currentTime = time;
  updatePlayheadUI();
}

function updatePlayheadUI() {
  currentTimecodeEl.textContent = formatTimecode(state.currentTime);
  const pixelsPerSecond = 50 * (state.timelineZoom / 2);
  const playheadX = 96 + (state.currentTime * pixelsPerSecond);
  playheadNeedle.style.left = `${playheadX}px`;
}

// Split Clip at Playhead (Razor Cut 'C')
function splitAtPlayhead() {
  const currentClip = state.clipProps[state.selectedClipId];
  if (!currentClip) return;
  
  const originalEl = document.getElementById(`clip-${state.selectedClipId}`);
  if (!originalEl) return;

  const currentWidth = parseFloat(originalEl.style.width);
  const currentLeft = parseFloat(originalEl.style.left);
  const newWidth = currentWidth / 2;
  originalEl.style.width = `${newWidth}px`;

  // Create right sibling clip
  const newId = `${state.selectedClipId}-cut`;
  const sibling = document.createElement('div');
  sibling.id = `clip-${newId}`;
  sibling.className = originalEl.className;
  sibling.style.left = `${currentLeft + newWidth + 4}px`;
  sibling.style.width = `${newWidth - 4}px`;
  sibling.dataset.clipId = newId;
  sibling.innerHTML = `
    <div class="flex items-center gap-1.5 truncate">
      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
      <span class="truncate">${currentClip.title} (Cut)</span>
    </div>
    <span class="text-[10px] font-mono text-amber-300">Cut</span>
    <div class="clip-handle left-handle"></div>
    <div class="clip-handle right-handle"></div>
  `;

  originalEl.parentElement.appendChild(sibling);
  state.clipProps[newId] = { ...currentClip, title: `${currentClip.title} (Cut)` };
  sibling.addEventListener('click', (e) => {
    e.stopPropagation();
    selectClip(newId);
  });
  selectClip(newId);

  // Split pulse feedback
  const splitBtn = document.getElementById('tool-split-btn');
  splitBtn.classList.add('bg-amber-400', 'text-black');
  setTimeout(() => splitBtn.classList.remove('bg-amber-400', 'text-black'), 200);
}

document.getElementById('tool-split-btn').addEventListener('click', splitAtPlayhead);

// Delete Clip
document.getElementById('tool-delete-btn').addEventListener('click', () => {
  if (state.selectedClipId) {
    const el = document.getElementById(`clip-${state.selectedClipId}`);
    if (el) el.remove();
    delete state.clipProps[state.selectedClipId];
    selectClip('v1-1');
  }
});

// Zoom Controls
document.getElementById('timeline-zoom-slider').addEventListener('input', (e) => {
  state.timelineZoom = Number(e.target.value);
  renderRuler();
  updatePlayheadUI();
});

// Preset Adders (Text, Media, FX)
document.querySelectorAll('.text-preset-card').forEach(card => {
  card.addEventListener('click', () => {
    const preset = card.dataset.preset;
    const textClip = state.clipProps['text-1'];
    if (textClip) {
      textClip.preset = preset;
      if (preset === 'hormozi') {
        textClip.text = 'VIRAL RETENTION HACK 🔥';
        textClip.color = '#facc15';
      } else if (preset === 'cyan-glow') {
        textClip.text = '✦ ULTRA SMOOTH EDITING ✦';
        textClip.color = '#00f2fe';
      } else {
        textClip.text = 'Aesthetic Minimalist';
        textClip.color = '#ffffff';
      }
      selectClip('text-1');
    }
  });
});

// FX Filter Adders
document.querySelectorAll('.fx-card').forEach(card => {
  card.addEventListener('click', () => {
    const fx = card.dataset.fx;
    const active = state.clipProps[state.selectedClipId];
    if (active) {
      if (fx === 'teal-orange') {
        active.temperature = 25;
        active.contrast = 130;
        active.saturation = 120;
      } else if (fx === 'vhs') {
        active.temperature = -15;
        active.contrast = 150;
        active.saturation = 160;
      } else if (fx === 'noir') {
        active.saturation = 0;
        active.contrast = 160;
      } else if (fx === 'glow') {
        active.exposure = 15;
        active.contrast = 120;
      }
      selectClip(state.selectedClipId);
    }
  });
});

// AI Buttons Simulation
document.getElementById('ai-generate-captions-btn').addEventListener('click', () => {
  const btn = document.getElementById('ai-generate-captions-btn');
  btn.textContent = 'Transcribing with Neural AI...';
  btn.classList.add('animate-pulse');
  setTimeout(() => {
    btn.textContent = '✓ Captions Generated (99.4%)';
    btn.classList.remove('animate-pulse');
    state.clipProps['text-1'].text = 'STOP USING OVERPRICED EDITORS 🚀';
    state.clipProps['text-1'].preset = 'hormozi';
    selectClip('text-1');
  }, 900);
});

document.getElementById('ai-silence-cut-btn').addEventListener('click', () => {
  const btn = document.getElementById('ai-silence-cut-btn');
  btn.textContent = 'Detecting 0.4s pauses...';
  setTimeout(() => {
    btn.textContent = '✓ Cut 4 Pauses (-3.2s saved)';
    splitAtPlayhead();
  }, 700);
});

document.getElementById('ai-enhance-voice-btn').addEventListener('click', () => {
  const btn = document.getElementById('ai-enhance-voice-btn');
  btn.textContent = 'Removing room echo & hum...';
  setTimeout(() => {
    btn.textContent = '✓ Studio Voice Enhanced';
  }, 600);
});

// Export 4K Modal
exportModalBtn.addEventListener('click', () => {
  exportModal.classList.remove('hidden');
});
closeExportModalBtn.addEventListener('click', () => {
  exportModal.classList.add('hidden');
});
cancelExportBtn.addEventListener('click', () => {
  exportModal.classList.add('hidden');
});

startExportBtn.addEventListener('click', () => {
  renderProgressBox.classList.remove('hidden');
  startExportBtn.disabled = true;
  startExportBtn.textContent = 'Rendering...';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 8;
    if (progress > 100) progress = 100;
    renderProgressBar.style.width = `${progress}%`;
    renderPct.textContent = `${progress}%`;

    if (progress === 100) {
      clearInterval(interval);
      renderStatusText.textContent = '✓ 4K UHD Render Finished (No Watermark)';
      startExportBtn.disabled = false;
      startExportBtn.textContent = 'Download Finished MP4';
      startExportBtn.onclick = () => {
        alert('🎉 Video exported successfully at 4K 60FPS! Zero watermarks applied.');
        exportModal.classList.add('hidden');
        renderProgressBox.classList.add('hidden');
        progress = 0;
        renderProgressBar.style.width = '0%';
        startExportBtn.textContent = 'Start Fast Render';
      };
    }
  }, 80);
});

// File Upload Handler
document.getElementById('media-file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const newMediaId = `user-media-${Date.now()}`;
    state.clipProps[state.selectedClipId].title = file.name;
    selectClip(state.selectedClipId);
    alert(`Imported "${file.name}" to project timeline!`);
  }
});

// Render Loop & Canvas Drawing
let lastFrameTime = performance.now();
function renderLoop(now) {
  if (state.isPlaying) {
    const dt = (now - lastFrameTime) / 1000;
    state.currentTime += dt * state.playbackSpeed;
    if (state.currentTime >= state.totalDuration) {
      state.currentTime = 0;
    }
    updatePlayheadUI();
    lastFrameTime = now;
  }

  drawCanvas();
  requestAnimationFrame(renderLoop);
}

// Procedural Video Frame Generator for realistic preview
function drawCanvas() {
  const w = canvas.width;
  const h = canvas.height;
  const t = state.currentTime;

  // Clear
  ctx.fillStyle = '#05070d';
  ctx.fillRect(0, 0, w, h);

  const active = state.clipProps[state.selectedClipId] || state.clipProps['v1-1'];

  ctx.save();
  // Transform & Color Grading matrix
  ctx.filter = `
    brightness(${100 + active.exposure}%)
    contrast(${active.contrast}%)
    saturate(${active.saturation}%)
    hue-rotate(${active.temperature * 1.5}deg)
  `;
  ctx.globalAlpha = active.opacity / 100;

  // Center of canvas
  ctx.translate(w / 2 + active.posX, h / 2 + active.posY);
  ctx.rotate((active.rotation * Math.PI) / 180);
  ctx.scale(active.scale / 100, active.scale / 100);

  // Background Motion Visuals (Cyberpunk / Sunset aesthetic)
  const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#1e1b4b');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(-w / 2, -h / 2, w, h);

  // Cyber Grid Floor
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
  ctx.lineWidth = 2;
  const gridOffset = (t * 60) % 40;
  for (let x = -w / 2; x <= w / 2; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, -h / 2);
    ctx.lineTo(x, h / 2);
    ctx.stroke();
  }
  for (let y = -h / 2 + gridOffset; y <= h / 2; y += 40) {
    ctx.beginPath();
    ctx.moveTo(-w / 2, y);
    ctx.lineTo(w / 2, y);
    ctx.stroke();
  }

  // Glowing Cyber Sun / Ambient Glow
  const sunGrad = ctx.createRadialGradient(0, -h * 0.15, 20, 0, -h * 0.15, 300);
  sunGrad.addColorStop(0, 'rgba(255, 0, 128, 0.9)');
  sunGrad.addColorStop(0.4, 'rgba(0, 242, 254, 0.4)');
  sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.15, 300, 0, Math.PI * 2);
  ctx.fill();

  // Floating Dynamic Shapes
  for (let i = 0; i < 5; i++) {
    const angle = t * 0.8 + i * 1.25;
    const px = Math.cos(angle) * (w * 0.25);
    const py = Math.sin(angle * 1.4) * (h * 0.2);
    ctx.fillStyle = i % 2 === 0 ? '#00f2fe' : '#f43f5e';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(px, py, 14 + Math.sin(t * 3 + i) * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Draw Dynamic Viral Subtitles (Track T1)
  const textClip = state.clipProps['text-1'];
  if (textClip && textClip.text) {
    ctx.save();
    ctx.translate(0, h * 0.25); // Position lower third
    
    if (textClip.preset === 'hormozi') {
      ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Black Stroke
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 14;
      ctx.strokeText(textClip.text, 0, 0);

      // Yellow Punch Fill
      ctx.fillStyle = '#facc15';
      ctx.fillText(textClip.text, 0, 0);
    } else if (textClip.preset === 'cyan-glow') {
      ctx.font = '800 54px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(textClip.text, 0, 0);
      ctx.shadowBlur = 0;
    } else {
      ctx.font = '700 44px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Frosted Pill Backdrop
      const textWidth = ctx.measureText(textClip.text).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.roundRect(-textWidth / 2 - 24, -36, textWidth + 48, 72, 36);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(textClip.text, 0, 0);
    }
    ctx.restore();
  }

  ctx.restore();
}

// Initial Setup
selectClip('v1-1');
updatePlayheadUI();
requestAnimationFrame(renderLoop);
