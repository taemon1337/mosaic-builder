<script>
  import { MainImage, TilePhotos, TileIndex, TargetWidth, TargetHeight, TargetScale, TargetModes, TileWidth, TileHeight, AutoCrop } from "../store/photo.js";
  import { Image } from 'image-js';
  import * as smartcrop from 'smartcrop';

  let mosaic;
  let mode = 'screen';
  let scale = 1;

  const FindTile = function (id) {
    return $TilePhotos.filter(p => p.id == id).pop();
  }

  const getBase64Image = function (photo, size) {
    let el = document.getElementById("a-" + photo.id);
    let c = document.createElement("canvas");
    let ctx = c.getContext('2d');
    let img = el.children[0];
    c.width = img.width;
    c.height = img.height;
    ctx.drawImage(img, 0, 0);
    let dataURL = c.toDataURL("image/jpeg");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  const buildMosaic = async function () {
    console.log('building mosaic...');
    resetMosaic();
    let grid = document.getElementById('grid-canvas');
    let tileIndex = [...$TileIndex];
    let progress = 0;
    let totalTiles = 0;

    let ctx = mosaic.getContext('2d');
    let gridctx = grid.getContext('2d');

    let mainimg = $MainImage;
    let gridimg = Image.fromCanvas(grid);

    let resizeOpts = { width: $TargetWidth * $TargetScale, height: $TargetHeight * $TargetScale };
    let tileOpts = { width: $TileWidth * $TargetScale, height: $TileHeight * $TargetScale };
    totalTiles = Math.floor(($TargetWidth * $TargetHeight) / ($TileWidth * $TileHeight));

    mosaic.width = resizeOpts.width;
    mosaic.height = resizeOpts.height;

    console.log('reloading and resizing all tile photos...');
    for (let x = 0; x < resizeOpts.width; x+=tileOpts.width) {
      for (let y = 0; y < resizeOpts.height; y+=tileOpts.height) {
        let photoId = tileIndex.splice(0,1);
        let photo = FindTile(photoId);
        if (photo) {
          let dataurl = getBase64Image(photo, tileOpts);
          let img = await Image.load(dataurl);
          img = img.resize(tileOpts);
          smartcrop.crop(img.getCanvas(), tileOpts).then(function (suggest) {
            if ($AutoCrop) {
              img = img.crop(suggest.topCrop);
            }
            ctx.drawImage(img.getCanvas(), x, y);
          });
        }

        progress++;
      }
    }

    mainimg = mainimg.resize(resizeOpts);

    let main = document.createElement('canvas');
    main.width = mainimg.width;
    main.height = mainimg.height;
    let mainctx = main.getContext('2d');

    mainctx.drawImage(mainimg.getCanvas(), 0, 0);
    mainctx.blendOnto(ctx, mode);
    console.log('mosaic done');
  }

  const blendTiles = function () {
    let grid = document.getElementById('grid-canvas');
    let gridctx = grid.getContext('2d');
    let ctx = mosaic.getContext('2d');
    gridctx.blendOnto(ctx, mode);
  }

  const blendMain = function () {
    let mainimg = $MainImage;
    let ctx = mosaic.getContext('2d');
    let resizeOpts = { width: $TargetWidth * $TargetScale, height: $TargetHeight * $TargetScale };
    mainimg = mainimg.resize(resizeOpts);

    let main = document.createElement('canvas');
    main.width = mainimg.width;
    main.height = mainimg.height;
    let mainctx = main.getContext('2d');

    mainctx.drawImage(mainimg.getCanvas(), 0, 0);
    mainctx.blendOnto(ctx, mode);
  }

  const resetMosaic = function () {
    let ctx = mosaic.getContext('2d');
    ctx.clearRect(0, 0, mosaic.width, mosaic.height);
  }
</script>

<section>
  <nav class="level">
    <div class="level-left">
      <div class="level-item">
        <a on:click={buildMosaic} class="button is-primary">Create Mosaic</a>
      </div>
      <div class="level-item">
        <a on:click={blendMain} class="button is-default">Enhance main</a>
      </div>
      <div class="level-item">
        <a on:click={blendTiles} class="button is-default">Enhance tiles</a>
      </div>
      <div class="level-item">
        <div class="select">
          <select value={mode}>
            {#each $TargetModes as m}
            <option value={m}>{m}</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="level-item">
        <div class="select">
          <select bind:value={$TargetScale}>
            <option value=1 selected>Select scale size (mosaic / tiles)</option>
            {#each [1,2,3,4,5,6,7,8,9,10] as x}
            <option value={x}>
              {x}x - {$TargetWidth * x}x{$TargetHeight * x} - {$TileWidth * x}x{$TileHeight * x}
            </option>
            {/each}
          </select>
        </div>
      </div>
    </div>
    <div class="level-right">
      <p class="help is-info">Size will be {$TargetWidth * $TargetScale}x{$TargetHeight * $TargetScale}</p>
      <p class="help is-info"> Tiles will be {$TileWidth * $TargetScale}x{$TileHeight * $TargetScale}</p>
      <div class="level-item">
        <a on:click={resetMosaic} class="button is-primary">Clear/Reset</a>
      </div>
    </div>
  </nav>
  <div class="columns">
    <div class="column is-full">
      <canvas bind:this={mosaic}></canvas>
    </div>
  </div>
</section>

<style>
  input.input {
    width: 50px;
  }
</style>
