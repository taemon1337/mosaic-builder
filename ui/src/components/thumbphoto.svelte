<script>
  export let photo;
  let width = "64";
  let height = "64";
</script>
<img id={photo.id} src="{photo.baseUrl.replace('https:/', '/api/photo')}=w{width}-h{height}" />
