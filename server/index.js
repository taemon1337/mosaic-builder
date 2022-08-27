import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import connectRedis from 'connect-redis';
import bodyParser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import oauth from 'passport-google-oauth';
import { SearchPages, RefreshRetry, Download, Origins } from './api.js';
import { handler } from './build/handler.js';

const app = express();
const GoogleStrategy = oauth.OAuth2Strategy;
const GoogleScopes = ['profile', 'email', 'https://www.googleapis.com/auth/photoslibrary.readonly'];


// Setup Redis for session storage
const redisOpts = {
  legacyMode: true,
  url: process.env.REDIS_URL || 'redis://redis:6379',
}

const RedisStore = connectRedis(session);
const redisClient = createClient(redisOpts);

redisClient.on('error', function (err) {
  console.log("Could not connect to redis at: ", redisOpts, err);
})

redisClient.on('connect', function () {
  console.log('Connected to redis.');
});

const sessionOpts = {
  name: 'userauth',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' },
  secret: process.env.SESSION_SECRET,
  maxAge: 24*60*60*1000,
}

if (process.env.NODE_ENV == 'production') {
  sessionOpts.store = new RedisStore({ client: redisClient });
  redisClient.connect().catch(console.error);
}

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

// setup session middleware
app.use(session(sessionOpts));

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
    callbackURL: process.env.CALLBACK_URL || "http://localhost:3000/auth/google/callback"
  },
  function(token, refreshToken, profile, done) {
    let user = profile._json
    user.token = token;
    user.refreshToken = refreshToken;
    console.log("[LOGIN] sub=" + user.sub + ", name='" + user.name + "', email=" + user.email);
    return done(null, user);
  }
));

app.get('/healthz', (req, res) => {
  res.send('OK');
});

app.get('/auth/me', RequireAuth, (req, res) => {
  res.json(req.user)
});

app.get('/auth/delete', (req, res) => {
  console.log("[LOGOUT] sub=" + req.user.sub + ", name='" + req.user.name + "', email=" + req.user.email);
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
      res.redirect(process.env.REDIRECT_URL);
    });
  });

app.get('/api/search', RequireAuth, (req, res) => {
  const filters = {contentFilter: {}, mediaTypeFilter: {mediaTypes: ['PHOTO']}};
  const parameters = {filters};

  SearchPages(req.user, parameters).then(function (resp) {
    res.status(200).send({photos: resp.photos, parameters: parameters})
  }).catch(function (err) {
    console.log("ERROR:500:/api/search", err, filters);
    res.status(500).send(err);
  });
});

app.post('/api/filter', RequireAuth, (req, res) => {
  const filters = {mediaTypeFilter: {mediaTypes: ['PHOTO']}};
  const parameters = {filters};
  const opts = {};

  if (req.body.maxPages) {
    opts.maxPages = req.body.maxPages;
  }

  if (req.body.pageSize) {
    opts.pageSize = req.body.pageSize;
  }

  if (req.body.dateFilter) {
    filters.dateFilter = req.body.dateFilter;
  }

  if (req.body.dateRange && req.body.dateRange.length == 2) {
    filters.dateFilter = { ranges: [{startDate: { year: req.body.dateRange[0] }, endDate: { year: req.body.dateRange[1] }}]};
  }

  if (req.body.featureFilter) {
    filters.featureFilter = req.body.featureFilter;
  }

  if (req.body.contentFilter) {
    filters.contentFilter = req.body.contentFilter;
  }

  SearchPages(req.user, parameters, opts).then(function (resp) {
    console.log('[FILTER] ' + JSON.stringify(filters), ' => ' + resp.photos.length + ' photos');
    res.status(200).send({photos: resp.photos, parameters: parameters})
  }).catch(function (err) {
    console.log("ERROR:500:/api/filter", err, filters);
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

if (process.env.NODE_ENV == "production") {
  // let SvelteKit handle everything else, including serving prerendered pages and static assets
  app.use(handler);
}

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port , host, () => console.log('App listening on port ' + port));
