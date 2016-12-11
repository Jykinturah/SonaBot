// Dependencies
const fs = require('fs');
const Eris = require('eris'); // https://abal.moe/Eris/docs/getting-started
const tumblrjs = require('tumblr.js'); // https://tumblr.github.io/tumblr.js/index.html
const Config = require('./config.json');
global.Promise = require('bluebird');

// Auth stuff
var bot = new Eris(Config.auth.bot_token, {
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
var tumblr = tumblrjs.createClient(Config.auth.tum_token);

// tumblr.blogPosts('').then(resp => {console.log(resp.posts[0]);}).catch(err => {console.log(err);});

// Global Vars, try keeping these few in number.
var blog;

// When bot starts set status "Playing with Luna"
// Don't judge me
bot.on("ready", () => {
	console.log(bot.user.username + " is awake! [" + bot.shards.size + "] S:" + bot.guilds.size + " U:" + bot.users.size);
	bot.editStatus("online",{"name":"with Luna"});
    tumblr.blogPosts(Config.blogName, { type: 'photo', limit: 5 })
        .then(resp => {blog = resp.posts;})
        .catch(err => {console.log(err);});
});

// Every 1 minute asynchronous
var tumblrRefresh = 60 * 1000
setInterval(()=>{
    tumblr.blogPosts(Config.blogName, { type: 'photo', limit: 5 })
        .then(resp => {blog = resp.posts;})
        .catch(err => {console.log(err);});
},tumblrRefresh);


// messagedelete function
var rm = (msg) => {
    if(Config.cmdClr > -1) 
        if(Config.cmdClr == 0)
            msg.delete();
        else setTimeout(() => {msg.delete();},Config.cmdClr);
}

var commands = {
    "art":{
        description: "Fetch the latest art post from Jyk's artblog.",
        process: (bot,msg,suffix) => {
            let post = blog[0];
            let stri = "Latest post on " + post.blog_name + ".tumblr.com!";
            bot.createMessage(msg.channel.id,{
                content:stri,
                embed:{
                    title: post.blog_name,
                    description: post.summary,
                    image: {
                        url: post.photos[0].original_size.url
                    },
                    url: post.post_url
                }
            });
            rm(msg);
        }
    },
    "poke": {
        description: "Poke!",
        process: function(bot,msg,suffix){bot.createMessage(msg.channel.id,"Hello, " + msg.author.mention + "! Why are you poking me? `" + (Date.now() - msg.timestamp) + "ms`");}
    },
    "myid": {
        description: "Ask me for your personal unique ID.",
        process: function(bot,msg){bot.createMessage(msg.channel.id,msg.author.mention + "'s ID: " + msg.author.id);rm(msg);}
    },
    "say": {
        admin: true,
        usage: "<message>",
        description: "Make me say something.",
        process: function(bot,msg,suffix){bot.createMessage(msg.channel.id,suffix);msg.delete();} //always delete
    },
    "uptime": {
        description: "Tells you how little sleep I have been getting.",
        process: function(bot,msg,suffix){
            let msec = bot.uptime;
            let days = Math.floor(msec / 1000 / 60 / 60 / 24);
            msec -= days * 1000 * 60 * 60 * 24;
            let hours = Math.floor(msec / 1000 / 60 / 60);
            msec -= hours * 1000 * 60 * 60;
            let mins = Math.floor(msec / 1000 / 60);
            msec -= mins * 1000 * 60;
            let secs = Math.floor(msec / 1000);
            let timestr = "";
            if(days > 0) timestr += days + " days ";
            if(hours > 0) timestr += hours + " hours ";
            if(mins > 0) timestr += mins + " minutes ";
            if(secs > 0) timestr += secs + " seconds ";
            bot.createMessage(msg.channel.id,"`Fickle Dissonance has been awake for " + timestr + "`");
            rm(msg);
        }
    },
    "vote": {
        admin: true,
        usage: "<message>",
        description: "Let's vote on something!",
        process: function(bot,msg,suffix){
            bot.createMessage(msg.channel.id,suffix).then((m)=>{
                    bot.addMessageReaction(m.channel.id,m.id,"👍").then(() => {
                        bot.addMessageReaction(m.channel.id,m.id,"👎");
                    });
                });
            msg.delete();
        }
    }
};

// https://github.com/ddlr/WishBot/blob/chryssi/index.js <- reference this
bot.on("messageCreate", (msg) => {
	if( !bot.ready || msg.author.bot ) return;
	if(msg.content.includes(bot.user.mention)){
		bot.addMessageReaction(msg.channel.id, msg.id, "⚡");
		bot.createMessage(msg.channel.id, "Oh, hello!");
	}
    if(msg.content.startsWith(Config.commandPrefix)){
        let cmd = msg.content.split(" ")[0].substring(1);
        var suffix = msg.content.substring(cmd.length+2);
        var cmdobj = commands[cmd];

        if(cmdobj){ //3874231
            if(cmdobj.admin)
                if (msg.author.id != Config.admin) bot.createMessage(msg.channel.id, "Sorry! I cannot let you do that, " + msg.author.mention);
                else cmdobj.process(bot,msg,suffix);
            else cmdobj.process(bot,msg,suffix);
        }
    }
});

bot.on("presenceUpdate", (usr) => {
    if(usr.id != Config.admin) return;
    if(usr.game == null) { bot.editStatus("online",{"name":"with Luna"}); }
    else{
        if(usr.game.name === "Adobe Photoshop") bot.editStatus("online",{"name":"with a tablet"});
        else if(usr.game.name === "with code") bot.editStatus("online",{"name":"find the bugs!"});
        else bot.editStatus("online",{"name":"with Jyky"});
    }
});

/*

## TODO ##

# Permissions # <------------ 3874231 NEEDS WORK
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