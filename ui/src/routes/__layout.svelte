<script>
  import { onMount } from "svelte";
  import { page } from '$app/stores';
  import "../app.scss";
  import { readable } from 'svelte/store';
  import { globals } from '$lib/globals';
  import { Me } from '$lib/api.js';
  import Navbar from '../components/navbar.svelte';

  onMount(async () => { Me() });
</script>

<section>
  <Navbar />
  <slot />
</section>
