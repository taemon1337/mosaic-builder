import { writable, derived } from 'svelte/store';
import { Image } from 'image-js';
import { Search } from '$lib/api.js';

export const Photos = writable({photos: []});
export const MainPhoto = writable(null);
export const TilePhotos = writable([]);
export const TileWidth = writable(50);
export const TileHeight = writable(50);
export const TargetWidth = writable(1920);
export const TargetHeight = writable(1080);
export const TargetModes = writable(['normal', 'src-in', 'screen', 'multiply', 'difference', 'exclusion']);
export const ColorPhotos = writable(['black', 'white', 'red', 'blue', 'orange', 'yellow', 'grey', 'pink', 'purple', 'green', 'light-blue']);

export const MainPhotoUrl = derived(
  MainPhoto,
  $MainPhoto => $MainPhoto ? FullPhotoUrl($MainPhoto) : ""
)

export const FirstTile = derived(
  TilePhotos,
  $TilePhotos => $TilePhotos.length ? $TilePhotos[0] : null
)

export const FullPhotoUrl = function (photo) {
  return "/api/photo/" + photo.baseUrl.replace('https://', '') + "=w1080-h1920";
}

export const TilePhotoUrl = function (photo) {
  return "/api/photo/" + photo.baseUrl.replace('https://', '') + "w128-h128";
}

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

export const GetAverageColor = function (photo, src, resizeOpts) {
  Image.load(src).then(function (tile) {
    tile = tile.rgba8().resize(resizeOpts);
    let avg = GetAverageColorOfTile(tile);
    photo.image = tile;
    photo.imageUrl = FullPhotoUrl(photo);
    photo.averageColor = avg;
  });
}

export const Load = function () {
  return Search().then(resp => Photos.set(resp))
}
