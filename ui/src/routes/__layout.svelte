<script>
  import { onMount } from "svelte";
  import { page } from '$app/stores';
  import "../app.scss";
  import { readable } from 'svelte/store';
  import { globals } from '$lib/globals';
  import { Me } from '$lib/api.js';
  import { SignedIn, Picture } from '../store/user.js';

  onMount(async () => { Me() });
</script>

<section class="hero is-fullheight is-default is-bold">
  <div class="hero-head">
      <nav class="navbar">
          <div class="container">
              <div class="navbar-brand">
                  <a class="navbar-item" href="../">
                      <img src="../images/bulma.png" alt="Logo">
                  </a>
                  <span class="navbar-burger burger" data-target="navbarMenu">
                      <span></span>
                      <span></span>
                      <span></span>
                  </span>
              </div>
              <div id="navbarMenu" class="navbar-menu">
                  <div class="navbar-end">
                      <div class="tabs is-right">
                          <ul>
                              <li class="is-active"><a>Home</a></li>
                              <li><a href="">Examples</a></li>
                              <li><a href="">Team</a></li>
                              {#if $SignedIn}
                              <li>
                                <figure class="image is-64x64">
                                  <img class="is-rounded" src={$Picture}>
                                </figure>
                              </li>
                              {:else}
                              <li><a href="/auth/google">Sign In</a></li>
                              {/if}
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      </nav>
  </div>
  <slot />
</section>
