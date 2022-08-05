import { writable, derived } from 'svelte/store';
import { Search } from '$lib/api.js';

export const Photos = writable({photos: []});

export const Load = function () {
  return Search().then(resp => Photos.set(resp))
}
