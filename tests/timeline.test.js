import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimecode,
  parseTimecode,
  splitClip,
  interpolateKeyframe,
  calculateSafeZone,
  calculateViewportDimensions
} from '../src/core/timeline.js';

describe('Shortcut Core Timeline Engine Tests', () => {

  describe('Timecode Conversion', () => {
    test('formatTimecode accurately formats zero time', () => {
      assert.equal(formatTimecode(0, 30), '00:00:00:00');
    });

    test('formatTimecode formats complex seconds and frames accurately', () => {
      // 1 minute, 23 seconds, 15 frames at 30fps = 60 + 23 + 15/30 = 83.5 seconds
      assert.equal(formatTimecode(83.5, 30), '00:01:23:15');
    });

    test('parseTimecode returns correct seconds from timecode string', () => {
      const seconds = parseTimecode('00:01:23:15', 30);
      assert.equal(seconds, 83.5);
    });
  });

  describe('Clip Splitting Logic', () => {
    test('splitClip splits a clip into two contiguous non-overlapping clips', () => {
      const originalClip = {
        id: 'clip-1',
        title: 'Interview.mp4',
        track: 'V1',
        startTime: 2.0,
        duration: 10.0,
        inPoint: 0.0,
        outPoint: 10.0
      };

      const splitTime = 6.0; // 4 seconds into the clip
      const result = splitClip(originalClip, splitTime);

      assert.ok(result, 'Result should exist');
      assert.equal(result.first.duration, 4.0);
      assert.equal(result.first.outPoint, 4.0);
      assert.equal(result.second.startTime, 6.0);
      assert.equal(result.second.duration, 6.0);
      assert.equal(result.second.inPoint, 4.0);
      assert.equal(result.second.outPoint, 10.0);
    });

    test('splitClip returns null if splitTime is outside clip bounds', () => {
      const clip = { id: 'c1', startTime: 2.0, duration: 5.0, inPoint: 0, outPoint: 5.0 };
      assert.equal(splitClip(clip, 1.0), null);
      assert.equal(splitClip(clip, 8.0), null);
    });
  });

  describe('Keyframe Interpolation', () => {
    test('interpolateKeyframe correctly interpolates values linearly between two keyframes', () => {
      const keyframes = [
        { time: 1.0, value: 100 },
        { time: 3.0, value: 200 }
      ];

      assert.equal(interpolateKeyframe(keyframes, 1.0), 100);
      assert.equal(interpolateKeyframe(keyframes, 2.0), 150);
      assert.equal(interpolateKeyframe(keyframes, 3.0), 200);
    });

    test('interpolateKeyframe clamps to boundary keyframes when out of range', () => {
      const keyframes = [
        { time: 1.0, value: 50 },
        { time: 2.0, value: 100 }
      ];

      assert.equal(interpolateKeyframe(keyframes, 0.5), 50);
      assert.equal(interpolateKeyframe(keyframes, 3.5), 100);
    });
  });

  describe('Safe Zone & Viewport Dimensions', () => {
    test('calculateSafeZone returns safe area margins for 9:16 Shorts', () => {
      const safeZone = calculateSafeZone('9:16', 1080, 1920);
      assert.ok(safeZone.top > 0);
      assert.ok(safeZone.bottom > 0);
      assert.ok(safeZone.rightMargin > 0);
      assert.equal(safeZone.isVertical, true);
    });

    test('calculateViewportDimensions maintains correct aspect ratios', () => {
      const bounds16x9 = calculateViewportDimensions('16:9', 800, 600);
      assert.equal(bounds16x9.width, 800);
      assert.equal(Math.round(bounds16x9.height), 450);

      const bounds9x16 = calculateViewportDimensions('9:16', 800, 600);
      assert.equal(bounds9x16.height, 600);
      assert.equal(Math.round(bounds9x16.width), 338);
    });
  });

});
