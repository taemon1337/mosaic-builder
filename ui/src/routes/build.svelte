<script>
  import { onMount } from "svelte";
  import { Photos, Load } from "../store/photo.js";

  let width="64";
  let height="64";

  onMount(async () => { Load() });
</script>

<div class="columns is-gapless is-multiline is-mobile">
  {#each $Photos.photos as photo}
    <div class="column is-1">
      <img src="{photo.baseUrl}=w{width}-h{height}" />
    </div>
  {/each}
</div>
