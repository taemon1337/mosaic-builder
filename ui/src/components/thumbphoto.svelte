<script>
  import { TileWidth, TileHeight, TargetScale } from "../store/photo.js";
  export let photo;
  let width = $TileWidth * $TargetScale;
  let height = $TileHeight * $TargetScale;

  const Url = function (photo) {
    if (photo.id) {
      return photo.baseUrl.replace('https:/', '/api/photo') + "=w"+width+"-h"+height;
    } else {
      return photo.baseUrl;
    }
  }
</script>
<img id={photo.id} src="{Url(photo)}" />
