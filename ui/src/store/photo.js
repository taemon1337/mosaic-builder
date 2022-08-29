import { writable, derived } from 'svelte/store';
import { Image } from 'image-js';
import { hash } from '$lib/similarity.js';

const PROXY = true;

export const MinimumTiles = writable(1);
export const TileWidth = writable(50);
export const TileHeight = writable(50);
export const TileProgress = writable(0);
export const TargetWidth = writable(1920);
export const TargetHeight = writable(1080);
export const TargetScale = writable(1);
export const TargetProgress = writable(0);
export const TargetModes = writable(['white', 'normal', 'src-in', 'screen', 'multiply', 'difference', 'exclusion', 'add', 'lighten', 'darken', 'overlay', 'hardlight', 'colordodge', 'colorburn', 'softlight', 'luminosity', 'color', 'hue', 'saturation', 'lightercolor', 'darkercolor']);
export const AllowDuplicateTiles = writable(0);
export const UniqueTiles = writable(false);
export const AutoCrop = writable(true);
export const ColorPhotos = writable(['black', 'white', 'red', 'blue', 'orange', 'yellow', 'grey', 'pink', 'purple', 'green', 'light-blue']);
