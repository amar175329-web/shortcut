// Shortcut Core Timeline Engine Functions

/**
 * Formats fractional seconds into SMPTE timecode (HH:MM:SS:FF)
 */
export function formatTimecode(seconds, fps = 30) {
  if (seconds < 0) seconds = 0;
  const totalFrames = Math.round(seconds * fps);
  const ff = String(totalFrames % fps).padStart(2, '0');
  const totalSeconds = Math.floor(seconds);
  const ss = String(totalSeconds % 60).padStart(2, '0');
  const mm = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  return `${hh}:${mm}:${ss}:${ff}`;
}

/**
 * Parses SMPTE timecode (HH:MM:SS:FF) into seconds
 */
export function parseTimecode(timecodeStr, fps = 30) {
  const parts = timecodeStr.split(':').map(Number);
  if (parts.length !== 4) return 0;
  const [hh, mm, ss, ff] = parts;
  return (hh * 3600) + (mm * 60) + ss + (ff / fps);
}

/**
 * Splits a clip at a specific timeline timestamp
 */
export function splitClip(clip, atTime) {
  const clipEnd = clip.startTime + clip.duration;
  // If split time is not strictly inside the clip bounds, cannot split
  if (atTime <= clip.startTime || atTime >= clipEnd) {
    return null;
  }

  const offset = atTime - clip.startTime;
  const firstDuration = offset;
  const secondDuration = clip.duration - offset;

  const firstClip = {
    ...clip,
    id: `${clip.id}-part1`,
    duration: firstDuration,
    outPoint: clip.inPoint + firstDuration
  };

  const secondClip = {
    ...clip,
    id: `${clip.id}-part2`,
    startTime: atTime,
    duration: secondDuration,
    inPoint: clip.inPoint + firstDuration,
    outPoint: clip.outPoint
  };

  return { first: firstClip, second: secondClip };
}

/**
 * Interpolates keyframe value at a given timestamp
 */
export function interpolateKeyframe(keyframes, currentTime) {
  if (!keyframes || keyframes.length === 0) return 0;
  if (keyframes.length === 1) return keyframes[0].value;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  if (currentTime <= sorted[0].time) return sorted[0].value;
  if (currentTime >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];
    if (currentTime >= k1.time && currentTime <= k2.time) {
      const span = k2.time - k1.time;
      if (span === 0) return k1.value;
      const progress = (currentTime - k1.time) / span;
      return k1.value + (k2.value - k1.value) * progress;
    }
  }

  return sorted[sorted.length - 1].value;
}

/**
 * Calculates TikTok / Reels safe zone boundaries
 */
export function calculateSafeZone(aspectRatio, width, height) {
  const isVertical = aspectRatio === '9:16';
  return {
    isVertical,
    top: isVertical ? height * 0.12 : height * 0.05,
    bottom: isVertical ? height * 0.22 : height * 0.05,
    leftMargin: width * 0.06,
    rightMargin: isVertical ? width * 0.20 : width * 0.06
  };
}

/**
 * Calculates responsive viewport container dimensions while maintaining aspect ratio
 */
export function calculateViewportDimensions(aspectRatio, maxWidth, maxHeight) {
  let ratioValue = 16 / 9;
  if (aspectRatio === '9:16') ratioValue = 9 / 16;
  if (aspectRatio === '1:1') ratioValue = 1.0;

  let width = maxWidth;
  let height = width / ratioValue;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratioValue;
  }

  return { width, height };
}
