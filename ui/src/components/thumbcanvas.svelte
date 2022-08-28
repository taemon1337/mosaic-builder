<script>
  import { onMount } from 'svelte';
  import { TileWidth, TileHeight } from "../store/photo.js";
  import { TileStore } from "../store/tilestore.js";

  export let id = null;
  export let tile = null;

  let canvas;
  let tiles = TileStore.tiles;

  const draw = () => {
    tile.image.subscribe(img => {
      console.log('image has changed', img);
      if (img) {
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img.resize({ width: $TileWidth, height: $TileHeight }).getCanvas(), 0, 0);
      }
    });
  }

  onMount(() => {
    if (tile) {
      draw()
    } else {
      if (id) {
        tile = $tiles.filter(t => t.id == id).pop(0);
        draw();
      }
    }
  });
</script>
<canvas id={id} bind:this={canvas} width={$TileWidth} height={$TileHeight}></canvas>
