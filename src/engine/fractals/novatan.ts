import { FractalDef } from "./example";

// Nova Inverse. Newton's method on f(z) = cos(z) - 1 instead of a
// polynomial: f'(z) = -sin(z), and f(z)/f'(z) = (cos(z)-1)/(-sin(z))
// simplifies exactly (half-angle identity) to tan(z/2) — confirmed by
// hand before implementing, not assumed. Complex tan has a closed form
// that avoids computing a full complex sin and cos separately:
//   tan(a+bi) = [sin(2a) + i*sinh(2b)] / [cos(2a) + cosh(2b)]
// With w = z/2 = x/2 + i*y/2, so 2a=x and 2b=y, this becomes simply
//   tan(z/2) = [sin(x) + i*sinh(y)] / [cos(x) + cosh(y)]
// — 4 transcendental calls total, cheaper than pickover.ts's biomorphs.
//
// f(z) = cos(z)-1 has infinitely many roots, at every z = 2*pi*k, not
// a small fixed set — so unlike nova.ts this is deliberately run in
// the "Julia" convention (z0 = pixel, c = a fixed constant) rather
// than the "Mandelbrot" one (c = pixel, z0 fixed). That choice isn't
// cosmetic: rendered with c = pixel instead, the periodic structure
// below barely shows at all (checked before settling on this). With
// z0 = pixel, the pixel grid directly explores the periodic root
// structure, and the fixed c perturbs the perfectly straight columns
// that show at c=0 into the wavy, bead-like chains seen at c=0.3+0.2i,
// which is the constant used here.
const cx0 = 0.3,
  cy0 = 0.2; // fixed c — try 0 for perfectly straight periodic columns
const tol2 = 1e-12;
const bigBailout2 = 1e8;

export default {
  fractalId: "novatan",
  uiOrder: 12.5,
  name: "Nova Inverse",
  preset: { x: 0, y: 0, w: 10, iter: 80 },
  fn: {
    normal: (cx, cy, iter) => {
      var x = cx,
        y = cy, // pixel is z0 here, not c
        i = 0;
      for (; i < iter; ++i) {
        var denomT = Math.cos(x) + Math.cosh(y);
        if (Math.abs(denomT) < 1e-14) break;
        var tx = Math.sin(x) / denomT,
          ty = Math.sinh(y) / denomT; // tan(z/2)
        var nx = x - tx + cx0,
          ny = y - ty + cy0;
        var dx = nx - x,
          dy = ny - y;
        x = nx;
        y = ny;
        if (dx * dx + dy * dy < tol2) break; // converged
        if (x * x + y * y > bigBailout2) break; // diverged
      }
      return i;
    },
  },
} as FractalDef;
