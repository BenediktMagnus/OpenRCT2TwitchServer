# OpenRCT2 Twitch Server

## Description

The *OpenRCT2 Twitch Server* is a server software for self-hosting the Twitch integration server for OpenRCT2.  
By default, the game tries to use the server on *openrct.ursalabs.co*, which is down now. With this programme you can host your own server to reenable the Twitch integration for OpenRCT2.

## Instructions

1. Copy `config/config.json.default` to `config/config.json` and change at least the name, the OAuth token and the client id. You can either use your user account for this or, better, create a new Twitch user as bot account.  
You can get an OAuth token from here: https://twitchapps.com/tmi/  
And how to get the client id is descriped here: https://blog.twitch.tv/client-id-required-for-kraken-api-calls-afbb8e95f843  

2. Add this line to your hosts file to make OpenRCT2 use your server as Twitch integration server: `<IP of your server> openrct.ursalabs.co`.
On Linux, you can find your hosts file under `/etc/hosts`.  
On Windows, it is located under `C:\Windows\System32\drivers\etc\hosts`.  

3. Start the server with [Node.JS](https://nodejs.org): `node OpenRCT2TwitchServer.js`.

Now you can use all of the Twitch integration features. Have fun seeing your viewers walking through your park again!