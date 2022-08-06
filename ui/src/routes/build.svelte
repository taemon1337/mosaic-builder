<script>
  import PhotoFilter from '../components/photofilter.svelte';
  import SearchPanel from '../components/searchpanel.svelte';
  import SelectedPanel from '../components/selectedpanel.svelte';
</script>

<section class="section">
  <div class="columns">
    <div class="column is-one-quarter">
      <PhotoFilter />
    </div>
    <div class="column is-half">
      <SearchPanel />
    </div>
    <div class="column is-one-quarter">
      <SelectedPanel />
    </div>
  </div>
</section>
