import { writable, derived } from 'svelte/store';

export const User = writable(null);

export const Picture = derived(
  User,
  $User => $User ? $User.picture : ""
);

export const SignedIn = derived(User, $User => $User !== null);

