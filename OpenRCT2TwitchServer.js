console.log('Starting Twitch integration server for OpenRCT2...');

const Config = require('./config.json');
const tmi = require("tmi.js");

Client = new tmi.client({
  identity:
  {
      username: Config.name,
      password: Config.oauth
  },
  connection:
  {
      reconnect: true,
      reconnectInterval: 250,
      reconnectDecay: 2.0
  }
});

Client.connect().then(function ()
    {
        console.log('Connected with Twitch.');

        const HTTP = require('http');
        const API = require('./API.js');
        API.Initialise(Client);

        console.log('Server initialised.');

        var App = HTTP.createServer(function (Req, Res)
        {
            Res.writeHead(200, {'Content-Type': 'application/json'});
        
            API.Request(Req.url, function (ReturnValue)
                {
                    Res.write(JSON.stringify(ReturnValue));
                    Res.end();
                }
            );
        });

        App.listen(Config.port, function()
        {
          console.log('\nServer started at *:' + Config.port);
        });
    }
);