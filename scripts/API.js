const Config = require('../config/config.json');
const TwitchAPI = require('./TwitchAPI.js');
var Client;
var ChannelList = new Map();

/**
 * Initialises the API functionality.
 * @param {*} AClient The client for Twitch connection.
 */
exports.Initialise = function (AClient)
{
    Client = AClient;
    TwitchAPI.Initialise(AClient);

    Client.on('chat', function (AChannel, AData, AMessage, AIsOwnMessage)
        {
            let Command = '!news';

            if (AChannel.startsWith('#'))
                AChannel = AChannel.substr(1);
            
            //Skip irrelevant messages:
            if (!AIsOwnMessage && AMessage.startsWith('!') && (AMessage.length > Command.length + 1) && AMessage.startsWith(Command + ' '))
                if (ChannelList.has(AChannel))
                {
                    let Channel = ChannelList.get(AChannel);
                    if (Channel.Messages.length <= Config.MaxMessageCount)
                        Channel.Messages.push({ message: Command + ' ' + AData['display-name'] + ':' + AMessage.substr(Command.length) });
                }
        }
    );
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
            ChannelRequest(Params, ACallback);
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
            AddChannelToList(ChannelName, function (Success)
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
function ChannelRequest (AParams, ACallback)
{
    let ChannelName = AParams[0].toLowerCase();
    let Channel;

    //If we aren't logged in we have to login first:
    if (!ChannelList.has(ChannelName))
    {
        Join([ChannelName], () => { ChannelRequest(AParams, ACallback); });
        return;
    }
    else //Otherwise we have to set the channel to active to keep it logged in:
    {
        Channel = ChannelList.get(ChannelName);
        Channel.Active = true;
    }

    switch (AParams[1])
    {
        case 'audience':
            HandleAudienceRequest();
            break;
        case 'messages':
            HandleMessageRequest();
            break;
        default:
            UnknownRequest('Channel->' + AParams.join('/'), ACallback);
    }

    function HandleAudienceRequest ()
    {
        let Result = [];
        let ResultAddedCounter = 0; //Used to determine when all data is gathered.

        TwitchAPI.GetChatters(Channel, function (ErrorHappened, ChattersObject, ChattersCount)
            {
                if (ErrorHappened)
                {
                    AddToResult([]);
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

                AddToResult(Output);
            }
        );

        TwitchAPI.GetFollowers(Channel, function (ErrorHappened, FollowersObject)
            {
                if (ErrorHappened)
                {
                    AddToResult([]);
                    return;
                }
                        
                let Output = new Array(FollowersObject);
                for (let i = 0; i < FollowersObject.length; i++)
                    Output[i] = { name: FollowersObject[i], inChat: false, isFollower: true, isMod: false };

                AddToResult(Output);
            }
        );

        function AddToResult (AOutput)
        {
            if (AOutput.length > 0)
                Result = Result.concat(AOutput);

            ResultAddedCounter++;

            if (ResultAddedCounter >= 2)
            {
                if (Result.length == 0)
                    Result = { status: 500 };

                ACallback(Result);
            }
        }
    }

    function HandleMessageRequest ()
    {
        ACallback(Channel.Messages);
        Channel.Messages = [];
    }
}

/**
 * Creates a channel object, gathers the needes information and adds it to the list.
 * @param {String} AChannelName The name of the channel/user in LOWERCASE.
 * @param {Function} ACallback Called when finished with success as boolean parameter.
 */
function AddChannelToList (AChannelName, ACallback)
{
    //Get User ID of the channel owner for later use in the Twitch API:
    TwitchAPI.LoginsToIds([AChannelName], function (ErrorHappened, Ids)
        {
            if (ErrorHappened)
                ACallback(false);
            else
            {
                var Channel = {
                    Name: AChannelName,
                    Id: Ids[0],
                    Active: true,
                    Pagination: '',
                    Messages: [],
                    Interval: undefined
                };

                ChannelList.set(AChannelName, Channel);
                
                //Use an interval to check if the client lost connection:
                Channel.Interval = setInterval(function ()
                    {
                        if (!Channel.Active)
                        {
                            ChannelList.delete(Channel.ChannelName);
                            clearInterval(Channel.Interval);
                        }
                        else
                            Channel.Active = false;
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