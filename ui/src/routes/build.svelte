<script>
  import PhotoFilter from '../components/photofilter.svelte';
  import MainPhotoSelect from '../components/mainphoto-select.svelte';
  import TilePhotosSelect from '../components/tilephotos-select.svelte';
  import GridTiles from '../components/gridtiles.svelte';
  import MainPhotoPreview from '../components/mainphoto-preview.svelte';
  import Mosaic from '../components/mosaic.svelte';

  let activeTab = "search";
</script>

<section class="section">
  <div class="tabs is-toggle is-fullwidth">
    <ul>
      <li class={activeTab == "search" ? "is-active" : ""}>
        <a on:click={() => activeTab = "search"}>
          <span class="icon"><i class="fas fa-image" aria-hidden="true"></i></span>
          <span>Load Photos</span>
        </a>
      </li>
      <li class={activeTab == "main" ? "is-active" : ""}>
        <a on:click={() => activeTab = "main"}>
          <span class="icon"><i class="fas fa-music" aria-hidden="true"></i></span>
          <span>Select Photo</span>
        </a>
      </li>
      <li class={activeTab == "tiles" ? "is-active" : ""}>
        <a on:click={() => activeTab = "tiles"}>
          <span class="icon"><i class="fas fa-film" aria-hidden="true"></i></span>
          <span>Select Tiles</span>
        </a>
      </li>
      <li class={activeTab == "preview" ? "is-active" : ""}>
        <a on:click={() => activeTab = "preview"}>
          <span class="icon"><i class="fas fa-film" aria-hidden="true"></i></span>
          <span>Preview Main</span>
        </a>
      </li>
      <li class={activeTab == "grid" ? "is-active" : ""}>
        <a on:click={() => activeTab = "grid"}>
          <span class="icon"><i class="fas fa-film" aria-hidden="true"></i></span>
          <span>Preview Tiles</span>
        </a>
      </li>
      <li class={activeTab == "mosaic" ? "is-active" : ""}>
        <a on:click={() => activeTab = "mosaic"}>
          <span class="icon"><i class="far fa-file-alt" aria-hidden="true"></i></span>
          <span>Preview Mosaic</span>
        </a>
      </li>
    </ul>
  </div>
  <div class={activeTab == "search" ? "" : "is-hidden"}>
    <PhotoFilter />
  </div>
  <div class={activeTab == "main" ? "" : "is-hidden"}>
    <MainPhotoSelect />
  </div>
  <div class={activeTab == "tiles" ? "" : "is-hidden"}>
    <TilePhotosSelect />
  </div>
  <div class={activeTab == "preview" ? "" : "is-hidden"}>
    <MainPhotoPreview />
  </div>
  <div class={activeTab == "grid" ? "" : "is-hidden"}>
    <GridTiles />
  </div>
  <div class={activeTab == "mosaic" ? "" : "is-hidden"}>
    <Mosaic />
  </div>
</section>
