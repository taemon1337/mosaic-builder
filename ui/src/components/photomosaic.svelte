<script>
  import { onMount } from 'svelte';
  import { MainPhotoUrl, TilePhotos, GetAverageColorOfTile, TileWidth, TileHeight } from "../store/photo.js";
  import { Image, Shape } from 'image-js';
  import ProgressBar from '../components/progressbar.svelte';
  import Color from 'color';

  let image;
  let mosaic;
  let preview;
  let tilesByColor = [];

  $: progress = 0;

  // https://en.wikipedia.org/wiki/YUV#Converting_between_Y%E2%80%B2UV_and_RGB
  const RGB2YUV = function (rgb) {
    let yuv = [0,0,0];
    yuv[0] = 0.299*rgb[0] + 0.587*rgb[1] + 0.114*rgb[2]; // compute Y
    yuv[1] = -0.147*rgb[0] - 0.289*rgb[1] + 0.436*rgb[2]; // compute U
    yuv[2] = 0.615*rgb[0] - 0.515*rgb[1] - 0.100*rgb[2]; // compute V
    return yuv;
  }

  const YUV2RGB = function (yuv) {
    let rgb = [0,0,0];
    rgb[0] = - 0.299*yuv[0] - 0.587*yuv[1] - 0.114*yuv[2]; // compute R
    rgb[1] = 0.147*yuv[0] + 0.289*yuv[1] - 0.436*yuv[2]; // compute G
    rgb[2] = - 0.615*yuv[0] + 0.515*yuv[1] + 0.100*yuv[2]; // compute B
    return rgb;
  }

  const RGB2HEX = function (r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  const GetClosestTileIndexByColor = function (color) {
    let yuv = RGB2YUV(color);
    let diff = 255*3;
    let idx = 0;

    $TilePhotos.forEach(function (photo, i) {
      let avg = RGB2YUV(photo.averageColor);

      let photodiff = Math.abs(avg[0] - yuv[0]) + Math.abs(avg[1] - yuv[1]) + Math.abs(avg[2] - yuv[2]);
      if (photodiff < diff) {
        console.log("FOUND CLOSER TILE BY COLOR", photodiff);
        diff = photodiff;
        idx = i;
      }
    });

    return { index: idx, background: RGB2HEX(color) }
  }

  const Clear = function () {
    mosaic.src = "";
  }

  const Render = function () {
    console.log('rendering...');
    Image.load(image.src).then(function(mos) {
      let rgbaImage = mos.rgba8();
      let processed = 0;
      let processedTotal = 0;
      let tileWidth = $TileWidth;
      let tileHeight = $TileHeight;
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

//          tile = tile.setBorder({ size: 1, algorithm: 'set', color: [255, 255, 255, 255] });
          preview.src = tile.toDataURL();

          let color = GetAverageColorOfTile(tile);
          let res = GetClosestTileIndexByColor(color);

          if ($TilePhotos[res.index] && $TilePhotos[res.index].image) {
            let i = $TilePhotos[res.index].image;
            tile = i.resize({ width: tileWidth, height: tileHeight });
          } else {
            console.log('could not find matching/loaded tile', $TilePhotos[res.index]);
          }

          target.insert(tile, { x: row, y: col, inPlace: true });
        }
        progress = Math.round((processed / processedTotal) * 100);
        console.log('PROGRESS', progress);
      }

      let ctx = mosaic.getContext('2d');
      target.toBlob().then(function (blob) {
        createImageBitmap(blob, 0, 0, target.width, target.height).then(function (resp) {
          ctx.drawImage(resp, 0, 0);
        });
      });

//      mosaic.src = target.toDataURL();
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
      <div class="level-item">
        <a on:click={Clear} class="button is-primary">Clear</a>
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
      <div class="outsideWrapper">
        <div class="insideWrapper">
          {#if $MainPhotoUrl}
          <img src={$MainPhotoUrl} />
          <canvas bind:this={mosaic} class="coveringCanvas"></canvas>
          {/if}
        </div>
      </div>
    </div>
    <div class="column is-half">
      {#if $MainPhotoUrl}
      <img bind:this={image} src={$MainPhotoUrl} />
      {/if}
    </div>
  </div>
</section>

<style>
.outsideWrapper{ 
    width:256px; height:256px; 
    margin:20px 60px; 
    border:1px solid blue;}
.insideWrapper{ 
    width:100%; height:100%; 
    position:relative;}
.coveredImage{ 
    width:100%; height:100%; 
    position:absolute; top:0px; left:0px;
}
.coveringCanvas{ 
    width:100%; height:100%; 
    position:absolute; top:0px; left:0px;
    background-color: rgba(255,0,0,.1);
    opacity:0.65;
}
</style>
