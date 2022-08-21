<script>
  import { TargetWidth, TargetHeight, TargetModes } from "../store/photo.js";

  let mosaic;
  let mode = 'screen';

  const buildMosaic = function () {
    console.log('building mosaic...');
    let main = document.getElementById('main-canvas');
    let grid = document.getElementById('grid-canvas');

    let ctx = mosaic.getContext('2d');
    let mainctx = main.getContext('2d');
    let gridctx = grid.getContext('2d');

    mosaic.width = $TargetWidth;
    mosaic.height = $TargetHeight;

    ctx.drawImage(grid, 0, 0);
    mainctx.blendOnto(ctx, mode);
    console.log('mosaic done');
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
        <div class="select">
          <select value={mode}>
            {#each $TargetModes as m}
            <option value={m}>{m}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
    <div class="level-right">
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
