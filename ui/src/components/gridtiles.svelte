<script>
  import { TilePhotos, TileIndex, TileWidth, TileHeight, TargetWidth, TargetHeight, AllowDuplicateTiles, GetAverageColorOfTile } from "../store/photo.js";
  import { FindAndRemoveClosestTileByColor } from '$lib/colors.js';
  import { Image } from 'image-js';

  export let grid;

  // builds the grid using tiles without any adjustments
  const buildGrid = function () {
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

  // builds the grid trying to match tiles to pixel colors
  const computeGrid = function () {
    console.log('computing grid...');
    grid.width = $TargetWidth;
    grid.height = $TargetHeight;
    let ctx = grid.getContext('2d');
    let x = 0;
    let y = 0;
    let w = $TileWidth;
    let h = $TileHeight;
    let tiles = [...$TilePhotos];
    let tileIndex = [];
    let main = document.getElementById("main-canvas");
    let mainctx = main.getContext('2d');
    let mainimage = Image.fromCanvas(main);

    if (mainimage.width != $TargetWidth || mainimage.height != $TargetHeight) {
      console.log('main image width:height does not match target image, did you load it?');
      return;
    }

    if (tiles.length < 1) {
      console.log('No tiles selected');
      return;
    }

    for (let x = 0; x < grid.width; x+=w) {
      for (let y = 0; y < grid.height; y+=h) {
        if (tiles.length < 1) { tiles = [...$TilePhotos]; } // reset tiles if all have been used (when not allow dups)

        let crop = mainimage.crop({ x: x, y: y, width: w, height: h });
        let avg = GetAverageColorOfTile(crop);
        let tile = FindAndRemoveClosestTileByColor(avg, tiles, $AllowDuplicateTiles);
        let img = tile.image.resize({ width: $TileWidth, height: $TileHeight })
        tileIndex.push(tile.id);
        ctx.drawImage(img.getCanvas(), x, y);
      }
    }
    TileIndex.set(tileIndex);
  }
</script>

<section>
  <nav class="level">
    <div class="level-left">
      <div class="level-item">
        <a on:click={buildGrid} class="button is-primary">Create Tile Grid</a>
      </div>
      <div class="level-item">
        <a on:click={computeGrid} class="button is-primary">Arrange Tile Grid</a>
      </div>
      <div class="level-item">
        <div class="select">
          <select bind:value={$TileWidth}>
            {#each [10,20,30,40,50,100,150,200,300,400,500] as s}
            <option value={s}>{s} pixels wide</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="level-item">
        <div class="select">
          <select bind:value={$TileHeight}>
            {#each [10,20,30,40,50,100,150,200,300,400,500] as s}
            <option value={s}>{s} pixels high</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="level-item">
        <div class="select">
          <select bind:value={$AllowDuplicateTiles}>
            <option value=1>Allow Tile Duplicates</option>
            <option value=0>Do not reuse tiles until all have been used</option>
          </select>
        </div>
      </div>
    </div>
  </nav>
  <div class="columns">
    <div class="column is-full">
      <span>Showing {$TilePhotos.length} tiles, Tile width: {$TileWidth}, Tile Height: {$TileHeight}</span>
      <canvas id="grid-canvas" bind:this={grid}></canvas>
    </div>
  </div>
</section>
