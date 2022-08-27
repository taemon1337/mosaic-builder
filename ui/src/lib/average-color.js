export const GetAverageColorOfTile = function (tile) {
  let R = 0
  let G = 1
  let B = 2
  let A = 3
  let sum = [0,0,0,0];
  let max = [0,0,0,0];
  let avg = [0,0,0,0];
  let total = 255 * tile.width * tile.height;

  for (let x = 0; x < tile.width; x++) {
    for (let y = 0; y < tile.height; y++) {
      let p = tile.getPixelXY(x, y);
      sum[R] += p[R];
      sum[G] += p[G];
      sum[B] += p[B];
      sum[A] += p[A];
      if (sum[R] > max[R]) { max[R] = sum[R] }
      if (sum[G] > max[G]) { max[G] = sum[G] }
      if (sum[B] > max[B]) { max[B] = sum[B] }
      if (sum[A] > max[A]) { max[A] = sum[A] }
    }
  }

  avg[R] = Math.floor((sum[R] / total) * 100);
  avg[G] = Math.floor((sum[G] / total) * 100);
  avg[B] = Math.floor((sum[B] / total) * 100);
  avg[A] = Math.floor((sum[A] / total) * 100);

  return avg;
}

