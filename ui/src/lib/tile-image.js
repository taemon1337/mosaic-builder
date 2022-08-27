import { writable } from 'svelte/store';
import { Image } from 'image-js';
import { GetAverageColorOfTile } from '$lib/average-color.js';
import { ComputeSimilarity } from '$lib/hashmap.js';
import * as smartcrop from 'smartcrop';

export const TileImageUrl = function (baseUrl, opts) {
  opts = Object.assign({ useProxy: true, width: 300, height: 300 }, opts);
  let sz = ["=w",opts.width,"-h",opts.height].join('');
  if (opts.useProxy) {
    return baseUrl.replace('https://', '/api/photo/') + sz;
  } else {
    return baseUrl;
  }
}

export const TileImage = function(id, baseUrl, opts) {
  opts = Object.assign({}, opts);
  this.id = id;
  this.baseUrl = baseUrl;
  this.tileWidth = opts.tileWidth || 300;
  this.tileHeight = opts.tileHeight || 300;
  this.smartcrop = {};
  this.colorhash = [];
  this.image = writable(null);
  this.error = writable(null);
  this.loading = writable(false);
}

TileImage.prototype = {
  id: 0,
  constructor: TileImage,

  load: async function () {
    Image.load(this.tileImageUrl()).then((img) => {
      this.image.set(img.rgba8());
      this.averageColor = GetAverageColorOfTile(img);
      this.loading.set(false);
    }).catch(this.handleError("loading photo "));
  },

  computeSimilarity: async function() {
    this.loading.set(true);
    ComputeSimilarity(this.image).then((s) => {
      this.colorhash = s;
      this.loading.set(false);
    }).catch(this.handleError("computing similarity of photo "));
  },

  computeCrop: async function () {
    this.loading.set(true);
    smartcrop.crop(this.image, { width: this.tileWidth, height: this.tileHeight }).then((sugg) => {
      this.smartcrop = sugg.topCrop;
      this.loading.set(false);
    }).catch(this.handleError("could not get suggested crop of photo"));
  },

  handleError: function (msg) {
    return (e) => {
      console.log("[ERROR] " + msg + this.id, e);
      this.error.set(e);
      this.loading.set(false);
    }
  },

  loadFullSize: async function () {
    Image.load(this.fullImageUrl()).then((img) => {
      this.image.set(img.rgba8());
    }).catch((err) => console.log("Could not load photo " + this.id, err));

  },

  tileImageUrl: function () {
    return TileImageUrl(this.baseUrl, { width: this.tileWidth, height: this.tileHeight });
  },

  fullImageUrl: function () {
    return TileImageUrl(this.baseUrl, { width: 1920, height: 1080 });
  },

  resize: function (opts) {
    this.image.resize(opts);
  },
}
