<script>
  export let photo;
  let width = "64";
  let height = "64";

  const Url = function (photo) {
    if (photo.id) {
      return photo.baseUrl.replace('https:/', '/api/photo') + "=w"+width+"-h"+height;
    } else {
      return photo.baseUrl;
    }
  }
</script>
<img id={photo.id} src="{Url(photo)}" />
