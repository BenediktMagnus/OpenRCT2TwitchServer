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
        case 'join':
            Join(Params, ACallback);
            break;
        case 'channel':
            Channel(Params, ACallback);
            break;
        default:
            UnknownRequest(ARequest, ACallback);
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
 * Handles channel specific functionality like returning the viewer list.
 * @param {Array} AParams The params given by the caller.
 * @param {Function} ACallback The callback function called when the return data is available. 
 */
function Channel (AParams, ACallback)
{
    switch (AParams[1])
    {
        case 'audience':
            Client.api({url: 'http://tmi.twitch.tv/group/user/' + AParams[0].toLowerCase() + '/chatters'}, function(Err, Res, Body)
                {
                    let Output = new Array(Body.chatter_count);
                    let Current = 0;

                    for (let ChatterGroup in Body.chatters)
                    {
                        let Chatters = Body.chatters[ChatterGroup];
                        let IsModGroup = (ChatterGroup != 'viewers');

                        for (let i = 0; i < Chatters.length; i++)
                        {
                            Output[Current] = { name: Chatters[i], inChat: true, isFollower: false, isMod: IsModGroup };
                            Current++;
                        }
                    }

                    ACallback(Output);
                }
            );
            break;
        default:
            UnknownRequest('Channel->' + AParams.join('/'), ACallback);
    }
}

/**
 * Handles unknown requests.
 * @param {String} ARequest A string that represents the request.
 * @param {Function} ACallback The callback function called when the return data is available. 
 */
function UnknownRequest (ARequest, ACallback)
{
    console.log('Unknown request: ' + ARequest);
    ACallback({ status: 500 });
}