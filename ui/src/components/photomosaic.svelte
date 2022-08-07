<script>
  import { onMount } from 'svelte';
  import { MainPhoto, TilePhotos } from "../store/photo.js";
  import { PhotoMosaic } from "$lib/photo-mosaic.js";
</script>

<section>
  <div class="columns">
    <div class="column is-half">
    {#if $MainPhoto}
      <img src="{$MainPhoto.baseUrl}=w1080-h1920" />
    {/if}
    </div>
    <div class="column is-half">
    </div>
  </div>
</section>
