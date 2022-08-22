<script>
  import { onMount } from 'svelte';
  export let photo;
  let canvas;
  let width = "64";
  let height = "64";

  onMount(() => {
    photo.imageElement.addEventListener('imaged', (e) => {
      if (canvas && photo.image) {
        let ctx = canvas.getContext('2d');
        ctx.drawImage(photo.image.getCanvas(), 0, 0);
      } else {
        console.log('no image in photo', photo);
      }
    }, false);
  });
</script>
<canvas bind:this={canvas} width={width} height={height}></canvas>
