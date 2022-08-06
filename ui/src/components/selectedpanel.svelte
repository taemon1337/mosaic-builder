<script>
  import { SelectedPhotos } from "../store/photo.js";
  import ThumbPhoto from '../components/thumbphoto.svelte';

  const DeselectPhoto = (id) => {
    $SelectedPhotos = $SelectedPhotos.filter(photo => photo.id !== id)
  }
</script>

<nav class="panel">
  <p class="panel-heading">
    Selected Photos
  </p>
  {#each $SelectedPhotos as photo}
  <a on:click|once={DeselectPhoto(photo.id)} href="#">
    <ThumbPhoto photo={photo} />
  </a>
  {/each}
  <div class="panel-block">
    <button class="button is-link is-outlined is-fullwidth">
      Reset all filters
    </button>
  </div>
</nav>

