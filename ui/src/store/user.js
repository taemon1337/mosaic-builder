import { writable, derived } from 'svelte/store';

export const User = writable(null);

export const Picture = derived(
  User,
  $User => $User && $User.photos ? $User.photos[0].value : ""
);

export const SignedIn = derived(User, $User => $User !== null);

