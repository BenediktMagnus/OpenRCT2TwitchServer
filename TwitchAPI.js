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

exports.GetChatters = function (AChannelName, ACallback)
{
    Client.api({ url: 'http://tmi.twitch.tv/group/user/' + AChannelName + '/chatters' }, function(Err, Res, Body)
        {
            if (Err != null || Body == undefined)
                ACallback(true);
            else
                ACallback(false, Body.chatters, Body.chatter_count);
        }
    );
};

exports.LoginsToIds = function (ALogins, ACallback)
{
    let LoginsString = '';
    for (let i = 0; i < ALogins.length; i++)
    {
        if (i > 0)
            LoginsString += '&';
        
        LoginsString += 'login=' + ALogins[i];
    }

    Client.api({
        url: 'https://api.twitch.tv/helix/users?' + LoginsString,
        headers: {
            'Client-ID': Config.clientid
        }
    }, function (Err, Res, Body)
        {
            if (Err == null && Body != undefined && Body.data != undefined && Body.data.length > 0)
            {
                let Ids = new Array(Body.data.length);
                for (let i = 0; i < Ids.length; i++)
                    Ids[i] = Body.data[i].id;

                ACallback(false, Ids);
            }
            else
                ACallback(true);
        }
    );
};