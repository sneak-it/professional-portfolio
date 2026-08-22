'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Triangle, Program, Mesh } from 'ogl';

/* ---------------------------------------------------------------------------
   Animated topographic contour field.

   A full-screen shader that draws iso-lines of a slowly-drifting noise height
   field — like the contour lines on a topographic map — with thicker "index"
   contours every 5th line and a green→teal→blue elevation tint. Colours are
   read live from the --accent-from/via/to CSS variables (re-read on theme
   change), so editing the palette in globals.css reskins this automatically.

   This component is ONLY mounted on the `full` motion tier (see
   components/BackgroundCanvas.tsx) and is loaded as a lazy chunk, so OGL never
   ships to mobile / reduced-motion users or blocks first paint.

   Efficiency: trivial vertex stage (one full-screen triangle), a single
   3-octave noise field per pixel, capped DPR, shader-based anti-aliasing (no
   MSAA), a 30 fps render cap, an opaque drawing buffer with no depth
   attachment, and the rAF pauses while the tab is hidden.
--------------------------------------------------------------------------- */

/* Render cap. The height field drifts at `uTime * 0.035`, so a frame advances
   the terrain by a fraction of a contour width and 30 fps is indistinguishable
   from 120 — at a quarter of the fill rate on a high-refresh display. Raise
   this if the drift term is ever sped up. */
const TARGET_FPS = 30;

const FRAME_MS = 1000 / TARGET_FPS;

interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parse a #hex into 0..1 floats for GLSL uniforms. */
function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.trim().replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full || '14b87a', 16);
  const c: Rgb = { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  return [c.r / 255, c.g / 255, c.b / 255];
}

function readVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return v.trim() || fallback;
}

const vertex = /* glsl */ `#version 300 es
  precision highp float;
  in vec2 uv;
  in vec2 position;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `#version 300 es
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uDark;
  uniform vec3 uBg;
  in vec2 vUv;
  out vec4 fragColor;

  // Cheap hash (Dave Hoskins style) — no textures, no external assets. Avoids
  // the axis-aligned banding the classic sin() hash would feed the contour step.
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  // Gradient noise, not value noise: value noise is exactly flat across every
  // cell edge, which fwidth() in contour() turns into dashed lattice seams.
  vec2 hgrad(vec2 i) {
    float a = hash(i) * 6.2831853;
    return vec2(cos(a), sin(a));
  }
  float gnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = p - i;
    // Quintic fade — C2-continuous, so fwidth() sees no cell-boundary kinks.
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = dot(hgrad(i), f);
    float b = dot(hgrad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(hgrad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(hgrad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 0.7 + 0.5;
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * gnoise(p);
      // Rotate/offset per octave; a plain p *= 2.0 stacks every octave's
      // residual lattice artifact onto one grid.
      p = mat2(0.80, -0.60, 0.60, 0.80) * p * 2.0 + vec2(11.3, 7.7);
      a *= 0.5;
    }
    return v;
  }

  // One anti-aliased iso-line family at the given line spacing. Returns ~1 on a
  // contour, 0 between. fwidth keeps the line a constant ~1px regardless of how
  // steep the slope is — the trick that makes contour lines look clean.
  float contour(float h, float spacing) {
    float f = h / spacing;
    float w = fwidth(f);
    return 1.0 - smoothstep(0.0, w * 1.5, abs(fract(f - 0.5) - 0.5));
  }

  void main() {
    // Aspect-correct so the contours aren't stretched on wide screens.
    vec2 uvA = vUv;
    uvA.x *= uResolution.x / uResolution.y;

    // Slowly-drifting height field — the "terrain". The domain is rotated ~30°
    // so the noise lattice never aligns with the screen axes (belt-and-braces
    // against axis-aligned seams).
    mat2 R = mat2(0.866, -0.5, 0.5, 0.866);
    float t = uTime * 0.035;
    float h = fbm(R * (uvA * 3.0) + vec2(t, t * 0.6));

    // Minor contours, plus heavier "index" contours every 5th line.
    float minor = contour(h, 0.05);
    float major = contour(h, 0.25);
    float lines = max(minor * 0.5, major);

    // Line colour by elevation: low → high reads green → teal → blue.
    vec3 lineCol = mix(uColorA, uColorB, smoothstep(0.25, 0.55, h));
    lineCol = mix(lineCol, uColorC, smoothstep(0.55, 0.85, h));

    // Right-side emphasis; faint on the left so centred text stays readable.
    float side = mix(0.14, 1.0, smoothstep(0.30, 0.85, vUv.x));
    float lineAmt = lines * side;

    // Compose the whole background opaquely in-shader (so every layer is
    // dithered together — no static CSS gradients to band). Dark mode is
    // light-on-dark: the accent is ADDED over the dark base. Light mode is the
    // inverse — dark-on-light: the bright base is TINTED toward the accent — so
    // the contours stay coloured instead of washing out to white.
    vec3 col = uBg;

    // Ambient accent wash on the left.
    float washX = 1.0 - smoothstep(0.0, 0.55, vUv.x);
    vec3 washCol = mix(uColorA, uColorB, 0.35);
    col = mix(mix(col, washCol, washX * 0.12), col + washCol * washX * 0.20, uDark);

    // Contour lines.
    col = mix(mix(col, lineCol, lineAmt), col + lineCol * lineAmt, uDark);

    // Vignette toward the base colour at the top/bottom edges.
    float edge = pow(clamp(abs(vUv.y - 0.5) * 2.0, 0.0, 1.0), 2.5);
    col = mix(col, uBg, edge * 0.6);

    // Per-pixel dither (~±1/256) before the 8-bit framebuffer → no banding.
    col += (hash(gl_FragCoord.xy) - 0.5) / 128.0;
    fragColor = vec4(col, 1.0);
  }
`;

export default function ShaderGradient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Cap DPR low — contour lines are shader-anti-aliased, so high retina
    // resolution is wasted fill rate. Not 1.0: the lines are ~1 *device* pixel
    // wide, so downsampling makes the compositor upscale them into a soft blur
    // on exactly the displays that can afford the pixels. The fps cap above is
    // the cheaper lever.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const renderer = new Renderer({
      dpr,
      // The shader writes alpha 1.0 over an opaque wrapper, so an alpha channel
      // buys only a per-pixel compositor blend that never does anything. One
      // full-screen triangle means no depth testing and no geometry edges, so
      // the depth attachment and MSAA go too.
      alpha: false,
      depth: false,
      antialias: false,
      powerPreference: 'low-power',
      // WebGL2 (default). The shaders are GLSL ES 3.00 (#version 300 es), where
      // fwidth() — used for the contour lines — is core, so no extension is
      // needed (unlike a GLSL ES 1.00 shader on WebGL2, which can't access it).
    });
    const gl = renderer.gl;
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.inset = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    container.appendChild(gl.canvas);

    const colorA = { value: hexToRgb01(readVar('--accent-from', '#14b87a')) };
    const colorB = { value: hexToRgb01(readVar('--accent-via', '#0ea5a4')) };
    const colorC = { value: hexToRgb01(readVar('--accent-to', '#4f7cff')) };
    const dark = {
      value: document.documentElement.classList.contains('dark') ? 1 : 0,
    };
    const bg = { value: hexToRgb01(readVar('--background-deep', '#050505')) };
    const time = { value: 0 };
    const resolution = { value: [1, 1] as [number, number] };

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: time,
        uResolution: resolution,
        uColorA: colorA,
        uColorB: colorB,
        uColorC: colorC,
        uDark: dark,
        uBg: bg,
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      resolution.value = [w, h];
    };
    resize();

    // Re-read palette on theme toggle so the field follows the tokens.
    const refreshTheme = () => {
      colorA.value = hexToRgb01(readVar('--accent-from', '#14b87a'));
      colorB.value = hexToRgb01(readVar('--accent-via', '#0ea5a4'));
      colorC.value = hexToRgb01(readVar('--accent-to', '#4f7cff'));
      dark.value = document.documentElement.classList.contains('dark') ? 1 : 0;
      bg.value = hexToRgb01(readVar('--background-deep', '#050505'));
    };
    const themeObserver = new MutationObserver(refreshTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    let rafId = 0;
    let running = true;
    const start = performance.now();
    // Deadlines advance on a fixed grid rather than resetting to `now`, so vsync
    // quantisation cancels out instead of accumulating. That holds the average on
    // target at any refresh rate, variable ones included; resetting to `now`
    // needs a fudge factor and still drifts to 25-33 fps depending on the panel.
    let due = 0;
    const loop = (now: number) => {
      if (!running) return;
      // Re-arm first, so a skipped frame still schedules the next one.
      rafId = requestAnimationFrame(loop);
      if (now < due) return;
      due += FRAME_MS;
      // Stalled (hidden tab, long task): skip ahead instead of rendering every
      // frame to catch up. Nothing here is frame-sequential.
      if (due < now) due = now + FRAME_MS;
      // Wall-clock elapsed, not a frame counter, so the cap changes GPU cost
      // and not the speed of the drift.
      time.value = (now - start) / 1000;
      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(loop);

    // Pause the rAF while the tab is hidden — no GPU work in the background.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        rafId = requestAnimationFrame(loop);
      }
    };
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      themeObserver.disconnect();
      // Release GPU memory and detach the canvas.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background-deep"
    >
      {/* The canvas composes the base background, accent wash, contour lines and
          vignette together — all dithered in-shader, so there are no static CSS
          gradients left to band. bg-background-deep is just a pre-paint fallback. */}
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
