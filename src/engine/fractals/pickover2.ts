import { FractalDef } from "./example";

// Second Pickover biomorph — same square/AND bailout as pickover.ts, but
// with the other base function explored during development: instead of
// sin(z)+e^z+c (feathery, "fern" look), this one is z(n+1) = sin(z(n)) +
// z(n)^2 + c, which produces the denser, leaflet-clustered "bract" look
// (a resemblance to plant/inflorescence structure was the original spot
// for this specific c). See pickover.ts for the general explanation of
// why the bailout is AND instead of the more commonly-documented OR, and
// for the note on why this whole family doesn't fit as a "variation" of
// a single file — the base function genuinely changes the character, not
// just a parameter, so it earns its own file/fractalId the same way
// Multibrot *3 and *4 each get their own file despite both being z^n+c.
const A = 10;
const refx = -1.0;
const refy = -1.0;

export default {
  fractalId: "pickover2",
  uiOrder: 8.5,
  name: "Pickover Biomorph II",
  preset: { x: 0, y: 0, w: 8, iter: 70 },
  fn: {
    normal: (cx, cy, iter) => {
      var x = cx,
        y = cy,
        i = 0;
      for (; i < iter; ++i) {
        // sin(z): same shared-exp(y) trick as pickover.ts to get cosh/sinh
        // without calling Math.cosh and Math.sinh separately.
        var ey = Math.exp(y),
          emy = 1 / ey;
        var coshy = (ey + emy) * 0.5,
          sinhy = (ey - emy) * 0.5;
        // z^2
        var zx2 = x * x - y * y,
          zy2 = 2 * x * y;
        var nx = Math.sin(x) * coshy + zx2 + refx;
        var ny = Math.cos(x) * sinhy + zy2 + refy;
        x = nx;
        y = ny;
        if (Math.abs(x) > A && Math.abs(y) > A) break;
      }
      return i;
    },
  },
} as FractalDef;
