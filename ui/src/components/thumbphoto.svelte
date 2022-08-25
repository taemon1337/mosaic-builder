<script>
  import { TileWidth, TileHeight, TargetScale, TilePhotoUrl } from "../store/photo.js";

  export let photo;
  let image;
  let width = $TileWidth * $TargetScale;
  let height = $TileHeight * $TargetScale;

  // ensure we have good enough sizes for thumbnails
  if (width < 150) { width = 150 }
  if (height < 150) { height = 150 }

  const Url = function(p) { return TilePhotoUrl(p) }

</script>
<img bind:this={image} id={photo.id} src="{Url(photo)}" />
