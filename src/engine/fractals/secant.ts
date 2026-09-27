import { FractalDef } from "./example";

// Secant method fractal for f(z) = z^3 - 1 — the derivative-free cousin
// of newton.ts. Instead of f'(z), each step uses the line through the
// two most recent points:
//   z(n+1) = z(n) - f(z(n)) * (z(n) - z(n-1)) / (f(z(n)) - f(z(n-1)))
// To evaluate a single pixel independently (the fn(cx,cy,iter) contract
// every fractal here needs), the two seeds required are built from the
// pixel alone: z0 = a fixed point, z1 = the pixel itself.
//
// z0 must NOT be a root of f — this was a real bug during development,
// not a hypothetical one: with z0 = 1 (an actual root, so f(z0) = 0),
// the formula degenerates on the very first step — z1 - step reduces
// algebraically to exactly z0, every time, for every pixel, regardless
// of z1. Rendering that gave a near-blank image, which is what exposed
// it. z0 = 0 (the critical point of z^3-1, not one of its roots) works
// correctly and is what's used below.
//
// Same three roots and basin-offset palette as newton.ts, but the
// four-lobed boundary looks nothing like it: approaching a root along a
// line through two wandering points, rather than along the tangent, is
// a genuinely different dynamical system, not a cosmetic tweak.
const rootPaletteOffset = [13356, 8036, 14572]; // same tuning as newton.ts

const roots = [
  { x: 1, y: 0 },
  { x: -0.5, y: Math.sqrt(3) / 2 },
  { x: -0.5, y: -Math.sqrt(3) / 2 },
];
const convergenceEps = 1e-12;
const degenerateEps = 1e-20; // guards f(z(n)) - f(z(n-1)) ~ 0
const divergeBailout2 = 1e12;

export default {
  fractalId: "secant",
  uiOrder: 10,
  name: "Secant Method",
  preset: { x: 0, y: 0, w: 4, iter: 80 },
  fn: {
    normal: (cx, cy, iter) => {
      var x0 = 0,
        y0 = 0, // fixed seed, NOT a root — see note above
        x1 = cx,
        y1 = cy, // pixel is the second seed
        root = -1,
        i = 0;
      // f(z0), cached and rolled forward each step instead of
      // recomputed — f(z(n-1)) in this step is just f(z(n)) from the
      // previous one.
      var xx0 = x0 * x0 - y0 * y0,
        yy0 = 2 * x0 * y0;
      var f0x = xx0 * x0 - yy0 * y0 - 1,
        f0y = xx0 * y0 + yy0 * x0;
      for (; i < iter; ++i) {
        var xx1 = x1 * x1 - y1 * y1,
          yy1 = 2 * x1 * y1;
        var f1x = xx1 * x1 - yy1 * y1 - 1,
          f1y = xx1 * y1 + yy1 * x1;
        var denx = f1x - f0x,
          deny = f1y - f0y;
        var denom = denx * denx + deny * deny;
        if (denom < degenerateEps) {
          root = -1;
          break;
        }
        var dzx = x1 - x0,
          dzy = y1 - y0;
        var numx = f1x * dzx - f1y * dzy,
          numy = f1x * dzy + f1y * dzx;
        var stepx = (numx * denx + numy * deny) / denom,
          stepy = (numy * denx - numx * deny) / denom;
        var nx = x1 - stepx,
          ny = y1 - stepy;
        // roll the window forward: (z0,f0) <- (z1,f1), z1 <- new point
        x0 = x1;
        y0 = y1;
        f0x = f1x;
        f0y = f1y;
        x1 = nx;
        y1 = ny;
        for (var r = 0; r < roots.length; ++r) {
          var ddx = x1 - roots[r].x,
            ddy = y1 - roots[r].y;
          if (ddx * ddx + ddy * ddy < convergenceEps) {
            root = r;
            break;
          }
        }
        if (root >= 0) break;
        if (x1 * x1 + y1 * y1 > divergeBailout2) {
          root = -1;
          break;
        }
      }
      if (root < 0) return 0;
      return rootPaletteOffset[root] + i;
    },
  },
} as FractalDef;
