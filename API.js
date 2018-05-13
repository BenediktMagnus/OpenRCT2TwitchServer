const Config = require('./config.json');
var Client;

/**
 * Initialises the API functionality.
 * @param {*} AClient The client for Twitch connection.
 */
exports.Initialise = function (AClient)
{
    Client = AClient;
};

/**
 * Handles a request URL.
 * @param {String} ARequest The API request as URL.
 * @param {Function} ACallback The callback function called when the return data is available.
 */
exports.Request = function (ARequest, ACallback)
{
    ARequest = ARequest.substr(1); //Remove leading slash.

    let Params = ARequest.split('/');
    let Command = Params[0];
    Params = Params.slice(1);

    switch (Command)
    {
        case 'join': Join(Params, ACallback); break;
        case 'channel': Channel(Params, ACallback); break;
        default: ACallback({ status: 500 });
    }
}

/**
 * Joines a chat room.
 * @param {Array} AParams The params given by the caller.
 * @param {Function} ACallback The callback function called when the return data is available. 
 */
function Join (AParams, ACallback)
{
    Client.join(AParams[0].toLowerCase()).then(function (Data)
        {
            ACallback({ status: 200 });
        }
    ).catch(function (Err)
        {
            console.log('Error: ' + Err);
            ACallback({ status: 500 });
        }
    );
};

/**
 * Handles channel functionality like returning the viewer list.
 * @param {*} AParams The params given by the caller.
 * @param {*} ACallback The callback function called when the return data is available. 
 */
function Channel (AParams, ACallback)
{
    if (AParams[1] == 'audience')
        Client.api({url: 'http://tmi.twitch.tv/group/user/' + AParams[0].toLowerCase() + '/chatters'}, function(Err, Res, Body)
            {
                let Viewers = Body.chatters.viewers;
                let Output = new Array(Viewers.length);

                for (let i = 0; i < Viewers.length; i++)
                {
                    Output[i] = { name: Viewers[i], inChat: true, isFollower: false, isMod: false };
                }

                ACallback(Output);
            }
        ); 
}