# OpenRCT2 Twitch Server

## Description

The *OpenRCT2 Twitch Server* is a server software for self-hosting the Twitch integration server for OpenRCT2. \
By default, the game tries to use the server on *openrct.ursalabs.co*, which is down now. With this programme you can host your own server to reenable the Twitch integration for OpenRCT2.

## Instructions


1. Install [Node.JS](https://nodejs.org) either from their website or through the software distribution on your operating system. The following steps imply that node is a globally accessible command. If this is not the case, you may run it from any folder by specifying the path of your installation like `/path/to/node`.

2. To install the project's dependencies run `npm install`. Like `node`, `npm` can be found in the folder of your Node.JS installation.

3. Copy `config/config.json.default` to `config/config.json` and change at least the name, the OAuth token and the client id. You can either use your user account for this or, better, create a new Twitch user as bot account. \
You can get an OAuth token from here: https://twitchapps.com/tmi/ \
And how to get the client id is descriped here: https://blog.twitch.tv/client-id-required-for-kraken-api-calls-afbb8e95f843

4. Start the server with [Node.JS](https://nodejs.org): `node OpenRCT2TwitchServer.js`.

5. Set your server's API URL in OpenRCT2's options (see https://github.com/OpenRCT2/OpenRCT2/pull/7555).

6. Go sure that "Enable Twitch integration" is set in the game options.

Now you can use all of the Twitch integration features. Have fun seeing your viewers walking through your park again!
