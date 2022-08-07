import { writable, derived } from 'svelte/store';
import { Search } from '$lib/api.js';

export const Photos = writable({photos: []});
export const MainPhoto = writable(null);
export const TilePhotos = writable([]);

export const Load = function () {
  return Search().then(resp => Photos.set(resp))
}
