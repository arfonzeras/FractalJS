import { FractalDef } from "./example";

// Nova (see nova.ts) with a complex relaxation factor R instead of the
// standard R=1: z(n+1) = z(n) - R*(z(n)^3-1)/(3*z(n)^2) + c. The real
// part of R still scales the Newton step; the imaginary part rotates
// it every iteration, the same "torque" effect used in
// newtonrelax.ts — but applied on top of Nova's per-pixel c instead of
// plain Newton, which is what turns Nova's already-rich boundary into
// fluid three-armed spirals instead of just twisting a single basin
// edge. z0 = 1 and c = pixel, unchanged from nova.ts.
const Rx = 1.0,
  Ry = 1.0; // R = 1 + i
const tol2 = 1e-12;
const bigBailout2 = 1e8;

export default {
  fractalId: "novacomplex",
  uiOrder: 12,
  name: "Nova (Complex Relaxation)",
  preset: { x: 0, y: 0, w: 4, iter: 100 },
  fn: {
    normal: (cx, cy, iter) => {
      var x = 1,
        y = 0,
        i = 0;
      for (; i < iter; ++i) {
        var x2 = x * x - y * y,
          y2 = 2 * x * y;
        var x3 = x2 * x - y2 * y,
          y3 = x2 * y + y2 * x;
        var numx = x3 - 1,
          numy = y3;
        var denx = 3 * x2,
          deny = 3 * y2;
        var denom = denx * denx + deny * deny;
        if (denom < 1e-18) break;
        var stepx = (numx * denx + numy * deny) / denom,
          stepy = (numy * denx - numx * deny) / denom;
        // multiply the step by the complex relaxation factor R
        var rstepx = Rx * stepx - Ry * stepy,
          rstepy = Rx * stepy + Ry * stepx;
        var nx = x - rstepx + cx,
          ny = y - rstepy + cy;
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
