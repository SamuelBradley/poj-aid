# POJaid

A Discord bot that integrates with twitch to pass chat messages back and foward and provide other integrations. Uses tmi.js & discord.js see their respective documentations for info.

Created for my twitch streamer friend POJ hence the name.

## Disclaimer

This is a very early version, 2 way chat is working and you can configure the twitch connection from your discord guild using:

```!settwitch TWITCH_CHANNEL DISCORD_CHANNEL```

Apart from that there is not much to see, this is my first Node JS project so the code architecture will improve over time.

Medium term plans include:

* Twitch API features (Stats and Clips to start with)
* Documentation
* A Travis file
* Tests!

## Getting Started

Before starting you will need the following

* Node Js Installed
* A token for your discord bot
* A Twitch account for your bot with a client id and an oauth token.
* A Discord guild (Thats what the servers are called) for testing
* *Optional:* A personal twich account for testing

If you have these or know how to get them you can skip the next section

### Seting up with Discord and Twitch

* Create an application in [Discord Developers](https://discordapp.com/developers/applications/)
* TODO: Finish this guide

### Create your secret.json

* Take the secret.json.template and rename it to secret.json
* Fill it in with your Discord Bot Token, Bot's Twitch Account OAUTH and Twitch Client Id

### Edit botconfig.json

Choose your prefered command prefix, twitch-chat channel name and your twitch bot user name. Though the defaults should work fine.

### Run the App

```
npm update
node index.js
```

Note: The app will run indefinatly in your command line, if you plan to use it keep it running on a Rasberry Pi or a server that stays on.

## Usage


