import { writable, derived } from 'svelte/store';
import { Search } from '$lib/api.js';

export const Photos = writable({photos: []});
export const SelectedPhotos = writable([]);

export const IsSelected = function (id) {
  SelectedPhotos.each(function (photo) {
    if (photo.id === id) return true;
  })
  return false
}

export const Load = function () {
  return Search().then(resp => Photos.set(resp))
}
