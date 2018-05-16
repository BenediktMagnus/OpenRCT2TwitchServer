const Config = require('./config.json');
var Client;

const ParameterLogin = 'login';
const ParameterId = 'id';

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
    GetLoginOrId(AIds, ParameterLogin, ACallback);
};

exports.IdsToLogins = function (AIds, ACallback)
{
    GetLoginOrId(AIds, ParameterId, ACallback);
};

function GetLoginOrId (ALoginOrIdList, AParameterString, ACallback)
{
    //Combine the list to a parameter string for the GET request:
    let CombinedParameterString = '';
    for (let i = 0; i < ALoginOrIdList.length; i++)
    {
        if (i > 0)
            CombinedParameterString += '&';

        CombinedParameterString += AParameterString + '=' + ALoginOrIdList[i];
    }

    let ResultParameterString = ((AParameterString == ParameterLogin) ? ParameterId : ParameterLogin);

    //Make the Twitch API request:
    Client.api({
        url: 'https://api.twitch.tv/helix/users?' + CombinedParameterString,
        headers: {
            'Client-ID': Config.clientid
        }
    }, function (Err, Res, Body)
        {
            if (Err == null && Body != undefined && Body.data != undefined && Body.data.length > 0)
            {
                let ResultList = new Array(Body.data.length);
                for (let i = 0; i < ResultList.length; i++)
                    ResultList[i] = Body.data[i][ResultParameterString];

                ACallback(false, ResultList);
            }
            else
                ACallback(true);
        }
    );
}