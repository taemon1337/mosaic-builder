<script>
  import { onMount } from 'svelte';

  let current = 1;
  let photos = ["/birthday-original.jpg", "birthday-grid.jpg", "birthday-mosaic-light.jpg", "birthday-mosaic.jpg" ];

  let next = function() {
    current < photos.length-1 ? current+=1 : current = 0;
  }

  onMount(() => {
    setInterval(() => {
      next();
    }, 9000);
  });
</script>

<div class="hero-body">
    <div class="container has-text-centered">
        <div class="columns is-multiline is-vcentered">
            <div class="column is-6">
                <figure class="image">
                    <img src={photos[current]} alt="Birthday Collage" style="width:540px;height:720px;">
                </figure>
            </div>
            <div class="column is-5 is-offset-1">
                <figure class="image is-128x128 mr-auto ml-auto">
                    <img src="/google-photos-icon-mosaic.png" alt="Google Photos Icon Mosaic">
                </figure>

                <h1 class="title is-2">
                  Photos Mosaic Builder
                </h1>
                <h2 class="subtitle is-4">
                    Build a beautiful photo mosaic using your Google Photos without downloading or uploading any files.
                </h2>
                <br>
                <p class="has-text-centered">
                    <a href="/build" class="button is-medium is-info is-outlined">
                      Get Started
                    </a>
                </p>
            </div>
        </div>
    </div>
</div>
