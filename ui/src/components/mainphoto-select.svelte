<script>
  import { onMount } from "svelte";
  import { Load, Photos, MainPhoto } from "../store/photo.js";
  import ThumbPhoto from '../components/thumbphoto.svelte';

  const SelectPhoto = (photo) => {
    $MainPhoto = photo;
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
        {#if $MainPhoto}
        <img src="{$MainPhoto.baseUrl}=w1080-h1920" />
        {/if}
        <div class="panel-block">
          <button class="button is-link is-outlined is-fullwidth" disabled={$MainPhoto == null}>
            Next - select tile images
          </button>
        </div>
      </nav>
    </div>
  </div>
</section>
