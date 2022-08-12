<script>
  import { onMount } from 'svelte';
  import { MainPhotoUrl, TilePhotos } from "../store/photo.js";
  import { PhotoMosaic, DefaultOptions } from "$lib/photo-mosaic.js";
  import { Image, Shape } from 'image-js';
  import ProgressBar from '../components/progressbar.svelte';
  import Color from 'color';

  let image;
  let mosaic;
  let preview;
  let tileWidth = 100;
  let tileHeight = 100;
  let progress = 0;
  let tilesByColor = [];

  const GetClosestColorIndex = function (color) {
    let diff = 255;
    let idx = 0;

    $TilePhotos.forEach(function (photo, i) {
      if (Math.abs(photo.averageColor - color) < diff) {
        diff = photo.averageColor;
        idx = i;
      }
    })

    return idx;
  }

  const GetAverageColor = function (tile) {
    let sum = 0;
    let total = tile.width * tile.height;

    for (let x = 0; x < tile.width; x++) {
      for (let y = 0; y < tile.height; y++) {
        sum += tile.getPixelXY(x, y);
      }
    }

    return (sum / total) * 100;
  }

  const Render = function () {
    console.log('rendering...');
    Image.load(image.src).then(function(mos) {
      let rgbaImage = mos.rgba8();
      let processed = 0;
      let processedTotal = 0;
      progress = 0;

      mosaic.width = rgbaImage.width;
      mosaic.height = rgbaImage.height;
      preview.width = tileWidth;
      preview.height = tileHeight;

      let totalWidth = rgbaImage.width;
      let totalHeight = rgbaImage.height;

      let rows = Math.floor(rgbaImage.width / tileWidth);
      let cols = Math.floor(rgbaImage.height / tileHeight);

      let adjustedWidth = rows * tileWidth;
      let adjustedHeight = cols * tileHeight;

      let target = Image.createFrom(rgbaImage);
      target = target.resize({ width: adjustedWidth, height: adjustedHeight });

      // iterate over image in chunks/tiles
      processedTotal = rows * cols;
      for (let row = 0; row < adjustedWidth; row+=tileWidth) {
        for (let col = 0; col < adjustedHeight; col+=tileHeight) {
          processed++
          let tile = rgbaImage.crop({ x: row, y: col, width: tileWidth, height: tileHeight });

          tile = tile.setBorder({ size: 1, algorithm: 'set', color: [255, 255, 255, 255] });
          preview.src = tile.toDataURL();

          let color = GetAverageColor(tile);
          let tileIndex = GetClosestColorIndex(color);

          if ($TilePhotos[tileIndex] && $TilePhotos[tileIndex].image) {
            let i = $TilePhotos[tileIndex].image;
            tile = i.resize({ width: tileWidth, height: tileHeight });
          } else {
            console.log('could not find matching/loaded tile', $TilePhotos[tileIndex]);
          }

          target.insert(tile, { x: row, y: col, inPlace: true });
        }
        progress = Math.round((processed / processedTotal) * 100);
        console.log('PROGRESS', progress);
      }

      mosaic.src = target.toDataURL();
      console.log('rendered');
    });
  }
</script>

<section>
  <nav class="level">
    <div class="level-left">
      <div class="level-item">
        <a on:click={Render} class="button is-primary">Draw Mosaic</a>
      </div>
    </div>
    <div class="level-right">
      <div class="level-item">
        <img bind:this={preview} />
      </div>
    </div>
  </nav>
  <ProgressBar value={progress} onValueChange="{(x) => progress = x}" />
  <div class="columns">
    <div class="column is-half">
      <img bind:this={mosaic} />
    </div>
    <div class="column is-half">
      {#if $MainPhotoUrl}
      <img bind:this={image} src={$MainPhotoUrl} />
      {/if}
    </div>
  </div>
</section>
