import { globals } from '$lib/globals';

var client;
var access_token;
var scopeApi = ['https://www.googleapis.com/auth/photoslibrary', 'https://www.googleapis.com/auth/photoslibrary.readonly', 'https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata'];

export const Load = function() {
  client = google.accounts.oauth2.initTokenClient({
    client_id: globals.google_client_id,
    scope: scopeApi.join(' '),
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.warn('ERROR: ', tokenResponse.error);
      }
      if (tokenResponse && tokenResponse.access_token) {
        access_token = tokenResponse.access_token;
        console.log('ACCESS TOKEN: ', access_token);
      }
      client.requestAccessToken().then(function (token) {
        console.log('TOKEN: ', token);
      }).catch(function (err) {
        console.warn('ERROR: ', err);
      });
    },
  })
}

export const InitApi = function () {
  gapi.client.init({
    apiKey: globals.google_api_key,
    clientId: globals.google_client_id,
    scope: scopeApi.join(' '),
  }).then(function (resp) {
    console.log('RSP', resp);
  }).catch(function (err) {
    console.warn('ERROR: ', err);
  });
}

export const GetToken = function() {
  return client.requestAccessToken();
}

export const RevokeToken = function(callback) {
  google.accounts.oauth2.revoke(access_token, callback);
}

export const Authorize = function(callback) {
  gapi.auth.authorize({
    client_id: globals.google_client_id,
    scope: scopeApi,
    immediate: false,
  }, callback);
}

export const GetAllPhotos = function() {
  gapi.client.request({
    path: 'https://photoslibrary.googleapis.com/v1/mediaItems:search',
    method: 'POST',
    body: {
      filters: {
        mediaTypeFilter: {
          mediaTypes: ["PHOTO"]
        }
      }
    }
  }).then(function (resp) {
    console.log('PHOTOS: ', resp);
  }).catch(function (err) {
    console.warn('ERROR: ', err);
  });
}

export const SignIn = function() {
  GetToken()
}

export const SignOut = function() {
  alert('SIGNING OUT');
}
