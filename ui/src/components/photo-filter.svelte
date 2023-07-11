<script>
  import GooglePhotosFilter from '../components/google-photos-filter.svelte';
  import GoogleImagesFilter from '../components/google-images-filter.svelte';

  export let provider;
</script>
{#if provider == 'google-images'}
  <GoogleImagesFilter />
{:else}
<GooglePhotosFilter />
{/if}
