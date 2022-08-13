<script>
  import { TilePhotos } from "../store/photo.js";
  import ThumbPhoto from '../components/thumbphoto.svelte';
  import PhotoColor from '../components/photocolor.svelte';

</script>

<section>
  <div class="columns">
    <div class="column is-three-quarters">
      <div class="columns is-gapless is-multiline is-mobile">
        {#each $TilePhotos as photo}
          <div class="column is-1">
            <ThumbPhoto photo={photo} />
            {#if photo.averageColor}
            <PhotoColor photo={photo} />
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
