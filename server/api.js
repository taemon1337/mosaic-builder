import fetch from 'node-fetch';

const Api = 'https://photoslibrary.googleapis.com';

export const Origins = [
  Api,
  'https://play.google.com',
  'https://lh3.googleusercontent.com',
]

export const Search = function (authToken, params) {
  params.pageSize = params.pageSize || 100;

  return fetch(Api + '/v1/mediaItems:search', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken,
    },
    body: JSON.stringify(params),
  }).then(function (resp) {
    if (resp.ok) {
      return resp.json()
    } else {
      throw new Error("Search Failed: " + resp.statusText)
    }
  }).then(function (data) {
    return ParseSearchResponse(data)
  }).catch(function (err) {
    console.warn('[ERROR] caught error - ', err);
    return []
  });
}

export const Download = function (authToken, url) {
  console.log("[GET] " + url);
  return fetch(url, {
    'Authorization': 'Bearer ' + authToken,
  })
}

export const ParseSearchResponse = function (body) {
  let photos = []

  const items = body.mediaItems
    .filter(x => x) // filter empty or invalid items
    .filter(x => x.mimeType && x.mimeType.startsWith('image/')) // items with an image mime type

  photos = photos.concat(items);

  return photos
}

