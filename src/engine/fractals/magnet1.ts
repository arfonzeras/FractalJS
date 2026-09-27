import { FractalDef } from "./example";

// Magnet Type I — from a mean-field model of ferromagnetic phase
// transitions (Peitgen & Richter, "The Beauty of Fractals"), not a
// polynomial-family tweak like most of this folder:
//   z(n+1) = ((z(n)^2 + c - 1) / (2*z(n) + c - 2))^2
// z0 = 0, c = pixel — same Mandelbrot-style setup as mandelbrot.ts, but
// the orbit doesn't escape outward like z^2+c; it settles toward stable
// "magnetic" states, so — same as newton.ts and nova.ts — this needs
// both a divergence bailout AND a convergence tolerance, not just one.
// Confirmed against Paul Bourke's and UltraFractal's reference formulas
// before implementing: recommended bailout > 30 for well-formed edges,
// convergence tolerance on the order of 1e-5 to 1e-8.
//
// Unlike Mandelbrot, the Magnet I set is known to not even be simply
// connected — there are regions of it that can't be reached from others
// without leaving the set (see hpdz.net's notes on this fractal).
const upperBailout2 = 900; // |z| > 30
const lowerTol2 = 6.4e-11; // ~(8e-6)^2, UltraFractal's default order of magnitude

export default {
  fractalId: "magnet1",
  uiOrder: 11,
  name: "Magnet I",
  preset: { x: 0, y: 0, w: 8, iter: 60 },
  fn: {
    normal: (cx, cy, iter) => {
      var x = 0,
        y = 0,
        i = 0;
      for (; i < iter; ++i) {
        var zzx = x * x - y * y,
          zzy = 2 * x * y; // z^2
        var numx = zzx + cx - 1,
          numy = zzy + cy; // z^2 + c - 1
        var denx = 2 * x + cx - 2,
          deny = 2 * y + cy; // 2z + c - 2
        var den2 = denx * denx + deny * deny;
        if (den2 < 1e-18) break;
        var rx = (numx * denx + numy * deny) / den2,
          ry = (numy * denx - numx * deny) / den2; // the ratio
        var nx = rx * rx - ry * ry,
          ny = 2 * rx * ry; // ratio^2
        var dx = nx - x,
          dy = ny - y;
        x = nx;
        y = ny;
        if (dx * dx + dy * dy < lowerTol2) break; // converged
        if (x * x + y * y > upperBailout2) break; // diverged
      }
      return i;
    },
  },
} as FractalDef;
