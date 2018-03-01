var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User');

module.exports = function(passport, io) {

	passport.serializeUser( (user, done) => {
		console.log(user);
		done(null, user.id);
	});

	passport.deserializeUser( (id,done) => {
		User.findById(id, (err, user) => { 
			done(err, user);
		})
	});

	passport.use('signup', new LocalStrategy ({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	(req, username, password, done) => {

		User.findOne({ 'username': username }, (err, user) => {
			if(err) return done(err);

			if(user) {
				return done(null, false, console.log('Username Taken'));
			} else {
				var newUser = new User();
				newUser.username = username;
				newUser.password = newUser.generateHash(password);

				newUser.save(err => {
					if(err) throw err;

					return done(null, newUser);
				});
			}
		});
	}
	));	

	passport.use('login', new LocalStrategy ({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, 
	(req, username, password, done) => {
		User.findOne({'username': username}, (err, user) => {
			if(err) return done(err);

			if(!user) return done(null, false, console.log('No user found'));

			if(!user.validPassword(password)) 
				return done(null, false, console.log('Wrong password'));

			return done(null, user);
		});
	}
	));
}