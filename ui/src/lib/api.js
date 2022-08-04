import { globals } from '$lib/globals';
import { User } from '../store/user.js';

export const Me = function () {
  fetch('/auth/me')
    .then(resp => {
      return resp.ok ? resp.json() : null;
    })
    .then(data => {
      console.log('USER', data);
      User.set(data)
    })
}

