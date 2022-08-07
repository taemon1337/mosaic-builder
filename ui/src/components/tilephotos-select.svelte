<script>
  import { onMount } from "svelte";
  import { Load, Photos, TilePhotos } from "../store/photo.js";
  import ThumbPhoto from '../components/thumbphoto.svelte';

  const SelectPhoto = (photo) => {
    $TilePhotos = [...$TilePhotos, photo]
  }

  const DeselectPhoto = (id) => {
    $TilePhotos = $TilePhotos.filter(photo => photo.id !== id)
  }

  onMount(async () => { Load() });
</script>

<section class="section">
  <div class="columns">
    <div class="column is-three-quarters">
      <div class="columns is-gapless is-multiline is-mobile">
        {#each $Photos.photos as photo}
          <div class="column is-1">
            <a on:click|once={SelectPhoto(photo)} href="#">
              <ThumbPhoto photo={photo} />
            </a>
          </div>
        {/each}
      </div>
    </div>
    <div class="column is-one-quarter">
      <nav class="panel">
        <p class="panel-heading">
          Selected Photos
        </p>
        {#each $TilePhotos as photo}
        <a on:click={DeselectPhoto(photo.id)} href="#">
          <ThumbPhoto photo={photo} />
        </a>
        {/each}
        <div class="panel-block">
          <button class="button is-link is-outlined is-fullwidth" disabled={$TilePhotos.length < 1}>
            Create Photo Mosaic
          </button>
        </div>
      </nav>
    </div>
  </div>
</section>
