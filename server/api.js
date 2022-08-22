import fetch from 'node-fetch';
import refresh from 'passport-oauth2-refresh';

const Api = 'https://photoslibrary.googleapis.com';

export const Origins = [
  Api,
  'https://play.google.com',
  'https://lh3.googleusercontent.com',
]

export const Search = function (user, params, opts) {
  opts = Object.assign({retries: 1, func: 'search'}, opts);
  params.pageSize = params.pageSize || 100;

  return fetch(Api + '/v1/mediaItems:search', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + user.token,
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
  }).catch(RefreshRetry(user, params, opts));
}

export const SearchPages = function (user, params, opts) {
  return new Promise(function (resolve, reject) {
    let maxPages = opts.maxPages || 3;
    let photos = [];

    let handleResponse = function (o) {
      return function (resp) {
        resp.photos.forEach(function(photo) {
          photos.push(photo);
        });
        if (resp.nextPageToken) {
          return { nextPageToken: resp.nextPageToken, pageCount: o.pageCount + 1 };
        } else {
          resolve({ photos: photos, parameters: params });
        }
      }
    };

    let SearchNext = function (o) {
      console.log("Searching page " + o.pageCount);

      if (o.nextPageToken) {
        params.pageToken = o.nextPageToken;
      }

      if (o.pageCount < maxPages) {
        Search(user, params, opts).then(handleResponse(o)).then(SearchNext).catch(reject);
      } else {
        resolve({ photos: photos, parameters: params });
      }
    }

    SearchNext({ photos: [], pageCount: 0, nextPageToken: null });
  });
}

export const Download = function (user, params, opts) {
  opts = Object.assign({retries: 1, func: 'download'}, opts);
  return fetch(params.url, {
    'Authorization': 'Bearer ' + user.token,
  }).catch(RefreshRetry(user, params, opts));
}

export const RefreshRetry = function (user, params, opts) {
  return function (err) {
    if (params.retries < 1) {
      console.log("[OUT OF RETRIES]", err);
      throw err; // out of retries
    }
    opts.retries = opts.retries - 1;

    if (err.code == 401) {
      // access token expired
      refresh.requestNewAccessToken('google', user.refreshToken, function (err, accessToken) {
        if (err || !accessToken) {
          return res.status(401).end();
        }

        user.token = accessToken;
        switch(opts.func) {
          case "search":
            return Search(user, params);
          case "download":
            return Download(user, params);
        }
      });
    }

    throw err; // preserve original error
  }
}

export const ParseSearchResponse = function (body) {
  let photos = []

  const items = body.mediaItems
    .filter(x => x) // filter empty or invalid items
    .filter(x => x.mimeType && x.mimeType.startsWith('image/')) // items with an image mime type

  photos = photos.concat(items);

  return { photos: photos, nextPageToken: body.nextPageToken }
}

