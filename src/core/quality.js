import { QUALITY_PRESETS } from "./config.js";

function leanMobilePreset() {
  try {
    let coarse =
        typeof matchMedia == "function" &&
        matchMedia("(pointer: coarse)").matches,
      narrow =
        typeof matchMedia == "function" &&
        matchMedia("(max-width: 900px)").matches,
      short =
        typeof matchMedia == "function" &&
        matchMedia("(max-height: 520px)").matches,
      tiny = Math.min(screen.width || 0, screen.height || 0) < 700,
      uaMobile = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(
        navigator.userAgent || "",
      ),
      multiTouchPad =
        (navigator.maxTouchPoints || 0) > 1 &&
        Math.min(screen.width || 0, screen.height || 0) < 900;
    // Phones / short landscape: lean low so dynres has headroom.
    if (uaMobile || multiTouchPad || ((coarse || tiny) && (narrow || short)))
      return QUALITY_PRESETS.low;
    // Large coarse tablets: medium keeps identity without desktop high cost.
    if (coarse) return QUALITY_PRESETS.medium;
  } catch {}
  return null;
}

function chooseQuality(i) {
  if (i && QUALITY_PRESETS[i])
    return {
      ...QUALITY_PRESETS[i],
    };
  let lean = leanMobilePreset();
  if (lean)
    return {
      ...lean,
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

export { chooseQuality, leanMobilePreset };
