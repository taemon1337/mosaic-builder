<script>
  import { onMount } from "svelte";
  import { Load, Photos, TilePhotos, ColorPhotos, GetAverageColor, TileWidth, TileHeight } from "../store/photo.js";
  import ThumbPhoto from '../components/thumbphoto.svelte';

  const SelectPhoto = (photo, el) => {
    let img = el.children[0];
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    GetAverageColor(photo, img.src, {width: $TileWidth, height: $TileHeight});
    $TilePhotos = [...$TilePhotos, photo]
  }

  const SelectColor = (color) => {
    let img = document.getElementById("color-" + color);
    let photo = { baseUrl: img.src };
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    GetAverageColor(photo, img.src, {width: $TileWidth, height: $TileHeight});
    $TilePhotos = [...$TilePhotos, photo];
  }

  const DeselectPhoto = (id) => {
    $TilePhotos = $TilePhotos.filter(photo => photo.id !== id)
  }

  onMount(async () => { Load() });
</script>

<section class="section">
  <div class="columns">
    <div class="column is-one-fifth">
      {#each $ColorPhotos as color}
        <div class="column is-1">
          <a on:click|once={SelectColor(color)} href="#">
            <img id="color-{color}" src="/colors/{color}.png" />
          </a>
        </div>
      {/each}
    </div>
    <div class="column is-three-fifths">
      <div class="columns is-gapless is-multiline is-mobile">
        {#each $Photos.photos as photo}
          <div class="column is-1">
            <a on:click|once={SelectPhoto(photo, this)} href="#">
              <ThumbPhoto photo={photo} />
            </a>
          </div>
        {/each}
      </div>
    </div>
    <div class="column is-one-fifth">
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
