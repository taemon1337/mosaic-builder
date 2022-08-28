import { writable, get } from 'svelte/store';
import { SearchWithFilter } from '$lib/api.js';
import { TileImage } from '$lib/tile-image.js';

export const TileImageStore = function (id, opts) {
  this.id = id;
  this.photos = writable([]);
  this.tiles = writable([]);
  this.mainphoto = writable(null);
  this.loading = writable(false);
}

TileImageStore.prototype = {
  id: 0,
  constructor: TileImageStore,

  search: function (filter) {
    this.loading = writable(true);
    SearchWithFilter(filter).then((resp) => {
      if (resp && resp.photos) {
        resp.photos.forEach((photo) => {
          this.addPhoto(new TileImage(photo.id, photo.baseUrl));
        });
      } else {
        console.log("[WARN] no photos found in resp ", resp);
      }
      get(this.photos).forEach((tile) => tile.load());
      this.loading = writable(false);
    }).catch(this.handleError("searching with filter " + JSON.stringify(filter)));
  },

  addPhoto: function (tile) {
    console.log('[ADD] adding photo ' + tile.id + ' to photo store ' + this.id);
    if (tile.storeId !== this.id) {
      tile.storeId.set(this.id);
      this.photos.set([...get(this.photos), tile]);
    } else {
      console.log("[DUPLICATE] photo " + tile.id + " is already in store " + this.id);
    }
  },

  removePhoto: function (id) {
    this.photos = get(this.photos).filter(t => t.id == id);
  },

  addTile: function (tile) {
    console.log('[ADD] adding tile ' + tile.id + ' to tile store ' + this.id);
    if (tile.storeId !== this.id) {
      tile.storeId.set(this.id);
      this.tiles.set([...get(this.tiles), tile]);
    } else {
      console.log("[DUPLICATE] tile " + tile.id + " is already in store " + this.id);
    }
  },

  removeTile: function (id) {
    this.tiles = get(this.tiles).filter(t => t.id == id);
  },

  handleError: function (msg) {
    return (e) => {
      console.log("[ERROR] " + msg, e);
      this.loading = writable(false);
    }
  },
}
