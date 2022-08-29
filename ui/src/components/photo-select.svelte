<script>
  import { createEventDispatcher } from 'svelte';
  import { MinimumTiles, ColorPhotos, TileWidth, TileHeight, TargetWidth, TargetHeight, TargetScale, AutoCrop } from "../store/photo.js";
  import { TileStore } from '../store/tilestore.js';
  import { CONTENT_CATEGORY } from '$lib/constants.js';
  import { calculateSimilarity } from '$lib/similarity.js';
  import ThumbCanvas from '../components/thumbcanvas.svelte';
  import PhotoFilter from '../components/photo-filter.svelte';
  import * as smartcrop from 'smartcrop';
  import { SearchWithFilter } from '$lib/api.js';
  import { GetAverageColorOfTile } from '$lib/average-color.js';
  import { TileImage } from '$lib/tile-image.js';
  import { TileImageStore } from '$lib/tile-image-store.js';

  let main;
  let filter;
  let pageSize = 100;
  let maxPages = 3;
  let tilesize = $TileWidth;
  let loadingTiles = false;
  let loadingPhotos = false;
  let similarityThreshold = 80;
  let photos = TileStore.photos;
  let tiles = TileStore.tiles;
  let mainphoto = TileStore.mainphoto;

  const dispatch = createEventDispatcher();

  const Filter = async function(evt) {
    loadingPhotos = true;
    await new Promise(res => setTimeout(res, 10));
    filter = evt.detail;
    filter.pageSize = pageSize;
    filter.maxPages = maxPages;
    await TileStore.search(filter);
    loadingPhotos = false;
  };

  const emitNext = function () {
    dispatch('next');
  }

  const select = (tile) => {
    if ($mainphoto) {
      loadingTiles = true;
      if (!tile.averageColor) {
        tile.averageColor = GetAverageColorOfTile(tile);
      }
      if (!tile.colorhash) {
        tile.computeSimilarity().then(() => {
          $tiles = [...$tiles, tile];
          $photos = $photos.filter(p => p.id !== tile.id);
          loadingTiles = false;
        });
      } else {
        $tiles = [...$tiles, tile];
        $photos = $photos.filter(p => p.id !== tile.id);
        loadingTiles = false;
      }
    } else {
      console.log('selecting main photo ' + tile.id);
      tile.loadFullSize().then(() => mainphoto.set(tile));
    }
  }

  const unselect = (tile) => {
    console.log('unselecting ', tile.id);
    $photos = [...$photos, tile];
    $tiles = $tiles.filter(t => t.id !== tile.id);
  }

  const RemoveSimilar = function () {
    let ids = $tiles.map(p => p.id);
    let sims = $tiles.map(p => p.colorhash);
    let matched = {};
    let deleted = [];
    let threshold = similarityThreshold;

    ids.forEach((p1, i) => {
      ids.forEach((p2, j) => {
        if (p1 !== p2) {
          if (sims[i] && sims[j]) {
            let pct = calculateSimilarity(sims[i], sims[j]);
            if (pct > threshold) {
              matched[p1] = matched[p1] || [];
              matched[p2] = matched[p2] || [];
              if (matched[p1].indexOf(p2) < 0) { matched[p1].push(p2); }
              if (matched[p2].indexOf(p1) < 0) { matched[p2].push(p1); }
            }
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
      unselect($tiles.filter(t => t.id == id).pop());
    });

    console.log('removed ' + deleted.length + ' similar images');
  }

  const setTileSizes = function () {
    $TileWidth = tilesize;
    $TileHeight = tilesize;
  }

  const SelectAllPhotos = function () {
    $photos.forEach(p => select(p));
  }

  const DeselectAllTiles = function () {
    $tiles.forEach(t => unselect(t));
  }

  const ClearAllPhotos = function () {
    photos.set([]);
  }

  const DeselectMainPhoto = function () {
    mainphoto.set(null);
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
                {$photos.length} photos
              {/if}
            </span>
          </div>
        </header>
        <div class="card-content">
          <div class="content">
            <div class="columns is-gapless is-multiline is-mobile">
              {#each $photos as photo (photo.id)}
                <a id="a-{photo.id}" on:click|preventDefault={select(photo)} href="#">
                  <ThumbCanvas tile={photo} />
                </a>
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
            <select bind:value={tilesize} on:change={setTileSizes}>
              {#each [50,100,150,200,300,400,500,1000] as x}
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
                {$tiles.length} tiles
              {/if}
            </span>
          </div>
        </header>

        <div class="card-content">
          <div class="content">
            <div class="columns is-gapless is-multiline is-mobile">
              {#each $tiles as tile (tile.id)}
                <a on:click|preventDefault={unselect(tile, this)} href="#">
                  <ThumbCanvas tile={tile} width={$TileWidth} height={$TileHeight} />
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
        <button on:click|preventDefault={emitNext} class="button is-primary is-large" disabled={!$mainphoto || $tiles.length < $MinimumTiles}>Generate Background</button>
      </div>

      <div class="card is-smaller">
        <header class="card-header">
          <p class="card-header-title">
            Main Photo
          </p>

          {#if $mainphoto}
            <div class="field mt-2 mr-2">
              <button on:click|preventDefault={DeselectMainPhoto} class="button is-default is-small">x</button>
            </div>
          {/if}
        </header>

        <div class="card-content">
          <div class="content">
            {#if $mainphoto}
              <ThumbCanvas tile={$mainphoto} width={300} height={300} />
            {:else}
              <article class="message is-primary">
                <div class="message-body">
                  Click a photo to select it as your main photo
                </div>
              </article>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .card {
    height: 600px;
  }
  .is-smaller {
    height: 528px;
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
