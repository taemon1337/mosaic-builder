<script>
  import { createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import { CONTENT_CATEGORY } from '$lib/constants.js';

  let filter;
  let includeDate;
  let pageSize = 100;
  let maxPages = 3;
  let selectDateFrom = 2000;
  let selectDateTo = 2030;
  let startDate;
  let endDate;
  let includedContentCategories = [];
  let includedFeatures = [];
  let includeSiteImages = false;

  const dispatch = createEventDispatcher();

  const updateFilter = function () {
    filter = getFilter();
    dispatch('change', filter);
  }

  const getFilter = function () {
    let filter = {
      pageSize: pageSize,
      maxPages: maxPages,
      mediaTypeFilter: {
        mediaTypes: ['PHOTO'],
      },
    }

    if (includedContentCategories.length) {
      filter.contentFilter = { includedContentCategories: includedContentCategories };
    }

    if (includeDate) {
      filter.dateRange = [startDate,endDate||startDate];
    }

    if (includeSiteImages) {
      filter.siteImages = true;
    }

    if (includedFeatures.length) {
      filter.featureFilter = { includedFeatures: includedFeatures };
    }
    return filter;
  }

  const toggleCategory = function (e) {
    if (e.target.checked) {
      includedContentCategories.push(e.target.id);
      includedContentCategories = includedContentCategories.filter((val, idx, self) => self.indexOf(val) === idx); // add and unique
    } else {
      includedContentCategories = includedContentCategories.filter(cat => cat !== e.target.id); // remove
    }
  }

  const toggleFeature = function (e) {
    if (e.target.checked) {
      includedFeatures.push(e.target.id);
      includedFeatures = includedFeatures.filter((val, idx, self) => self.indexOf(val) === idx); // add and unique
    } else {
      includedFeatures = includedFeatures.filter(f => f !== e.target.id); // remove
    }

  }
</script>
<div class="form">
  <div class="field">
    <button class="button is-primary is-large" on:click|preventDefault={updateFilter}>Search Photos</button>
  </div>

  <div class="field">
    <label class="checkbox">
      <input type="checkbox" bind:checked={includeDate}> Add Date Range
    </label>
  </div>

  {#if includeDate}
  <div class="field">
    <div class="select">
      <select bind:value={startDate}>
        {#each Array.from(Array(selectDateTo - selectDateFrom).keys()) as year}
        <option value={selectDateFrom+year}>{selectDateFrom+year}</option>
        {/each}
      </select>
    </div>

    <div class="select">
      <select bind:value={endDate}>
        {#each Array.from(Array(selectDateTo - selectDateFrom).keys()) as year}
          {#if (selectDateFrom+year) >= startDate}
          <option value={selectDateFrom+year}>{selectDateFrom+year}</option>
          {/if}
        {/each}
      </select>
    </div>
  </div>
  {/if}

  {#each ['FAVORITES'] as fav}
  <div class="field">
    <label class="checkbox">
      <input type="checkbox" id={fav} on:change={toggleFeature}>
      {fav}
    </label>
  </div>
  {/each}

  {#each Object.entries(CONTENT_CATEGORY) as [key,val]}
  <div class="field">
    <label class="checkbox">
      <input type="checkbox" id={key} on:change={toggleCategory}>
      {val}
    </label>
  </div>
  {/each}

  <div class="field">
    <label class="checkbox">
      <input type="checkbox" bind:checked={includeSiteImages}>
      Site Images
    </label>
  </div>
</div>
