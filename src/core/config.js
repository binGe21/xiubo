// World dimensions, lighting, player dimensions and quality presets.
import { Color, Vector3 } from "../vendor/three-r180.js";

var WORLD_BOUNDS = {
  min: new Vector3(-40, 0, -30),
  max: new Vector3(40, 30, 30),
  groundY: 0,
  seaY: -1.6,
  quayX: 30,
};

var SUN_LIGHT = {
  // Lower, warmer sodium dusk — 锈泊 identity (not Saltline parity).
  dir: new Vector3(0.86, 0.2, 0.4).normalize(),
  color: new Color(1, 0.62, 0.32),
  intensity: 10.2,
};

var SKY_COLORS = {
  zenith: new Color(0.032, 0.052, 0.108),
  horizon: new Color(1, 0.46, 0.18),
  horizonAway: new Color(0.11, 0.15, 0.22),
  // Warm sodium haze rather than cool grey fog.
  fog: new Color(0.5, 0.42, 0.34),
};

var PLAYER_DIMENSIONS = {
  eye: 1.68,
  crouchEye: 1.05,
  radius: 0.32,
  height: 1.8,
  fov: 74,
  viewFov: 54,
};

var vf = 0;

var zc = 1;

var QUALITY_PRESETS = {
  test: {
    name: "test",
    scale: 1,
    msaa: 0,
    shadow: 1024,
    tex: 256,
    volSteps: 10,
    ao: !0,
    planar: 0.5,
    bloom: !0,
    motionBlur: !1,
    rain: 0.48,
  },
  low: {
    name: "low",
    scale: 0.72,
    msaa: 0,
    shadow: 2048,
    tex: 512,
    volSteps: 12,
    ao: !1,
    planar: 0,
    bloom: !0,
    motionBlur: !1,
    rain: 0.62,
  },
  medium: {
    name: "medium",
    scale: 0.9,
    msaa: 2,
    shadow: 2048,
    tex: 1024,
    volSteps: 16,
    ao: !0,
    planar: 0.65,
    bloom: !0,
    motionBlur: !1,
    rain: 0.92,
  },
  high: {
    name: "high",
    scale: 1,
    msaa: 4,
    shadow: 4096,
    tex: 1536,
    // Lean vol + no default MB — smoother laptop Chromium without muddy look.
    volSteps: 24,
    ao: !0,
    planar: 0.85,
    bloom: !0,
    motionBlur: !1,
    rain: 1.08,
  },
  ultra: {
    name: "ultra",
    scale: 1,
    msaa: 4,
    shadow: 4096,
    tex: 2048,
    volSteps: 40,
    ao: !0,
    planar: 1,
    bloom: !0,
    motionBlur: !0,
    rain: 1.22,
  },
};

export {
  SUN_LIGHT,
  PLAYER_DIMENSIONS,
  vf,
  zc,
  QUALITY_PRESETS,
  WORLD_BOUNDS,
  SKY_COLORS,
};
