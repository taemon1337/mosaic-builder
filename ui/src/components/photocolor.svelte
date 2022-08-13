<script>
  export let photo;
  let el;

  $: rgb = photo.averageColor
  $: hex = RGB2HEX(photo.averageColor[0], photo.averageColor[1], photo.averageColor[2])

  const RGB2HEX = function (r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
</script>

<span bind:this={el} style="background-color:{hex}" class="tag">{rgb}</span>
