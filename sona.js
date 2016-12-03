// Dependencies
const fs = require('fs');
const Eris = require('eris');
const tumblrjs = require('tumblr.js');
const Auth = require('./auth.json');
const Config = require("./config.json");

// Auth stuff
var bot = new Eris(Auth.bot_token)
var tumblr = tumblrjs.createClient(Auth.tum_token);

// When bot starts set status "Playing with Luna"
// Don't judge me
bot.on("ready", () => {console.log("Fickle Dissonance is awake!");bot.user.setGame("with Luna");});

