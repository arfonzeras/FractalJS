import { FractalDef } from "./example";

// Magnet Type II — same mean-field magnetic model as magnet1.ts, but
// the next order up: a cubic numerator over a quadratic denominator
// instead of quadratic over linear.
//   z(n+1) = ((z^3 + 3(c-1)z + (c-1)(c-2)) / (3z^2 + 3(c-2)z + (c-1)(c-2) + 1))^2
// z0 = 0, c = pixel. Confirmed against two independent sources before
// implementing (Paul Bourke's site and UltraFractal's Magnet2Julia
// reference formula) — they define it identically.
//
// (c-1), (c-2) and their product don't depend on z, so they're computed
// once per pixel instead of once per iteration.
const upperBailout2 = 900; // |z| > 30, matches magnet1.ts
const lowerTol2 = 6.4e-11; // ~(8e-6)^2, same order as magnet1.ts

export default {
  fractalId: "magnet2",
  uiOrder: 11.5,
  name: "Magnet II",
  preset: { x: 0, y: 0, w: 8, iter: 60 },
  fn: {
    normal: (cx, cy, iter) => {
      var threeAx = 3 * (cx - 1),
        threeAy = 3 * cy; // 3*(c-1)
      var threeBx = 3 * (cx - 2),
        threeBy = 3 * cy; // 3*(c-2)
      var abx = (cx - 1) * (cx - 2) - cy * cy,
        aby = (cx - 1) * cy + cy * (cx - 2); // (c-1)*(c-2)
      var x = 0,
        y = 0,
        i = 0;
      for (; i < iter; ++i) {
        var zzx = x * x - y * y,
          zzy = 2 * x * y; // z^2
        var z3x = zzx * x - zzy * y,
          z3y = zzx * y + zzy * x; // z^3
        var threeAzx = threeAx * x - threeAy * y,
          threeAzy = threeAy * x + threeAx * y; // 3(c-1)*z
        var numx = z3x + threeAzx + abx,
          numy = z3y + threeAzy + aby;
        var threeBzx = threeBx * x - threeBy * y,
          threeBzy = threeBy * x + threeBx * y; // 3(c-2)*z
        var denx = 3 * zzx + threeBzx + abx + 1,
          deny = 3 * zzy + threeBzy + aby;
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
