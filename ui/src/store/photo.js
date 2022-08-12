import { writable, derived } from 'svelte/store';
import { Image } from 'image-js';
import { Search } from '$lib/api.js';

export const Photos = writable({photos: []});
export const MainPhoto = writable(null);
export const TilePhotos = writable([]);

export const MainPhotoUrl = derived(
  MainPhoto,
  $MainPhoto => $MainPhoto ? "/api/photo/" + $MainPhoto.baseUrl.replace('https://', '') + "=w1080-h1920" : ""
)

export const TilePhotoUrl = function (photo) {
  return "/api/photo/" + photo.baseUrl.replace('https://', '') + "w128-h128";
}

export const GetAverageColor = function (photo, src) {
  Image.load(src).then(function (tile) {
    let sum = 0;
    let total = tile.width * tile.height;

    for (let x = 0; x < tile.width; x++) {
      for (let y = 0; y < tile.height; y++) {
        sum += tile.getPixelXY(x, y);
      }
    }

    photo.image = tile;
    photo.averageColor = (sum / total) * 100;
  });
}

export const Load = function () {
  return Search().then(resp => Photos.set(resp))
}
