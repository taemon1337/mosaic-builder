<script>
  export let onValueChange;
  export let value;
  export let progressClass="progress is-success";

  $: onValueChange(value);
</script>

<progress class="{progressClass}" value={value} max="100">{value}%</progress>
