import { FractalDef } from "./example";

// Newton fractal for f(z) = z^3 - 1, using Newton's method:
//   z(n+1) = z(n) - f(z(n)) / f'(z(n)) = z(n) - (z^3 - 1) / (3 * z^2)
// Unlike the Mandelbrot-family fractals in this folder, this is NOT an
// escape-time fractal: every starting point (almost) converges to one of
// the three cube roots of unity. The picture comes from HOW FAST and to
// WHICH of the three roots each point converges.
//
// Color encoding: the palette in painter.ts maps the returned number
// through a cyclic palette (color = buffer[(value * density + offset) %
// resolution]), the same way it does for every other fractal in this
// project. To get three visually distinct color regions (one per root)
// instead of one smooth gradient, we offset the iteration count by
// (rootIndex * iter) before returning it, so each root's pixels land in
// a different band of the cyclic palette. Note the engine also treats a
// returned value of exactly 0 as "not yet painted" (see painter.ts), so
// we offset every result by +1 to avoid colliding with that.

const roots = [
  { x: 1, y: 0 },
  { x: -0.5, y: Math.sqrt(3) / 2 },
  { x: -0.5, y: -Math.sqrt(3) / 2 },
];
const convergenceEps = 1e-12; // squared distance to a root
const derivativeEps = 1e-14; // squared magnitude of 3*z^2

const iterate = (cx: number, cy: number, iter: number) => {
  var x = cx,
    y = cy,
    i = 0,
    root = -1;
  for (; i < iter; ++i) {
    // z^2
    var x2 = x * x - y * y;
    var y2 = 2 * x * y;
    // z^3 = z^2 * z
    var x3 = x2 * x - y2 * y;
    var y3 = x2 * y + y2 * x;
    // numerator = z^3 - 1
    var nx = x3 - 1;
    var ny = y3;
    // denominator = f'(z) = 3 * z^2
    var dx = 3 * x2;
    var dy = 3 * y2;
    var denom = dx * dx + dy * dy;
    if (denom < derivativeEps) {
      // sitting on the critical point (z = 0): no defined Newton step
      root = -1;
      break;
    }
    // z -= numerator / denominator  (complex division)
    var px = (nx * dx + ny * dy) / denom;
    var py = (ny * dx - nx * dy) / denom;
    x -= px;
    y -= py;
    // did we land close enough to one of the three roots?
    for (var r = 0; r < roots.length; ++r) {
      var ddx = x - roots[r].x;
      var ddy = y - roots[r].y;
      if (ddx * ddx + ddy * ddy < convergenceEps) {
        root = r;
        break;
      }
    }
    if (root >= 0) break;
  }
  if (root < 0) return 0; // didn't converge within iter steps
  return 1 + root * iter + i;
};

export default {
  fractalId: "newton",
  uiOrder: 7,
  name: "Newton",
  preset: { x: 0, y: 0, w: 4, iter: 40 },
  fn: {
    normal: iterate,
  },
} as FractalDef;
