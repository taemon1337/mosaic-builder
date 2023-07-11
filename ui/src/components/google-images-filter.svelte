<script>
  import { SignedIn } from '../store/user.js';
  export let q = "";

  const updateFilter = function () {
    dispatch('change', {q: q});
  }
</script>
<div class="form">
  <div class="field">
    <button class="button is-primary is-large" on:click|preventDefault={updateFilter} disabled={!SignedIn}>Search Images</button>
  </div>

  <div class="field">
    <label class="label">Search Google Images</label>
    <div class="control has-icons-left has-icons-right">
      <input class="input" type="text" placeholder="search..." bind:value={q}>
    </div>
  </div>
</div>
