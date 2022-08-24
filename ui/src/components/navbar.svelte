<script>
  import { SignedIn, Picture } from '../store/user.js';
</script>

<nav class="navbar" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="/google-photos-icon.svg">
    </a>

    <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>

  <div id="navbarBasicExample" class="navbar-menu">
    <div class="navbar-start">
      <a href="/" class="navbar-item">
        Photo Mosaic
      </a>

      <a href="/build" class="navbar-item">
        Create
      </a>
    </div>

    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          {#if $SignedIn}
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">
              <figure class="image">
                <img class="is-rounded" src={$Picture} />
              </figure>
            </a>

            <div class="navbar-dropdown">
              <a class="navbar-item">
                About
              </a>
              <a class="navbar-item">
                Contact
              </a>
              <hr class="navbar-divider">
              <a href="/auth/delete" class="navbar-item">
                Sign out
              </a>
            </div>
          </div>
          {:else}
          <a href="/auth/google" class="button is-primary">
            <strong>Sign in</strong>
          </a>
          {/if}
        </div>
      </div>
    </div>
  </div>
</nav>
