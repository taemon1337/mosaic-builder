<script>
  import { tick, createEventDispatcher } from 'svelte';
  import { MainPhotoUrl, MainImage, TilePhotos, MinimumTiles, TileIndex, TileWidth, TileHeight, TileProgress, TargetWidth, TargetHeight, AllowDuplicateTiles, GetAverageColorOfTile } from "../store/photo.js";
  import { FindAndRemoveClosestTileByColor } from '$lib/colors.js';
  import { Image } from 'image-js';

  export let grid;
  export let mode = "colormatch";

  let percentDone = 0;
  let retries = 3;
  let progressBar;

  const dispatch = createEventDispatcher();

  const emitNext = function () { dispatch('next'); }
  const emitPrev = function () { dispatch('prev'); }

  const computeGrid = function () {
    switch (mode) {
      case "basic":
        return basicGrid();
      case "duplicate":
        AllowDuplicateTiles.set(true);
        return colorMatchGrid();
      case "colormatch":
        AllowDuplicateTiles.set(false);
        return colorMatchGrid();
      default:
        console.log("No mode selected.");
        return;
    }
  }

  const setMode = function (e) {
    if (e.target.checked) {
      mode = e.target.id
    } else {
      mode = "";
    }
  }

  // builds the grid using tiles without any adjustments
  const basicGrid = function () {
    grid.width = $TargetWidth;
    grid.height = $TargetHeight;
    let ctx = grid.getContext('2d');
    let x = 0;
    let y = 0;
    let i = 0;

    if ($TilePhotos.length < 1) {
      console.log('No tiles selected');
      return;
    }

    for (let x = 0; x < grid.width; x+=$TileWidth) {
      for (let y = 0; y < grid.height; y+=$TileHeight) {
        let tile = $TilePhotos[i];
        if (tile.image) {
          let img = tile.image.resize({ width: $TileWidth, height: $TileHeight })
          ctx.drawImage(img.getCanvas(), x, y);
          i < $TilePhotos.length - 1 ? i += 1 : i = 0; // increment photo index unless we've hit max then reset to 0
        } else {
          console.log('[SKIP] Image is missing.', tile);
        }
      }
    }
  }

  const ClearProgress = async function () {
    await new Promise(res => setTimeout(res, 5000))
    progressBar.value = 0;
    progressBar.className = "is-hidden";
  }

  const ErrorHandler = function (e) {
    console.log("ERROR building color matched grid ", e);
    if (retries > 0) {
      console.log("retrying...");
      retries = retries - 1;
      colorMatchGrid();
    } else {
      retries = 3;
    }
    ClearProgress();
  }

  // builds the grid trying to match tiles to pixel colors
  const colorMatchGrid = async function () {
    try {
      progressBar.className = "progress is-primary";
      grid.width = $TargetWidth;
      grid.height = $TargetHeight;
      let ctx = grid.getContext('2d');
      let x = 0;
      let y = 0;
      let w = $TileWidth;
      let h = $TileHeight;
      let tiles = [...$TilePhotos];
      let tileIndex = [];
      let total = w*h;
      let progress = 1;
      progressBar.value = Math.floor(progress / total * 100);

      let mainimage = await Image.load($MainPhotoUrl)
      try {
        MainImage.set(mainimage);
        $TargetWidth = mainimage.width;
        $TargetHeight = mainimage.height;

        if (tiles.length < 1) {
          console.log('No tiles selected');
          return;
        }

        for (let x = 0; x < grid.width; x+=w) {
          for (let y = 0; y < grid.height; y+=h) {
            progress++;
            if (tiles.length < 1) { tiles = [...$TilePhotos]; } // reset tiles if all have been used (when not allow dups)
            let cropts = { x: x, y: y, width: w, height: h }

            if (x + w > mainimage.width) { cropts.width = mainimage.width - x }
            if (y + h > mainimage.height) { cropts.height = mainimage.height - y }

            let crop = mainimage.crop(cropts);
            let avg = GetAverageColorOfTile(crop);
            let tile = FindAndRemoveClosestTileByColor(avg, tiles, $AllowDuplicateTiles);
            let img = tile.image.resize({ width: $TileWidth, height: $TileHeight })
            tileIndex.push(tile.id);
            ctx.drawImage(img.getCanvas(), x, y);
            progressBar.value = Math.floor(progress / total * 100);
            await new Promise(res => setTimeout(res, 2))
          }
        }
        TileIndex.set(tileIndex);
        ClearProgress();
      } catch (e) {
        ErrorHandler()
      }
    } catch (e) {
      ErrorHandler()
    }
  }
</script>

<section>
  <div class="columns">
    <div class="column is-2">
      <div class="form">
        <div class="field">
          <button on:click|preventDefault={computeGrid} class="button is-primary is-large" disabled={$TilePhotos.length < $MinimumTiles}>Generate Background</button>
        </div>

        <div class="field">
          <progress bind:this={progressBar} class="is-hidden progress is-primary" value=1 max="100">1%</progress>
        </div>

        <div class="field">
          <label class="checkbox">
            <input type="checkbox" id="colormatch" checked={mode == "colormatch"} on:click={setMode}>
            Color match main photo grid
          </label>
          <p class="help">Each tile's average color is matched against the main photo</p>
        </div>

        <div class="field">
          <label class="checkbox">
            <input type="checkbox" id="basic" checked={mode == "basic"} on:click={setMode}>
            Basic mode
          </label>
          <p class="help">Draws grid one tile at a tile without any ordering</p>
        </div>

        <div class="field">
          <label class="checkbox">
            <input type="checkbox" id="duplicate" checked={mode == "duplicate"} on:click={setMode}>
            Duplicate mode
          </label>
          <p class="help">Same as color match but reuses duplicate tiles</p>
        </div>

        <div class="field">
          <label class="label">Tile Width</label>
          <div class="select">
            <select bind:value={$TileWidth}>
              {#each [10,20,30,40,50,100,150,200,300,400,500,1000] as s}
              <option value={s}>{s} pixels wide</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="field">
          <label class="label">Tile Height</label>
          <div class="select">
            <select bind:value={$TileHeight}>
              {#each [10,20,30,40,50,100,150,200,300,400,500,1000] as s}
              <option value={s}>{s} pixels high</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="column is-8">
      <canvas id="grid-canvas" bind:this={grid}></canvas>
    </div>
    <div class="column is-2">
      <div class="form">
        <div class="field">
          <button on:click|preventDefault={emitNext} class="button is-primary is-large">Generate Mosaic</button>
        </div>

        <div class="field">
          <button on:click|preventDefault={emitPrev} class="button is-default">back</button>
        </div>
      </div>
    </div>
  </div>
</section>
