// Dependencies
const fs = require('fs');
const Eris = require('eris'); // https://abal.moe/Eris/docs/getting-started
const tumblrjs = require('tumblr.js'); // https://tumblr.github.io/tumblr.js/index.html
const Auth = require('./auth.json');
const Config = require('./config.json');
global.Promise = require('bluebird');

// Auth stuff
var bot = new Eris(Auth.bot_token, {
    getAllUsers: true,
    messageLimit: 0,
    maxShards: 1, 
    disableEvents: {
        TYPING_START: true,
        MESSAGE_UPDATE: true,
        MESSAGE_DELETE: true,
        MESSAGE_DELETE_BULK: true,
        VOICE_STATE_UPDATE: true
    }
});
var tumblr = tumblrjs.createClient(Auth.tum_token);

// tumblr.blogPosts('').then(resp => {console.log(resp.posts[0]);}).catch(err => {console.log(err);});

// When bot starts set status "Playing with Luna"
// Don't judge me
bot.on("ready", () => {
	console.log(bot.user.username + " is awake! [" + bot.shards.size + "] S:" + bot.guilds.size + " U:" + bot.users.size);
	bot.editStatus("online",{"name":"with Luna"});
});

// Every 1 minute asynchronous
setInterval(()=>{
	console.log("1 minute");
},60000);

// https://github.com/ddlr/WishBot/blob/chryssi/index.js <- reference this
bot.on("messageCreate", (msg) => {
	if( !bot.ready || msg.author.bot ) return;
	if(msg.content.includes(bot.user.mention)){
		bot.addMessageReaction(msg.channel.id, msg.id, "⚡");
		bot.createMessage(msg.channel.id, "Oh, hello!");
	}
});

bot.on("presenceUpdate", (usr) => {
    if(usr.id != Config.admin) return;
    // console.log(usr.id,usr.game);
    if(usr.game == null) { bot.editStatus("online",{"name":"with Luna"}); }
    else{
        if(usr.game.name === "Adobe Photoshop") bot.editStatus("online",{"name":"with a tablet"});
        else if(usr.game.name === "with code") bot.editStatus("online",{"name":"find the bugs!"});
        else bot.editStatus("online",{"name":"with Jyky"});
    }
});

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