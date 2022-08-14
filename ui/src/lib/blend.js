import { Image } from 'image-js';

// https://homepages.inf.ed.ac.uk/rbf/HIPR2/blend.htm
export const BlendImage = function (t1, t2, x) {
  x = x || 0.7;

  if (t1.width != t2.width || t1.height != t2.height) {
    throw new Error("images must be the same size and they are not");
  }

  let out = Image.createFrom(t1);

  for (let x = 0; x < t1.width; x++) {
    for (let y = 0; y < t1.height; y++) {
      let q = x * t1.getPixelXY(x, y) + (1 - x) * t2.getPixelXY(x, y);
      out.setPixelXY(x, y, q);
    }
  }

  return out;
}
