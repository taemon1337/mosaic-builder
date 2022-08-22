<script>
  import { MainPhoto, MainPhotoUrl, TargetWidth, TargetHeight } from "../store/photo.js";
  import { Image } from 'image-js';

  export let main;

  const buildMain = function () {
    Image.load($MainPhotoUrl).then(function (img) {
      $TargetWidth = img.width;
      $TargetHeight = img.height;
      main.width = img.width;
      main.height = img.height;
      let ctx = main.getContext('2d');

      if (img.width != $TargetWidth || img.height != $TargetHeight) {
        console.log('resizing from ' + img.width + 'x' + img.height + 'to ' + $TargetWidth + 'x' + $TargetHeight);
        img = img.resize({ width: $TargetWidth, height: $TargetHeight });
      }

      ctx.drawImage(img.getCanvas(), 0, 0);
    });
  }
</script>

<section>
  <nav class="level">
    <div class="level-left">
      <div class="level-item">
        <a on:click={buildMain} class="button is-primary">Create Main Background</a>
      </div>
    </div>
  </nav>
  <div class="columns">
    <div class="column is-full">
      <canvas id="main-canvas" bind:this={main}></canvas>
    </div>
  </div>
</section>
