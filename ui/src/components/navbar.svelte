<script>
  import { User, SignedIn, Picture } from '../store/user.js';

  let showMenu = false;
</script>

<nav class="navbar" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="/google-photos-icon-mosaic.png">
    </a>

    <a role="button" on:click={() => showMenu = !showMenu} class={showMenu ? "navbar-burger is-active" : "navbar-burger"} aria-label="menu" aria-expanded="false" data-target="navbar">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>

  <div id="navbar" class={showMenu ? "navbar-menu is-active" : "navbar-menu"}>
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
              <p class="navbar-item">
                Email: {$User.email}
              </p>
              <hr class="navbar-divider">
              <a href="/auth/delete" class="navbar-item">
                Sign out
              </a>
            </div>
          </div>
          {:else}
          <div class="navbar-item">
            <div class="buttons">
              <a href="/auth/google" class="button is-primary">
                <strong>Sign in</strong>
              </a>
            </div>
          </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</nav>
