import { Image } from 'image-js';

// https://en.m.wikipedia.org/wiki/Alpha_compositing
export const BlendImage = function (t1, t2, x) {
  x = x || 0.7;

  if (t1.width != t2.width || t1.height != t2.height) {
    throw new Error("images must be the same size and they are not");
  }

  let out = Image.createFrom(t1);

  for (let x = 0; x < t1.width; x++) {
    for (let y = 0; y < t1.height; y++) {
      let q = [0,0,0,0];
      let p1 = t1.getPixelXY(x, y);
      let p2 = t2.getPixelXY(x, y);
      let aq = p1[3] + p2[3] * (1 - p1[3]); // alpha
      let a1 = p1[3];
      let a2 = p2[3];

      q[0] = ((p1[0] * a1) + (p2[0] * a2 * (1 - a1))) / aq; // R
      q[1] = ((p1[1] * a1) + (p2[1] * a2 * (1 - a1))) / aq; // G
      q[2] = ((p1[2] * a1) + (p2[2] * a2 * (1 - a1))) / aq; // B
      q[3] = aq; // alpha
      out.setPixelXY(x, y, q);
    }
  }

  return out;
}
