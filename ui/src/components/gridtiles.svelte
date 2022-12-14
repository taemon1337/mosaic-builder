<script>
  import { tick, createEventDispatcher } from 'svelte';
  import { MinimumTiles, TileWidth, TileHeight, TileProgress, TargetWidth, TargetHeight, AllowDuplicateTiles, UniqueTiles } from "../store/photo.js";
  import { TileStore } from '../store/tilestore.js';
  import { FindAndRemoveClosestTileByColor } from '$lib/colors.js';
  import { GetAverageColorOfTile } from '$lib/average-color.js';
  import { Image } from 'image-js';

  export let grid;
  export let mode = "colormatch";

  let tiles = TileStore.tiles;
  let mainphoto = TileStore.mainphoto;
  let tileindex = TileStore.tileindex;
  let mainimage = $mainphoto?.image;
  let percentDone = 0;
  let retries = 3;
  let progressBar;

  mainphoto.subscribe((val) => {
    mainimage = $mainphoto?.image;
  });

  const dispatch = createEventDispatcher();

  const emitNext = function () { dispatch('next'); }
  const emitPrev = function () { dispatch('prev'); }

  const computeGrid = function () {
    switch (mode) {
      case "basic":
        return basicGrid();
      case "duplicate":
        AllowDuplicateTiles.set(true);
        UniqueTiles.set(false);
        return colorMatchGrid();
      case "colormatch":
        AllowDuplicateTiles.set(false);
        UniqueTiles.set(false);
        return colorMatchGrid();
      case "single":
        AllowDuplicateTiles.set(false);
        UniqueTiles.set(true);
        return colorMatchGrid();
      default:
        console.log("No mode selected.");
        return;
    }
  };

  const setMode = function (e) {
    if (e.target.checked) {
      mode = e.target.id
    } else {
      mode = "";
    }
  };

  // builds the grid using tiles without any adjustments
  const basicGrid = function () {
    grid.width = $TargetWidth;
    grid.height = $TargetHeight;
    let ctx = grid.getContext('2d');
    let x = 0;
    let y = 0;
    let i = 0;
    let tileIndex = [];

    if ($tiles.length < 1) {
      console.log('No tiles selected');
      return;
    }

    for (let x = 0; x < grid.width; x+=$TileWidth) {
      for (let y = 0; y < grid.height; y+=$TileHeight) {
        let tile = $tiles[i];
        if (tile.image) {
          tileIndex.push(tile.id);
          tile.drawToCanvas(grid, x, y, { width: $TileWidth, height: $TileHeight });
          i < $tiles.length - 1 ? i += 1 : i = 0; // increment photo index unless we've hit max then reset to 0
        } else {
          console.log('[SKIP] Image is missing.', tile);
        }
      }
    }

    tileindex.set(tileIndex);
  };

  const ClearProgress = async function () {
    await new Promise(res => setTimeout(res, 2000))
    progressBar.value = 0;
    progressBar.className = "is-hidden";
  };

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
    $TargetWidth = $mainimage.width;
    $TargetHeight = $mainimage.height;
    grid.width = $TargetWidth;
    grid.height = $TargetHeight;

    let x = 0;
    let y = 0;
    let w = $TileWidth;
    let h = $TileHeight;
    let _tiles = [...$tiles];
    let tileIndex = [];
    let total = $TargetWidth*$TargetHeight;
    let progress = 1;
    progressBar.className = "progress is-primary";
    progressBar.value = Math.floor(progress / total * 100);

    if (_tiles.length < 1) {
      console.log('No tiles selected');
      return;
    }

    for (let x = 0; x < grid.width; x+=w) {
      for (let y = 0; y < grid.height; y+=h) {
        progress = progress + w*h;
        if (_tiles.length < 1) {
          if ($UniqueTiles) {
            console.log('ran out of unique tiles in single mode, stopping');
            return;
          } else {
            _tiles = [...$tiles]; // reset tiles
          }
        }
        let cropts = { x: x, y: y, width: w, height: h }

        if (x + w > $mainimage.width) { cropts.width = $mainimage.width - x }
        if (y + h > $mainimage.height) { cropts.height = $mainimage.height - y }

        try {
          let crop = $mainimage.crop(cropts);
          let avg = GetAverageColorOfTile(crop);
          let tile = FindAndRemoveClosestTileByColor(avg, _tiles, $AllowDuplicateTiles);
          tileIndex.push(tile.id);
          tile.drawToCanvas(grid, x, y, { width: $TileWidth, height: $TileHeight });
        } catch(e) {
          console.log('error cropping ', e);
          continue;
        }
        progressBar.value = Math.floor(progress / total * 100);
        await new Promise(res => setTimeout(res, 2))
      }
    }
    tileindex.set(tileIndex);
    ClearProgress();
  }
</script>

<section>
  <div class="columns">
    <div class="column is-2">
      <div class="form">
        <div class="field">
          <button on:click|preventDefault={computeGrid} class="button is-primary is-large" disabled={$tiles.length < $MinimumTiles}>Generate Background</button>
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
            <input type="checkbox" id="single" checked={mode == "single"} on:click={setMode}>
            Single mode
          </label>
          <p class="help">Do not duplicate any tiles, stop drawing if not enough selected</p>
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

        <div class="field">
          <label class="label">Mosaic Info</label>
          <p class="help">{$tiles.length} unique tiles</p>
          <p class="help">{Math.floor(($TargetWidth*$TargetHeight) / ($TileWidth*$TileHeight))} total tiles</p>
          <p class="help">{$TargetWidth}x{$TargetHeight} pixels</p>
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
