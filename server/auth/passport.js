// מנגנון OAuth לא בשימוש יותר

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // <-- בהמשך תפעיל
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // <-- בהמשך תפעיל
// const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL; // <-- בהמשך תפעיל
// const JWT_SECRET = process.env.JWT_SECRET; // <-- בהמשך תפעיל

const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email,
        displayName: profile.displayName,
        isAdmin: adminEmails.includes(email),
      });
    } else if (user.isAdmin !== adminEmails.includes(email)) {
      user.isAdmin = adminEmails.includes(email);
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// module.exports = passport; // <-- להפעיל כשתחזיר את הקוד 