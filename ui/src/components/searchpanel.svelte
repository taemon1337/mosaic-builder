<script>
  import { onMount } from "svelte";
  import { Load, Photos, SelectedPhotos } from "../store/photo.js";
  import ThumbPhoto from '../components/thumbphoto.svelte';

  const SelectPhoto = (photo) => {
    $SelectedPhotos = [...$SelectedPhotos, photo]
  }

  onMount(async () => { Load() });
</script>

<section class="section">
  <div class="columns is-gapless is-multiline is-mobile">
    {#each $Photos.photos as photo}
      <div class="column is-1">
        <a on:click|once={SelectPhoto(photo)} href="#">
          <ThumbPhoto photo={photo} />
        </a>
      </div>
    {/each}
  </div>
  <nav class="pagination" role="navigation" aria-label="pagination">
    <a class="pagination-previous">Previous</a>
    <a class="pagination-next">Next page</a>
    <ul class="pagination-list">
      <li>
        <a class="pagination-link" aria-label="Goto page 1">1</a>
      </li>
      <li>
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li>
        <a class="pagination-link" aria-label="Goto page 45">45</a>
      </li>
      <li>
        <a class="pagination-link is-current" aria-label="Page 46" aria-current="page">46</a>
      </li>
      <li>
        <a class="pagination-link" aria-label="Goto page 47">47</a>
      </li>
      <li>
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li>
        <a class="pagination-link" aria-label="Goto page 86">86</a>
      </li>
    </ul>
  </nav>
</section>
