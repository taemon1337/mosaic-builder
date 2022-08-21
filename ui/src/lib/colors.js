// https://en.wikipedia.org/wiki/YUV#Converting_between_Y%E2%80%B2UV_and_RGB
export const RGB2YUV = function (rgb) {
  let yuv = [0,0,0];
  yuv[0] = 0.299*rgb[0] + 0.587*rgb[1] + 0.114*rgb[2]; // compute Y
  yuv[1] = -0.147*rgb[0] - 0.289*rgb[1] + 0.436*rgb[2]; // compute U
  yuv[2] = 0.615*rgb[0] - 0.515*rgb[1] - 0.100*rgb[2]; // compute V
  return yuv;
}

export const YUV2RGB = function (yuv) {
  let rgb = [0,0,0];
  rgb[0] = - 0.299*yuv[0] - 0.587*yuv[1] - 0.114*yuv[2]; // compute R
  rgb[1] = 0.147*yuv[0] + 0.289*yuv[1] - 0.436*yuv[2]; // compute G
  rgb[2] = - 0.615*yuv[0] + 0.515*yuv[1] + 0.100*yuv[2]; // compute B
  return rgb;
}

export const FindAndRemoveClosestTileByColor = function (color, tiles) {
  let yuv = RGB2YUV(color);
  let diff = 255*3;
  let idx = 0;

  tiles.forEach(function (photo, i) {
    let avg = RGB2YUV(photo.averageColor);
    let photodiff = Math.abs(avg[0] - yuv[0]) + Math.abs(avg[1] - yuv[1]) + Math.abs(avg[2] - yuv[2]);

    if (photodiff < diff) {
      console.log("FOUND CLOSER TILE BY COLOR", photodiff);
      diff = photodiff;
      idx = i;
    }
  });

  return tiles[idx];
//  return tiles.splice(idx, 1).pop(); // return tile and remove it from tiles
}
