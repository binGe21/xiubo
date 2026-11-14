import { QUALITY_PRESETS } from "./config.js";

function chooseQuality(i) {
  if (i && QUALITY_PRESETS[i])
    return {
      ...QUALITY_PRESETS[i],
    };
  if (
    /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 &&
      Math.min(screen.width, screen.height) < 900)
  )
    return {
      ...QUALITY_PRESETS.low,
    };
  let t = "";
  try {
    let s = document.createElement("canvas"),
      o = s.getContext("webgl2") || s.getContext("webgl");
    if (o) {
      let r = o.getExtension("WEBGL_debug_renderer_info");
      t = String(
        r
          ? o.getParameter(r.UNMASKED_RENDERER_WEBGL)
          : o.getParameter(o.RENDERER),
      );
      let a = o.getExtension("WEBGL_lose_context");
      a && a.loseContext();
    }
  } catch {}
  // Prefer a sharper default than the original on discrete / Apple GPUs.
  if (/SwiftShader|llvmpipe|Software|Mali|Adreno|PowerVR/i.test(t))
    return { ...QUALITY_PRESETS.medium };
  if (/Intel/i.test(t) && !/Arc|Xe|Iris Xe/i.test(t))
    return { ...QUALITY_PRESETS.medium };
  if (/Apple|Metal|M[1-4]|NVIDIA|GeForce|RTX|AMD|Radeon|Arc/i.test(t))
    return { ...QUALITY_PRESETS.high };
  return { ...QUALITY_PRESETS.high };
}

export { chooseQuality };
