/**
 * Standard Educational Robot Arenas & Track Presets
 */

import { ArenaEnvironment, ObstacleBox, TrackLine, Point2D } from './sensors';

/**
 * Creates an Oval Track arena (ideal for beginner line follower tuning)
 */
export function createOvalTrackArena(
  width = 300, // 300 cm (3m)
  height = 200, // 200 cm (2m)
  trackWidth = 2.5, // 2.5 cm electrical tape
): ArenaEnvironment {
  const cx = width / 2;
  const cy = height / 2;
  const rx = 100; // half horizontal span
  const ry = 60; // half vertical span
  const points: Point2D[] = [];

  // Generate smooth elliptical track with 40 waypoints
  const numPts = 48;
  for (let i = 0; i < numPts; i++) {
    const angle = (i / numPts) * 2 * Math.PI;
    points.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    });
  }

  const ovalTrack: TrackLine = {
    id: 'oval-loop',
    points,
    closed: true,
    width: trackWidth,
  };

  return {
    width,
    height,
    obstacles: [],
    tracks: [ovalTrack],
  };
}

/**
 * Creates a Figure-8 Track arena (challenges robot with left & right alternating turns)
 */
export function createFigureEightArena(
  width = 320,
  height = 240,
  trackWidth = 2.5,
): ArenaEnvironment {
  const cx = width / 2;
  const cy = height / 2;
  const a = 110; // lemniscate scale factor
  const points: Point2D[] = [];

  // Lemniscate of Bernoulli: x = a*cos(t)/(1+sin^2(t)), y = a*sin(t)*cos(t)/(1+sin^2(t))
  const numPts = 64;
  for (let i = 0; i < numPts; i++) {
    const t = (i / numPts) * 2 * Math.PI;
    const denom = 1 + Math.sin(t) * Math.sin(t);
    const x = (a * Math.cos(t)) / denom;
    const y = (a * Math.sin(t) * Math.cos(t)) / denom;
    points.push({
      x: cx + x,
      y: cy + y,
    });
  }

  const figureEightTrack: TrackLine = {
    id: 'figure-eight-loop',
    points,
    closed: true,
    width: trackWidth,
  };

  return {
    width,
    height,
    obstacles: [],
    tracks: [figureEightTrack],
  };
}

/**
 * Creates an Obstacle Course Arena with boundary walls and scattered obstacle boxes
 */
export function createObstacleCourseArena(width = 300, height = 200): ArenaEnvironment {
  const obstacles: ObstacleBox[] = [
    { id: 'obs-center-pillar', x: 150, y: 100, width: 25, height: 25 },
    { id: 'obs-left-box', x: 75, y: 130, width: 30, height: 20 },
    { id: 'obs-right-box', x: 220, y: 70, width: 20, height: 35 },
    { id: 'obs-top-barrier', x: 180, y: 160, width: 45, height: 15 },
    { id: 'obs-bottom-barrier', x: 100, y: 45, width: 35, height: 15 },
  ];

  return {
    width,
    height,
    obstacles,
    tracks: [],
  };
}
