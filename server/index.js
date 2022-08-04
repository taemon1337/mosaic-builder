import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import oauth from 'passport-google-oauth';
// import { handler } from './build/handler.js';

const app = express();
const GoogleStrategy = oauth.OAuth2Strategy;

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

/*  PASSPORT SETUP  */

var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => res.send(userProfile));
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
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));

app.get('/auth/me', (req, res) => {
  if (req.session.passport && req.session.passport.user) {
    res.json(req.session.passport.user)
  } else {
    res.status(403).send('Not Authenticated - please sign in first.');
  }
});

app.get('/auth/delete', (req, res) => {
  req.session.destroy()
})

app.get('/auth/google',
  passport.authenticate('google', { scope : ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    req.session.save(() => {
      res.redirect('http://localhost:5173');
    });
  });

// let SvelteKit handle everything else, including serving prerendered pages and static assets
//app.use(handler);

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port , host, () => console.log('App listening on port ' + port));
