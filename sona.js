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

// Global Vars, try keeping these few in number.
var blog;

// When bot starts set status "Playing with Luna"
// Don't judge me
bot.on("ready", () => {
	console.log(bot.user.username + " is awake! [" + bot.shards.size + "] S:" + bot.guilds.size + " U:" + bot.users.size);
	bot.editStatus("online",{"name":"with Luna"});
    tumblr.blogPosts(Config.blogName, { type: 'photo', limit: 10 })
        .then(resp => {blog = resp.posts;})
        .catch(err => {console.log(err);});
});

// Every 5 minute asynchronous
var tumblrRefresh = 5 * 60 * 1000
setInterval(()=>{
    tumblr.blogPosts(Config.blogName, { type: 'photo', limit: 10 })
        .then(resp => {blog = resp.posts;})
        .catch(err => {console.log(err);});
},tumblrRefresh);

// https://github.com/ddlr/WishBot/blob/chryssi/index.js <- reference this
bot.on("messageCreate", (msg) => {
	if( !bot.ready || msg.author.bot ) return;
	if(msg.content.includes(bot.user.mention)){
		bot.addMessageReaction(msg.channel.id, msg.id, "⚡");
		bot.createMessage(msg.channel.id, "Oh, hello!");
	}

    // SIMPLE IMPLEMENTATION FIRST BEFORE REAL IMPLEMENTATION
    if(msg.content.startsWith(Config.commandPrefix)){
        if(msg.content.substring(1).startsWith("tumblr")){
            var post = blog[0];
            var stri = "Latest post on " + post.blog_name + ".tumblr.com!";
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
        }

        // **** ONLY IN DEV BRANCH PLEASE ****
        if(msg.content.substring(1).startsWith("dev ")){
            if (msg.author.id != Config.admin) bot.createMessage(msg.channel.id, "I cannot let you do that, " + msg.author.mention);
            else{
                var devCmd = msg.content.substring(5);
                if(devCmd.startsWith("tumblr")){
                    tumblr.blogPosts(devCmd.substring(7), { limit: 1 })
                        .then(resp => {
                            devPost = resp.posts[0];
                            var contentTitle = "Latest post on " + devPost.blog_name + ".tumblr.com";
                            bot.createMessage(msg.channel.id,{
                                content:contentTitle,
                                embed:{
                                    title: devPost.blog_name,
                                    description: devPost.summary,
                                    url: devPost.post_url
                                }
                            });
                        })
                        .catch(err => {
                            bot.createMessage(msg.channel.id, "Something went wrong!\n\`\`\`\n" + err + "\n\`\`\`");
                        });
                }
            }
        }
        // **** ONLY IN DEV BRANCH PLEASE ****
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