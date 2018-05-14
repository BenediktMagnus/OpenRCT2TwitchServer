const Config = require('./config.json');
const TwitchAPI = require('./TwitchAPI.js');
var Client;
var IdList = new Map();

/**
 * Initialises the API functionality.
 * @param {*} AClient The client for Twitch connection.
 */
exports.Initialise = function (AClient)
{
    Client = AClient;
    TwitchAPI.Initialise(AClient);
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
    let ChannelName = AParams[0].toLowerCase();

    Client.join(ChannelName).then(function (Data)
        {
            GetUserIdByName(ChannelName, function (Success)
                {
                    ACallback( Success ? { status: 200 } : { status: 500 } );
                }
            );
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
            TwitchAPI.GetChatters(AParams[0].toLowerCase(), function (ErrorHappened, ChattersObject, ChattersCount)
                {
                    if (ErrorHappened)
                    {
                        ACallback({ status: 500 });
                        return;
                    }

                    let Output = new Array(ChattersCount);
                    let Current = 0;

                    for (let ChatterGroup in ChattersObject)
                    {
                        let Chatters = ChattersObject[ChatterGroup];
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
 * Gets the user id by name and saves it in the map.
 * @param {String} AChannelName The name of the channel/user in LOWERCASE.
 * @param {Function} ACallback Called when finished with success as boolean parameter.
 */
function GetUserIdByName (AChannelName, ACallback)
{
    //Get User ID of the channel owner for later use in the Twitch API:
    TwitchAPI.LoginsToIds([AChannelName], function (ErrorHappened, Ids)
        {
            if (ErrorHappened)
                ACallback(false);
            else
            {
                var User = {
                    Name: AChannelName,
                    Id: Ids[0],
                    Active: true,
                    Interval: undefined
                };

                IdList.set(AChannelName, User);
                
                //Use an interval to check if the client lost connection:
                User.Interval = setInterval(function ()
                    {
                        if (!User.Active)
                        {
                            IdList.delete(User.ChannelName);
                            clearInterval(User.Interval);
                        }
                        else
                            User.Active = false;
                    },
                    60000
                );

                ACallback(true);
            }
        }
    );
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