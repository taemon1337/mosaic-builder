<script>
  import { createEventDispatcher } from 'svelte';
  import { Photos, MainPhoto, MainPhotoUrl, TilePhotos, MinimumTiles, ColorPhotos, GetAverageColor, TileWidth, TileHeight, TargetWidth, TargetHeight, TargetScale, AutoCrop } from "../store/photo.js";
  import { CONTENT_CATEGORY } from '$lib/constants.js';
  import { calculateSimilarity } from '$lib/hashmap.js';
  import ThumbPhoto from '../components/thumbphoto.svelte';
  import ThumbCanvas from '../components/thumbcanvas.svelte';
  import PhotoFilter from '../components/photo-filter.svelte';
  import * as smartcrop from 'smartcrop';
  import { SearchWithFilter } from '$lib/api.js';

  let main;
  let filter;
  let pageSize = 100;
  let maxPages = 3;
  let tilesize = 150;
  let loadingPhotos = false;
  let loadingTiles = false;
  let similarityThreshold = 80;

  const dispatch = createEventDispatcher();

  const Filter = function(evt) {
    loadingPhotos = true;
    filter = evt.detail;
    filter.pageSize = pageSize;
    filter.maxPages = maxPages;
    return SearchWithFilter(filter).then(resp => {
      if (resp && resp.photos) {
        $Photos = { photos: [...$Photos.photos, ...resp.photos]}
      }
      loadingPhotos = false;
    }).catch(function (e) {
      console.warn('Error loading photos', e);
      loadingPhotos = false;
    });
  }

  const emitNext = function () {
    dispatch('next');
  }

  const RemoveSimilar = function () {
    let ids = $Photos.photos.map(p => p.id);
    let sims = $Photos.photos.map(p => p.hashmap);
    let matched = {};
    let deleted = [];
    let threshold = similarityThreshold;

    ids.forEach((p1, i) => {
      ids.forEach((p2, j) => {
        if (p1 !== p2) {
          let pct = calculateSimilarity(sims[i], sims[j]);
          if (pct > threshold) {
            matched[p1] = matched[p1] || [];
            matched[p2] = matched[p2] || [];
            if (matched[p1].indexOf(p2) < 0) { matched[p1].push(p2); }
            if (matched[p2].indexOf(p1) < 0) { matched[p2].push(p1); }
          }
        }
      });
    });

    Object.keys(matched).forEach((id1) => {
      matched[id1].forEach((id2) => {
        if (deleted.indexOf(id1) < 0 && deleted.indexOf(id2) < 0) {
          deleted.push(id1); // we only want to delete 1 of the similar images
        }
      });
    });

    deleted.forEach((id) => {
      DeselectTilePhoto(id);
    });

    console.log('removed ' + deleted.length + ' similar images');
  }

  const SelectTilePhoto = (photo, el) => {
    let found = $TilePhotos.filter(p => p.id == photo.id);
    if (found.length) { return; } // already selected

    let img = el.children[0];
    try {
      smartcrop.crop(img, { width: $TileWidth, height: $TileHeight}).then(function (suggest) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let cropopts = Object.assign({ enabled: $AutoCrop }, suggest.topCrop);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        photo.imageElement = img;
        photo.imageElement.imaged = new Event('imaged');
        GetAverageColor(photo, img.src, cropopts);
        $TilePhotos = [...$TilePhotos, photo]
      }).catch(function (err) {
        console.log(photo.id, err);
      });
    } catch (e) {
      console.log('caught image processing error:', e);
    }
  }

  const setTileSizes = function () {
    $TileWidth = tilesize;
    $TileHeight = tilesize;
  }

  // if the main photo is already selected, then select photo tile
  const SelectPhoto = (photo, el) => {
    if ($MainPhotoUrl) {
      SelectTilePhoto(photo, el);
    } else {
      MainPhoto.set(photo);
    }
  }

  const SelectAllPhotos = function () {
    loadingTiles = true;
    $Photos.photos.forEach(function (photo) {
      SelectTilePhoto(photo, document.getElementById("a-"+photo.id))
    });
    loadingTiles = false;
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

</script>

<section>
  <div class="columns">
    <div class="column is-2">
      <PhotoFilter on:change={Filter} />
    </div>
    <div class="column is-4">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            Google Photos
          </p>

          <div class="select is-small is-rounded mt-2 mr-2">
            <select bind:value={pageSize}>
              {#each Array.from(Array(11).keys()).filter(i => i > 0) as num}
                <option value={num*100}>{num*100} per page</option>
              {/each}
            </select>
          </div>
          <div class="select is-small is-rounded mt-2 mr-2">
            <select bind:value={maxPages}>
              {#each Array.from(Array(11).keys()).filter(i => i > 0) as num}
                <option value={num}>{num} max pages</option>
              {/each}
            </select>
          </div>

          <div class="is-pulled-right mt-3 mr-2">
            <span class="is-italic is-size-7">
              {#if loadingPhotos}
                loading...
              {:else}
                {$Photos.photos.length} photos
              {/if}
            </span>
          </div>
        </header>
        <div class="card-content">
          <div class="content">
            <div class="columns is-gapless is-multiline is-mobile">
              {#each $Photos.photos as photo}
                <div class="column is-1">
                  <a id="a-{photo.id}" on:click|preventDefault={SelectPhoto(photo, this)} href="#">
                    <ThumbPhoto photo={photo} />
                  </a>
                </div>
              {/each}
            </div>
          </div>
        </div>
        <footer class="card-footer">
          <a href="#" on:click|preventDefault={SelectAllPhotos} class="card-footer-item">Select All for Tiles</a>
          <a href="#" on:click|preventDefault={ClearAllPhotos} class="card-footer-item">Clear All Photos</a>
        </footer>
      </div>
    </div>

    <div class="column is-4">
     <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            Mosaic Tile Images
          </p>

          <div class="select is-small is-rounded mt-2 mr-2">
            <select bind:value={similarityThreshold}>
              {#each [50,60,70,80,90,100] as x}
              <option value={x}>
                {x}%
              </option>
              {/each}
            </select>
          </div>

          <div class="select is-small is-rounded mt-2 mr-2">
            <select bind:value={tilesize}>
              {#each [150,200,300,400,500,1000] as x}
              <option value={x}>
                {x}x{x} tiles
              </option>
              {/each}
            </select>
          </div>

          <div class="is-pulled-right mt-3 mr-2">
            <span class="is-italic is-size-7">
              {#if loadingTiles}
                loading...
              {:else}
                {$TilePhotos.length} tiles
              {/if}
            </span>
          </div>
        </header>

        <div class="card-content">
          <div class="content">
            <div class="columns is-gapless is-multiline is-mobile">
              {#each $TilePhotos as photo}
              <a on:click|preventDefault={DeselectTilePhoto(photo.id)} href="#">
                <ThumbCanvas photo={photo} />
              </a>
              {/each}
            </div>
          </div>
        </div>

        <footer class="card-footer">
          <a href="#" on:click|preventDefault={DeselectAllTiles} class="card-footer-item">Clear All</a>
          <a href="#" on:click|preventDefault={RemoveSimilar} class="card-footer-item">Remove Similar</a>
          <a href="#" on:click|preventDefault={() => $AutoCrop = !$AutoCrop} class={$AutoCrop ? "card-footer-item" : "card-footer-item is-strikethrough"} title={$AutoCrop ? "Will autocrop tile images" : "Will not autocrop tile images"}>
            Auto Crop Tiles
          </a>
        </footer>
      </div>
    </div>
    <div class="column is-2">
      <div class="field">
        <button on:click|preventDefault={emitNext} class="button is-primary is-large" disabled={!$MainPhotoUrl || $TilePhotos.length < $MinimumTiles}>Generate Background</button>
      </div>

      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            Main Photo
          </p>
        </header>

        <div class="card-content">
          <div class="content">
            {#if $MainPhotoUrl}
              <img bind:this={main} src="{$MainPhotoUrl}" />
            {:else}
              <article class="message is-primary">
                <div class="message-body">
                  Click a photo to select it as your main photo
                </div>
              </article>
            {/if}
          </div>
        </div>
        <footer class="card-footer">
          {#if $MainPhotoUrl}
          <a href="#" on:click|preventDefault={DeselectMainPhoto} class="card-footer-item">Clear Main Photo</a>
          {/if}
        </footer>
      </div>
    </div>
  </div>
</section>

<style>
  .card {
    height: 600px;
  }
  .card-content {
    height: 500px;
    overflow:scroll;
  }
  input.input {
    width: 60px;
  }
  a.is-strikethrough {
    text-decoration: line-through;
  }
</style>
