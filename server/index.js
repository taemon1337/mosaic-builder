import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import oauth from 'passport-google-oauth';
import { Search, RefreshRetry, Download, Origins } from './api.js';
//import { handler } from './build/handler.js';

const app = express();
const GoogleStrategy = oauth.OAuth2Strategy;
const GoogleScopes = ['profile', 'email', 'https://www.googleapis.com/auth/photoslibrary.readonly'];

function RequireAuth(req, res, next) {
  if (!req.user || !req.isAuthenticated()) {
    res.status(403).send('Not Authenticated - please sign in first.');
    return
  }

  if (!req.user.token) {
    console.log("req.user", req.user);
    res.status(403).send('No Authentication token found.');
    return
  }

  next()
}

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET 
}));

// Parse application/json request data.
app.use(bodyParser.json());

// Parse application/xwww-form-urlencoded request data.
app.use(bodyParser.urlencoded({extended: true}));

/* CORS SETUP */

const corsOptions = {
  origin: function (origin, callback) {
    origin = origin || "*"
    callback(null, origin);
  },
  credentials: true,
}

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

/*  PASSPORT SETUP  */

app.use(passport.initialize());
app.use(passport.session());
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(token, refreshToken, profile, done) {
      return done(null, {profile, token, refreshToken});
  }
));

app.get('/auth/me', RequireAuth, (req, res) => {
  res.json(req.user.profile)
});

app.get('/auth/delete', (req, res) => {
  req.session.destroy()
  res.redirect('/');
})

app.get('/auth/google',
  passport.authenticate('google', { scope : GoogleScopes }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error', session: true }),
  function(req, res) {
    // Successful authentication, redirect success.
    req.session.save(() => {
      res.redirect('http://localhost:5173');
    });
  });

app.get('/api/search', RequireAuth, (req, res) => {
  const filters = {contentFilter: {}, mediaTypeFilter: {mediaTypes: ['PHOTO']}};
  const parameters = {filters};

  Search(req.user, parameters).then(function (photos) {
    res.status(200).send({photos: photos, parameters: parameters})
  }).catch(function (err) {
    console.log("ERROR:500:/api/search", err);
    res.status(500).send(err);
  });
});

app.get('/api/photo/*', RequireAuth, (req, res) => {
  Download(req.user, { url: "https://" + req.originalUrl.replace("/api/photo/", "") }).then(function (resp) {
    resp.body.pipe(res);
  }).catch(function (err) {
    console.log("ERROR:500:/api/photo", err);
    res.status(500).send(err);
  });
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
//app.use(handler);

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port , host, () => console.log('App listening on port ' + port));
