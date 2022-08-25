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

export const Search = function () {
  return fetch('/api/search', { credentials: 'include' })
    .then(resp => {
      return resp.ok ? resp.json() : null;
    })
}

export const SearchWithFilter = function (filter) {
  return fetch('/api/filter', {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify(filter),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  }).then(resp => {
    if (resp.ok) {
      return resp.json().then((data) => {
        if (filter.siteImages) {
          data.photos = data.photos.concat([{id: 'photo01', baseUrl: "/google-photos-icon.png"}]);
        }
      
        return data;
      });
    } else {
      return null;
    }
  })
}

export const GetPhoto = function (domain, path) {
  return fetch('/api/photo', {
    credentials: 'include',
    method: "GET",
    body: {
      domain: domain,
      path: path,
    }
  }).then(resp => {
    console.log('[PHOTO]', resp);
    return resp.ok ? resp.json() : null;
  })
}
