<script>
  import { Filter, Photos, MainPhoto, MainPhotoUrl, TilePhotos, ColorPhotos, GetAverageColor, TileWidth, TileHeight, Cropping } from "../store/photo.js";
  import { CONTENT_CATEGORY } from '$lib/constants.js';
  import ThumbPhoto from '../components/thumbphoto.svelte';
  import ThumbCanvas from '../components/thumbcanvas.svelte';
  import * as smartcrop from 'smartcrop';

  let main;
  let includedContentCategories = [];
  let excludedContentCategories = [];
  let pageSize = 100;
  let maxPages = 3;

  const SelectTilePhoto = (photo, el) => {
    let found = $TilePhotos.filter(p => p.id == photo.id);
    if (found.length) { return; } // already selected

    let img = el.children[0];
    smartcrop.crop(img, { width: $TileWidth, height: $TileHeight}).then(function (suggest) {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      photo.imageElement = img;
      photo.imageElement.imaged = new Event('imaged');
      GetAverageColor(photo, img.src, suggest.topCrop);
      $TilePhotos = [...$TilePhotos, photo]
    });
  }

  // if the main photo is already selected, then select photo tile
  const SelectPhoto = (photo, el) => {
    if ($MainPhotoUrl) {
      SelectTilePhoto(photo, el);
    } else {
      console.log('[MAIN] setting main photo', photo);
      MainPhoto.set(photo);
    }
  }

  const SelectAllPhotos = function () {
    $Photos.photos.forEach(function (photo) {
      SelectTilePhoto(photo, document.getElementById("a-"+photo.id))
    });
  }

  const DeselectAllTiles = function () {
    TilePhotos.set([]);
  }

  const ClearAllPhotos = function () {
    Photos.set({ photos: [] });
  }

  const DeselectMainPhoto = function () {
    MainPhoto.set(null);
  }

  const DeselectTilePhoto = (id) => {
    $TilePhotos = $TilePhotos.filter(photo => photo.id !== id)
  }

  const SubmitFilter = function () {
    Filter({ includedContentCategories: includedContentCategories, maxPages: maxPages, pageSize: pageSize })
  }

  const ChangeFilter = function (el) {
    if (el.target.checked) {
      includedContentCategories.push(el.target.id);
      includedContentCategories = includedContentCategories.filter((val, idx, self) => self.indexOf(val) === idx); // add and unique
    } else {
      includedContentCategories = includedContentCategories.filter(cat => cat !== el.target.id); // remove
    }
  }
</script>

<section class="section">
  <nav class="level">
    <div class="level-left">
      <div class="level-item">
        <a on:click={SelectAllPhotos} class="button is-primary">Use All for Tiles</a>
      </div>
      <div class="level-item">
        <a on:click={DeselectAllTiles} class="button is-primary">Remove All Tiles</a>
      </div>
      <div class="level-item">
        <a on:click={ClearAllPhotos} class="button is-primary">Clear All Photos</a>
      </div>
      <div class="level-item">
        <input class="input" type="number" bind:value={pageSize} />
      </div>
      <div class="level-item">
        <input class="input" type="number" bind:value={maxPages} />
      </div>
    </div>
    <div class="level-right">
      <div class="level-item">
        {$Photos.photos.length} photos
      </div>
      <div class="level-item">
        {$TilePhotos.length} tiles selected
      </div>
    </div>
  </nav>
  <div class="columns">
    <div class="column is-one-fifth">
      <div class="form">
        {#each Object.entries(CONTENT_CATEGORY) as [key,val]}
        <div class="field">
          <label class="checkbox">
            <input type="checkbox" id={key} on:change={ChangeFilter}>
            {val}
          </label>
        </div>
        {/each}
        <button on:click={SubmitFilter} type="button" class="button is-primary">Filter</button>
      </div>
    </div>
    <div class="column is-three-fifths">
      <div class="columns is-gapless is-multiline is-mobile">
        {#each $Photos.photos as photo}
          <div class="column is-1">
            <a id="a-{photo.id}" on:click={SelectPhoto(photo, this)} href="#">
              <ThumbPhoto photo={photo} />
            </a>
          </div>
        {/each}
      </div>
    </div>
    <div class="column is-one-fifth">
      <nav class="panel">
        <p class="panel-heading">
          Selected Main Photo
          {#if $MainPhotoUrl}
          <span class="is-small">click to remove</span>
          {/if}
        </p>
        {#if $MainPhotoUrl}
        <a on:click={DeselectMainPhoto} href="#">
          <img bind:this={main} src="{$MainPhotoUrl}" />
        </a>
        {:else}
        <p>Click photo to select as main background image</p>
        {/if}
      </nav>
      <nav class="panel">
        <p class="panel-heading">
          Selected Tile Photos <span class="is-small">({$TilePhotos.length})</span>
        </p>
        {#each $TilePhotos as photo}
        <a on:click={DeselectTilePhoto(photo.id)} href="#">
          <ThumbCanvas photo={photo} />
        </a>
        {/each}
      </nav>
    </div>
  </div>
</section>

<style>
  input.input {
    width: 100px;
  }
</style>
