<script>
  import { TileWidth, TileHeight, TargetScale } from "../store/photo.js";
  export let photo;
  let width = $TileWidth * $TargetScale;
  let height = $TileHeight * $TargetScale;

  if (width < 150) { width = 150 }
  if (height < 150) { height = 150 }

  const Url = function (photo) {
    if (photo.id) {
      return photo.baseUrl.replace('https:/', '/api/photo') + "=w"+width+"-h"+height+"-c";
    } else {
      return photo.baseUrl;
    }
  }
</script>
<img id={photo.id} src="{Url(photo)}" />
