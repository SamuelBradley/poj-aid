const envResult =  require('dotenv').config()
const botUtils = require('./botUtils');
const fs = require('fs');
var path = require('path');
const botconfigdefault = require("./botconfig-default.json");
const Discord = require("discord.js");
const tmi = require('tmi.js')

if(envResult.error)
{
  //Do nothing probably a docker build
}

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const TWITCH_AUTH = process.env.TWITCH_AUTH;
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;

//Server Path
let configPath = process.env.CONFIG_PATH;
if(configPath == null)
{
  //Local path
  configPath = "../data/";
}

const configFileName = configPath + "botconfig.json";
if (!fs.existsSync(path.resolve(__dirname,configFileName))) {
  console.log(`${configFileName} does not exist, copying defaults`);
  try {
    fs.copyFileSync(path.resolve(__dirname,'./botconfig-default.json'), path.resolve(__dirname,configFileName));
    console.log(`Copied default config to ${configFileName}`);
  } catch (err) {
    console.error(err)
  }
}

const botconfig = require(configFileName);

let discordBot = new Discord.Client({disableEveryone:true});

let connections = new Map();
let discordCommands = { hello, twitch, settwitch }
let twitchCommands = {echo};
let commandPrefix = botconfig.prefix;
let twitchClient = null;
let twitchChannels = new Array();

function initialiseTwitch() {

  opts = {
    options:{
      clientId: TWITCH_CLIENT_ID
    },
    connection: {
      reconnect: true
    },
    identity: {
      username: botconfig.twitchUsername,
      password: TWITCH_AUTH
    },
    channels: twitchChannels  
  }
  twitchClient = new tmi.client(opts);

  // Register our event handlers (defined below):
  twitchClient.on('message', onTwitchMessageHandler)
  twitchClient.on('connected', onTwitchConnectedHandler)
  twitchClient.on('disconnected', onTwitchDisconnectedHandler)

  console.log("Connecting to twitch");
  twitchClient.connect();
}

// Called every time a message comes in:
function onTwitchMessageHandler (target, context, msg, self) {
  if (self) { return } // Ignore messages from the bot

  //If it's a command process it
  if(!botUtils.processCommand(commandPrefix, msg, twitchCommands, context.username, context, target))
  {
    let con = connections.get(target.replace('#',''));

    if(con.discordChannelId == null)
    {
      let chan = discordBot.guilds.get(con.discordGuild).channels.find('name', con.discordChannel);
      con.discordChannelId = chan.id;
      console.log(`Set channelId to ${chan.id} `);
    }

    discordBot.guilds.get(con.discordGuild).channels.get(con.discordChannelId).send(`***${context.username}***: ${msg}`)
  }
}

// Called every time the bot connects to Twitch chat:
function onTwitchConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}

// Called every time the bot disconnects from Twitch:
function onTwitchDisconnectedHandler (reason) {
  console.log(`Disconnected: ${reason}`)
}

// Function called when the "echo" command is issued:
function echo (target, context, params) {
  // If there's something to echo:
  if (params.length) {
    // Join the params into a string:
    const msg = params.join(' ')
    // Send it back to the correct place:
    sendTwitchMessage(target, context, msg)
  } else { // Nothing to echo
    console.log(`* Nothing to echo`)
  }
}

// Helper function to send the correct type of message:
function sendTwitchMessage (target, context, message) {
  if (context['message-type'] === 'whisper') {
    twitchClient.whisper(target, message)
  } else {
    twitchClient.say(target, message)
  }
}

function updateConnections () { 
  botconfig.connections.forEach(e => {  
    connections.set(e.discordGuild, e);
    if(e.twitchChannel != null)
    {
      twitchChannels.push(e.twitchChannel);
      connections.set(e.twitchChannel, e);
    }
  });  
}

discordBot.on("ready", async () => {
  console.log(`${discordBot.user.username} is online!`);
  console.log(`Loading twitch conncetions...`);
  updateConnections();
  
  //Make sure all existing guilds have an entry in the connections config
  discordBot.guilds.forEach(g => {
    
    if(connections.get(g.id) == null)
    {
      var newConnection = {
        discordGuild: g.id,
        discordChannel: botconfig.defaultChatChannel
      } 
      botconfig.connections.push(newConnection); 
      updateConfig('Updating ' + configFileName + ' with new discord connection ' + g.name);
    }
  });

  initialiseTwitch(); 
});

discordBot.on("guildCreate", async guild => {
  console.log(`${discordBot.user.username} has joined ${guild.name}!`);
  console.log(`Updating config file...`);
  
  if(connections.get(guild.id) == null)
  {
    var newConnection = {
      discordGuild: guild.id,
      discordChannel: botconfig.defaultChatChannel
    } 
    botconfig.connections.push(newConnection); 
    updateConfig('Updating ' + configFileName + ' with new discord connection ' + guild.name);
  }

  
});

discordBot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  if(!botUtils.processCommand(botconfig.prefix, message.content, discordCommands, message.author.username, message, message.channel.name))
  {
    if(message.channel.name === connections.get(message.guild.id).discordChannel)
    {
      twitchClient.say(connections.get(message.guild.id).twitchChannel, `${message.author.username}: ${message.content}`);
    }
  }

});

discordBot.login(DISCORD_TOKEN);

//Discord Command
function hello(target, object, params){
  return object.channel.send("Hello " + object.author.username);
}

//Discord Command
function twitch(target, object, params){
  let end = false;
  botconfig.connections.forEach(e => {
    if(e.discordGuild === object.guild.id)
    {
      end = true;
      return object.channel.send(`The current twitch channel for this guild is ${e.twitchChannel} and messages will post to ${e.discordChannel}`);
    }
  });  
  if(end) return;
  return object.channel.send("There is no twitch channel set for this guild. Use the command !settwich TWITCH_CHANNEL DISCORD_CHANNEL");
}

//Discord Command
function settwitch(target, object, params){
  if(params[0] == null)
  {
    return object.channel.send("This command needs an argument");
  }
  
  let end = false;
  let dc = botconfig.defaultChatChannel;

  botconfig.connections.forEach(e => {
    if(e.discordGuild === object.guild.id)
    {
      end = true;
      if(e.twitchChannel)
      {
        console.log('Leaving twitch channel ' + e.twitchChannel);
        twitchClient.part(e.twitchChannel);
      }
     
      e.twitchChannel = params[0];
      if(params.length > 1)
      {
        e.discordChannel = params[1];
      }
      
    }
  });  
  
  if(!end)
  {
    console.log("Couldn't find discord channel in config");
    if(params.length > 1)
      dc = params[1];
    
    var newConnection = {
      twitchChannel: params[0],
      discordGuild: object.guild.id,
      discordChannel: dc
    } 
    botconfig.connections.push(newConnection);   
  }

  //Join the channel
  console.log('Joining twitch channel ' + params[0]);
  twitchClient.join(params[0]);
  
  updateConfig('Updating ' + configFileName + ' with new twitch conncetion ' + params[0]);

  return object.channel.send(`The twitch channel has been set to ${params[0]} messages will be posted in ${dc}` );
}

function updateConfig(note){
  console.log(`Writing to ${path.resolve(__dirname,configFileName)}`)
  fs.writeFile(path.resolve(__dirname,configFileName), JSON.stringify(botconfig, null, 2), function (err) {
    if (err) return console.log(err);
    if(note) console.log(note);
    //Update all the data structures with the latest information.
    updateConnections();
  });
}