import { writable, derived } from 'svelte/store';
import { Image } from 'image-js';
import { hash } from '$lib/hashmap.js';

const PROXY = true;

export const Photos = writable({photos: []});
export const MainPhoto = writable(null);
export const MainImage = writable(null);
export const MinimumTiles = writable(1);
export const TilePhotos = writable([]);
export const TileWidth = writable(30);
export const TileHeight = writable(30);
export const TileIndex = writable([]); // store the order of tiles
export const TileProgress = writable(0);
export const TargetWidth = writable(1920);
export const TargetHeight = writable(1080);
export const TargetScale = writable(1);
export const TargetProgress = writable(0);
export const TargetModes = writable(['foobar', 'normal', 'src-in', 'screen', 'multiply', 'difference', 'exclusion', 'add', 'lighten', 'darken', 'overlay', 'hardlight', 'colordodge', 'colorburn', 'softlight', 'luminosity', 'color', 'hue', 'saturation', 'lightercolor', 'darkercolor']);
export const AllowDuplicateTiles = writable(0);
export const UniqueTiles = writable(false);
export const AutoCrop = writable(true);
export const ColorPhotos = writable(['black', 'white', 'red', 'blue', 'orange', 'yellow', 'grey', 'pink', 'purple', 'green', 'light-blue']);

export const MainPhotoUrl = derived(
  MainPhoto,
  $MainPhoto => $MainPhoto ? FullPhotoUrl($MainPhoto) : ""
)

export const MainPhotoOriginalUrl = derived(
  MainPhoto,
  $MainPhoto => $MainPhoto ? OriginalPhotoUrl($MainPhoto) : ""
)

export const FirstTile = derived(
  TilePhotos,
  $TilePhotos => $TilePhotos.length ? $TilePhotos[0] : null
)

export const FullPhotoUrl = function (photo) {
  let dim = "=w1080-h1920";
  if (PROXY) {
    return "/api/photo/" + photo.baseUrl.replace('https://', '') + dim;
  } else {
    return photo.baseUrl + dim;
  }
}

export const OriginalPhotoUrl = function (photo) {
  let dim = "=dv";
  if (PROXY) {
    return photo.baseUrl + dim;
  } else {
    return "/api/photo/" + photo.baseUrl.replace('https://', '') + dim;
  }
}

export const TilePhotoUrl = function (photo) {
  let dim = "w128-h128"
  if (PROXY) {
    return photo.baseUrl + dim;
  } else {
    return "/api/photo/" + photo.baseUrl.replace('https://', '') + dim;
  }
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

export const ComputeSimilarity = function (img) {
  let c = img.getCanvas();
  let ctx = c.getContext('2d');
  let imgData = ctx.getImageData(0, 0, img.width, img.height);
  return hash(imgData);
}

export const GetAverageColor = function (photo, src, cropOpts) {
  Image.load(src).then(function (tile) {
    if (cropOpts.enabled) {
      tile = tile.rgba8().crop(cropOpts);
    } else {
      tile = tile.rgba8();
    }
    let avg = GetAverageColorOfTile(tile);
    photo.image = tile;
    photo.imageUrl = FullPhotoUrl(photo);
    photo.averageColor = avg;
    ComputeSimilarity(tile).then((sim) => photo.hashmap = sim)
    photo.imageElement.dispatchEvent(photo.imageElement.imaged);
  });
}
