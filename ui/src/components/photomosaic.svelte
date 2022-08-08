<script>
  import { onMount } from 'svelte';
  import { MainPhoto, TilePhotos } from "../store/photo.js";
  import { PhotoMosaic, DefaultOptions } from "$lib/photo-mosaic.js";
  import { paper, project, view, Size, Path, Point } from 'paper';

  let img;
  let mosaic;
  let width = "1080";
  let height = "1920";
  let gridSize = 12;
  let spacing = 1.2;

  // this actually proxies through the api to avoid CORS issues
  const PhotoUrl = function () {
    return "/api/photo/" + $MainPhoto.baseUrl.replace('https://', '') + "=w"+width+"-h"+height
//    return $MainPhoto === null ? "" : $MainPhoto.baseUrl + "=w"+width+"-h"+height
  }

  const RenderRaster = function () {
    let raster = new paper.Raster(mosaic);

    raster.onLoad = function() {
      raster.Size = new Size(40, 30);

      for (let y = 0; y < raster.height; y++) {
        for (let x = 0; x < raster.width; x++) {
          let color = raster.getPixel(x, y);

          let path = new Path.Circle({
            center: new Point(x, y) * gridSize,
            radius: gridSize / 2 / spacing,
          })

          path.fillColor = color;
        }
      }
      project.activeLayer.position = view.center;
    }
  }

  const Render = function () {
    if (img) {
      img.src = PhotoUrl();
      RenderRaster()
    }
  }

  onMount(() => {
    paper.setup(mosaic);
    img = new Image();
    const ctx = mosaic.getContext("2d");
    img.crossOrigin = "use-credentials"; // 'anonymous' or 'use-credentials'
    img.onload = function () {
      mosaic.width = img.width;
      mosaic.height = img.height;
      ctx.drawImage(img, 0, 0);
    }
  })
</script>

<section>
  <div class="columns">
    <div class="column is-half">
      <canvas bind:this={mosaic} crossorigin=""></canvas>
      {#if $MainPhoto}
      <button on:click={Render} class="button is-primary" disabled={$MainPhoto ? false : true}>Render</button>
      {/if}
    </div>
    <div class="column is-half">
      <div class="field">
        <label class="label">Width</label>
        <input bind:value={DefaultOptions.width} class="input" type="text" />
      </div>
      <div class="field">
        <label class="label">Height</label>
        <input bind:value={DefaultOptions.height} class="input" type="text" />
      </div>
      <div class="field">
        <label class="label">Tile Width</label>
        <input bind:value={DefaultOptions.tileWidth} class="input" type="text" />
      </div>
      <div class="field">
        <label class="label">Tile Height</label>
        <input bind:value={DefaultOptions.tileHeight} class="input" type="text" />
      </div>
    </div>
  </div>
</section>
