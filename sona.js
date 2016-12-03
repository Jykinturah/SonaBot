// Dependencies
const fs = require('fs');
const Eris = require('eris'); // https://abal.moe/Eris/docs/getting-started
const tumblrjs = require('tumblr.js'); // https://tumblr.github.io/tumblr.js/index.html
const Auth = require('./auth.json');
const Config = require("./config.json");

// Auth stuff
var bot = new Eris(Auth.bot_token)
var tumblr = tumblrjs.createClient(Auth.tum_token);

// tumblr.blogPosts('').then(resp => {console.log(resp.posts[0]);}).catch(err => {console.log(err);});

// When bot starts set status "Playing with Luna"
// Don't judge me
bot.on("ready", () => {console.log("Fickle Dissonance is awake!");bot.editStatus("online",{"name":"with Luna"});});

/*

## TODO ##

# Permissions #
Check by Guild (if moderation implemented)
Spam prevention

# Commands # https://github.com/abalabahaha/eris/blob/master/examples/basicCommands.js
Tumblr check (5min auto)
Tumblr check (cmd + rate limit)
Msg (check old bot)
Luna (reaction)
Poke
Uptime (native)
Say
Myid

# Optional #
Moderation tools

*/

bot.connect();