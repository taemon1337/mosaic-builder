<script>
  import PhotoSelect from '../components/photo-select.svelte';
  import GridTiles from '../components/gridtiles.svelte';
  import Mosaic from '../components/mosaic.svelte';

  let activeTab = "select";
</script>

<section class="mr-5 ml-5">
  <div class="tabs is-toggle is-fullwidth">
    <ul class="is-hidden">
      <li class={activeTab == "select" ? "is-active" : ""}>
        <a on:click={() => activeTab = "select"}>
          <span class="icon"><i class="fas fa-music" aria-hidden="true"></i></span>
          <span>Select Photos</span>
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
  <div class={activeTab == "select" ? "" : "is-hidden"}>
    <PhotoSelect on:next={() => activeTab = "grid"} />
  </div>
  <div class={activeTab == "grid" ? "" : "is-hidden"}>
    <GridTiles on:next={() => activeTab = "mosaic"} on:prev={() => activeTab = "select"} />
  </div>
  <div class={activeTab == "mosaic" ? "" : "is-hidden"}>
    <Mosaic on:prev={() => activeTab="grid"} />
  </div>
</section>
