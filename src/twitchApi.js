let schedule = require('node-schedule');

var _logger;
var _db;

function initialise(logger, db)
{
    _logger = logger;
    _db = db;
}

function searchClips(twitchClient, clientID, channel, findClipCallback)
{
    getClips(twitchClient, clientID, channel, function(body){
        if(body)
        {
            let clips = body.clips;

            clips.forEach(e => {               
                if(_db.clips.findOne({slug : e.slug}) == null)
                {
                    _db.clips.save(e);
                    _logger.info("New clip found sending it to discord");
                    findClipCallback(e);
                }
            });
        }
        else
        {
            _logger.info("No clips returned");
        }
    });
}

function getClips(twitchClient, clientID, channel, callback) {
    
    twitchClient.api({
        url: "https://api.twitch.tv/kraken/clips/top?channel=" + channel + "&period=day&limit=20",
        method: "GET",
        headers: {
            "Accept": "application/vnd.twitchtv.v5+json",
            "Client-ID": clientID
        }
    }, function(err, res, body) {
        _logger.debug("get clips body");
        _logger.debug(body)
        if(!err && !body.error)
        {
            callback(body);
        }
        else {
            if(body.error)           
                _logger.error(body.error);
            else
                _logger.error(err);
        }     
    }); 
}

function scheduleClips(twitchClient, clientID, channel, freq, findClipCallback)
  { 
    var sc = schedule.scheduleJob(freq, function(){
        _logger.info("Running Clips schedulle");
        searchClips(twitchClient, clientID, channel, findClipCallback)
    });
  }

module.exports = {
    initialise: initialise,
    searchClips: searchClips,
    getClips: getClips,
    scheduleClips: scheduleClips  
}
