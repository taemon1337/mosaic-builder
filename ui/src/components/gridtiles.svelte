<script>
  import { TilePhotos, TileWidth, TileHeight, TargetWidth, TargetHeight } from "../store/photo.js";

  export let grid;

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
</script>

<section>
  <nav class="level">
    <div class="level-left">
      <div class="level-item">
        <a on:click={buildGrid} class="button is-primary">Create Tile Grid</a>
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
