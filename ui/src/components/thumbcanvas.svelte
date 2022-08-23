<script>
  import { onMount } from 'svelte';
  export let photo;
  let canvas;
  let width = 64;
  let height = 64;

  onMount(() => {
    photo.imageElement.addEventListener('imaged', (e) => {
      if (canvas && photo.image) {
        canvas.width = width;
        canvas.height = height;
        let img = photo.image.resize({ width: width, height: height });
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img.getCanvas(), 0, 0);
      }
    }, false);
  });
</script>
<canvas bind:this={canvas}></canvas>
