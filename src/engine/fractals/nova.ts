import { FractalDef } from "./example";

// Nova (Mandelbrot form), invented by Paul Derbyshire. Takes Newton's
// method on f(z) = z^3 - 1 (see newton.ts) and adds a per-pixel constant
// c to every step, the same way Mandelbrot adds c to z^2:
//   z(n+1) = z(n) - (z(n)^3 - 1) / (3 * z(n)^2) + c
//
// Two things distinguish this from newton.ts, both confirmed against
// UltraFractal's reference formula docs (the standard implementation
// this fractal is defined by) before writing this, not guessed:
//
// 1. z0 is FIXED at (1, 0) here — one of the roots of z^3-1 — and c is
//    what varies per pixel. In newton.ts it's the other way around
//    (z0 = pixel, no c at all). This swap is exactly why Mandelbrot-like
//    bulbs and embedded spirals show up at the boundary: it's the same
//    "vary the perturbation, fix the seed" trick that makes the
//    Mandelbrot set what it is, just applied to Newton's method instead
//    of z^2+c.
// 2. The exit test is convergence-based, not escape-based: stop once z
//    stops moving (|z(n+1) - z(n)| below a small tolerance), not once
//    |z| crosses a radius. With c added, the fixed points Newton's
//    method would normally converge to shift and aren't the plain cube
//    roots of unity anymore, and for some c the orbit never settles at
//    all — so a second, much larger bailout catches points that
//    genuinely diverge instead of looping until iter every time.
const tol2 = 1e-12; // squared distance; matches UltraFractal's small default bailout
const bigBailout2 = 1e8;

export default {
  fractalId: "nova",
  uiOrder: 9,
  name: "Nova",
  preset: { x: 0, y: 0, w: 4, iter: 100 },
  fn: {
    normal: (cx, cy, iter) => {
      var x = 1,
        y = 0, // fixed start value, not the pixel
        i = 0;
      for (; i < iter; ++i) {
        var x2 = x * x - y * y,
          y2 = 2 * x * y; // z^2
        var x3 = x2 * x - y2 * y,
          y3 = x2 * y + y2 * x; // z^3
        var numx = x3 - 1,
          numy = y3; // z^3 - 1
        var denx = 3 * x2,
          deny = 3 * y2; // 3*z^2
        var denom = denx * denx + deny * deny;
        if (denom < 1e-18) break; // critical point, no defined step
        var px = (numx * denx + numy * deny) / denom;
        var py = (numy * denx - numx * deny) / denom;
        var nx = x - px + cx;
        var ny = y - py + cy;
        var dx = nx - x,
          dy = ny - y;
        x = nx;
        y = ny;
        if (dx * dx + dy * dy < tol2) break; // converged / settled
        if (x * x + y * y > bigBailout2) break; // diverged to infinity
      }
      return i;
    },
  },
} as FractalDef;
