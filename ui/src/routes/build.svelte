<script>
  import { onMount } from "svelte";
  import { Photos, Load } from "../store/photo.js";

  let width="64";
  let height="64";

  onMount(async () => { Load() });
</script>

<div class="sm:text-center lg:text-left">
  <div class="grid grid-cols-10">
    {#each $Photos.photos as photo}
    <div>
      <img src="{photo.baseUrl}=w{width}-h{height}" />
    </div>
    {/each}
  </div>
</div>
